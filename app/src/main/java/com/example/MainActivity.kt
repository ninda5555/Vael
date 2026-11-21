package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ai.configureAppCheck
import com.example.model.CreateMode
import com.example.model.TabId
import com.example.ui.UnsentViewModel
import com.example.ui.components.VeylWordmark
import com.example.ui.screens.*
import com.example.ui.theme.LocalVeylPalette
import com.example.ui.theme.VeylTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureAppCheck(this, intent)
        enableEdgeToEdge()
        setContent {
            VeylAppRoot()
        }
    }
}

private data class NavDest(
    val id: TabId,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector
)

private val NAV_DESTINATIONS = listOf(
    NavDest(TabId.TODAY, "Today", Icons.Outlined.Home, Icons.Rounded.Home),
    NavDest(TabId.ZODIAC, "Zodiac", Icons.Outlined.Explore, Icons.Rounded.Explore),
    NavDest(TabId.ALMANAC, "Almanac", Icons.Outlined.CalendarMonth, Icons.Rounded.CalendarMonth),
    NavDest(TabId.BOX, "My Box", Icons.Outlined.Inventory2, Icons.Rounded.Inventory2)
)

@Composable
fun VeylAppRoot(viewModel: UnsentViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    VeylTheme(
        themeMode = state.prefs.theme,
        textSize = state.prefs.textSize
    ) {
        val palette = LocalVeylPalette.current
        val inFullScreenFlow = state.showSettings || state.createMode != null

        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .background(palette.canvas)
        ) {
            val isWide = maxWidth >= 720.dp

            Row(modifier = Modifier.fillMaxSize()) {
                // Adaptive NavigationRail for Tablets / Foldables / Wide Screens
                if (isWide && !inFullScreenFlow) {
                    NavigationRail(
                        containerColor = palette.surface,
                        header = {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.padding(top = 12.dp)
                            ) {
                                VeylWordmark(color = palette.ink, fontSizeSp = 13f)
                                FloatingActionButton(
                                    onClick = { viewModel.setCreateChooser(true) },
                                    containerColor = palette.ink,
                                    contentColor = palette.surface,
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier.testTag("rail_create_fab")
                                ) {
                                    Icon(Icons.Rounded.Add, contentDescription = "Create")
                                }
                            }
                        }
                    ) {
                        Spacer(Modifier.height(12.dp))
                        NAV_DESTINATIONS.forEach { dest ->
                            val selected = state.activeTab == dest.id
                            NavigationRailItem(
                                selected = selected,
                                onClick = { viewModel.selectTab(dest.id) },
                                icon = {
                                    Icon(
                                        if (selected) dest.selectedIcon else dest.icon,
                                        contentDescription = dest.label
                                    )
                                },
                                label = { Text(dest.label) }
                            )
                        }
                        Spacer(Modifier.weight(1f))
                        NavigationRailItem(
                            selected = state.showSettings,
                            onClick = { viewModel.setShowSettings(true) },
                            icon = { Icon(Icons.Outlined.Settings, contentDescription = "Settings") },
                            label = { Text("Settings") }
                        )
                    }
                    VerticalDivider(color = palette.divider)
                }

                Scaffold(
                    containerColor = palette.canvas,
                    contentWindowInsets = WindowInsets.safeDrawing,
                    floatingActionButton = {
                        if (!isWide && !inFullScreenFlow) {
                            FloatingActionButton(
                                onClick = { viewModel.setCreateChooser(true) },
                                containerColor = palette.ink,
                                contentColor = palette.surface,
                                shape = RoundedCornerShape(16.dp),
                                modifier = Modifier.testTag("create_fab")
                            ) {
                                Icon(Icons.Rounded.Add, contentDescription = "Create letter or card")
                            }
                        }
                    },
                    bottomBar = {
                        if (!isWide && !inFullScreenFlow) {
                            NavigationBar(
                                containerColor = palette.surface,
                                tonalElevation = 0.dp,
                                windowInsets = WindowInsets.navigationBars
                            ) {
                                NAV_DESTINATIONS.forEach { dest ->
                                    val selected = state.activeTab == dest.id
                                    NavigationBarItem(
                                        selected = selected,
                                        onClick = { viewModel.selectTab(dest.id) },
                                        icon = {
                                            Icon(
                                                if (selected) dest.selectedIcon else dest.icon,
                                                contentDescription = dest.label
                                            )
                                        },
                                        label = { Text(dest.label) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = palette.ink,
                                            selectedTextColor = palette.ink,
                                            unselectedIconColor = palette.secondaryInk,
                                            unselectedTextColor = palette.secondaryInk,
                                            indicatorColor = palette.raised
                                        ),
                                        modifier = Modifier.testTag("nav_${dest.id.name.lowercase()}")
                                    )
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        contentAlignment = Alignment.TopCenter
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .widthIn(max = 720.dp)
                        ) {
                            when {
                                state.showSettings -> {
                                    SettingsScreen(
                                        prefs = state.prefs,
                                        recoveryCode = state.recoveryCode,
                                        passphraseEnabled = state.passphraseEnabled,
                                        audioPlaying = state.audioPlaying,
                                        onBack = { viewModel.setShowSettings(false) },
                                        onUpdatePrefs = viewModel::updatePreferences,
                                        onToggleAudio = viewModel::toggleAudio,
                                        onEnablePassphrase = viewModel::enablePassphraseLock,
                                        onDisablePassphrase = viewModel::disablePassphraseLock,
                                        onEraseAll = viewModel::eraseAllLocalData,
                                        onOpenWelcome = { viewModel.setWelcomeModal(true) },
                                        onOpenSupport = { viewModel.setSupportModal(true) }
                                    )
                                }

                                state.createMode == CreateMode.LETTER && state.activeLetter != null -> {
                                    LetterEditorScreen(
                                        letter = state.activeLetter!!,
                                        language = state.prefs.language,
                                        saveStatus = state.saveStatus,
                                        reflectionState = state.aiReflectionState,
                                        onChange = viewModel::upsertLetter,
                                        onBack = viewModel::closeCreateFlow,
                                        onKeepInBox = viewModel::keepLetterInBox,
                                        onTurnIntoCard = { letter ->
                                            viewModel.openCardStudio(
                                                text = letter.body,
                                                signId = letter.signLens,
                                                recipient = letter.recipientLabel,
                                                style = letter.paper
                                            )
                                        },
                                        onTurnReflectionIntoCard = { text, signId ->
                                            viewModel.clearLetterReflection()
                                            viewModel.openCardStudio(
                                                text = text,
                                                signId = signId
                                            )
                                        },
                                        onRequestReflection = viewModel::requestLetterReflection,
                                        onClearReflection = viewModel::clearLetterReflection,
                                        onReleaseConfirm = viewModel::releaseLetter
                                    )
                                }

                                state.createMode == CreateMode.CARD -> {
                                    FeelingCardStudioScreen(
                                        seed = state.cardSeed,
                                        language = state.prefs.language,
                                        timeZone = state.prefs.timeZone,
                                        reducedMotion = state.prefs.reducedMotion,
                                        onBack = viewModel::closeCreateFlow,
                                        onSaveCard = viewModel::saveFeelingCard
                                    )
                                }

                                state.activeTab == TabId.TODAY -> {
                                    TodayScreen(
                                        state = state,
                                        onQuickDraftChange = viewModel::setQuickDraftText,
                                        onWriteFromToday = { viewModel.startNewLetter(initialBody = state.quickDraftText) },
                                        onResumeDraft = viewModel::openExistingLetter,
                                        onUseSecondaryPrompt = { prompt -> viewModel.startNewLetter(contextPrompt = prompt) },
                                        onGenerateAiPrompt = viewModel::generateDailyAiPrompt,
                                        onSelectDate = viewModel::selectAlmanacDate,
                                        onOpenCheckIn = viewModel::openCheckInForDate,
                                        onOpenWelcome = { viewModel.setWelcomeModal(true) },
                                        onOpenSettings = { viewModel.setShowSettings(true) },
                                        onToggleAudio = viewModel::toggleAudio,
                                        onGoToBox = { viewModel.selectTab(TabId.BOX) },
                                        onDismissReleaseBanner = viewModel::dismissReleaseBanner
                                    )
                                }

                                state.activeTab == TabId.ZODIAC -> {
                                    ZodiacScreen(
                                        language = state.prefs.language,
                                        timeZone = state.prefs.timeZone,
                                        zodiacProfile = state.prefs.zodiacProfile,
                                        reducedMotion = state.prefs.reducedMotion,
                                        onUpdateProfile = { zp -> viewModel.updatePreferences { it.copy(zodiacProfile = zp) } },
                                        onStartLetterFromSign = { signId, prompt ->
                                            viewModel.startNewLetter(signLens = signId, contextPrompt = prompt)
                                        },
                                        onMakeCardFromSign = { signId, text ->
                                            viewModel.openCardStudio(text = text, signId = signId)
                                        },
                                        onOpenLensCalculator = { viewModel.setLensCalculator(true) }
                                    )
                                }

                                state.activeTab == TabId.ALMANAC -> {
                                    AlmanacScreen(
                                        language = state.prefs.language,
                                        timeZone = state.prefs.timeZone,
                                        selectedDate = state.almanacDate,
                                        zodiacProfile = state.prefs.zodiacProfile,
                                        checkIns = if (state.vaultLocked) emptyList() else state.checkIns,
                                        letters = if (state.vaultLocked) emptyList() else state.letters,
                                        cards = if (state.vaultLocked) emptyList() else state.cards,
                                        onSelectDate = viewModel::selectAlmanacDate,
                                        onOpenCheckIn = viewModel::openCheckInForDate,
                                        onOpenLensCalculator = { viewModel.setLensCalculator(true) },
                                        onOpenLetter = viewModel::openExistingLetter,
                                        onOpenCard = viewModel::openExistingCard
                                    )
                                }

                                state.activeTab == TabId.BOX -> {
                                    MyBoxScreen(
                                        locked = state.vaultLocked,
                                        canLock = state.passphraseEnabled,
                                        letters = state.letters,
                                        cards = state.cards,
                                        checkInsCount = state.checkIns.size,
                                        demoDismissed = state.prefs.demoDismissed,
                                        onUnlock = viewModel::unlockWithPassphrase,
                                        onLockNow = viewModel::lockVaultNow,
                                        onStartWriting = { viewModel.startNewLetter() },
                                        onOpenLetter = viewModel::openExistingLetter,
                                        onOpenCard = viewModel::openExistingCard,
                                        onDuplicateLetter = viewModel::duplicateLetter,
                                        onToggleLetterFav = viewModel::toggleLetterFavorite,
                                        onToggleCardFav = viewModel::toggleCardFavorite,
                                        onDeleteLetter = viewModel::deleteLetter,
                                        onDeleteCard = viewModel::deleteCard,
                                        onDismissDemo = { viewModel.updatePreferences { it.copy(demoDismissed = true) } }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Global Sheets & Dialogs
        if (state.showCreateChooser) {
            CreateChooserSheet(
                onDismiss = { viewModel.setCreateChooser(false) },
                onWriteLetter = { viewModel.startNewLetter() },
                onMakeCard = { viewModel.openCardStudio() }
            )
        }

        state.checkInSheetDate?.let { dateStr ->
            MoodCheckInSheet(
                dateStr = dateStr,
                existing = state.checkIns.firstOrNull { it.date == dateStr },
                onDismiss = { viewModel.openCheckInForDate(null) },
                onSave = { mood, note -> viewModel.saveCheckIn(dateStr, mood, note) }
            )
        }

        if (state.showLensCalculator) {
            LensCalculatorSheet(
                language = state.prefs.language,
                timeZone = state.prefs.timeZone,
                zodiacProfile = state.prefs.zodiacProfile,
                onDismiss = { viewModel.setLensCalculator(false) },
                onSaveProfile = { zp -> viewModel.updatePreferences { it.copy(zodiacProfile = zp) } }
            )
        }

        if (state.showWelcomeModal) {
            WelcomeDialog(onDismiss = { viewModel.setWelcomeModal(false) })
        }

        if (state.showSupportModal) {
            SupportDialog(onDismiss = { viewModel.setSupportModal(false) })
        }
    }
}
