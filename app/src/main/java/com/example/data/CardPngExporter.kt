package com.example.data

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import androidx.core.content.FileProvider
import androidx.core.content.res.ResourcesCompat
import com.example.R
import com.example.model.AppLanguage
import com.example.model.FontScaleOption
import com.example.model.PaperStyleId
import com.example.model.SignId
import java.io.File
import java.io.FileOutputStream

/**
 * Renders 1080x1920 (9:16) editorial Feeling Card PNGs using bundled Cormorant Garamond
 * and Plus Jakarta Sans typefaces, then shares via FileProvider or saves to Gallery via MediaStore.
 */
object CardPngExporter {

    fun paginateCardText(text: String, maxCharsPerCard: Int = 340): List<String> {
        val clean = text.trim()
        if (clean.isEmpty()) return listOf("")
        if (clean.length <= maxCharsPerCard) return listOf(clean)

        val paragraphs = clean.split(Regex("\\n+"))
        val pages = mutableListOf<String>()
        var current = ""

        for (para in paragraphs) {
            val words = para.split(Regex("\\s+")).filter { it.isNotEmpty() }
            for (word in words) {
                val candidate = if (current.isEmpty()) word else "$current $word"
                if (candidate.length > maxCharsPerCard && current.isNotEmpty()) {
                    pages.add(current.trim())
                    current = word
                } else {
                    current = candidate
                }
            }
            if (current.isNotEmpty() && current.length < maxCharsPerCard - 20) {
                current += "\n"
            }
        }
        if (current.trim().isNotEmpty()) pages.add(current.trim())
        return pages.ifEmpty { listOf(clean) }
    }

    fun renderCardBitmap(
        context: Context,
        text: String,
        style: PaperStyleId,
        fontScale: FontScaleOption,
        signId: SignId?,
        showMedallion: Boolean,
        showRecipient: Boolean,
        recipientLabel: String,
        showWatermark: Boolean,
        dateLabel: String,
        pageLabel: String?,
        language: AppLanguage
    ): Bitmap {
        val width = 1080
        val height = 1920
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val spec = UnsentCatalog.paperSpec(style)

        val serifTypeface = ResourcesCompat.getFont(context, R.font.cormorant_garamond) ?: Typeface.SERIF
        val sansTypeface = ResourcesCompat.getFont(context, R.font.plus_jakarta_sans) ?: Typeface.SANS_SERIF

        // Background subtle gradient
        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(
                0f, 0f, width.toFloat(), height.toFloat(),
                spec.bgHex, spec.bgSecondaryHex, Shader.TileMode.CLAMP
            )
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // Hairline editorial border frame
        val framePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = spec.accentHex
            alpha = 56
            this.style = Paint.Style.STROKE
            strokeWidth = 3f
        }
        canvas.drawRoundRect(RectF(80f, 108f, width - 80f, height - 108f), 28f, 28f, framePaint)

        var topY = 220f

        // Optional Zodiac sign header
        val signDef = signId?.let { UnsentCatalog.signById(it) }
        if (signDef != null) {
            val signPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = spec.accentHex
                typeface = Typeface.create(sansTypeface, Typeface.BOLD)
                textSize = 32f
            }
            val header = "${signDef.glyph}  ${signDef.westernName.get(language)} · ${signDef.rashiName.get(language)}"
            canvas.drawText(header, 132f, topY, signPaint)
            topY += 62f
        }

        // Optional recipient header
        if (showRecipient && recipientLabel.isNotBlank()) {
            val recPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = spec.mutedInkHex
                typeface = Typeface.create(serifTypeface, Typeface.NORMAL)
                textSize = 44f
            }
            canvas.drawText("To ${recipientLabel.trim()}", 132f, topY + 18f, recPaint)
            topY += 86f
        }

        // Optional dark pedestal medallion with geometric motif
        if (showMedallion) {
            val cx = width / 2f
            val cy = maxOf(topY + 190f, 520f)
            val radius = 165f

            val discPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = 0xEB19191B.toInt()
                this.style = Paint.Style.FILL
            }
            canvas.drawCircle(cx, cy, radius, discPaint)

            val ringPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = 0xFFEEEAE2.toInt()
                this.style = Paint.Style.STROKE
                strokeWidth = 3.5f
            }
            canvas.drawCircle(cx, cy, radius * 0.72f, ringPaint)
            canvas.drawCircle(cx, cy, radius * 0.44f, Paint(ringPaint).apply { alpha = 120 })

            val glyphPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = 0xFFF3F1EC.toInt()
                typeface = serifTypeface
                textSize = 96f
                textAlign = Paint.Align.CENTER
            }
            val centerSymbol = signDef?.glyph ?: "✉"
            canvas.drawText(centerSymbol, cx, cy + 32f, glyphPaint)

            topY = cy + radius + 68f
        }

        // Main editorial passage wrapped via StaticLayout
        val basePx = when (fontScale) {
            FontScaleOption.SMALL -> 46f
            FontScaleOption.MEDIUM -> 58f
            FontScaleOption.LARGE -> 72f
        }
        val textPaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
            color = spec.inkHex
            typeface = serifTypeface
            textSize = basePx
        }
        val maxWidth = width - 264
        val bodyText = text.trim().ifEmpty { " " }
        val layout = StaticLayout.Builder.obtain(bodyText, 0, bodyText.length, textPaint, maxWidth)
            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
            .setLineSpacing(0f, 1.38f)
            .build()

        val textY = if (showMedallion) {
            maxOf(topY + 24f, height * 0.52f).coerceAtMost(height - 260f - layout.height)
        } else {
            ((height - layout.height) / 2f).coerceIn(topY + 40f, maxOf(topY + 40f, height - 260f - layout.height))
        }

        canvas.save()
        canvas.translate(132f, textY)
        layout.draw(canvas)
        canvas.restore()

        // Footer: date + page + VEYL watermark
        val bottomY = height - 160f
        val footerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = spec.mutedInkHex
            typeface = Typeface.create(sansTypeface, Typeface.BOLD)
            textSize = 28f
        }
        val footerLeft = listOfNotNull(dateLabel.takeIf { it.isNotBlank() }, pageLabel).joinToString(" · ")
        if (footerLeft.isNotEmpty()) {
            canvas.drawText(footerLeft, 132f, bottomY, footerPaint)
        }

        if (showWatermark) {
            val wmPaint = Paint(footerPaint).apply {
                textAlign = Paint.Align.RIGHT
                letterSpacing = 0.14f
                alpha = 215
            }
            canvas.drawText("VEYL", width - 132f, bottomY, wmPaint)
        }

        return bitmap
    }

    fun shareCardPng(context: Context, bitmap: Bitmap): Boolean {
        return try {
            val dir = File(context.cacheDir, "shared_cards").apply { mkdirs() }
            val outFile = File(dir, "veyl-card-${System.currentTimeMillis()}.png")
            FileOutputStream(outFile).use { out ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }
            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                outFile
            )
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "Veyl Feeling Card")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(intent, "Share Feeling Card").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun saveCardToGallery(context: Context, bitmap: Bitmap): Boolean {
        return try {
            val fileName = "Veyl_Card_${System.currentTimeMillis()}.png"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Images.Media.DISPLAY_NAME, fileName)
                    put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                    put(MediaStore.Images.Media.RELATIVE_PATH, "${Environment.DIRECTORY_PICTURES}/Veyl")
                    put(MediaStore.Images.Media.IS_PENDING, 1)
                }
                val resolver = context.contentResolver
                val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: return false
                resolver.openOutputStream(uri)?.use { out ->
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                }
                values.clear()
                values.put(MediaStore.Images.Media.IS_PENDING, 0)
                resolver.update(uri, values, null, null)
                true
            } else {
                val dir = File(context.cacheDir, "shared_cards").apply { mkdirs() }
                val outFile = File(dir, fileName)
                FileOutputStream(outFile).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                }
                true
            }
        } catch (_: Exception) {
            false
        }
    }
}
