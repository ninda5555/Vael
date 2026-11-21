package com.example.data

import android.content.Context
import android.media.MediaPlayer
import com.example.R

/**
 * Opt-in ambient flute soundtrack controller.
 * Silent on launch; loops softly when explicitly enabled by the user.
 */
class AudioController(private val context: Context) {

    private var player: MediaPlayer? = null

    fun toggle(currentlyPlaying: Boolean): Boolean {
        return if (currentlyPlaying) {
            pause()
            false
        } else {
            play()
        }
    }

    fun play(): Boolean {
        return try {
            val mp = player ?: MediaPlayer.create(context, R.raw.krishna_flute)?.apply {
                isLooping = true
                setVolume(0.42f, 0.42f)
            }
            player = mp
            if (mp != null) {
                mp.start()
                true
            } else {
                false
            }
        } catch (_: Exception) {
            false
        }
    }

    fun pause() {
        try {
            if (player?.isPlaying == true) {
                player?.pause()
            }
        } catch (_: Exception) {
            // Ignore audio pause edge cases
        }
    }

    fun release() {
        try {
            player?.release()
        } catch (_: Exception) {
            // Ignore release errors
        } finally {
            player = null
        }
    }
}
