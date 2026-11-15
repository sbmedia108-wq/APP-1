package com.jarvis.assistant

import android.content.Context
import android.os.Handler
import android.os.Looper

object Prefs {
    private const val FILE = "jarvis"
    private fun sp(c: Context) = c.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun apiKey(c: Context): String = sp(c).getString("api_key", "") ?: ""
    fun setApiKey(c: Context, v: String) = sp(c).edit().putString("api_key", v.trim()).apply()

    fun model(c: Context): String = sp(c).getString("model", "claude-opus-5-5") ?: "claude-opus-5-5"

    fun wakeMode(c: Context) = sp(c).getBoolean("wake_mode", false)
    fun setWakeMode(c: Context, v: Boolean) = sp(c).edit().putBoolean("wake_mode", v).apply()

    fun muteBeeps(c: Context) = sp(c).getBoolean("mute_beeps", true)
    fun setMuteBeeps(c: Context, v: Boolean) = sp(c).edit().putBoolean("mute_beeps", v).apply()
}

/** Tiny main-thread event bus so the UI can mirror what the background service is doing. */
object AssistantBus {
    interface Listener {
        fun onStatus(status: String)
        fun onTranscript(you: String, jarvis: String)
    }

    private val main = Handler(Looper.getMainLooper())
    var listener: Listener? = null
    var lastStatus = "Ready"
        private set
    var lastYou = ""
        private set
    var lastJarvis = ""
        private set

    fun status(s: String) = main.post { lastStatus = s; listener?.onStatus(s) }
    fun transcript(you: String, jarvis: String) = main.post {
        lastYou = you; lastJarvis = jarvis; listener?.onTranscript(you, jarvis)
    }
}
