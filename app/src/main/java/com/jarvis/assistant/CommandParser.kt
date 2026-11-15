package com.jarvis.assistant

/**
 * Offline, rule-based understanding of common commands. Returns null when it doesn't
 * recognise the request, so the caller can hand it to Claude (smart mode) instead.
 * Pure Kotlin with no Android dependencies, so it is unit-testable on the JVM.
 */
object CommandParser {

    fun parse(raw: String): List<Action>? {
        val parts = clean(raw).split(Regex("\\s+(?:and then|then|and also)\\s+")).filter { it.isNotBlank() }
        if (parts.isEmpty()) return null
        val actions = mutableListOf<Action>()
        for (p in parts) actions += parseOne(p) ?: return null
        return actions
    }

    fun clean(raw: String): String {
        var s = raw.lowercase().trim()
            .replace(Regex("[?!.,]+$"), "")
            .replace(",", " ")
            .replace(Regex("\\s+"), " ")
        val fillers = listOf(
            "hey jarvis", "ok jarvis", "okay jarvis", "jarvis", "please", "can you", "could you",
            "would you", "will you", "i want you to", "i want to", "i'd like to", "go ahead and",
        )
        var changed = true
        while (changed) {
            changed = false
            for (f in fillers) {
                if (s.startsWith("$f ") || s == f) { s = s.removePrefix(f).trim(); changed = true }
            }
        }
        s = s.removeSuffix(" please").removeSuffix(" for me").trim()
        return s
    }

    private fun m(s: String, pattern: String): MatchResult? = Regex(pattern).find(s)

    private fun parseOne(s: String): Action? {
        if (s.isBlank()) return null

        // ---- assistant control ----
        if (m(s, "^(stop listening|go to sleep|goodbye|bye|that's all|that is all|stop jarvis|shut down|turn yourself off)$") != null)
            return Action("stop_listening")
        if (m(s, "^(help|what can you do|what can i say|commands)$") != null) return Action("help")

        // ---- info ----
        if (m(s, "^(what time is it|what's the time|what is the time|tell me the time|time|the time)$") != null) return Action("tell_time")
        if (m(s, "^(what's the date|what is the date|what day is it|what's today's date|today's date|date)$") != null) return Action("tell_date")
        if (m(s, "battery") != null && m(s, "(how much|what's|what is|level|percent|left|status|^battery$)") != null) return Action("battery")

        // ---- navigation / system (accessibility) ----
        if (m(s, "^(go )?(back|go back|press back|previous screen)$") != null) return Action("back")
        if (m(s, "^(go )?(home|to the home screen|home screen)$|^(close (this|the app|app|everything)|minimi[sz]e)") != null) return Action("home")
        if (m(s, "^(show |open )?(the )?(recent apps|recents|recent|app switcher|multitask(ing)?)$") != null) return Action("recents")
        if (m(s, "^(show |open |pull down )?(my |the )?(notifications|notification shade)$") != null) return Action("notifications")
        if (m(s, "^(show |open )?(the )?quick settings$") != null) return Action("quick_settings")
        if (m(s, "(take|grab|capture) (a )?screen ?shot|^screenshot$") != null) return Action("screenshot")
        if (m(s, "^lock( the| my)? (screen|phone|device)$|^lock$") != null) return Action("lock_screen")
        if (m(s, "power (menu|options)") != null) return Action("power_menu")
        m(s, "^(scroll|swipe|page) (up|down)")?.let {
            return Action(if (it.groupValues[2] == "up") "scroll_up" else "scroll_down")
        }
        m(s, "^(?:tap|click|press|select|hit|choose)(?: on)?(?: the)? (.+?)(?: button| link| icon)?$")?.let {
            return Action("tap", it.groupValues[1])
        }
        m(s, "^(?:type|write|enter|input)(?: in| out)? (.+)$")?.let { return Action("type", it.groupValues[1]) }

        // ---- hardware ----
        if (m(s, "(flash ?light|torch|flash)") != null) {
            return Action("flashlight", when {
                m(s, "\\b(off|disable|stop|kill)\\b") != null -> "off"
                m(s, "\\b(on|enable|start)\\b") != null -> "on"
                else -> "toggle"
            })
        }
        parseVolume(s)?.let { return it }
        parseBrightness(s)?.let { return it }

        // ---- settings ----
        m(s, "(?:turn|switch|toggle) (?:on|off) (?:the |my )?(wi-?fi|bluetooth|nfc|airplane mode|aeroplane mode|mobile data|data|location|hotspot)|(?:turn|switch|toggle) (?:the |my )?(wi-?fi|bluetooth|nfc|airplane mode|aeroplane mode|mobile data|data|location|hotspot) (?:on|off)")?.let {
            val what = it.groupValues[1].ifEmpty { it.groupValues[2] }
            return Action("open_settings", settingKey(what))
        }
        m(s, "^(?:open |show |go to )?(?:the |my )?(wi-?fi|bluetooth|nfc|display|battery|sound|volume|location|apps|app|airplane mode|internet|storage|notification|accessibility)? ?settings$")?.let {
            return Action("open_settings", settingKey(it.groupValues[1]))
        }

        // ---- timers & alarms ----
        m(s, "^(?:set |start )?(?:a |an )?timer (?:for )?(.+)$|^(.+) timer$|^(?:count ?down|remind me in) (.+)$")?.let {
            val spec = it.groupValues.drop(1).firstOrNull { g -> g.isNotEmpty() } ?: ""
            parseDurationSeconds(spec)?.let { secs -> return Action("set_timer", secs.toString()) }
        }
        m(s, "^(?:set |create |make )?(?:an |the |a )?alarm (?:for |at )?(.+)$|^wake me( up)? (?:at |for )?(.+)$")?.let {
            val spec = it.groupValues[1].ifEmpty { it.groupValues[3] }
            parseClock(spec)?.let { (h, min) -> return Action("set_alarm", "%02d:%02d".format(h, min)) }
        }

        // ---- communication ----
        m(s, "^(?:send )?(?:a )?(?:text|message|sms)(?: message)?(?: to)? (.+?)(?:,)? (?:saying|that says|that|say|and say|telling (?:them|him|her))\\s+(.+)$")?.let {
            return Action("send_text", it.groupValues[1].trim(), it.groupValues[2].trim())
        }
        m(s, "^(?:text|message) (.+?)\\s+(.+)$")?.let {
            // "text mum on my way" — ambiguous; require short recipient
            val who = it.groupValues[1]
            if (who.split(" ").size <= 2) return Action("send_text", who, it.groupValues[2])
        }
        m(s, "^(?:call|phone|ring|dial|facetime)(?: up)? (.+?)(?: now)?$")?.let { return Action("call", it.groupValues[1]) }

        // ---- media ----
        if (m(s, "^(pause|stop)( the)?( music| song| playback| video| audio)?$") != null) return Action("media", "pause")
        if (m(s, "^(play|resume|continue)( the)?( music| song| playback)?$") != null) return Action("media", "play")
        if (m(s, "^(next|skip)( song| track| one)?$|^skip (this )?(song|track)$|^play the next (song|track)$") != null) return Action("media", "next")
        if (m(s, "^(previous|last|go back a)( song| track)$|^play the previous (song|track)$") != null) return Action("media", "previous")
        m(s, "^play (.+?) on (youtube music|youtube|spotify|soundcloud)$")?.let {
            return Action("play_media", it.groupValues[1], it.groupValues[2])
        }
        m(s, "^(?:play|put on|listen to) (.+)$")?.let { return Action("play_media", it.groupValues[1], "") }

        // ---- camera ----
        if (m(s, "(take|snap) (a )?(photo|picture|pic|selfie)|^open (the )?camera$|^camera$") != null) return Action("camera", "photo")
        if (m(s, "(record|take|shoot) (a )?video") != null) return Action("camera", "video")

        // ---- web & maps ----
        m(s, "^(?:navigate|directions|get directions|take me|drive me|give me directions|how do i get)(?: to| home to)? (.+)$")?.let {
            return Action("navigate", it.groupValues[1])
        }
        m(s, "^(?:where is|find|show me) (.+) on (?:the )?map$")?.let { return Action("navigate", it.groupValues[1], "map") }
        m(s, "^(?:go to|open|visit) ((?:www\\.)?[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:com|org|net|io|co|uk|co\\.uk|dev|app|ai|gov|edu|tv|me))$")?.let {
            return Action("open_url", it.groupValues[1])
        }
        m(s, "^(?:search(?: the web| google| online)?(?: for)?|google|look up|bing) (.+)$")?.let { return Action("web_search", it.groupValues[1]) }

        // ---- apps ----
        m(s, "^(?:open|launch|start|run|load|go to|show me|bring up|fire up)(?: up)?(?: the| my)?(?: app)? (.+?)(?: app| application)?$")?.let {
            return Action("open_app", it.groupValues[1])
        }

        return null
    }

    private fun settingKey(raw: String): String = when (raw.replace("-", "")) {
        "wifi" -> "wifi"
        "bluetooth" -> "bluetooth"
        "nfc" -> "nfc"
        "airplane mode", "aeroplane mode" -> "airplane"
        "mobile data", "data", "internet", "hotspot" -> "internet"
        "location" -> "location"
        "display" -> "display"
        "battery" -> "battery"
        "sound", "volume" -> "sound"
        "apps", "app" -> "apps"
        "storage" -> "storage"
        "notification" -> "notifications"
        "accessibility" -> "accessibility"
        else -> ""
    }

    private fun parseVolume(s: String): Action? {
        if (m(s, "^(unmute|un-mute|sound on)") != null) return Action("volume", "unmute")
        if (m(s, "^(mute|silence|be quiet|quiet)( the)?( phone| sound| volume| audio| media| it)?$|silent mode") != null) return Action("volume", "mute")
        if (m(s, "(max|maximum|full) volume|volume (to )?(max|maximum|full)") != null) return Action("volume", "100")
        m(s, "volume (?:to |at )?(\\d{1,3})(?: ?%| percent)?|(\\d{1,3})(?: ?%| percent) volume")?.let {
            return Action("volume", it.groupValues[1].ifEmpty { it.groupValues[2] })
        }
        if (m(s, "(volume up|turn (it|the volume|the sound|the music) up|turn up the (volume|sound|music)|louder|raise the volume|increase (the )?volume)") != null) return Action("volume", "up")
        if (m(s, "(volume down|turn (it|the volume|the sound|the music) down|turn down the (volume|sound|music)|quieter|softer|lower the volume|decrease (the )?volume)") != null) return Action("volume", "down")
        return null
    }

    private fun parseBrightness(s: String): Action? {
        if (m(s, "bright|dim") == null) return null
        if (m(s, "(max|maximum|full) brightness|brightness (to )?(max|maximum|full)") != null) return Action("brightness", "100")
        if (m(s, "(min|minimum|lowest) brightness|brightness (to )?(min|minimum|lowest)") != null) return Action("brightness", "0")
        m(s, "brightness (?:to |at )?(\\d{1,3})")?.let { return Action("brightness", it.groupValues[1]) }
        if (m(s, "(brighter|brightness up|increase (the )?brightness|turn up (the )?brightness|raise (the )?brightness)") != null) return Action("brightness", "up")
        if (m(s, "(dimmer|dim (the )?screen|brightness down|decrease (the )?brightness|turn down (the )?brightness|lower (the )?brightness)") != null) return Action("brightness", "down")
        return null
    }

    private val NUMBER_WORDS = mapOf(
        "a" to 1, "an" to 1, "one" to 1, "two" to 2, "three" to 3, "four" to 4, "five" to 5,
        "six" to 6, "seven" to 7, "eight" to 8, "nine" to 9, "ten" to 10, "eleven" to 11,
        "twelve" to 12, "fifteen" to 15, "twenty" to 20, "thirty" to 30, "forty" to 40,
        "forty five" to 45, "fifty" to 50, "sixty" to 60, "ninety" to 90,
    )

    fun parseDurationSeconds(spec: String): Int? {
        var s = spec.lowercase().trim()
        if (s.contains("half an hour") || s.contains("half hour")) s = s.replace(Regex("half an? hour|half hour"), "30 minutes")
        if (s.contains("quarter of an hour") || s.contains("quarter hour")) s = s.replace(Regex("quarter (of an )?hour"), "15 minutes")
        s = s.replace(Regex("and a half (hour|minute)s?")) { r -> "${r.groupValues[1]}s 30 ${if (r.groupValues[1] == "hour") "minutes" else "seconds"}" }
        for ((w, n) in NUMBER_WORDS.entries.sortedByDescending { it.key.length }) {
            s = s.replace(Regex("\\b$w\\b"), n.toString())
        }
        var total = 0
        var found = false
        for (r in Regex("(\\d+(?:\\.\\d+)?)\\s*(hours?|hrs?|h\\b|minutes?|mins?|m\\b|seconds?|secs?|s\\b)").findAll(s)) {
            val n = r.groupValues[1].toDouble()
            val unit = r.groupValues[2]
            total += when {
                unit.startsWith("h") -> (n * 3600).toInt()
                unit.startsWith("m") -> (n * 60).toInt()
                else -> n.toInt()
            }
            found = true
        }
        return if (found && total > 0) total else null
    }

    /** "7", "7 30", "7:30 pm", "half past 6", "noon" -> (hour24, minute). */
    fun parseClock(spec: String): Pair<Int, Int>? {
        var s = spec.lowercase().trim()
            .replace("a.m.", "am").replace("p.m.", "pm").replace("o'clock", "").replace(Regex("\\b(tomorrow|today|tonight|in the)\\b"), " ")
            .replace(Regex("\\s+"), " ").trim()
        if (s.startsWith("noon") || s == "midday") return 12 to 0
        if (s.startsWith("midnight")) return 0 to 0
        for ((w, n) in NUMBER_WORDS.entries.sortedByDescending { it.key.length }) {
            if (w == "a" || w == "an") continue
            s = s.replace(Regex("\\b$w\\b"), n.toString())
        }
        var pm = s.contains("pm") || s.contains("evening") || s.contains("night") || s.contains("afternoon")
        val am = s.contains("am") || s.contains("morning")
        var hour: Int
        var minute = 0
        val past = Regex("(half|quarter|\\d{1,2}) (past|after|to) (\\d{1,2})").find(s)
        if (past != null) {
            val mins = when (past.groupValues[1]) { "half" -> 30; "quarter" -> 15; else -> past.groupValues[1].toInt() }
            hour = past.groupValues[3].toInt()
            if (past.groupValues[2] == "to") { hour -= 1; minute = 60 - mins } else minute = mins
        } else {
            val r = Regex("(\\d{1,2})(?:[: ](\\d{2}))?").find(s) ?: return null
            hour = r.groupValues[1].toInt()
            if (r.groupValues[2].isNotEmpty()) minute = r.groupValues[2].toInt()
            // "730" spoken as one token
            if (r.groupValues[2].isEmpty()) Regex("\\b(\\d{1,2})(\\d{2})\\b").find(s)?.let { hour = it.groupValues[1].toInt(); minute = it.groupValues[2].toInt() }
        }
        if (hour !in 0..23 || minute !in 0..59) return null
        if (pm && hour < 12) hour += 12
        if (am && hour == 12) hour = 0
        if (!pm && !am && hour == 12) pm = true
        return hour to minute
    }
}
