package com.example.ui

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ai.DailyLunarPromptResult
import com.example.ai.VeylAiRepository
import com.example.data.AstronomyEngine
import com.example.data.AudioController
import com.example.data.UnsentCatalog
import com.example.data.VaultRepository
import com.example.model.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.time.Instant
import java.util.UUID

private const val TAG = "UnsentViewModel"

sealed interface AiReflectionUiState {
    data object Idle : AiReflectionUiState
    data object Loading : AiReflectionUiState
    data class Streaming(val text: String) : AiReflectionUiState
    data class Success(val text: String) : AiReflectionUiState
    data class Error(val message: String) : AiReflectionUiState
}

sealed interface AiPromptUiState {
    data object Idle : AiPromptUiState
    data object Loading : AiPromptUiState
    data class Success(val result: DailyLunarPromptResult) : AiPromptUiState
    data class Error(val message: String) : AiPromptUiState
}

data class CardSeed(
    val id: String? = null,
    val text: String = "",
    val signId: SignId? = null,
    val recipient: String = "",
    val style: PaperStyleId = PaperStyleId.OLD_PARCHMENT
)

data class VeylUiState(
    val prefs: UserPreferences = UserPreferences(),
    val activeTab: TabId = TabId.TODAY,
    val showSettings: Boolean = false,
    val createMode: CreateMode? = null,
    val activeLetter: LetterRecord? = null,
    val cardSeed: CardSeed = CardSeed(),
    val quickDraftText: String = "",
    val almanacDate: String = AstronomyEngine.todayDateString("Asia/Kolkata"),
    val letters: List<LetterRecord> = emptyList(),
    val cards: List<FeelingCardRecord> = emptyList(),
    val checkIns: List<AlmanacCheckIn> = emptyList(),
    val vaultLocked: Boolean = false,
    val passphraseEnabled: Boolean = false,
    val recoveryCode: String? = null,
    val vaultLoading: Boolean = true,
    val saveStatus: String = "Saved on device",
    val releaseBanner: String? = null,
    val audioPlaying: Boolean = false,
    val showCreateChooser: Boolean = false,
    val showWelcomeModal: Boolean = false,
    val showSupportModal: Boolean = false,
    val showLensCalculator: Boolean = false,
    val checkInSheetDate: String? = null,
    val aiReflectionState: AiReflectionUiState = AiReflectionUiState.Idle,
    val aiPromptState: AiPromptUiState = AiPromptUiState.Idle
)

class UnsentViewModel(application: Application) : AndroidViewModel(application) {

    private val repo = VaultRepository(application)
    private val audio = AudioController(application)
    private val aiRepo = VeylAiRepository()
    private var vaultKey: ByteArray? = null
    private var reflectionJob: Job? = null
    private var promptJob: Job? = null

    private val _uiState = MutableStateFlow(VeylUiState())
    val uiState: StateFlow<VeylUiState> = _uiState.asStateFlow()

    init {
        loadVault()
    }

    override fun onCleared() {
        reflectionJob?.cancel()
        promptJob?.cancel()
        audio.release()
        super.onCleared()
    }

    private fun loadVault() {
        viewModelScope.launch {
            _uiState.update { it.copy(vaultLoading = true) }
            val result = withContext(Dispatchers.IO) {
                val prefs = repo.loadPreferences()
                val today = AstronomyEngine.todayDateString(prefs.timeZone)
                val locked = repo.isPassphraseLocked()
                if (locked) {
                    Triple(prefs, today, null)
                } else {
                    val (key, recovery) = repo.initializeUnlockedVault()
                    val payload = repo.loadVaultPayload(key)
                    vaultKey = key
                    Triple(prefs, today, Pair(recovery, payload))
                }
            }
            val (prefs, today, unlockedData) = result
            if (unlockedData == null) {
                _uiState.update {
                    it.copy(
                        prefs = prefs,
                        almanacDate = today,
                        vaultLocked = true,
                        passphraseEnabled = true,
                        vaultLoading = false
                    )
                }
            } else {
                val (recovery, payload) = unlockedData
                _uiState.update {
                    it.copy(
                        prefs = prefs,
                        almanacDate = today,
                        letters = payload.letters,
                        cards = payload.cards,
                        checkIns = payload.checkIns,
                        recoveryCode = recovery,
                        vaultLocked = false,
                        passphraseEnabled = false,
                        vaultLoading = false
                    )
                }
            }
        }
    }

    fun selectTab(tab: TabId) {
        _uiState.update {
            it.copy(
                activeTab = tab,
                showSettings = false,
                createMode = null
            )
        }
    }

    fun setShowSettings(show: Boolean) {
        _uiState.update { it.copy(showSettings = show, createMode = null) }
    }

    fun setQuickDraftText(text: String) {
        _uiState.update { it.copy(quickDraftText = text) }
    }

    fun selectAlmanacDate(date: String) {
        _uiState.update { it.copy(almanacDate = date) }
    }

    fun setCreateChooser(open: Boolean) {
        _uiState.update { it.copy(showCreateChooser = open) }
    }

    fun setWelcomeModal(open: Boolean) {
        _uiState.update { it.copy(showWelcomeModal = open) }
    }

    fun setSupportModal(open: Boolean) {
        _uiState.update { it.copy(showSupportModal = open) }
    }

    fun setLensCalculator(open: Boolean) {
        _uiState.update { it.copy(showLensCalculator = open) }
    }

    fun openCheckInForDate(date: String?) {
        _uiState.update { it.copy(checkInSheetDate = date) }
    }

    fun dismissReleaseBanner() {
        _uiState.update { it.copy(releaseBanner = null) }
    }

    fun toggleAudio() {
        val next = audio.toggle(_uiState.value.audioPlaying)
        _uiState.update { it.copy(audioPlaying = next) }
    }

    fun updatePreferences(transform: (UserPreferences) -> UserPreferences) {
        val next = transform(_uiState.value.prefs)
        val today = AstronomyEngine.todayDateString(next.timeZone)
        _uiState.update { it.copy(prefs = next, almanacDate = today) }
        viewModelScope.launch(Dispatchers.IO) {
            repo.savePreferences(next)
        }
    }

    fun startNewLetter(
        initialBody: String = "",
        signLens: SignId? = null,
        contextPrompt: String? = null
    ) {
        val state = _uiState.value
        val now = Instant.now().toString()
        val lang = state.prefs.language
        val defaultCat = RecipientCategory.PRESENT_SELF
        val defaultPaper = if (state.prefs.theme == ThemeMode.INK) {
            PaperStyleId.MOONLIT_INK
        } else {
            PaperStyleId.OLD_PARCHMENT
        }
        val letter = LetterRecord(
            id = UUID.randomUUID().toString(),
            recipientCategory = defaultCat,
            recipientLabel = UnsentCatalog.recipientLabel(defaultCat, lang),
            salutation = UnsentCatalog.defaultSalutation(defaultCat, lang),
            contextPrompt = contextPrompt,
            body = initialBody,
            paper = defaultPaper,
            sealed = false,
            linkedAlmanacDate = AstronomyEngine.todayDateString(state.prefs.timeZone),
            signLens = signLens,
            createdAt = now,
            updatedAt = now
        )
        _uiState.update {
            it.copy(
                activeLetter = letter,
                createMode = CreateMode.LETTER,
                showSettings = false,
                showCreateChooser = false,
                quickDraftText = "",
                releaseBanner = null,
                saveStatus = if (initialBody.isNotBlank()) "Saving…" else "Ready"
            )
        }
        if (initialBody.isNotBlank()) {
            upsertLetter(letter)
        }
    }

    fun openExistingLetter(letter: LetterRecord) {
        _uiState.update {
            it.copy(
                activeLetter = letter,
                createMode = CreateMode.LETTER,
                showSettings = false,
                saveStatus = "Saved on device"
            )
        }
    }

    fun duplicateLetter(letter: LetterRecord) {
        val now = Instant.now().toString()
        val copy = letter.copy(
            id = UUID.randomUUID().toString(),
            sealed = false,
            sealedAt = null,
            createdAt = now,
            updatedAt = now
        )
        upsertLetter(copy)
        openExistingLetter(copy)
    }

    fun upsertLetter(updated: LetterRecord) {
        _uiState.update { state ->
            val exists = state.letters.any { it.id == updated.id }
            val nextLetters = if (exists) {
                state.letters.map { if (it.id == updated.id) updated else it }
            } else {
                listOf(updated) + state.letters
            }
            state.copy(
                activeLetter = if (state.activeLetter?.id == updated.id) updated else state.activeLetter,
                letters = nextLetters,
                saveStatus = "Saved on device"
            )
        }
        persistVault()
    }

    fun keepLetterInBox(letter: LetterRecord) {
        upsertLetter(letter)
        _uiState.update {
            it.copy(
                createMode = null,
                activeTab = TabId.BOX
            )
        }
    }

    fun releaseLetter(letterId: String, visual: ReleaseVisual) {
        val visualLabel = when (visual) {
            ReleaseVisual.ASH -> "Ash"
            ReleaseVisual.EMBERS -> "Embers"
            ReleaseVisual.PAPER_BIRDS -> "Paper Birds"
        }
        _uiState.update { state ->
            state.copy(
                letters = state.letters.filterNot { it.id == letterId },
                activeLetter = null,
                createMode = null,
                releaseBanner = "Letter gently released ($visualLabel)."
            )
        }
        persistVault()
    }

    fun openCardStudio(
        text: String = "",
        signId: SignId? = null,
        recipient: String = "",
        style: PaperStyleId = PaperStyleId.OLD_PARCHMENT,
        cardId: String? = null
    ) {
        _uiState.update {
            it.copy(
                cardSeed = CardSeed(
                    id = cardId,
                    text = text,
                    signId = signId,
                    recipient = recipient,
                    style = style
                ),
                createMode = CreateMode.CARD,
                showSettings = false,
                showCreateChooser = false
            )
        }
    }

    fun openExistingCard(card: FeelingCardRecord) {
        openCardStudio(
            text = card.text,
            signId = card.signId,
            recipient = card.recipientLabel.orEmpty(),
            style = card.style,
            cardId = card.id
        )
    }

    fun saveFeelingCard(card: FeelingCardRecord) {
        _uiState.update { state ->
            val nextCards = listOf(card) + state.cards.filterNot { it.id == card.id }
            state.copy(cards = nextCards)
        }
        persistVault()
    }

    fun toggleLetterFavorite(id: String) {
        _uiState.update { state ->
            state.copy(
                letters = state.letters.map {
                    if (it.id == id) it.copy(favorite = !it.favorite) else it
                }
            )
        }
        persistVault()
    }

    fun toggleCardFavorite(id: String) {
        _uiState.update { state ->
            state.copy(
                cards = state.cards.map {
                    if (it.id == id) it.copy(favorite = !it.favorite) else it
                }
            )
        }
        persistVault()
    }

    fun deleteLetter(id: String) {
        _uiState.update { state ->
            state.copy(letters = state.letters.filterNot { it.id == id })
        }
        persistVault()
    }

    fun deleteCard(id: String) {
        _uiState.update { state ->
            state.copy(cards = state.cards.filterNot { it.id == id })
        }
        persistVault()
    }

    fun saveCheckIn(dateStr: String, moodLabel: String, note: String) {
        val ci = AlmanacCheckIn(
            date = dateStr,
            moodLabel = moodLabel,
            note = note.trim(),
            updatedAt = Instant.now().toString()
        )
        _uiState.update { state ->
            val next = listOf(ci) + state.checkIns.filterNot { it.date == dateStr }
            state.copy(checkIns = next, checkInSheetDate = null)
        }
        persistVault()
    }

    fun closeCreateFlow() {
        reflectionJob?.cancel()
        _uiState.update { it.copy(createMode = null, aiReflectionState = AiReflectionUiState.Idle) }
    }

    fun clearLetterReflection() {
        reflectionJob?.cancel()
        _uiState.update { it.copy(aiReflectionState = AiReflectionUiState.Idle) }
    }

    fun requestLetterReflection(letter: LetterRecord) {
        if (letter.body.isBlank()) {
            _uiState.update {
                it.copy(aiReflectionState = AiReflectionUiState.Error("Write a few lines first before asking for a reflection."))
            }
            return
        }
        reflectionJob?.cancel()
        val lang = _uiState.value.prefs.language
        reflectionJob = viewModelScope.launch {
            _uiState.update { it.copy(aiReflectionState = AiReflectionUiState.Loading) }
            val accumulated = StringBuilder()
            try {
                withTimeout(60_000L) {
                    aiRepo.streamLetterReflection(letter, lang).collect { chunk ->
                        accumulated.append(chunk)
                        _uiState.update {
                            it.copy(aiReflectionState = AiReflectionUiState.Streaming(accumulated.toString()))
                        }
                    }
                }
                val finalText = accumulated.toString().trim()
                if (finalText.isNotBlank()) {
                    _uiState.update { it.copy(aiReflectionState = AiReflectionUiState.Success(finalText)) }
                } else {
                    _uiState.update {
                        it.copy(aiReflectionState = AiReflectionUiState.Error("Gemini returned an empty reflection. Please try again."))
                    }
                }
            } catch (e: TimeoutCancellationException) {
                Log.e(TAG, "Letter reflection timed out", e)
                _uiState.update {
                    it.copy(aiReflectionState = AiReflectionUiState.Error("Reflection timed out after 60 seconds. Please try again."))
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Firebase AI letter reflection failed", e)
                _uiState.update {
                    it.copy(aiReflectionState = AiReflectionUiState.Error(e.localizedMessage ?: "Reflection failed. Please check your connection."))
                }
            }
        }
    }

    fun generateDailyAiPrompt() {
        promptJob?.cancel()
        val state = _uiState.value
        val moon = AstronomyEngine.calculateMoonPhaseForDate(state.almanacDate, state.prefs.timeZone)
        val signLens = state.prefs.zodiacProfile.chosenLens
        val lang = state.prefs.language
        promptJob = viewModelScope.launch {
            _uiState.update { it.copy(aiPromptState = AiPromptUiState.Loading) }
            try {
                val result = withTimeout(60_000L) {
                    aiRepo.generateDailyLunarPrompt(moon, signLens, lang)
                }
                _uiState.update { it.copy(aiPromptState = AiPromptUiState.Success(result)) }
            } catch (e: TimeoutCancellationException) {
                Log.e(TAG, "Daily lunar prompt generation timed out", e)
                _uiState.update {
                    it.copy(aiPromptState = AiPromptUiState.Error("Prompt generation timed out after 60 seconds. Please try again."))
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Firebase AI daily prompt generation failed", e)
                _uiState.update {
                    it.copy(aiPromptState = AiPromptUiState.Error(e.localizedMessage ?: "Unable to generate a Gemini prompt right now."))
                }
            }
        }
    }

    fun enablePassphraseLock(passphrase: String): String? {
        val key = vaultKey ?: return "Unlock vault first."
        if (passphrase.length < 4) return "Passphrase must be at least 4 characters."
        return try {
            repo.enablePassphraseLock(key, passphrase)
            _uiState.update { it.copy(passphraseEnabled = true) }
            null
        } catch (e: Exception) {
            e.message ?: "Unable to enable lock."
        }
    }

    fun disablePassphraseLock() {
        val key = vaultKey ?: return
        repo.disablePassphraseLock(key)
        _uiState.update { it.copy(passphraseEnabled = false) }
    }

    fun lockVaultNow() {
        vaultKey = null
        _uiState.update {
            it.copy(
                vaultLocked = true,
                letters = emptyList(),
                cards = emptyList(),
                checkIns = emptyList(),
                activeLetter = null,
                createMode = null,
                recoveryCode = null
            )
        }
    }

    fun unlockWithPassphrase(passphrase: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val unlocked = withContext(Dispatchers.IO) {
                val pair = repo.unlockWithPassphrase(passphrase) ?: return@withContext null
                val payload = repo.loadVaultPayload(pair.first)
                Triple(pair.first, pair.second, payload)
            }
            if (unlocked == null) {
                onResult(false)
            } else {
                vaultKey = unlocked.first
                _uiState.update {
                    it.copy(
                        vaultLocked = false,
                        recoveryCode = unlocked.second,
                        letters = unlocked.third.letters,
                        cards = unlocked.third.cards,
                        checkIns = unlocked.third.checkIns
                    )
                }
                onResult(true)
            }
        }
    }

    fun eraseAllLocalData() {
        viewModelScope.launch {
            val (key, recovery) = withContext(Dispatchers.IO) {
                repo.eraseAllLocalData()
                repo.initializeUnlockedVault()
            }
            vaultKey = key
            _uiState.update {
                VeylUiState(
                    prefs = UserPreferences(),
                    almanacDate = AstronomyEngine.todayDateString("Asia/Kolkata"),
                    recoveryCode = recovery,
                    vaultLocked = false,
                    passphraseEnabled = false,
                    vaultLoading = false
                )
            }
        }
    }

    private fun persistVault() {
        val key = vaultKey ?: return
        val state = _uiState.value
        val payload = VaultPayload(
            letters = state.letters,
            cards = state.cards,
            checkIns = state.checkIns
        )
        viewModelScope.launch(Dispatchers.IO) {
            repo.saveVaultPayload(key, payload)
        }
    }
}
