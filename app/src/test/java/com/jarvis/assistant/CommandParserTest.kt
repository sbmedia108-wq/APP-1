package com.jarvis.assistant

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class CommandParserTest {
    private fun one(s: String) = CommandParser.parse(s)?.single()

    @Test fun apps() {
        assertEquals(Action("open_app", "spotify"), one("Open Spotify"))
        assertEquals(Action("open_app", "whatsapp"), one("Jarvis, can you launch WhatsApp please"))
        assertEquals(Action("open_app", "youtube"), one("open the YouTube app"))
        assertEquals(Action("camera", "photo"), one("open camera"))
        assertEquals(Action("open_url", "bbc.co.uk"), one("go to bbc.co.uk"))
    }

    @Test fun system() {
        assertEquals(Action("home"), one("go home"))
        assertEquals(Action("home"), one("go to the home screen"))
        assertEquals(Action("back"), one("go back"))
        assertEquals(Action("recents"), one("show recent apps"))
        assertEquals(Action("screenshot"), one("take a screenshot"))
        assertEquals(Action("lock_screen"), one("lock the phone"))
        assertEquals(Action("scroll_down"), one("scroll down"))
        assertEquals(Action("tap", "subscribe"), one("tap on the subscribe button"))
        assertEquals(Action("type", "hello there"), one("type hello there"))
        assertEquals(Action("notifications"), one("show my notifications"))
    }

    @Test fun hardware() {
        assertEquals(Action("flashlight", "on"), one("turn on the flashlight"))
        assertEquals(Action("flashlight", "off"), one("torch off"))
        assertEquals(Action("volume", "up"), one("turn the volume up"))
        assertEquals(Action("volume", "40"), one("set volume to 40 percent"))
        assertEquals(Action("volume", "mute"), one("mute"))
        assertEquals(Action("brightness", "70"), one("brightness to 70"))
        assertEquals(Action("brightness", "down"), one("dim the screen"))
        assertEquals(Action("open_settings", "wifi"), one("turn on wifi"))
        assertEquals(Action("open_settings", "bluetooth"), one("bluetooth settings"))
        assertEquals(Action("open_settings", ""), one("open settings"))
    }

    @Test fun time() {
        assertEquals(Action("set_timer", "600"), one("set a timer for 10 minutes"))
        assertEquals(Action("set_timer", "90"), one("timer for 1 minute 30 seconds"))
        assertEquals(Action("set_timer", "1800"), one("set a timer for half an hour"))
        assertEquals(Action("set_timer", "300"), one("5 minute timer"))
        assertEquals(Action("set_alarm", "06:45"), one("set an alarm for 6:45 am"))
        assertEquals(Action("set_alarm", "19:30"), one("set alarm for 7 30 pm"))
        assertEquals(Action("set_alarm", "07:00"), one("wake me up at 7 a.m."))
        assertEquals(Action("tell_time"), one("what time is it?"))
    }

    @Test fun comms() {
        assertEquals(Action("call", "mum"), one("call mum"))
        assertEquals(Action("send_text", "sam", "i'm on my way"), one("text Sam saying I'm on my way"))
        assertEquals(Action("send_text", "john", "running late"), one("send a message to john that running late"))
    }

    @Test fun media() {
        assertEquals(Action("play_media", "drake", "spotify"), one("play drake on spotify"))
        assertEquals(Action("media", "pause"), one("pause the music"))
        assertEquals(Action("media", "next"), one("next song"))
        assertEquals(Action("navigate", "the airport"), one("navigate to the airport"))
        assertEquals(Action("web_search", "pizza near me"), one("search for pizza near me"))
    }

    @Test fun chains() {
        assertEquals(
            listOf(Action("open_app", "whatsapp"), Action("tap", "chats")),
            CommandParser.parse("open whatsapp then tap chats"),
        )
    }

    @Test fun unknownGoesToSmartMode() {
        assertNull(CommandParser.parse("what's the weather like in london"))
        assertNull(CommandParser.parse("tell me a joke"))
    }
}
