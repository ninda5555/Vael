package com.example.model

import androidx.compose.ui.graphics.Color
import kotlinx.serialization.Serializable

@Serializable
enum class AppLanguage(val code: String, val displayName: String) {
    EN("en", "English"),
    BN("bn", "বাংলা"),
    HI("hi", "हिन्दी"),
    HINGLISH("hinglish", "Hinglish")
}

@Serializable
enum class ThemeMode {
    PAPER, INK, SYSTEM
}

@Serializable
enum class TextSize {
    NORMAL, LARGE
}

enum class TabId {
    TODAY, ZODIAC, ALMANAC, BOX
}

enum class CreateMode {
    LETTER, CARD
}

@Serializable
enum class SignId {
    ARIES, TAURUS, GEMINI, CANCER, LEO, VIRGO,
    LIBRA, SCORPIO, SAGITTARIUS, CAPRICORN, AQUARIUS, PISCES
}

enum class ElementKind {
    FIRE, EARTH, AIR, WATER
}

@Serializable
enum class RecipientCategory {
    EX, MOTHER, FATHER, FRIEND, LOST, PAST_SELF, FUTURE_SELF, PRESENT_SELF, CUSTOM
}

@Serializable
enum class PaperStyleId {
    OLD_PARCHMENT, MIDNIGHT_BLUE, ROSE_PETAL, RAIN_GLASS, TORN_NOTEBOOK, MOONLIT_INK
}

enum class ReleaseVisual {
    ASH, EMBERS, PAPER_BIRDS
}

enum class FontScaleOption {
    SMALL, MEDIUM, LARGE
}

enum class PairContext {
    FRIENDSHIP, FAMILY, CREATIVE
}

@Serializable
enum class MoonPhaseKey {
    NEW_MOON,
    WAXING_CRESCENT,
    FIRST_QUARTER,
    WAXING_GIBBOUS,
    FULL_MOON,
    WANING_GIBBOUS,
    LAST_QUARTER,
    WANING_CRESCENT
}

@Serializable
data class LetterRecord(
    val id: String,
    val recipientCategory: RecipientCategory = RecipientCategory.PRESENT_SELF,
    val recipientLabel: String = "Present Self",
    val salutation: String = "Dear me right now,",
    val contextPrompt: String? = null,
    val body: String = "",
    val paper: PaperStyleId = PaperStyleId.OLD_PARCHMENT,
    val sealed: Boolean = false,
    val sealedAt: String? = null,
    val favorite: Boolean = false,
    val linkedAlmanacDate: String? = null,
    val signLens: SignId? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class FeelingCardRecord(
    val id: String,
    val text: String,
    val moodLabel: String? = null,
    val style: PaperStyleId = PaperStyleId.OLD_PARCHMENT,
    val signId: SignId? = null,
    val showWatermark: Boolean = true,
    val showRecipient: Boolean = false,
    val recipientLabel: String? = null,
    val favorite: Boolean = false,
    val linkedAlmanacDate: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class AlmanacCheckIn(
    val date: String,
    val moodLabel: String,
    val note: String = "",
    val updatedAt: String
)

@Serializable
data class SunCalculationResult(
    val signId: SignId? = null,
    val candidateSigns: List<SignId> = emptyList(),
    val degreeInSign: Double? = null,
    val precision: String = "exact_instant",
    val note: String? = null,
    val isAmbiguous: Boolean = false
)

@Serializable
data class ZodiacProfile(
    val chosenLens: SignId? = null,
    val tropicalSun: SunCalculationResult? = null,
    val vedicMoonSign: SignId? = null
)

@Serializable
data class UserPreferences(
    val language: AppLanguage = AppLanguage.EN,
    val theme: ThemeMode = ThemeMode.PAPER,
    val textSize: TextSize = TextSize.NORMAL,
    val reducedMotion: Boolean = false,
    val hapticsEnabled: Boolean = false,
    val timeZone: String = "Asia/Kolkata",
    val demoDismissed: Boolean = false,
    val welcomeDismissed: Boolean = false,
    val zodiacProfile: ZodiacProfile = ZodiacProfile()
)

@Serializable
data class VaultPayload(
    val letters: List<LetterRecord> = emptyList(),
    val cards: List<FeelingCardRecord> = emptyList(),
    val checkIns: List<AlmanacCheckIn> = emptyList()
)

data class MoonPhaseInfo(
    val date: String,
    val timeZone: String,
    val phaseAngle: Double,
    val illumination: Int,
    val phaseKey: MoonPhaseKey,
    val nextNewMoonLabel: String,
    val nextFullMoonLabel: String,
    val sameDayEvent: String? = null
)

data class MonthMoonEvent(
    val dateStr: String,
    val isFullMoon: Boolean
)

data class PaperVisualSpec(
    val id: PaperStyleId,
    val bg: Color,
    val bgSecondary: Color,
    val ink: Color,
    val mutedInk: Color,
    val accent: Color,
    val border: Color,
    val bgHex: Int,
    val bgSecondaryHex: Int,
    val inkHex: Int,
    val mutedInkHex: Int,
    val accentHex: Int
)

data class LocalizedText(
    val en: String,
    val bn: String,
    val hi: String,
    val hinglish: String
) {
    fun get(lang: AppLanguage): String = when (lang) {
        AppLanguage.EN -> en
        AppLanguage.BN -> bn
        AppLanguage.HI -> hi
        AppLanguage.HINGLISH -> hinglish
    }
}

data class SignPromptItem(
    val id: String,
    val theme: String,
    val spark: LocalizedText,
    val action: LocalizedText
)

data class ZodiacSignDef(
    val id: SignId,
    val glyph: String,
    val elementKind: ElementKind,
    val westernName: LocalizedText,
    val rashiName: LocalizedText,
    val element: LocalizedText,
    val modality: LocalizedText,
    val vedicRuler: LocalizedText,
    val prompts: List<SignPromptItem>
)

data class PairPromptCard(
    val questionForA: LocalizedText,
    val questionForB: LocalizedText,
    val sharedActivity: LocalizedText
)
