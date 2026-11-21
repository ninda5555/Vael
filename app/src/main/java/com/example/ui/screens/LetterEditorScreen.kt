package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.UnsentCatalog
import com.example.model.*
import com.example.ui.AiReflectionUiState
import com.example.ui.theme.CormorantGaramond
import com.example.ui.theme.LocalVeylPalette
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.Instant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LetterEditorScreen(
    letter: LetterRecord,
    language: AppLanguage,
    saveStatus: String,
    reflectionState: AiReflectionUiState,
    onChange: (LetterRecord) -> Unit,
    onBack: () -> Unit,
    onKeepInBox: (LetterRecord) -> Unit,
    onTurnIntoCard: (LetterRecord) -> Unit,
    onTurnReflectionIntoCard: (String, SignId?) -> Unit,
    onRequestReflection: (LetterRecord) -> Unit,
    onClearReflection: () -> Unit,
    onReleaseConfirm: (String, ReleaseVisual) -> Unit
) {
    BackHandler(onBack = onBack)

    val palette = LocalVeylPalette.current
    val scope = rememberCoroutineScope()
    val paperSpec = UnsentCatalog.paperSpec(letter.paper)
    val prompts = remember(letter.recipientCategory, language) {
        UnsentCatalog.recipientPrompts(letter.recipientCategory, language)
    }

    var showRecipientSheet by remember { mutableStateOf(false) }
    var showPaperSheet by remember { mutableStateOf(false) }
    var showPromptBox by remember { mutableStateOf(false) }
    var promptIndex by remember { mutableIntStateOf(0) }
    var showReleaseSheet by remember { mutableStateOf(false) }
    var selectedReleaseVisual by remember { mutableStateOf(ReleaseVisual.PAPER_BIRDS) }
    var releasingAnim by remember { mutableStateOf(false) }

    val releaseAlpha by animateFloatAsState(
        targetValue = if (releasingAnim) 0f else 1f,
        animationSpec = tween(420),
        label = "release_alpha"
    )
    val releaseOffsetY by animateFloatAsState(
        targetValue = if (releasingAnim && selectedReleaseVisual == ReleaseVisual.PAPER_BIRDS) -72f else 0f,
        animationSpec = tween(420),
        label = "release_offset"
    )

    val hasBody = letter.body.trim().isNotEmpty()
    val wordCount = remember(letter.body) {
        if (!hasBody) 0 else letter.body.trim().split(Regex("\\s+")).size
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Compact Top Writer Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 52.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            TextButton(
                onClick = onBack,
                modifier = Modifier
                    .heightIn(min = 48.dp)
                    .testTag("editor_back_button")
            ) {
                Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back", tint = palette.ink)
                Spacer(Modifier.width(4.dp))
                Text("Back", color = palette.ink, style = MaterialTheme.typography.labelLarge)
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Unsent Letter", style = MaterialTheme.typography.titleMedium, color = palette.ink)
                Text(
                    text = "$saveStatus · $wordCount words",
                    style = MaterialTheme.typography.labelSmall,
                    color = palette.secondaryInk
                )
            }

            if (!letter.sealed) {
                Button(
                    onClick = {
                        onChange(
                            letter.copy(
                                sealed = true,
                                sealedAt = Instant.now().toString(),
                                updatedAt = Instant.now().toString()
                            )
                        )
                    },
                    enabled = hasBody,
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = palette.ink,
                        contentColor = palette.surface
                    ),
                    modifier = Modifier
                        .heightIn(min = 44.dp)
                        .testTag("seal_letter_button")
                ) {
                    Text("Seal", style = MaterialTheme.typography.labelLarge)
                }
            } else {
                Spacer(Modifier.width(56.dp))
            }
        }

        HorizontalDivider(color = palette.divider)

        // Recipient & Paper Controls (when unsealed)
        if (!letter.sealed) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = palette.surface,
                    border = BorderStroke(1.dp, palette.divider),
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { showRecipientSheet = true }
                        .testTag("recipient_picker_button")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("To: ", style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk)
                        Text(
                            text = letter.recipientLabel.ifBlank { "Custom" },
                            style = MaterialTheme.typography.labelLarge,
                            color = palette.ink,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = palette.surface,
                    border = BorderStroke(1.dp, palette.divider),
                    modifier = Modifier
                        .heightIn(min = 44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { showPaperSheet = true }
                        .testTag("paper_picker_button")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            Icons.Outlined.Palette,
                            contentDescription = "Choose paper",
                            tint = palette.ink,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = UnsentCatalog.paperName(letter.paper, language),
                            style = MaterialTheme.typography.labelMedium,
                            color = palette.ink
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = { showPromptBox = !showPromptBox },
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (showPromptBox) "Hide starting line" else "Need a starting line?",
                        style = MaterialTheme.typography.labelMedium,
                        color = palette.secondaryInk,
                        textDecoration = TextDecoration.Underline
                    )
                }
            }
        }

        // Context prompt from Today or Zodiac
        if (!letter.contextPrompt.isNullOrBlank() && !letter.sealed) {
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Text(
                    text = letter.contextPrompt,
                    style = MaterialTheme.typography.bodyMedium,
                    color = palette.secondaryInk,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                )
            }
        }

        // Optional Recipient Prompt Cycler
        AnimatedVisibility(visible = showPromptBox && !letter.sealed) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = prompts[promptIndex % prompts.size],
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.ink,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedButton(
                        onClick = { promptIndex = (promptIndex + 1) % prompts.size },
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, palette.divider)
                    ) {
                        Text("Next", color = palette.ink)
                    }
                }
            }
        }

        // Tactile Paper Surface
        Surface(
            shape = RoundedCornerShape(22.dp),
            color = paperSpec.bg,
            border = BorderStroke(1.dp, paperSpec.border),
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 360.dp)
                .alpha(releaseAlpha)
                .graphicsLayer { translationY = releaseOffsetY }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Sealed Wax Stamp Header
                if (letter.sealed) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            modifier = Modifier
                                .border(1.5.dp, palette.clay, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                Icons.Rounded.Verified,
                                contentDescription = null,
                                tint = palette.clay,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "SEALED · UNSENT",
                                style = MaterialTheme.typography.labelMedium,
                                color = palette.clay
                            )
                        }

                        TextButton(
                            onClick = {
                                onChange(letter.copy(sealed = false, updatedAt = Instant.now().toString()))
                            }
                        ) {
                            Text(
                                text = "Unseal to edit",
                                color = paperSpec.ink.copy(alpha = 0.8f),
                                textDecoration = TextDecoration.Underline
                            )
                        }
                    }
                    HorizontalDivider(color = paperSpec.ink.copy(alpha = 0.14f))
                }

                // Salutation Input
                BasicTextField(
                    value = letter.salutation,
                    onValueChange = {
                        if (!letter.sealed) {
                            onChange(letter.copy(salutation = it, updatedAt = Instant.now().toString()))
                        }
                    },
                    enabled = !letter.sealed,
                    textStyle = TextStyle(
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 26.sp,
                        lineHeight = 32.sp,
                        color = paperSpec.ink
                    ),
                    cursorBrush = SolidColor(paperSpec.accent),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("letter_salutation_input")
                )

                HorizontalDivider(color = paperSpec.ink.copy(alpha = 0.12f))

                // Main Letter Body Input
                Box(modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = 240.dp)) {
                    if (letter.body.isEmpty()) {
                        Text(
                            text = "Write freely. Nothing here is ever sent to anyone…",
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Medium,
                            fontSize = 21.sp,
                            lineHeight = 32.sp,
                            color = paperSpec.ink.copy(alpha = 0.45f)
                        )
                    }
                    BasicTextField(
                        value = letter.body,
                        onValueChange = {
                            if (!letter.sealed) {
                                onChange(letter.copy(body = it, updatedAt = Instant.now().toString()))
                            }
                        },
                        enabled = !letter.sealed,
                        textStyle = TextStyle(
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Medium,
                            fontSize = 21.sp,
                            lineHeight = 33.sp,
                            color = paperSpec.ink
                        ),
                        cursorBrush = SolidColor(paperSpec.accent),
                        minLines = 10,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("letter_body_input")
                    )
                }
            }
        }

        // Bottom Actions (Sealed vs Open Draft)
        if (letter.sealed) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { onKeepInBox(letter) },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = palette.ink,
                            contentColor = palette.surface
                        ),
                        modifier = Modifier
                            .heightIn(min = 48.dp)
                            .testTag("keep_in_box_button")
                    ) {
                        Text("Keep in Box")
                    }

                    OutlinedButton(
                        onClick = { onTurnIntoCard(letter) },
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, palette.divider),
                        modifier = Modifier
                            .heightIn(min = 48.dp)
                            .testTag("turn_into_card_button")
                    ) {
                        Text("Feeling Card", color = palette.ink)
                    }

                    Spacer(Modifier.weight(1f))

                    TextButton(
                        onClick = { showReleaseSheet = true },
                        modifier = Modifier
                            .heightIn(min = 48.dp)
                            .testTag("release_letter_button")
                    ) {
                        Text("Let it go", color = palette.clay, style = MaterialTheme.typography.labelLarge)
                    }
                }

                OutlinedButton(
                    onClick = { onRequestReflection(letter) },
                    enabled = hasBody,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, palette.divider),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .testTag("reflect_with_gemini_button")
                ) {
                    Icon(
                        Icons.Outlined.AutoAwesome,
                        contentDescription = null,
                        tint = palette.clay,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text("Quiet Reflection with Gemini", color = palette.ink)
                }
            }
        } else {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = { onRequestReflection(letter) },
                        enabled = hasBody,
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, palette.divider),
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 46.dp)
                            .testTag("reflect_with_gemini_button")
                    ) {
                        Icon(
                            Icons.Outlined.AutoAwesome,
                            contentDescription = null,
                            modifier = Modifier.size(17.dp),
                            tint = palette.clay
                        )
                        Spacer(Modifier.width(6.dp))
                        Text("Reflect", color = palette.ink, maxLines = 1)
                    }

                    OutlinedButton(
                        onClick = { onTurnIntoCard(letter) },
                        enabled = hasBody,
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, palette.divider),
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 46.dp)
                    ) {
                        Icon(Icons.Outlined.Style, contentDescription = null, modifier = Modifier.size(17.dp), tint = palette.ink)
                        Spacer(Modifier.width(6.dp))
                        Text("9:16 Card", color = palette.ink, maxLines = 1)
                    }
                }

                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
                    TextButton(
                        onClick = { showReleaseSheet = true },
                        modifier = Modifier.heightIn(min = 44.dp)
                    ) {
                        Text("Let it go", color = palette.secondaryInk)
                    }
                }
            }
        }

        Spacer(Modifier.height(32.dp))
    }

    // Gemini Quiet Reflection Sheet (Streaming via Firebase AI Logic)
    if (reflectionState !is AiReflectionUiState.Idle) {
        ModalBottomSheet(
            onDismissRequest = onClearReflection,
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 22.dp, vertical = 10.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Outlined.AutoAwesome,
                            contentDescription = null,
                            tint = palette.clay,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            "Quiet Reflection",
                            style = MaterialTheme.typography.titleLarge,
                            color = palette.ink
                        )
                    }
                    Text(
                        "Gemini",
                        style = MaterialTheme.typography.labelMedium,
                        color = palette.secondaryInk
                    )
                }

                Text(
                    "Only this letter is shared when you ask for a reflection. Your vault stays encrypted on this device.",
                    style = MaterialTheme.typography.bodySmall,
                    color = palette.secondaryInk
                )

                HorizontalDivider(color = palette.divider)

                when (reflectionState) {
                    is AiReflectionUiState.Loading -> {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 20.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp,
                                color = palette.ink
                            )
                            Text(
                                "Reading quietly between the lines…",
                                style = MaterialTheme.typography.bodyMedium,
                                color = palette.secondaryInk
                            )
                        }
                    }

                    is AiReflectionUiState.Streaming -> {
                        Text(
                            text = reflectionState.text,
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Medium,
                            fontSize = 20.sp,
                            lineHeight = 30.sp,
                            color = palette.ink
                        )
                    }

                    is AiReflectionUiState.Success -> {
                        Text(
                            text = reflectionState.text,
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Medium,
                            fontSize = 20.sp,
                            lineHeight = 30.sp,
                            color = palette.ink
                        )
                        HorizontalDivider(color = palette.divider)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onRequestReflection(letter) },
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, palette.divider),
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 48.dp)
                            ) {
                                Text("Reflect again", color = palette.ink)
                            }
                            Button(
                                onClick = {
                                    val firstLine = reflectionState.text
                                        .split("\n")
                                        .firstOrNull { it.isNotBlank() }
                                        ?.take(220)
                                        ?: reflectionState.text.take(220)
                                    onTurnReflectionIntoCard(firstLine, letter.signLens)
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = palette.ink,
                                    contentColor = palette.surface
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 48.dp)
                            ) {
                                Text("Save as 9:16 Card")
                            }
                        }
                    }

                    is AiReflectionUiState.Error -> {
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = palette.raised,
                            border = BorderStroke(1.dp, palette.clay.copy(alpha = 0.4f))
                        ) {
                            Text(
                                text = reflectionState.message,
                                style = MaterialTheme.typography.bodyMedium,
                                color = palette.clay,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp)
                            )
                        }
                        Button(
                            onClick = { onRequestReflection(letter) },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = palette.ink,
                                contentColor = palette.surface
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 48.dp)
                        ) {
                            Text("Try again")
                        }
                    }

                    AiReflectionUiState.Idle -> Unit
                }

                Spacer(Modifier.height(14.dp))
            }
        }
    }

    // Recipient Picker Bottom Sheet
    if (showRecipientSheet) {
        ModalBottomSheet(
            onDismissRequest = { showRecipientSheet = false },
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Address this letter to", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                RecipientCategory.entries.chunked(2).forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        pair.forEach { cat ->
                            val selected = letter.recipientCategory == cat
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (selected) palette.ink else palette.surface,
                                border = BorderStroke(1.dp, if (selected) palette.ink else palette.divider),
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 48.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable {
                                        onChange(
                                            letter.copy(
                                                recipientCategory = cat,
                                                recipientLabel = if (cat == RecipientCategory.CUSTOM) letter.recipientLabel
                                                else UnsentCatalog.recipientLabel(cat, language),
                                                salutation = UnsentCatalog.defaultSalutation(cat, language),
                                                updatedAt = Instant.now().toString()
                                            )
                                        )
                                        promptIndex = 0
                                        if (cat != RecipientCategory.CUSTOM) showRecipientSheet = false
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = UnsentCatalog.recipientLabel(cat, language),
                                        color = if (selected) palette.surface else palette.ink,
                                        style = MaterialTheme.typography.labelLarge
                                    )
                                    if (selected) {
                                        Icon(
                                            Icons.Rounded.Check,
                                            contentDescription = null,
                                            tint = palette.surface,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }

                if (letter.recipientCategory == RecipientCategory.CUSTOM) {
                    OutlinedTextField(
                        value = letter.recipientLabel,
                        onValueChange = {
                            onChange(letter.copy(recipientLabel = it, updatedAt = Instant.now().toString()))
                        },
                        label = { Text("Recipient name or place") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Button(
                        onClick = { showRecipientSheet = false },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
                    ) {
                        Text("Done")
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }
    }

    // Tactile Paper Picker Bottom Sheet
    if (showPaperSheet) {
        val excerpt = letter.body.trim().take(68).ifEmpty { "What you meant to say…" }
        ModalBottomSheet(
            onDismissRequest = { showPaperSheet = false },
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Choose tactile paper", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                PaperStyleId.entries.chunked(2).forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        pair.forEach { styleId ->
                            val spec = UnsentCatalog.paperSpec(styleId)
                            val selected = letter.paper == styleId
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = spec.bg,
                                border = BorderStroke(
                                    width = if (selected) 2.dp else 1.dp,
                                    color = if (selected) palette.ink else spec.border
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(16.dp))
                                    .clickable {
                                        onChange(letter.copy(paper = styleId, updatedAt = Instant.now().toString()))
                                        showPaperSheet = false
                                    }
                            ) {
                                Column(
                                    modifier = Modifier.padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            UnsentCatalog.paperName(styleId, language),
                                            style = MaterialTheme.typography.labelMedium,
                                            color = spec.ink
                                        )
                                        if (selected) {
                                            Icon(
                                                Icons.Rounded.Check,
                                                contentDescription = null,
                                                tint = spec.ink,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                    Text(
                                        text = excerpt,
                                        fontFamily = CormorantGaramond,
                                        fontSize = 15.sp,
                                        color = spec.ink.copy(alpha = 0.85f),
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }
    }

    // Release Ritual Sheet ("Let it go")
    if (showReleaseSheet) {
        ModalBottomSheet(
            onDismissRequest = { if (!releasingAnim) showReleaseSheet = false },
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text("Release this letter?", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                Text(
                    "Releasing permanently removes this letter from your local encrypted box. Choose a quiet parting gesture.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = palette.secondaryInk
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        Triple(ReleaseVisual.PAPER_BIRDS, "Paper Birds", Icons.Outlined.Send),
                        Triple(ReleaseVisual.ASH, "Ash", Icons.Outlined.Air),
                        Triple(ReleaseVisual.EMBERS, "Embers", Icons.Outlined.LocalFireDepartment)
                    ).forEach { (vis, label, icon) ->
                        val active = selectedReleaseVisual == vis
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (active) palette.ink else palette.surface,
                            border = BorderStroke(1.dp, if (active) palette.ink else palette.divider),
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 60.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { selectedReleaseVisual = vis }
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(icon, contentDescription = null, tint = if (active) palette.surface else palette.ink, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.height(4.dp))
                                Text(label, style = MaterialTheme.typography.labelSmall, color = if (active) palette.surface else palette.ink)
                            }
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = { showReleaseSheet = false },
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, palette.divider),
                        modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                    ) {
                        Text("Keep letter", color = palette.ink)
                    }
                    Button(
                        onClick = {
                            releasingAnim = true
                            showReleaseSheet = false
                            scope.launch {
                                delay(440)
                                onReleaseConfirm(letter.id, selectedReleaseVisual)
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = palette.clay, contentColor = palette.surface),
                        modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                    ) {
                        Text("Release now")
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }
    }
}
