package com.jarvis.assistant

import android.Manifest
import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast

class MainActivity : Activity(), AssistantBus.Listener {

    private lateinit var status: TextView
    private lateinit var transcript: TextView
    private lateinit var wakeSwitch: Switch
    private lateinit var btnPermissions: Button
    private lateinit var btnAccessibility: Button
    private lateinit var btnWriteSettings: Button
    private lateinit var btnBattery: Button
    private var pendingAfterPermission: (() -> Unit)? = null

    private val runtimePermissions: Array<String>
        get() = buildList {
            add(Manifest.permission.RECORD_AUDIO)
            add(Manifest.permission.READ_CONTACTS)
            add(Manifest.permission.CALL_PHONE)
            add(Manifest.permission.SEND_SMS)
            if (Build.VERSION.SDK_INT >= 33) add(Manifest.permission.POST_NOTIFICATIONS)
        }.toTypedArray()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        status = findViewById(R.id.status)
        transcript = findViewById(R.id.transcript)
        wakeSwitch = findViewById(R.id.wakeSwitch)
        btnPermissions = findViewById(R.id.btnPermissions)
        btnAccessibility = findViewById(R.id.btnAccessibility)
        btnWriteSettings = findViewById(R.id.btnWriteSettings)
        btnBattery = findViewById(R.id.btnBattery)
        val apiKey = findViewById<EditText>(R.id.apiKey)
        val muteSwitch = findViewById<Switch>(R.id.muteSwitch)

        findViewById<TextView>(R.id.helpText).text = HELP

        findViewById<ImageButton>(R.id.micButton).setOnClickListener {
            withMic { AssistantService.send(this, AssistantService.ACTION_LISTEN) }
        }

        wakeSwitch.isChecked = Prefs.wakeMode(this) && AssistantService.running
        wakeSwitch.setOnCheckedChangeListener { _, on ->
            if (on) {
                withMic { AssistantService.send(this, AssistantService.ACTION_WAKE_ON) }
            } else {
                Prefs.setWakeMode(this, false)
                AssistantService.send(this, AssistantService.ACTION_WAKE_OFF)
            }
        }

        muteSwitch.isChecked = Prefs.muteBeeps(this)
        muteSwitch.setOnCheckedChangeListener { _, on -> Prefs.setMuteBeeps(this, on) }

        btnPermissions.setOnClickListener { requestPermissions(runtimePermissions, 1) }
        btnAccessibility.setOnClickListener {
            Toast.makeText(this, "Find Jarvis in the list and switch it on", Toast.LENGTH_LONG).show()
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }
        btnWriteSettings.setOnClickListener {
            startActivity(Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS, Uri.parse("package:$packageName")))
        }
        btnBattery.setOnClickListener {
            @Suppress("BatteryLife")
            val i = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$packageName"))
            try { startActivity(i) } catch (_: Exception) { startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)) }
        }

        if (Prefs.apiKey(this).isNotEmpty()) apiKey.hint = "Key saved ✓ (enter a new one to replace)"
        findViewById<Button>(R.id.btnSaveKey).setOnClickListener {
            val k = apiKey.text.toString().trim()
            Prefs.setApiKey(this, k)
            apiKey.setText("")
            apiKey.hint = if (k.isEmpty()) "sk-ant-…" else "Key saved ✓ (enter a new one to replace)"
            Toast.makeText(this, if (k.isEmpty()) "Smart mode off" else "Smart mode on", Toast.LENGTH_SHORT).show()
        }

        // Opened by the "assist" gesture or a headset button: start listening straight away.
        if (intent?.action == Intent.ACTION_ASSIST || intent?.action == Intent.ACTION_VOICE_COMMAND) {
            withMic { AssistantService.send(this, AssistantService.ACTION_LISTEN) }
        }
    }

    override fun onResume() {
        super.onResume()
        AssistantBus.listener = this
        onStatus(AssistantBus.lastStatus)
        if (AssistantBus.lastYou.isNotEmpty()) onTranscript(AssistantBus.lastYou, AssistantBus.lastJarvis)
        refreshSetup()
    }

    override fun onPause() {
        if (AssistantBus.listener === this) AssistantBus.listener = null
        super.onPause()
    }

    override fun onStatus(status: String) { this.status.text = status }

    override fun onTranscript(you: String, jarvis: String) {
        transcript.text = "You: $you\n\nJarvis: $jarvis"
    }

    private fun has(p: String) = checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED

    private fun withMic(then: () -> Unit) {
        if (has(Manifest.permission.RECORD_AUDIO)) { then(); return }
        pendingAfterPermission = then
        requestPermissions(runtimePermissions, 2)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        refreshSetup()
        val next = pendingAfterPermission
        pendingAfterPermission = null
        if (has(Manifest.permission.RECORD_AUDIO)) {
            next?.invoke()
        } else {
            wakeSwitch.isChecked = false
            Toast.makeText(this, "Jarvis needs the microphone to hear you", Toast.LENGTH_LONG).show()
        }
    }

    private fun accessibilityOn(): Boolean {
        val me = ComponentName(this, JarvisAccessibilityService::class.java).flattenToString()
        val enabled = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
        return enabled.split(':').any { it.equals(me, ignoreCase = true) } || JarvisAccessibilityService.instance != null
    }

    private fun refreshSetup() {
        fun mark(b: Button, done: Boolean, label: String) {
            b.text = if (done) "✓  $label" else label
            b.alpha = if (done) 0.6f else 1f
        }
        mark(btnPermissions, runtimePermissions.all { has(it) }, "1. Grant permissions (mic, contacts, calls, SMS)")
        mark(btnAccessibility, accessibilityOn(), "2. Turn on phone control (Accessibility)")
        mark(btnWriteSettings, Settings.System.canWrite(this), "3. Allow brightness control")
        val pm = getSystemService(PowerManager::class.java)
        mark(btnBattery, pm.isIgnoringBatteryOptimizations(packageName), "4. Don't let Android kill Jarvis (battery)")
    }

    companion object {
        private const val HELP = """THINGS YOU CAN SAY

Apps: “open Spotify”, “launch the camera”, “go to bbc.co.uk”
Phone: “go home”, “go back”, “recent apps”, “show notifications”, “quick settings”, “take a screenshot”, “lock the phone”, “power menu”
On screen: “scroll down”, “tap Subscribe”, “click Next”, “type hello there”
Calls & texts: “call Mum”, “text Sam saying I'm on my way”, “call 07700 900123”
Time: “set an alarm for 6:45 am”, “set a timer for 10 minutes”, “what time is it”, “what's the date”
Phone settings: “flashlight on”, “volume up”, “volume 40 percent”, “mute”, “brightness 70”, “turn on Wi-Fi”, “Bluetooth settings”
Media: “play Drake on Spotify”, “play lo-fi beats on YouTube”, “pause”, “next song”
Maps & web: “navigate to the airport”, “search for pizza near me”
Chain steps: “open WhatsApp then tap Chats”
Jarvis: “battery level”, “help”, “stop listening”

With smart mode on, you can say anything — Jarvis works out the steps."""
    }
}
