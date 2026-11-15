package com.jarvis.assistant

/** One thing to do on the phone. The local parser and Claude both produce these. */
data class Action(val type: String, val value: String = "", val extra: String = "")

/** Every action type Jarvis knows how to perform (shared with the Claude schema). */
object ActionTypes {
    val ALL = listOf(
        "open_app", "home", "back", "recents", "notifications", "quick_settings",
        "screenshot", "lock_screen", "power_menu", "scroll_up", "scroll_down",
        "tap", "type", "call", "send_text", "set_alarm", "set_timer", "flashlight",
        "volume", "brightness", "web_search", "navigate", "play_media", "media",
        "open_url", "open_settings", "camera", "tell_time", "tell_date", "battery",
        "stop_listening", "help", "say",
    )
}
