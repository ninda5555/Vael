package com.example.ai

import com.example.data.UnsentCatalog
import com.example.model.AppLanguage
import com.example.model.LetterRecord
import com.example.model.MoonPhaseInfo
import com.example.model.SignId
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.mapNotNull
import org.json.JSONObject

data class DailyLunarPromptResult(
    val prompt: String,
    val whisper: String,
    val closingAction: String
)

class VeylAiRepository {

    private val reflectionModel by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            systemInstruction = content {
                text(
                    """
                    You are Veyl's quiet, non-judgmental contemplative companion.
                    The user has written a private unsent letter and explicitly asked for a gentle reflection.
                    Respond concisely in the requested language with three short, poetic yet grounded paragraphs:
                    1. What emotional thread or unspoken truth sits at the center of this letter (2 sentences max).
                    2. A tender perspective shift or grounding observation (2 sentences max).
                    3. One quiet closing question the writer can sit with (1 sentence).
                    Never diagnose, never claim certainty about fate or others' motives, never preach, and never use markdown headings, bullet lists, or asterisks. Keep total length under 140 words.
                    """.trimIndent()
                )
            }
        )
    }

    private val lunarPromptSchema = Schema.obj(
        properties = mapOf(
            "prompt" to Schema.string(description = "One intimate, grounded unsent-letter prompt (12-24 words)"),
            "whisper" to Schema.string(description = "A calm poetic subtitle tying the lunar phase to inward reflection (6-14 words)"),
            "closingAction" to Schema.string(description = "A small 1-sentence grounding gesture after writing")
        )
    )

    private val lunarPromptModel by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = generationConfig {
                responseMimeType = "application/json"
                responseSchema = lunarPromptSchema
            }
        )
    }

    fun streamLetterReflection(
        letter: LetterRecord,
        language: AppLanguage
    ): Flow<String> {
        val langName = when (language) {
            AppLanguage.EN -> "English"
            AppLanguage.BN -> "Bengali (বাংলা)"
            AppLanguage.HI -> "Hindi (हिन्दी)"
            AppLanguage.HINGLISH -> "Hinglish (natural warm Hindi in Latin script)"
        }
        val signNote = letter.signLens?.let {
            val s = UnsentCatalog.signById(it)
            "Optional reflective sign lens: ${s.westernName.en} / ${s.rashiName.en}."
        }.orEmpty()

        val prompt = buildString {
            appendLine("Respond in $langName.")
            appendLine("Addressed to: ${letter.recipientLabel.ifBlank { "Someone unnamed" }}")
            appendLine("Salutation: ${letter.salutation}")
            if (signNote.isNotBlank()) appendLine(signNote)
            appendLine("Unsent letter:")
            appendLine(letter.body.trim().take(2400))
        }

        return reflectionModel.generateContentStream(prompt).mapNotNull { it.text }
    }

    suspend fun generateDailyLunarPrompt(
        moon: MoonPhaseInfo,
        signLens: SignId?,
        language: AppLanguage
    ): DailyLunarPromptResult {
        val langName = when (language) {
            AppLanguage.EN -> "English"
            AppLanguage.BN -> "Bengali (বাংলা)"
            AppLanguage.HI -> "Hindi (हिन्दी)"
            AppLanguage.HINGLISH -> "Hinglish (warm conversational Hindi in Latin script)"
        }
        val signText = signLens?.let {
            val s = UnsentCatalog.signById(it)
            "Writing lens: ${s.westernName.en} (${s.rashiName.en}, ${s.element.en})."
        } ?: "Writing lens: Universal quiet reflection."

        val prompt = """
            Generate a fresh, deeply human unsent-letter prompt for Veyl in $langName.
            Date: ${moon.date}
            Moon phase: ${UnsentCatalog.moonPhaseLabel(moon.phaseKey, AppLanguage.EN)} (${moon.illumination}% illumination)
            $signText
            Keep it warm, minimalist, emotionally honest, and free of fortune-telling or deterministic claims.
        """.trimIndent()

        val response = lunarPromptModel.generateContent(prompt)
        val rawJson = response.text ?: throw IllegalStateException("Gemini returned an empty prompt.")
        val json = JSONObject(rawJson)
        return DailyLunarPromptResult(
            prompt = json.getString("prompt"),
            whisper = json.getString("whisper"),
            closingAction = json.getString("closingAction")
        )
    }
}
