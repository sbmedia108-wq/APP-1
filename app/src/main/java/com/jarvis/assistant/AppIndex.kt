package com.jarvis.assistant

import android.content.Context
import android.content.Intent

/** Finds installed apps by a spoken name ("open insta" -> Instagram). */
class AppIndex(private val context: Context) {
    data class App(val label: String, val pkg: String, val key: String)

    private var cache: List<App> = emptyList()
    private var loadedAt = 0L

    fun apps(): List<App> {
        if (cache.isEmpty() || System.currentTimeMillis() - loadedAt > 5 * 60_000) {
            val pm = context.packageManager
            val launcher = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
            cache = pm.queryIntentActivities(launcher, 0)
                .map { ri ->
                    val label = ri.loadLabel(pm).toString()
                    App(label, ri.activityInfo.packageName, normalize(label))
                }
                .filter { it.pkg != context.packageName }
                .distinctBy { it.pkg }
                .sortedBy { it.label.lowercase() }
            loadedAt = System.currentTimeMillis()
        }
        return cache
    }

    fun labels(): List<String> = apps().map { it.label }

    fun find(spoken: String): App? {
        val q = normalize(ALIASES[spoken.trim().lowercase()] ?: spoken)
        if (q.isEmpty()) return null
        var best: App? = null
        var bestScore = 0.0
        for (app in apps()) {
            val s = score(q, app.key)
            if (s > bestScore) { bestScore = s; best = app }
        }
        return if (bestScore >= 0.55) best else null
    }

    fun launch(app: App): Boolean {
        val intent = context.packageManager.getLaunchIntentForPackage(app.pkg) ?: return false
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
        return Launcher.start(context, intent)
    }

    private fun score(q: String, label: String): Double = when {
        q == label -> 1.0
        label.startsWith(q) -> 0.9
        q.startsWith(label) && label.length >= 3 -> 0.8
        label.contains(q) && q.length >= 3 -> 0.75
        else -> {
            val d = levenshtein(q, label)
            1.0 - d.toDouble() / maxOf(q.length, label.length)
        }
    }

    companion object {
        private val ALIASES = mapOf(
            "insta" to "instagram", "the gram" to "instagram", "yt" to "youtube",
            "fb" to "facebook", "messenger" to "messenger", "texts" to "messages",
            "text messages" to "messages", "sms" to "messages", "mail" to "gmail",
            "email" to "gmail", "maps" to "maps", "google maps" to "maps",
            "browser" to "chrome", "internet" to "chrome", "music" to "spotify",
            "photos" to "photos", "gallery" to "gallery", "play store" to "play store",
            "app store" to "play store", "calculator" to "calculator", "x" to "x",
            "twitter" to "x", "snap" to "snapchat", "whatsapp" to "whatsapp",
            "clock" to "clock", "calendar" to "calendar", "phone" to "phone",
            "dialer" to "phone", "contacts" to "contacts", "files" to "files",
        )

        fun normalize(s: String) = s.lowercase().replace(Regex("[^a-z0-9]"), "")

        fun levenshtein(a: String, b: String): Int {
            val dp = IntArray(b.length + 1) { it }
            for (i in 1..a.length) {
                var prev = dp[0]
                dp[0] = i
                for (j in 1..b.length) {
                    val tmp = dp[j]
                    dp[j] = minOf(dp[j] + 1, dp[j - 1] + 1, prev + if (a[i - 1] == b[j - 1]) 0 else 1)
                    prev = tmp
                }
            }
            return dp[b.length]
        }
    }
}

/**
 * Starts activities. Android blocks background apps from opening screens, but an app whose
 * accessibility service is enabled is exempt, so we launch from that service when we can.
 */
object Launcher {
    fun start(context: Context, intent: Intent): Boolean {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        val ctx: Context = JarvisAccessibilityService.instance ?: context
        return try {
            ctx.startActivity(intent); true
        } catch (e: Exception) {
            false
        }
    }
}
