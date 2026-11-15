package com.jarvis.assistant

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Foreground service that owns the microphone, speech recognition and text-to-speech.
 * It keeps running with the app closed. Two modes:
 *  - one-shot: listen for a single command (mic button, Quick Settings tile, notification).
 *  - always listening: keep listening for the wake word "Jarvis", then run the command.
 */
class AssistantService : Service(), RecognitionListener, TextToSpeech.OnInitListener {

    companion object {
        const val ACTION_LISTEN = "com.jarvis.LISTEN"
        const val ACTION_WAKE_ON = "com.jarvis.WAKE_ON"
        const val ACTION_WAKE_OFF = "com.jarvis.WAKE_OFF"
        const val ACTION_STOP = "com.jarvis.STOP"
        private const val CHANNEL = "jarvis"
        private const val NOTIF_ID = 1
        private val WAKE_WORDS = listOf("hey jarvis", "ok jarvis", "okay jarvis", "jarvis", "jervis", "jarvas")

        @Volatile
        var running = false
            private set

        fun send(context: Context, action: String) {
            val i = Intent(context, AssistantService::class.java).setAction(action)
            if (action == ACTION_STOP || action == ACTION_WAKE_OFF) {
                if (running) context.startService(i)
            } else {
                context.startForegroundService(i)
            }
        }
    }

    private enum class Mode { IDLE, WAKE, COMMAND, BUSY }

    private val main = Handler(Looper.getMainLooper())
    private val worker = Executors.newSingleThreadExecutor()
    private lateinit var apps: AppIndex
    private lateinit var actions: PhoneActions
    private lateinit var audio: AudioManager
    private var recognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var mode = Mode.IDLE
    private var wakeMode = false
    private var listenAfterSpeaking = false
    private var beepsMuted = false
    private var errorStreak = 0

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        running = true
        audio = getSystemService(AUDIO_SERVICE) as AudioManager
        apps = AppIndex(this)
        actions = PhoneActions(this, apps).also { it.onStopListening = { setWake(false) } }
        tts = TextToSpeech(this, this)
        createChannel()
        worker.execute { apps.apps() } // warm the app list
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        goForeground()
        when (intent?.action) {
            ACTION_LISTEN -> { stopRecognizer(); tts?.stop(); listen(Mode.COMMAND) }
            ACTION_WAKE_ON -> setWake(true)
            ACTION_WAKE_OFF -> setWake(false)
            ACTION_STOP -> { Prefs.setWakeMode(this, false); shutdown(); return START_NOT_STICKY }
            null -> if (Prefs.wakeMode(this)) setWake(true) // restarted by the system
        }
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        unmuteBeeps()
        recognizer?.destroy()
        tts?.shutdown()
        worker.shutdownNow()
        AssistantBus.status("Off")
        super.onDestroy()
    }

    // ---------------- notification ----------------

    private fun createChannel() {
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL, "Jarvis assistant", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Shown while Jarvis is ready to listen"
                setShowBadge(false)
            },
        )
    }

    private fun buildNotification(text: String): Notification {
        val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), flags)
        val listen = PendingIntent.getActivity(this, 1, Intent(this, ListenActivity::class.java), flags)
        val stop = PendingIntent.getService(this, 2, Intent(this, AssistantService::class.java).setAction(ACTION_STOP), flags)
        return Notification.Builder(this, CHANNEL)
            .setSmallIcon(R.drawable.ic_jarvis)
            .setContentTitle("Jarvis")
            .setContentText(text)
            .setContentIntent(open)
            .setOngoing(true)
            .addAction(Notification.Action.Builder(null, "Talk", listen).build())
            .addAction(Notification.Action.Builder(null, "Stop", stop).build())
            .build()
    }

    private fun goForeground() {
        val n = buildNotification(if (wakeMode) "Say “Jarvis” followed by a command" else "Ready")
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
        } else {
            startForeground(NOTIF_ID, n)
        }
    }

    private fun updateNotification(text: String) {
        getSystemService(NotificationManager::class.java).notify(NOTIF_ID, buildNotification(text))
    }

    // ---------------- modes ----------------

    private fun setWake(on: Boolean) {
        wakeMode = on
        Prefs.setWakeMode(this, on)
        if (on) {
            updateNotification("Say “Jarvis” followed by a command")
            if (mode == Mode.IDLE || mode == Mode.WAKE) listen(Mode.WAKE)
        } else {
            unmuteBeeps()
            if (mode == Mode.WAKE) { stopRecognizer(); mode = Mode.IDLE }
            if (mode == Mode.IDLE) shutdown()
        }
    }

    private fun shutdown() {
        wakeMode = false
        stopRecognizer()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun finishTurn() {
        if (listenAfterSpeaking) { listenAfterSpeaking = false; listen(Mode.COMMAND); return }
        if (wakeMode) listen(Mode.WAKE) else { mode = Mode.IDLE; AssistantBus.status("Ready"); shutdown() }
    }

    // ---------------- speech recognition ----------------

    private fun listen(newMode: Mode) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            AssistantBus.status("No speech recognition on this phone — install or enable the Google app.")
            mode = Mode.IDLE
            return
        }
        mode = newMode
        if (recognizer == null) {
            recognizer = SpeechRecognizer.createSpeechRecognizer(this).also { it.setRecognitionListener(this) }
        }
        if (newMode == Mode.WAKE) muteBeeps() else unmuteBeeps()
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag())
            .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
            .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
            .putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, packageName)
        if (newMode == Mode.WAKE) intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        AssistantBus.status(if (newMode == Mode.WAKE) "Waiting for “Jarvis”…" else "Listening…")
        try {
            recognizer?.startListening(intent)
        } catch (e: Exception) {
            resetRecognizer()
            main.postDelayed({ if (mode == newMode) listen(newMode) }, 1000)
        }
    }

    private fun stopRecognizer() {
        try { recognizer?.cancel() } catch (_: Exception) { }
    }

    private fun resetRecognizer() {
        try { recognizer?.destroy() } catch (_: Exception) { }
        recognizer = null
    }

    override fun onResults(results: Bundle?) {
        errorStreak = 0
        val heard = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION).orEmpty()
        if (mode == Mode.WAKE) {
            for (h in heard) {
                val lower = h.lowercase(Locale.getDefault())
                val w = WAKE_WORDS.firstOrNull { Regex("\\b$it\\b").containsMatchIn(lower) } ?: continue
                val command = lower.substringAfter(w).trim().trimStart(',', '.', ' ')
                unmuteBeeps()
                if (command.isEmpty()) {
                    listenAfterSpeaking = true
                    reply("", "Yes?")
                } else {
                    handle(command)
                }
                return
            }
            listen(Mode.WAKE) // nothing for us, keep waiting
            return
        }
        val text = heard.firstOrNull()
        if (text.isNullOrBlank()) finishTurn() else handle(text)
    }

    override fun onError(error: Int) {
        val wasMode = mode
        when (error) {
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> {
                AssistantBus.status("Microphone permission needed — open Jarvis to grant it.")
                shutdown(); return
            }
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY, SpeechRecognizer.ERROR_CLIENT,
            SpeechRecognizer.ERROR_SERVER_DISCONNECTED, SpeechRecognizer.ERROR_SERVER -> resetRecognizer()
        }
        errorStreak++
        if (wasMode == Mode.COMMAND) {
            if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                AssistantBus.status("Didn't catch that")
            }
            mode = Mode.BUSY
            main.postDelayed({ finishTurn() }, 300)
        } else if (wasMode == Mode.WAKE) {
            // Back off a little if the recognizer keeps failing, to save battery.
            val delay = if (errorStreak > 5) 3000L else 250L
            main.postDelayed({ if (wakeMode && mode == Mode.WAKE) listen(Mode.WAKE) }, delay)
        }
    }

    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {}
    override fun onPartialResults(partialResults: Bundle?) {}
    override fun onEvent(eventType: Int, params: Bundle?) {}

    // The speech engine beeps every time it starts. In always-listening mode that would beep
    // constantly, so we silence the notification/system streams while waiting for the wake word.
    private fun muteBeeps() {
        if (beepsMuted || !Prefs.muteBeeps(this)) return
        try {
            audio.adjustStreamVolume(AudioManager.STREAM_NOTIFICATION, AudioManager.ADJUST_MUTE, 0)
            audio.adjustStreamVolume(AudioManager.STREAM_SYSTEM, AudioManager.ADJUST_MUTE, 0)
            beepsMuted = true
        } catch (_: SecurityException) { }
    }

    private fun unmuteBeeps() {
        if (!beepsMuted) return
        try {
            audio.adjustStreamVolume(AudioManager.STREAM_NOTIFICATION, AudioManager.ADJUST_UNMUTE, 0)
            audio.adjustStreamVolume(AudioManager.STREAM_SYSTEM, AudioManager.ADJUST_UNMUTE, 0)
        } catch (_: SecurityException) { }
        beepsMuted = false
    }

    // ---------------- understanding & doing ----------------

    private fun handle(text: String) {
        mode = Mode.BUSY
        AssistantBus.transcript(text, "…")
        val local = CommandParser.parse(text)
        if (local != null) {
            val said = local.map { actions.run(it) }.filter { it.isNotBlank() }.joinToString(". ")
            reply(text, said.ifBlank { "Done." })
            return
        }

        val key = Prefs.apiKey(this)
        if (key.isBlank()) {
            reply(text, "Sorry, I don't know how to do that yet. Say help to hear what I can do, or add a Claude key in the app for smart mode.")
            return
        }

        AssistantBus.status("Thinking…")
        val screen = JarvisAccessibilityService.instance?.let { svc ->
            try { svc.visibleLabels() } catch (_: Exception) { emptyList() }
        } ?: emptyList()
        val model = Prefs.model(this)
        worker.execute {
            val result = try {
                ClaudeBrain.ask(key, model, text, apps.labels(), screen)
            } catch (e: Exception) {
                ClaudeBrain.Plan("I couldn't reach my brain just now. Check your internet connection or API key.", emptyList())
            }
            main.post { runPlan(text, result) }
        }
    }

    /** Runs Claude's actions one at a time, pausing between steps so screens can load. */
    private fun runPlan(heard: String, plan: ClaudeBrain.Plan) {
        val outputs = mutableListOf<String>()
        fun step(i: Int) {
            if (i >= plan.actions.size) {
                val problems = outputs.filter { it.startsWith("I ") || it.startsWith("Turn on") || it.startsWith("Something") }
                reply(heard, (listOf(plan.say) + problems).filter { it.isNotBlank() }.joinToString(" ").ifBlank { "Done." })
                return
            }
            val a = plan.actions[i]
            outputs += actions.run(a)
            val pause = when (a.type) { "open_app", "open_url", "navigate", "play_media", "home", "back", "recents", "tap" -> 1200L; else -> 250L }
            main.postDelayed({ step(i + 1) }, pause)
        }
        step(0)
    }

    private fun reply(heard: String, say: String) {
        if (heard.isNotEmpty()) AssistantBus.transcript(heard, say)
        speak(say)
    }

    // ---------------- text to speech ----------------

    override fun onInit(status: Int) {
        val t = tts ?: return
        if (status != TextToSpeech.SUCCESS) return
        t.language = Locale.getDefault()
        t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) { main.post { finishTurn() } }
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) { main.post { finishTurn() } }
        })
        ttsReady = true
    }

    private fun speak(text: String) {
        mode = Mode.BUSY
        AssistantBus.status("Speaking")
        val t = tts
        if (!ttsReady || t == null || text.isBlank()) { main.postDelayed({ finishTurn() }, 200); return }
        t.speak(text, TextToSpeech.QUEUE_FLUSH, null, "jarvis-${System.nanoTime()}")
    }
}
