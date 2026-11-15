package com.jarvis.assistant

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * The part of Jarvis that can actually drive the phone: global buttons (home, back, recents,
 * lock, screenshot), tapping on-screen things by name, scrolling and typing. Android only grants
 * these powers to an accessibility service that the user switches on themselves.
 */
class JarvisAccessibilityService : AccessibilityService() {

    companion object {
        @Volatile
        var instance: JarvisAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        instance = this
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        instance = null
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}

    private fun roots(): List<AccessibilityNodeInfo> {
        val fromWindows = try { windows.mapNotNull { it.root } } catch (_: Exception) { emptyList() }
        val active = rootInActiveWindow
        return (listOfNotNull(active) + fromWindows).distinct()
    }

    private fun walk(node: AccessibilityNodeInfo?, out: MutableList<AccessibilityNodeInfo>, depth: Int = 0) {
        if (node == null || depth > 40 || out.size > 2000) return
        out += node
        for (i in 0 until node.childCount) walk(node.getChild(i), out, depth + 1)
    }

    private fun allNodes(): List<AccessibilityNodeInfo> {
        val out = mutableListOf<AccessibilityNodeInfo>()
        roots().forEach { walk(it, out) }
        return out
    }

    private fun labelOf(n: AccessibilityNodeInfo): String =
        (n.text?.toString() ?: n.contentDescription?.toString() ?: "").trim()

    /** Short list of what's on screen, used to give Claude context in smart mode. */
    fun visibleLabels(limit: Int = 60): List<String> =
        allNodes().filter { it.isVisibleToUser }
            .map { labelOf(it) }
            .filter { it.isNotEmpty() && it.length < 80 }
            .distinct()
            .take(limit)

    fun tapText(query: String): Boolean {
        val q = AppIndex.normalize(query)
        if (q.isEmpty()) return false
        val candidates = allNodes().filter { it.isVisibleToUser && AppIndex.normalize(labelOf(it)).isNotEmpty() }
        val target = candidates.firstOrNull { AppIndex.normalize(labelOf(it)) == q }
            ?: candidates.firstOrNull { AppIndex.normalize(labelOf(it)).startsWith(q) }
            ?: candidates.firstOrNull { AppIndex.normalize(labelOf(it)).contains(q) }
            ?: return false

        var n: AccessibilityNodeInfo? = target
        while (n != null) {
            if (n.isClickable && n.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true
            n = n.parent
        }
        val r = Rect()
        target.getBoundsInScreen(r)
        return tapAt(r.exactCenterX(), r.exactCenterY())
    }

    fun tapAt(x: Float, y: Float): Boolean {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 60))
            .build()
        return dispatchGesture(gesture, null, null)
    }

    fun typeText(text: String): Boolean {
        val focused = roots().firstNotNullOfOrNull { it.findFocus(AccessibilityNodeInfo.FOCUS_INPUT) }
            ?: allNodes().firstOrNull { it.isEditable && it.isVisibleToUser }
            ?: return false
        val existing = if (focused.isShowingHintTextCompat()) "" else focused.text?.toString().orEmpty()
        val newText = if (existing.isBlank()) text else "$existing $text"
        val args = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, newText)
        }
        focused.performAction(AccessibilityNodeInfo.ACTION_FOCUS)
        return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
    }

    private fun AccessibilityNodeInfo.isShowingHintTextCompat(): Boolean =
        if (android.os.Build.VERSION.SDK_INT >= 26) isShowingHintText else false

    fun scroll(down: Boolean): Boolean {
        val scrollable = allNodes()
            .filter { it.isScrollable && it.isVisibleToUser }
            .maxByOrNull { val r = Rect(); it.getBoundsInScreen(r); r.width() * r.height() }
        val action = if (down) AccessibilityNodeInfo.ACTION_SCROLL_FORWARD else AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD
        if (scrollable != null && scrollable.performAction(action)) return true

        // Fallback: a swipe gesture in the middle of the screen.
        val dm = resources.displayMetrics
        val x = dm.widthPixels / 2f
        val (y1, y2) = if (down) dm.heightPixels * 0.75f to dm.heightPixels * 0.3f else dm.heightPixels * 0.3f to dm.heightPixels * 0.75f
        val path = Path().apply { moveTo(x, y1); lineTo(x, y2) }
        return dispatchGesture(
            GestureDescription.Builder().addStroke(GestureDescription.StrokeDescription(path, 0, 300)).build(), null, null,
        )
    }
}
