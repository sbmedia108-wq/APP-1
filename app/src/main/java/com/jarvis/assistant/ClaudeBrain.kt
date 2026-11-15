package com.jarvis.assistant

import com.anthropic.client.AnthropicClient
import com.anthropic.client.okhttp.AnthropicOkHttpClient
import com.anthropic.core.JsonValue
import com.anthropic.models.messages.JsonOutputFormat
import com.anthropic.models.messages.MessageCreateParams
import com.anthropic.models.messages.OutputConfig
import com.anthropic.models.messages.StopReason
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Smart mode: when the offline parser doesn't understand a request, Claude turns it into a
 * short spoken reply plus a list of phone [Action]s. Must be called off the main thread.
 */
object ClaudeBrain {

    data class Plan(val say: String, val actions: List<Action>)

    private var client: AnthropicClient? = null
    private var clientKey: String? = null
    private val history = ArrayDeque<String>()

    private fun client(apiKey: String): AnthropicClient {
        if (client == null || clientKey != apiKey) {
            client = AnthropicOkHttpClient.builder().apiKey(apiKey).build()
            clientKey = apiKey
        }
        return client!!
    }

    private val SYSTEM = """
You are Jarvis, a voice assistant running on the user's Android phone. You hear the user through
speech recognition (expect mis-hearings and fix them sensibly) and you control the phone by
returning actions. Your "say" text is read aloud, so keep it to one or two short, natural
sentences with no markdown, lists or emoji. If the request is only a question, answer it in "say"
and return no actions.

Action types (value / extra):
- open_app: value = app name, preferably exactly as in the installed-apps list
- home, back, recents, notifications, quick_settings, screenshot, lock_screen, power_menu, scroll_up, scroll_down: no value
- tap: value = the visible text or label of the thing to tap (use the on-screen list)
- type: value = text to type into the focused text box
- call: value = contact name or phone number
- send_text: value = contact name or number, extra = message body
- set_alarm: value = "HH:MM" 24-hour, extra = optional label
- set_timer: value = whole seconds
- flashlight: value = on | off | toggle
- volume: value = up | down | mute | unmute | 0-100
- brightness: value = up | down | 0-100
- web_search: value = query
- navigate: value = destination; extra = "map" to only show it instead of starting directions
- play_media: value = what to play, extra = "spotify" | "youtube" | "youtube music" | "" (default player)
- media: value = play | pause | next | previous
- open_url: value = URL
- open_settings: value = wifi | bluetooth | internet | nfc | airplane | location | display | battery | sound | apps | storage | accessibility | "" (main settings)
- camera: value = photo | video
- tell_time, tell_date, battery: no value
- stop_listening: user wants you to stop listening

Multi-step requests become several actions in order, e.g. open an app, then tap, then type.
Never invent contacts or phone numbers. Use empty strings for unused value/extra fields.
""".trimIndent()

    private fun schema(): JsonOutputFormat.Schema {
        val action = mapOf(
            "type" to "object",
            "properties" to mapOf(
                "type" to mapOf("type" to "string", "enum" to ActionTypes.ALL.filter { it != "say" && it != "help" }),
                "value" to mapOf("type" to "string"),
                "extra" to mapOf("type" to "string"),
            ),
            "required" to listOf("type", "value", "extra"),
            "additionalProperties" to false,
        )
        return JsonOutputFormat.Schema.builder()
            .putAdditionalProperty("type", JsonValue.from("object"))
            .putAdditionalProperty(
                "properties",
                JsonValue.from(
                    mapOf(
                        "say" to mapOf("type" to "string"),
                        "actions" to mapOf("type" to "array", "items" to action),
                    ),
                ),
            )
            .putAdditionalProperty("required", JsonValue.from(listOf("say", "actions")))
            .putAdditionalProperty("additionalProperties", JsonValue.from(false))
            .build()
    }

    fun ask(apiKey: String, model: String, heard: String, installedApps: List<String>, screen: List<String>): Plan {
        val now = SimpleDateFormat("EEEE d MMMM yyyy, HH:mm", Locale.getDefault()).format(Date())
        val user = buildString {
            appendLine("Current time: $now")
            appendLine("Installed apps: " + installedApps.take(250).joinToString(", "))
            if (screen.isNotEmpty()) appendLine("Text currently on screen: " + screen.joinToString(" | "))
            if (history.isNotEmpty()) {
                appendLine("Recent conversation:")
                history.forEach { appendLine(it) }
            }
            appendLine()
            append("User said: \"$heard\"")
        }

        val params = MessageCreateParams.builder()
            .model(model)
            .maxTokens(4000L)
            .system(SYSTEM)
            .outputConfig(
                OutputConfig.builder()
                    // Low effort keeps voice replies fast; raise it for harder multi-step tasks.
                    .effort(OutputConfig.Effort.LOW)
                    .format(JsonOutputFormat.builder().schema(schema()).build())
                    .build(),
            )
            // If a safety classifier declines, let the API retry on a fallback model automatically.
            .putAdditionalHeader("anthropic-beta", "server-side-fallback-2026-07-01")
            .putAdditionalBodyProperty("fallbacks", JsonValue.from("default"))
            .addUserMessage(user)
            .build()

        val response = client(apiKey).messages().create(params)
        if (response.stopReason().orElse(null) == StopReason.REFUSAL) {
            return Plan("Sorry, I can't help with that one.", emptyList())
        }
        val text = response.content().mapNotNull { b -> b.text().map { it.text() }.orElse(null) }.joinToString("")
        val plan = parse(text)
        remember("User: $heard", "Jarvis: ${plan.say}")
        return plan
    }

    private fun remember(vararg lines: String) {
        lines.forEach { history.addLast(it) }
        while (history.size > 8) history.removeFirst()
    }

    fun parse(json: String): Plan {
        val obj = JSONObject(json.trim())
        val arr = obj.optJSONArray("actions")
        val actions = mutableListOf<Action>()
        if (arr != null) for (i in 0 until arr.length()) {
            val a = arr.getJSONObject(i)
            val type = a.optString("type")
            if (type in ActionTypes.ALL) actions += Action(type, a.optString("value"), a.optString("extra"))
        }
        return Plan(obj.optString("say"), actions)
    }
}
