package com.jarvis.assistant

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle

/**
 * Invisible screen that just kicks off one round of listening. Android only lets an app start
 * using the microphone in the background if it was visible a moment ago, so the Quick Settings
 * tile, notification button, headset button and assist gesture all come through here.
 */
class ListenActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } else {
            AssistantService.send(this, AssistantService.ACTION_LISTEN)
        }
        finish()
        overridePendingTransition(0, 0)
    }
}
