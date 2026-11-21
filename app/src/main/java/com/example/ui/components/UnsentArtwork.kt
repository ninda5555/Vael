package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.UnsentCatalog
import com.example.model.ElementKind
import com.example.model.SignId
import com.example.ui.theme.PlusJakartaSans
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun VeylWordmark(
    color: Color,
    modifier: Modifier = Modifier,
    fontSizeSp: Float = 18f,
    showSwash: Boolean = false
) {
    Column(modifier = modifier, horizontalAlignment = Alignment.Start) {
        Text(
            text = "VEYL",
            fontFamily = PlusJakartaSans,
            fontWeight = FontWeight.Bold,
            fontSize = fontSizeSp.sp,
            letterSpacing = 4.sp,
            color = color
        )
        if (showSwash) {
            Canvas(
                modifier = Modifier
                    .width(72.dp)
                    .height(10.dp)
            ) {
                val path = Path().apply {
                    moveTo(2f, size.height * 0.72f)
                    quadraticTo(size.width * 0.45f, size.height * 0.15f, size.width - 8f, size.height * 0.48f)
                }
                drawPath(
                    path = path,
                    color = color.copy(alpha = 0.78f),
                    style = Stroke(width = 2.2f, cap = StrokeCap.Round)
                )
                drawLine(
                    color = color.copy(alpha = 0.78f),
                    start = Offset(size.width - 14f, size.height * 0.25f),
                    end = Offset(size.width - 6f, size.height * 0.48f),
                    strokeWidth = 2.2f,
                    cap = StrokeCap.Round
                )
                drawLine(
                    color = color.copy(alpha = 0.78f),
                    start = Offset(size.width - 13f, size.height * 0.78f),
                    end = Offset(size.width - 6f, size.height * 0.48f),
                    strokeWidth = 2.2f,
                    cap = StrokeCap.Round
                )
            }
        }
    }
}

/**
 * Monochrome lunar disc accurately illustrating waxing/waning illumination from phaseAngle (0..360).
 */
@Composable
fun MonochromeMoonCanvas(
    phaseAngle: Double,
    size: Dp = 52.dp,
    litColor: Color = Color(0xFFF3F1EC),
    darkColor: Color = Color(0xFF2B2D2F),
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .size(size)
            .semantics { contentDescription = "Moon phase diagram" }
    ) {
        val r = this.size.minDimension / 2f - 2f
        val center = Offset(this.size.width / 2f, this.size.height / 2f)

        // Base dark lunar sphere
        drawCircle(color = darkColor, radius = r, center = center)
        drawCircle(
            color = litColor.copy(alpha = 0.35f),
            radius = r,
            center = center,
            style = Stroke(width = 1.5f)
        )

        val rad = (phaseAngle % 360.0) * PI / 180.0
        val waxing = (phaseAngle % 360.0) < 180.0
        val terminatorScale = cos(rad).toFloat() // 1 at new, 0 at quarter, -1 at full

        // Lit half + terminator curve via sampled polygon for crisp accuracy on all API levels
        val path = Path()
        val steps = 36
        for (i in 0..steps) {
            val theta = -PI / 2.0 + PI * i / steps
            val y = center.y + r * sin(theta).toFloat()
            val limbX = if (waxing) center.x + r * cos(theta).toFloat() else center.x - r * cos(theta).toFloat()
            if (i == 0) path.moveTo(limbX, y) else path.lineTo(limbX, y)
        }
        for (i in steps downTo 0) {
            val theta = -PI / 2.0 + PI * i / steps
            val y = center.y + r * sin(theta).toFloat()
            val tx = if (waxing) {
                center.x + r * terminatorScale * cos(theta).toFloat()
            } else {
                center.x - r * terminatorScale * cos(theta).toFloat()
            }
            path.lineTo(tx, y)
        }
        path.close()
        drawPath(path = path, color = litColor)
    }
}

/**
 * Interactive geometric astral sculpture rendered on Canvas.
 * Supports Folded Ivory Envelope (default) or Fire/Earth/Air/Water element sculptures
 * with ambient slow breathing/rotation and manual drag/offset rotation.
 */
@Composable
fun AstralSculptureCanvas(
    element: ElementKind?,
    rotationOffsetDeg: Float = 0f,
    paused: Boolean = false,
    reducedMotion: Boolean = false,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "astral_orbit")
    val ambientAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 18000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "ambient_angle"
    )
    val effectiveAngle = if (paused || reducedMotion) rotationOffsetDeg else (ambientAngle + rotationOffsetDeg) % 360f
    val rad = effectiveAngle * (PI.toFloat() / 180f)

    Canvas(
        modifier = modifier.semantics {
            contentDescription = element?.let { "${it.name.lowercase()} geometric sculpture" }
                ?: "Folded ivory envelope sculpture"
        }
    ) {
        val cx = size.width / 2f
        val cy = size.height / 2f
        val r = size.minDimension * 0.37f
        val ivory = Color(0xFFEEEAE2)
        val clay = Color(0xFFA63A32)

        // Subtle pedestal shadow
        drawOval(
            color = Color.Black.copy(alpha = 0.34f),
            topLeft = Offset(cx - r * 0.72f, cy + r * 0.92f),
            size = Size(r * 1.44f, r * 0.24f)
        )

        when (element) {
            null -> {
                // Folded Ivory Envelope with clay wax seal & gentle float
                val floatY = if (paused || reducedMotion) 0f else sin(rad * 2f) * (r * 0.08f)
                val envW = r * 1.85f
                val envH = r * 1.24f
                val left = cx - envW / 2f
                val top = cy - envH / 2f + floatY
                val tiltDeg = if (paused || reducedMotion) -3f else sin(rad) * 5f

                rotate(degrees = tiltDeg, pivot = Offset(cx, cy + floatY)) {
                    drawRoundRect(
                        color = ivory,
                        topLeft = Offset(left, top),
                        size = Size(envW, envH),
                        cornerRadius = CornerRadius(r * 0.14f, r * 0.14f)
                    )
                    // Flap fold lines
                    val flap = Path().apply {
                        moveTo(left + 4f, top + 4f)
                        lineTo(cx, top + envH * 0.56f)
                        lineTo(left + envW - 4f, top + 4f)
                    }
                    drawPath(
                        path = flap,
                        color = Color(0xFF19191B).copy(alpha = 0.24f),
                        style = Stroke(width = 2.6f, join = StrokeJoin.Round)
                    )
                    // Subtle lower fold lines
                    drawLine(
                        color = Color(0xFF19191B).copy(alpha = 0.12f),
                        start = Offset(left + 6f, top + envH - 6f),
                        end = Offset(cx - envW * 0.16f, top + envH * 0.48f),
                        strokeWidth = 2f
                    )
                    drawLine(
                        color = Color(0xFF19191B).copy(alpha = 0.12f),
                        start = Offset(left + envW - 6f, top + envH - 6f),
                        end = Offset(cx + envW * 0.16f, top + envH * 0.48f),
                        strokeWidth = 2f
                    )
                    // Clay wax seal at center flap
                    drawCircle(
                        color = clay,
                        radius = r * 0.23f,
                        center = Offset(cx, top + envH * 0.54f)
                    )
                    drawCircle(
                        color = ivory.copy(alpha = 0.28f),
                        radius = r * 0.15f,
                        center = Offset(cx, top + envH * 0.54f),
                        style = Stroke(width = 1.6f)
                    )
                }
            }

            ElementKind.FIRE -> {
                // Rotating faceted octahedron flame prism
                val points = (0..5).map { i ->
                    val a = rad + i * (PI.toFloat() / 3f)
                    Offset(cx + cos(a) * r * 0.85f, cy + sin(a) * r * 0.34f)
                }
                val apexTop = Offset(cx, cy - r * 1.05f)
                val apexBottom = Offset(cx, cy + r * 0.85f)
                points.forEachIndexed { idx, p ->
                    val next = points[(idx + 1) % points.size]
                    drawLine(ivory.copy(alpha = 0.85f), apexTop, p, strokeWidth = 2.4f)
                    drawLine(ivory.copy(alpha = 0.45f), apexBottom, p, strokeWidth = 1.8f)
                    drawLine(clay.copy(alpha = 0.85f), p, next, strokeWidth = 2.4f)
                }
                drawCircle(clay, radius = r * 0.14f, center = Offset(cx, cy - r * 0.08f))
            }

            ElementKind.EARTH -> {
                // Concentric tilted terracotta clay rings + monolith core
                for (i in 0..3) {
                    val scale = 0.42f + i * 0.21f
                    val ringAngle = effectiveAngle * (if (i % 2 == 0) 0.4f else -0.3f) + i * 18f
                    rotate(ringAngle, Offset(cx, cy)) {
                        drawOval(
                            color = if (i == 1) clay else ivory.copy(alpha = 0.78f - i * 0.14f),
                            topLeft = Offset(cx - r * scale, cy - r * scale * 0.56f),
                            size = Size(r * scale * 2f, r * scale * 1.12f),
                            style = Stroke(width = 2.6f)
                        )
                    }
                }
                drawCircle(ivory, radius = r * 0.2f, center = Offset(cx, cy))
            }

            ElementKind.AIR -> {
                // Interlocking orbital ribbons
                for (i in 0..2) {
                    rotate(effectiveAngle * 0.5f + i * 60f, Offset(cx, cy)) {
                        drawOval(
                            color = ivory.copy(alpha = 0.82f - i * 0.18f),
                            topLeft = Offset(cx - r, cy - r * 0.38f),
                            size = Size(r * 2f, r * 0.76f),
                            style = Stroke(width = 2.2f)
                        )
                    }
                }
                val orb = Offset(cx + cos(rad * 1.5f) * r * 0.85f, cy + sin(rad * 1.5f) * r * 0.34f)
                drawCircle(clay, radius = r * 0.12f, center = orb)
            }

            ElementKind.WATER -> {
                // Lunar tide ripples & silver droplet
                for (i in 0..3) {
                    val pulse = ((effectiveAngle / 90f + i * 0.25f) % 1f)
                    val radius = r * (0.28f + pulse * 0.78f)
                    drawCircle(
                        color = ivory.copy(alpha = (1f - pulse) * 0.75f),
                        radius = radius,
                        center = Offset(cx, cy),
                        style = Stroke(width = 2.2f)
                    )
                }
                drawCircle(
                    color = ivory,
                    radius = r * 0.22f,
                    center = Offset(cx, cy),
                    style = Stroke(width = 2.8f)
                )
                drawCircle(color = clay, radius = r * 0.09f, center = Offset(cx, cy))
            }
        }
    }
}

/**
 * Interactive 12-sign Zodiac Wheel Canvas. Tapping any radial sector selects that sign.
 */
@Composable
fun ZodiacWheelCanvas(
    selectedSign: SignId,
    onSelectSign: (SignId) -> Unit,
    modifier: Modifier = Modifier
) {
    val signs = UnsentCatalog.ZODIAC_SIGNS
    val selectedIndex = signs.indexOfFirst { it.id == selectedSign }.coerceAtLeast(0)

    Canvas(
        modifier = modifier
            .pointerInput(signs) {
                detectTapGestures { offset ->
                    val cx = size.width / 2f
                    val cy = size.height / 2f
                    val dx = offset.x - cx
                    val dy = offset.y - cy
                    var deg = (atan2(dy.toDouble(), dx.toDouble()) * 180.0 / PI) + 90.0
                    if (deg < 0) deg += 360.0
                    val sector = ((deg / 30.0).toInt()) % 12
                    onSelectSign(signs[sector].id)
                }
            }
            .semantics { contentDescription = "Interactive 12-sign zodiac wheel" }
    ) {
        val cx = size.width / 2f
        val cy = size.height / 2f
        val outerR = size.minDimension * 0.44f
        val innerR = outerR * 0.54f
        val ivory = Color(0xFFEEEAE2)
        val clay = Color(0xFFA63A32)

        // Outer & inner celestial rings
        drawCircle(ivory.copy(alpha = 0.30f), radius = outerR, center = Offset(cx, cy), style = Stroke(2f))
        drawCircle(ivory.copy(alpha = 0.22f), radius = innerR, center = Offset(cx, cy), style = Stroke(1.6f))

        // 12 radial dividers + sign nodes
        for (i in 0 until 12) {
            val spokeAngle = (-90.0 + i * 30.0) * PI / 180.0
            val p1 = Offset(cx + cos(spokeAngle).toFloat() * innerR, cy + sin(spokeAngle).toFloat() * innerR)
            val p2 = Offset(cx + cos(spokeAngle).toFloat() * outerR, cy + sin(spokeAngle).toFloat() * outerR)
            drawLine(ivory.copy(alpha = 0.22f), p1, p2, strokeWidth = 1.4f)

            val midAngle = (-75.0 + i * 30.0) * PI / 180.0
            val midR = (innerR + outerR) / 2f
            val node = Offset(cx + cos(midAngle).toFloat() * midR, cy + sin(midAngle).toFloat() * midR)
            val isSel = i == selectedIndex
            if (isSel) {
                drawCircle(color = ivory, radius = outerR * 0.14f, center = node)
                drawCircle(color = clay, radius = outerR * 0.055f, center = node)
            } else {
                drawCircle(color = ivory.copy(alpha = 0.55f), radius = outerR * 0.045f, center = node)
            }
        }

        // Center compass needle pointing to focused sign
        val targetAngle = (-75.0 + selectedIndex * 30.0) * PI / 180.0
        val tip = Offset(cx + cos(targetAngle).toFloat() * (innerR * 0.82f), cy + sin(targetAngle).toFloat() * (innerR * 0.82f))
        drawLine(clay, Offset(cx, cy), tip, strokeWidth = 3f, cap = StrokeCap.Round)
        drawCircle(ivory, radius = outerR * 0.08f, center = Offset(cx, cy))
    }
}
