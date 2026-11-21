package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AstronomyEngine
import com.example.data.UnsentCatalog
import com.example.model.LetterRecord
import com.example.model.TabId
import com.example.ui.AiPromptUiState
import com.example.ui.VeylUiState
import com.example.ui.components.AstralSculptureCanvas
import com.example.ui.components.MonochromeMoonCanvas
import com.example.ui.components.VeylWordmark
import com.example.ui.theme.LocalVeylPalette
import com.example.ui.theme.PlusJakartaSans
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodayScreen(
    state: VeylUiState,
    onQuickDraftChange: (String) -> Unit,
    onWriteFromToday: () -> Unit,
    onResumeDraft: (LetterRecord) -> Unit,
    onUseSecondaryPrompt: (String) -> Unit,
    onGenerateAiPrompt: () -> Unit,
    onSelectDate: (String) -> Unit,
    onOpenCheckIn: (String) -> Unit,
    onOpenWelcome: () -> Unit,
    onOpenSettings: () -> Unit,
    onToggleAudio: () -> Unit,
    onGoToBox: () -> Unit,
    onDismissReleaseBanner: () -> Unit
) {
    val palette = LocalVeylPalette.current
    val lang = state.prefs.language
    val todayStr = remember(state.prefs.timeZone) {
        AstronomyEngine.todayDateString(state.prefs.timeZone)
    }
    val weekDates = remember(todayStr) { AstronomyEngine.buildWeekDates(todayStr) }
    val selectedMoon = remember(state.almanacDate, state.prefs.timeZone) {
        AstronomyEngine.calculateMoonPhaseForDate(state.almanacDate, state.prefs.timeZone)
    }
    var dateDetailOpen by remember { mutableStateOf(false) }

    val latestDraft = remember(state.letters, state.vaultLocked) {
        if (state.vaultLocked) null else state.letters.firstOrNull { !it.sealed }
    }
    val chosenLensSign = state.prefs.zodiacProfile.chosenLens?.let { UnsentCatalog.signById(it) }
    val secondaryPrompt = "What would feel lighter if you put it on paper tonight?"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // Release confirmation banner
        AnimatedVisibility(visible = state.releaseBanner != null) {
            state.releaseBanner?.let { msg ->
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = palette.surface,
                    border = BorderStroke(1.dp, palette.divider)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = msg,
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.ink,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(onClick = onDismissReleaseBanner) {
                            Text("Dismiss", color = palette.ink)
                        }
                    }
                }
            }
        }

        // 1. Minimal 52dp Header: VEYL wordmark — centered Today — Audio & Settings
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 52.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .clickable(onClick = onOpenWelcome)
                    .padding(vertical = 8.dp, horizontal = 4.dp)
                    .testTag("welcome_wordmark_button"),
                contentAlignment = Alignment.CenterStart
            ) {
                VeylWordmark(color = palette.ink, fontSizeSp = 14f)
            }

            Text(
                text = "Today",
                style = MaterialTheme.typography.titleLarge,
                color = palette.ink
            )

            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onToggleAudio,
                    modifier = Modifier.testTag("audio_toggle_button")
                ) {
                    Icon(
                        imageVector = if (state.audioPlaying) Icons.Rounded.VolumeUp else Icons.Outlined.MusicNote,
                        contentDescription = if (state.audioPlaying) "Pause ambient flute" else "Play ambient flute",
                        tint = if (state.audioPlaying) palette.clay else palette.ink
                    )
                }
                IconButton(
                    onClick = onOpenSettings,
                    modifier = Modifier.testTag("settings_button")
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Settings,
                        contentDescription = "Settings",
                        tint = palette.ink
                    )
                }
            }
        }

        // 2. Seven-Day Calendar Strip
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            weekDates.forEach { dStr ->
                val parsed = AstronomyEngine.parseDateOrToday(dStr)
                val weekday = parsed.format(DateTimeFormatter.ofPattern("EEE", Locale.getDefault()))
                val dayNum = parsed.dayOfMonth.toString()
                val isSelected = dStr == state.almanacDate
                val isToday = dStr == todayStr
                val hasEntry = !state.vaultLocked && (
                    state.checkIns.any { it.date == dStr } ||
                        state.letters.any { it.linkedAlmanacDate == dStr } ||
                        state.cards.any { it.linkedAlmanacDate == dStr }
                    )

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 58.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (isSelected) palette.surface else palette.canvas)
                        .border(
                            width = if (isSelected) 1.5.dp else 0.dp,
                            color = if (isSelected) palette.ink else palette.canvas,
                            shape = RoundedCornerShape(14.dp)
                        )
                        .clickable {
                            onSelectDate(dStr)
                            dateDetailOpen = true
                        }
                        .padding(vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(3.dp)
                ) {
                    Text(
                        text = weekday,
                        style = MaterialTheme.typography.labelSmall,
                        color = palette.secondaryInk,
                        maxLines = 1
                    )
                    Text(
                        text = dayNum,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = if (isToday || isSelected) FontWeight.Bold else FontWeight.Medium
                        ),
                        color = palette.ink
                    )
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .clip(CircleShape)
                            .background(if (hasEntry) palette.ink else palette.canvas.copy(alpha = 0f))
                    )
                }
            }
        }

        // 3. Signature Ink Hero Writing Card with live editable draft & folded envelope / lens sculpture
        Surface(
            shape = RoundedCornerShape(26.dp),
            color = palette.heroBg,
            border = if (palette.isDark) BorderStroke(1.dp, palette.divider) else null,
            shadowElevation = 2.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 22.dp, vertical = 24.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(18.dp)
                ) {
                    Box(modifier = Modifier.fillMaxWidth()) {
                        if (state.quickDraftText.isEmpty()) {
                            Text(
                                text = "What stayed unsaid today?",
                                fontFamily = PlusJakartaSans,
                                fontWeight = FontWeight.Bold,
                                fontSize = 22.sp,
                                lineHeight = 29.sp,
                                color = palette.heroMuted
                            )
                        }
                        BasicTextField(
                            value = state.quickDraftText,
                            onValueChange = onQuickDraftChange,
                            textStyle = TextStyle(
                                fontFamily = PlusJakartaSans,
                                fontWeight = FontWeight.Bold,
                                fontSize = 21.sp,
                                lineHeight = 28.sp,
                                color = palette.heroText
                            ),
                            cursorBrush = SolidColor(palette.ivory),
                            minLines = 3,
                            maxLines = 5,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("today_quick_draft_input")
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = onWriteFromToday,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = palette.ivory,
                                contentColor = palette.ivoryInk
                            ),
                            contentPadding = PaddingValues(horizontal = 18.dp, vertical = 13.dp),
                            modifier = Modifier
                                .heightIn(min = 48.dp)
                                .testTag("today_write_letter_button")
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Edit,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = "Write a letter",
                                style = MaterialTheme.typography.labelLarge
                            )
                        }

                        if (!state.vaultLocked && latestDraft != null) {
                            TextButton(
                                onClick = { onResumeDraft(latestDraft) },
                                modifier = Modifier.heightIn(min = 48.dp)
                            ) {
                                Text(
                                    text = "Resume draft",
                                    color = palette.heroMuted,
                                    textDecoration = TextDecoration.Underline,
                                    style = MaterialTheme.typography.labelLarge
                                )
                            }
                        } else if (state.vaultLocked) {
                            TextButton(
                                onClick = onGoToBox,
                                modifier = Modifier.heightIn(min = 48.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Lock,
                                    contentDescription = null,
                                    tint = palette.heroMuted,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(
                                    text = "Box locked",
                                    color = palette.heroMuted,
                                    style = MaterialTheme.typography.labelMedium
                                )
                            }
                        }
                    }
                }

                // Single focal geometric sculpture
                AstralSculptureCanvas(
                    element = chosenLensSign?.elementKind,
                    reducedMotion = state.prefs.reducedMotion,
                    modifier = Modifier.size(98.dp)
                )
            }
        }

        // 4. Secondary Gentle Prompt Card (with opt-in Gemini Personalized Lunar Prompt)
        val activePromptText = when (val p = state.aiPromptState) {
            is AiPromptUiState.Success -> p.result.prompt
            else -> secondaryPrompt
        }
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.AutoAwesome,
                            contentDescription = null,
                            tint = palette.clay,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = if (state.aiPromptState is AiPromptUiState.Success) "Gemini lunar prompt" else "Tonight's prompt",
                            style = MaterialTheme.typography.labelMedium,
                            color = palette.secondaryInk
                        )
                    }
                    TextButton(
                        onClick = onGenerateAiPrompt,
                        enabled = state.aiPromptState !is AiPromptUiState.Loading,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier
                            .heightIn(min = 36.dp)
                            .testTag("today_gemini_prompt_button")
                    ) {
                        if (state.aiPromptState is AiPromptUiState.Loading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(14.dp),
                                strokeWidth = 2.dp,
                                color = palette.ink
                            )
                            Spacer(Modifier.width(6.dp))
                            Text("Listening…", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                        } else {
                            Icon(
                                imageVector = Icons.Outlined.AutoAwesome,
                                contentDescription = null,
                                tint = palette.ink,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                text = if (state.aiPromptState is AiPromptUiState.Success) "New prompt" else "Ask Gemini",
                                style = MaterialTheme.typography.labelMedium,
                                color = palette.ink
                            )
                        }
                    }
                }

                Text(
                    text = activePromptText,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = palette.ink
                )

                when (val p = state.aiPromptState) {
                    is AiPromptUiState.Success -> {
                        Text(
                            text = p.result.whisper,
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.secondaryInk
                        )
                        Text(
                            text = "After writing: ${p.result.closingAction}",
                            style = MaterialTheme.typography.labelMedium,
                            color = palette.clay
                        )
                    }
                    is AiPromptUiState.Error -> {
                        Text(
                            text = p.message,
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.clay
                        )
                    }
                    else -> Unit
                }

                OutlinedButton(
                    onClick = { onUseSecondaryPrompt(activePromptText) },
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, palette.divider),
                    modifier = Modifier
                        .heightIn(min = 44.dp)
                        .testTag("use_secondary_prompt_button")
                ) {
                    Text(
                        text = "Use this prompt",
                        color = palette.ink,
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }

        // 5. Today's Sky & Lens Quiet Glance Card
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider),
            modifier = Modifier.clickable { dateDetailOpen = true }
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(palette.heroBg),
                    contentAlignment = Alignment.Center
                ) {
                    MonochromeMoonCanvas(
                        phaseAngle = selectedMoon.phaseAngle,
                        size = 42.dp
                    )
                }
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = "Lunar sky · ${selectedMoon.illumination}% illuminated",
                        style = MaterialTheme.typography.labelMedium,
                        color = palette.secondaryInk
                    )
                    Text(
                        text = UnsentCatalog.moonPhaseLabel(selectedMoon.phaseKey, lang),
                        style = MaterialTheme.typography.titleMedium,
                        color = palette.ink
                    )
                    if (chosenLensSign != null) {
                        Text(
                            text = "Lens · ${chosenLensSign.westernName.get(lang)} (${chosenLensSign.rashiName.get(lang)})",
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.secondaryInk,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                Icon(
                    imageVector = Icons.Rounded.ChevronRight,
                    contentDescription = "Open date details",
                    tint = palette.secondaryInk
                )
            }
        }

        Spacer(Modifier.height(84.dp))
    }

    // Selected Date Detail Sheet
    if (dateDetailOpen) {
        val checkIn = state.checkIns.firstOrNull { it.date == state.almanacDate }
        ModalBottomSheet(
            onDismissRequest = { dateDetailOpen = false },
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 12.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(palette.heroBg),
                        contentAlignment = Alignment.Center
                    ) {
                        MonochromeMoonCanvas(phaseAngle = selectedMoon.phaseAngle, size = 44.dp)
                    }
                    Column {
                        Text(state.almanacDate, style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                        Text(
                            UnsentCatalog.moonPhaseLabel(selectedMoon.phaseKey, lang),
                            style = MaterialTheme.typography.titleLarge,
                            color = palette.ink
                        )
                        Text(
                            "${selectedMoon.illumination}% · ${selectedMoon.phaseAngle}°",
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.secondaryInk
                        )
                    }
                }

                HorizontalDivider(color = palette.divider)

                if (checkIn != null) {
                    Text("Your weather", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                    Text(checkIn.moodLabel, style = MaterialTheme.typography.titleMedium, color = palette.ink)
                    if (checkIn.note.isNotBlank()) {
                        Text(checkIn.note, style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk)
                    }
                } else {
                    Text(
                        "No mood check-in saved for this day yet.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.secondaryInk
                    )
                }

                Button(
                    onClick = {
                        dateDetailOpen = false
                        onOpenCheckIn(state.almanacDate)
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = palette.ink,
                        contentColor = palette.surface
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                ) {
                    Text(if (checkIn == null) "Record how today felt" else "Update mood check-in")
                }

                Spacer(Modifier.height(16.dp))
            }
        }
    }
}
