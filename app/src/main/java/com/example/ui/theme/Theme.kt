package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.TextSize
import com.example.model.ThemeMode

val PlusJakartaSans = FontFamily(
    Font(R.font.plus_jakarta_sans, FontWeight.Normal),
    Font(R.font.plus_jakarta_sans, FontWeight.Medium),
    Font(R.font.plus_jakarta_sans, FontWeight.SemiBold),
    Font(R.font.plus_jakarta_sans, FontWeight.Bold)
)

val CormorantGaramond = FontFamily(
    Font(R.font.cormorant_garamond, FontWeight.Normal),
    Font(R.font.cormorant_garamond, FontWeight.Medium),
    Font(R.font.cormorant_garamond, FontWeight.SemiBold),
    Font(R.font.cormorant_garamond, FontWeight.Bold)
)

@Immutable
data class VeylPalette(
    val canvas: Color,
    val surface: Color,
    val raised: Color,
    val divider: Color,
    val ink: Color,
    val secondaryInk: Color,
    val heroBg: Color,
    val heroText: Color,
    val heroMuted: Color,
    val ivory: Color,
    val ivoryInk: Color,
    val clay: Color,
    val isDark: Boolean
)

val PaperPalette = VeylPalette(
    canvas = Color(0xFFF3F3F5),
    surface = Color(0xFFFFFFFF),
    raised = Color(0xFFECECEF),
    divider = Color(0xFFDADADD),
    ink = Color(0xFF19191B),
    secondaryInk = Color(0xFF59595F),
    heroBg = Color(0xFF19191B),
    heroText = Color(0xFFF3F1EC),
    heroMuted = Color(0xFFB3B4B1),
    ivory = Color(0xFFEEEAE2),
    ivoryInk = Color(0xFF1A1B1C),
    clay = Color(0xFFA63A32),
    isDark = false
)

val InkPalette = VeylPalette(
    canvas = Color(0xFF151617),
    surface = Color(0xFF1D1F20),
    raised = Color(0xFF252729),
    divider = Color(0xFF363839),
    ink = Color(0xFFF3F1EC),
    secondaryInk = Color(0xFFB3B4B1),
    heroBg = Color(0xFF1D1F20),
    heroText = Color(0xFFF3F1EC),
    heroMuted = Color(0xFFB3B4B1),
    ivory = Color(0xFFEEEAE2),
    ivoryInk = Color(0xFF1A1B1C),
    clay = Color(0xFFE07A73),
    isDark = true
)

val LocalVeylPalette = staticCompositionLocalOf { PaperPalette }

private val PaperColorScheme = lightColorScheme(
    primary = Color(0xFF19191B),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFEEEAE2),
    onPrimaryContainer = Color(0xFF1A1B1C),
    secondary = Color(0xFF59595F),
    onSecondary = Color(0xFFFFFFFF),
    tertiary = Color(0xFFA63A32),
    onTertiary = Color(0xFFFFFFFF),
    background = Color(0xFFF3F3F5),
    onBackground = Color(0xFF19191B),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF19191B),
    surfaceVariant = Color(0xFFECECEF),
    onSurfaceVariant = Color(0xFF59595F),
    outline = Color(0xFFDADADD),
    error = Color(0xFFA63A32)
)

private val InkColorScheme = darkColorScheme(
    primary = Color(0xFFEEEAE2),
    onPrimary = Color(0xFF1A1B1C),
    primaryContainer = Color(0xFF252729),
    onPrimaryContainer = Color(0xFFF3F1EC),
    secondary = Color(0xFFB3B4B1),
    onSecondary = Color(0xFF151617),
    tertiary = Color(0xFFE07A73),
    onTertiary = Color(0xFF151617),
    background = Color(0xFF151617),
    onBackground = Color(0xFFF3F1EC),
    surface = Color(0xFF1D1F20),
    onSurface = Color(0xFFF3F1EC),
    surfaceVariant = Color(0xFF252729),
    onSurfaceVariant = Color(0xFFB3B4B1),
    outline = Color(0xFF363839),
    error = Color(0xFFE07A73)
)

fun buildVeylTypography(scale: Float): Typography = Typography(
    displaySmall = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = (28f * scale).sp,
        lineHeight = (34f * scale).sp,
        letterSpacing = (-0.4).sp
    ),
    headlineMedium = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = (24f * scale).sp,
        lineHeight = (30f * scale).sp,
        letterSpacing = (-0.3).sp
    ),
    headlineSmall = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = (20f * scale).sp,
        lineHeight = (26f * scale).sp,
        letterSpacing = (-0.2).sp
    ),
    titleLarge = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = (18f * scale).sp,
        lineHeight = (24f * scale).sp
    ),
    titleMedium = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.SemiBold,
        fontSize = (16f * scale).sp,
        lineHeight = (22f * scale).sp
    ),
    bodyLarge = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Medium,
        fontSize = (15f * scale).sp,
        lineHeight = (22f * scale).sp
    ),
    bodyMedium = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Normal,
        fontSize = (14f * scale).sp,
        lineHeight = (20f * scale).sp
    ),
    labelLarge = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = (14f * scale).sp,
        lineHeight = (18f * scale).sp
    ),
    labelMedium = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.SemiBold,
        fontSize = (12f * scale).sp,
        lineHeight = (16f * scale).sp
    ),
    labelSmall = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Medium,
        fontSize = (11f * scale).sp,
        lineHeight = (14f * scale).sp
    )
)

@Composable
fun VeylTheme(
    themeMode: ThemeMode,
    textSize: TextSize = TextSize.NORMAL,
    content: @Composable () -> Unit
) {
    val systemDark = isSystemInDarkTheme()
    val useDark = when (themeMode) {
        ThemeMode.PAPER -> false
        ThemeMode.INK -> true
        ThemeMode.SYSTEM -> systemDark
    }
    val palette = if (useDark) InkPalette else PaperPalette
    val colorScheme = if (useDark) InkColorScheme else PaperColorScheme
    val fontScale = if (textSize == TextSize.LARGE) 1.12f else 1.0f

    CompositionLocalProvider(LocalVeylPalette provides palette) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = buildVeylTypography(fontScale),
            content = content
        )
    }
}
