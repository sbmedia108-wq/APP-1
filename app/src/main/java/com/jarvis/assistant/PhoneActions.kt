package com.jarvis.assistant

import android.Manifest
import android.accessibilityservice.AccessibilityService
import android.app.SearchManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.provider.AlarmClock
import android.provider.ContactsContract
import android.provider.MediaStore
import android.provider.Settings
import android.telephony.SmsManager
import android.view.KeyEvent
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Carries out [Action]s on the phone and returns what Jarvis should say about it. */
class PhoneActions(private val context: Context, private val apps: AppIndex) {

    private val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val camera = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var torchOn = false

    init {
        try {
            camera.registerTorchCallback(object : CameraManager.TorchCallback() {
                override fun onTorchModeChanged(cameraId: String, enabled: Boolean) { torchOn = enabled }
            }, null)
        } catch (_: Exception) { }
    }

    /** Set by the service so "stop listening" can turn off always-listening mode. */
    var onStopListening: (() -> Unit)? = null

    fun run(a: Action): String = try {
        perform(a)
    } catch (e: SecurityException) {
        "I don't have permission for that yet. Open Jarvis and tap Grant permissions."
    } catch (e: Exception) {
        "Something went wrong: ${e.message ?: e.javaClass.simpleName}"
    }

    private fun perform(a: Action): String = when (a.type) {
        "say" -> a.value
        "help" -> HELP_SPOKEN
        "stop_listening" -> { onStopListening?.invoke(); "Okay, I'll stop listening." }
        "tell_time" -> "It's " + SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date())
        "tell_date" -> "It's " + SimpleDateFormat("EEEE, MMMM d", Locale.getDefault()).format(Date())
        "battery" -> battery()

        "open_app" -> openApp(a.value)
        "home" -> global(AccessibilityService.GLOBAL_ACTION_HOME, "") { Launcher.start(context, Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)) }
        "back" -> global(AccessibilityService.GLOBAL_ACTION_BACK, "")
        "recents" -> global(AccessibilityService.GLOBAL_ACTION_RECENTS, "")
        "notifications" -> global(AccessibilityService.GLOBAL_ACTION_NOTIFICATIONS, "")
        "quick_settings" -> global(AccessibilityService.GLOBAL_ACTION_QUICK_SETTINGS, "")
        "power_menu" -> global(AccessibilityService.GLOBAL_ACTION_POWER_DIALOG, "")
        "screenshot" -> if (Build.VERSION.SDK_INT >= 28) global(AccessibilityService.GLOBAL_ACTION_TAKE_SCREENSHOT, "") else "Screenshots need Android 9 or newer."
        "lock_screen" -> if (Build.VERSION.SDK_INT >= 28) global(AccessibilityService.GLOBAL_ACTION_LOCK_SCREEN, "") else "Locking needs Android 9 or newer."
        "scroll_up", "scroll_down" -> withA11y { if (it.scroll(a.type == "scroll_down")) "" else "I couldn't find anything to scroll." }
        "tap" -> withA11y { if (it.tapText(a.value)) "" else "I couldn't see ${a.value} on the screen." }
        "type" -> withA11y { if (it.typeText(a.value)) "" else "Tap a text box first, then ask me to type." }

        "call" -> call(a.value)
        "send_text" -> sendText(a.value, a.extra)

        "set_alarm" -> setAlarm(a.value, a.extra)
        "set_timer" -> setTimer(a.value.toIntOrNull() ?: 0)

        "flashlight" -> flashlight(a.value)
        "volume" -> volume(a.value)
        "brightness" -> brightness(a.value)

        "web_search" -> start(Intent(Intent.ACTION_WEB_SEARCH).putExtra(SearchManager.QUERY, a.value), "Searching for ${a.value}")
            ?: start(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=" + Uri.encode(a.value))), "Searching for ${a.value}")
            ?: "I couldn't open a browser."
        "navigate" -> navigate(a.value, a.extra == "map")
        "open_url" -> {
            val url = if (a.value.startsWith("http")) a.value else "https://${a.value}"
            start(Intent(Intent.ACTION_VIEW, Uri.parse(url)), "Opening ${a.value}") ?: "I couldn't open that link."
        }
        "play_media" -> playMedia(a.value, a.extra)
        "media" -> media(a.value)
        "camera" -> start(
            Intent(if (a.value == "video") MediaStore.INTENT_ACTION_VIDEO_CAMERA else MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA),
            "Opening the camera",
        ) ?: "I couldn't find a camera app."
        "open_settings" -> openSettings(a.value)
        else -> "I don't know how to do ${a.type} yet."
    }

    // ---------- helpers ----------

    private fun start(intent: Intent, reply: String): String? =
        if (Launcher.start(context, intent)) reply else null

    private inline fun withA11y(block: (JarvisAccessibilityService) -> String): String {
        val svc = JarvisAccessibilityService.instance
            ?: return "Turn on phone control first: open Jarvis and tap step 2, Accessibility."
        return block(svc)
    }

    private fun global(action: Int, reply: String, fallback: (() -> Boolean)? = null): String {
        val svc = JarvisAccessibilityService.instance
        if (svc != null && svc.performGlobalAction(action)) return reply
        if (fallback != null && fallback()) return reply
        return "Turn on phone control first: open Jarvis and tap step 2, Accessibility."
    }

    private fun battery(): String {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val pct = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val charging = bm.isCharging
        return "Battery is at $pct percent" + if (charging) " and charging." else "."
    }

    private fun openApp(name: String): String {
        val n = name.trim().lowercase()
        when (n) {
            "settings", "the settings" -> return openSettings("")
            "camera" -> return perform(Action("camera", "photo"))
            "notifications" -> return perform(Action("notifications"))
            "recent apps", "recents" -> return perform(Action("recents"))
        }
        val app = apps.find(n) ?: return "I couldn't find an app called $name."
        return if (apps.launch(app)) "Opening ${app.label}" else "I couldn't open ${app.label}."
    }

    private fun has(perm: String) =
        context.checkSelfPermission(perm) == PackageManager.PERMISSION_GRANTED

    private data class Contact(val name: String, val number: String)

    private fun findContact(spoken: String): Contact? {
        if (!has(Manifest.permission.READ_CONTACTS)) return null
        val q = spoken.trim().removePrefix("my ").trim()
        val cursor = context.contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            arrayOf(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME, ContactsContract.CommonDataKinds.Phone.NUMBER),
            null, null, null,
        ) ?: return null
        var best: Contact? = null
        var bestScore = 0.0
        val key = AppIndex.normalize(q)
        cursor.use {
            while (it.moveToNext()) {
                val name = it.getString(0) ?: continue
                val number = it.getString(1) ?: continue
                val nk = AppIndex.normalize(name)
                val first = AppIndex.normalize(name.split(" ").first())
                val score = when {
                    nk == key -> 1.0
                    first == key -> 0.95
                    nk.startsWith(key) -> 0.9
                    nk.contains(key) && key.length >= 3 -> 0.8
                    else -> 1.0 - AppIndex.levenshtein(key, nk).toDouble() / maxOf(key.length, nk.length)
                }
                if (score > bestScore) { bestScore = score; best = Contact(name, number) }
            }
        }
        return if (bestScore >= 0.6) best else null
    }

    private fun resolveNumber(who: String): Pair<String, String>? {
        val digits = who.replace(Regex("[^0-9+]"), "")
        if (digits.length >= 3 && digits.length >= who.replace(" ", "").length - 2) return digits to digits
        val c = findContact(who) ?: return null
        return c.number to c.name
    }

    private fun call(who: String): String {
        val (number, name) = resolveNumber(who)
            ?: return if (!has(Manifest.permission.READ_CONTACTS)) "I need contacts permission to find $who." else "I couldn't find $who in your contacts."
        val action = if (has(Manifest.permission.CALL_PHONE)) Intent.ACTION_CALL else Intent.ACTION_DIAL
        return start(Intent(action, Uri.parse("tel:" + Uri.encode(number))), "Calling $name") ?: "I couldn't start the call."
    }

    private fun sendText(who: String, message: String): String {
        if (message.isBlank()) return "What should the message say?"
        val (number, name) = resolveNumber(who)
            ?: return if (!has(Manifest.permission.READ_CONTACTS)) "I need contacts permission to find $who." else "I couldn't find $who in your contacts."
        if (has(Manifest.permission.SEND_SMS)) {
            val sms: SmsManager = if (Build.VERSION.SDK_INT >= 31) context.getSystemService(SmsManager::class.java)
            else @Suppress("DEPRECATION") SmsManager.getDefault()
            sms.sendMultipartTextMessage(number, null, sms.divideMessage(message), null, null)
            return "Sent to $name: $message"
        }
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + Uri.encode(number))).putExtra("sms_body", message)
        return start(intent, "I've written the message to $name. Tap send.") ?: "I couldn't open your messages app."
    }

    private fun setAlarm(hhmm: String, label: String): String {
        val parts = hhmm.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: return "What time should the alarm be?"
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        val intent = Intent(AlarmClock.ACTION_SET_ALARM)
            .putExtra(AlarmClock.EXTRA_HOUR, h)
            .putExtra(AlarmClock.EXTRA_MINUTES, m)
            .putExtra(AlarmClock.EXTRA_SKIP_UI, true)
        if (label.isNotBlank()) intent.putExtra(AlarmClock.EXTRA_MESSAGE, label)
        val spoken = SimpleDateFormat("h:mm a", Locale.getDefault()).format(
            java.util.Calendar.getInstance().apply { set(java.util.Calendar.HOUR_OF_DAY, h); set(java.util.Calendar.MINUTE, m) }.time,
        )
        return start(intent, "Alarm set for $spoken") ?: "I couldn't find a clock app."
    }

    private fun setTimer(seconds: Int): String {
        if (seconds <= 0) return "How long should the timer be?"
        val intent = Intent(AlarmClock.ACTION_SET_TIMER)
            .putExtra(AlarmClock.EXTRA_LENGTH, seconds)
            .putExtra(AlarmClock.EXTRA_SKIP_UI, true)
        return start(intent, "Timer set for ${humanDuration(seconds)}") ?: "I couldn't find a clock app."
    }

    private fun humanDuration(sec: Int): String {
        val h = sec / 3600; val m = (sec % 3600) / 60; val s = sec % 60
        return listOfNotNull(
            if (h > 0) "$h hour${if (h > 1) "s" else ""}" else null,
            if (m > 0) "$m minute${if (m > 1) "s" else ""}" else null,
            if (s > 0) "$s second${if (s > 1) "s" else ""}" else null,
        ).joinToString(" and ")
    }

    private fun flashlight(mode: String): String {
        val id = camera.cameraIdList.firstOrNull {
            camera.getCameraCharacteristics(it).get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
        } ?: return "This phone doesn't have a flashlight."
        val on = when (mode) { "on" -> true; "off" -> false; else -> !torchOn }
        camera.setTorchMode(id, on)
        torchOn = on
        return if (on) "Flashlight on" else "Flashlight off"
    }

    private fun volume(v: String): String {
        val stream = AudioManager.STREAM_MUSIC
        val max = audio.getStreamMaxVolume(stream)
        val flags = AudioManager.FLAG_SHOW_UI
        when (v) {
            "up" -> repeat(2) { audio.adjustStreamVolume(stream, AudioManager.ADJUST_RAISE, flags) }
            "down" -> repeat(2) { audio.adjustStreamVolume(stream, AudioManager.ADJUST_LOWER, flags) }
            "mute" -> { audio.adjustStreamVolume(stream, AudioManager.ADJUST_MUTE, flags); return "Muted" }
            "unmute" -> { audio.adjustStreamVolume(stream, AudioManager.ADJUST_UNMUTE, flags); return "Sound is back on" }
            else -> {
                val pct = v.toIntOrNull()?.coerceIn(0, 100) ?: return "What volume? Say a number from 0 to 100."
                audio.setStreamVolume(stream, Math.round(max * pct / 100f), flags)
                return "Volume $pct percent"
            }
        }
        return "Volume ${Math.round(audio.getStreamVolume(stream) * 100f / max)} percent"
    }

    private fun brightness(v: String): String {
        if (!Settings.System.canWrite(context)) {
            start(Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS, Uri.parse("package:" + context.packageName)), "")
            return "I need permission to change brightness. Turn on Allow modifying system settings for Jarvis."
        }
        val cr = context.contentResolver
        Settings.System.putInt(cr, Settings.System.SCREEN_BRIGHTNESS_MODE, Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL)
        val cur = Settings.System.getInt(cr, Settings.System.SCREEN_BRIGHTNESS, 128)
        val target = when (v) {
            "up" -> cur + 64
            "down" -> cur - 64
            else -> Math.round((v.toIntOrNull() ?: return "Say a brightness from 0 to 100.").coerceIn(0, 100) * 2.55f)
        }.coerceIn(5, 255)
        Settings.System.putInt(cr, Settings.System.SCREEN_BRIGHTNESS, target)
        return "Brightness ${Math.round(target / 2.55f)} percent"
    }

    private fun navigate(place: String, justShow: Boolean): String {
        val nav = Intent(Intent.ACTION_VIEW, Uri.parse(
            if (justShow) "geo:0,0?q=" + Uri.encode(place) else "google.navigation:q=" + Uri.encode(place),
        ))
        return start(nav, if (justShow) "Here's $place" else "Starting directions to $place")
            ?: start(Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=" + Uri.encode(place))), "Here's $place on the map")
            ?: "I couldn't find a maps app."
    }

    private fun playMedia(query: String, where: String): String {
        val q = query.trim()
        when {
            where.contains("youtube") -> {
                val i = Intent(Intent.ACTION_SEARCH).setPackage(
                    if (where == "youtube music") "com.google.android.apps.youtube.music" else "com.google.android.youtube",
                ).putExtra(SearchManager.QUERY, q)
                return start(i, "Searching YouTube for $q")
                    ?: start(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=" + Uri.encode(q))), "Searching YouTube for $q")
                    ?: "I couldn't open YouTube."
            }
            where == "spotify" ->
                return start(Intent(Intent.ACTION_VIEW, Uri.parse("spotify:search:" + Uri.encode(q))), "Opening $q on Spotify")
                    ?: "Spotify isn't installed."
        }
        val play = Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
            .putExtra(SearchManager.QUERY, q)
            .putExtra(MediaStore.EXTRA_MEDIA_FOCUS, "vnd.android.cursor.item/*")
        return start(play, "Playing $q")
            ?: start(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=" + Uri.encode(q))), "Searching YouTube for $q")
            ?: "I couldn't find an app to play that."
    }

    private fun media(cmd: String): String {
        val code = when (cmd) {
            "pause" -> KeyEvent.KEYCODE_MEDIA_PAUSE
            "play" -> KeyEvent.KEYCODE_MEDIA_PLAY
            "next" -> KeyEvent.KEYCODE_MEDIA_NEXT
            "previous" -> KeyEvent.KEYCODE_MEDIA_PREVIOUS
            else -> KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE
        }
        audio.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, code))
        audio.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, code))
        return ""
    }

    private fun openSettings(which: String): String {
        val q = Build.VERSION.SDK_INT >= 29
        val (action, reply) = when (which) {
            "wifi" -> (if (q) Settings.Panel.ACTION_WIFI else Settings.ACTION_WIFI_SETTINGS) to
                "Android doesn't let apps flip Wi-Fi directly, so here's the Wi-Fi switch."
            "bluetooth" -> Settings.ACTION_BLUETOOTH_SETTINGS to "Here are your Bluetooth settings."
            "internet" -> (if (q) Settings.Panel.ACTION_INTERNET_CONNECTIVITY else Settings.ACTION_WIRELESS_SETTINGS) to "Here are your connection settings."
            "nfc" -> (if (q) Settings.Panel.ACTION_NFC else Settings.ACTION_NFC_SETTINGS) to "Here's NFC."
            "airplane" -> Settings.ACTION_AIRPLANE_MODE_SETTINGS to "Here's airplane mode."
            "location" -> Settings.ACTION_LOCATION_SOURCE_SETTINGS to "Here are location settings."
            "display" -> Settings.ACTION_DISPLAY_SETTINGS to "Display settings."
            "battery" -> Intent.ACTION_POWER_USAGE_SUMMARY to "Battery settings."
            "sound" -> (if (q) Settings.Panel.ACTION_VOLUME else Settings.ACTION_SOUND_SETTINGS) to "Sound settings."
            "apps" -> Settings.ACTION_APPLICATION_SETTINGS to "Your apps."
            "storage" -> Settings.ACTION_INTERNAL_STORAGE_SETTINGS to "Storage settings."
            "notifications" -> Settings.ACTION_SETTINGS to "Settings."
            "accessibility" -> Settings.ACTION_ACCESSIBILITY_SETTINGS to "Accessibility settings."
            else -> Settings.ACTION_SETTINGS to "Opening settings"
        }
        return start(Intent(action), reply) ?: start(Intent(Settings.ACTION_SETTINGS), "Opening settings") ?: "I couldn't open settings."
    }

    companion object {
        const val HELP_SPOKEN =
            "You can say things like: open WhatsApp, call Mum, text Sam saying I'm on my way, set an alarm for 7 AM, " +
                "set a timer for 10 minutes, flashlight on, volume up, go home, go back, scroll down, tap Subscribe, " +
                "take a screenshot, lock the phone, navigate to the nearest petrol station, play Drake on Spotify, or what time is it."
    }
}
