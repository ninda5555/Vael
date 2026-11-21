package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AstronomyEngine
import com.example.data.UnsentCatalog
import com.example.model.*
import com.example.ui.components.AstralSculptureCanvas
import com.example.ui.components.ZodiacWheelCanvas
import com.example.ui.theme.LocalVeylPalette

@Composable
fun ZodiacScreen(
    language: AppLanguage,
    timeZone: String,
    zodiacProfile: ZodiacProfile,
    reducedMotion: Boolean,
    onUpdateProfile: (ZodiacProfile) -> Unit,
    onStartLetterFromSign: (SignId, String) -> Unit,
    onMakeCardFromSign: (SignId, String) -> Unit,
    onOpenLensCalculator: () -> Unit
) {
    val palette = LocalVeylPalette.current
    val todayStr = remember(timeZone) { AstronomyEngine.todayDateString(timeZone) }

    var zodiacMode by remember { mutableStateOf("wheel") }
    var searchQuery by remember { mutableStateOf("") }
    var wheelFocusSignId by remember(zodiacProfile.chosenLens) {
        mutableStateOf(zodiacProfile.chosenLens ?: SignId.PISCES)
    }
    var detailSignId by remember { mutableStateOf<SignId?>(null) }
    var detailRotDeg by remember { mutableFloatStateOf(0f) }
    var sparkOffset by remember { mutableIntStateOf(0) }

    var pairA by remember { mutableStateOf(SignId.GEMINI) }
    var pairB by remember { mutableStateOf(SignId.PISCES) }
    var pairContext by remember { mutableStateOf(PairContext.FRIENDSHIP) }

    val activeDetailSign = detailSignId?.let { UnsentCatalog.signById(it) }

    if (activeDetailSign != null) {
        BackHandler {
            detailSignId = null
            detailRotDeg = 0f
            sparkOffset = 0
        }

        val isLens = zodiacProfile.chosenLens == activeDetailSign.id
        val baseIdx = UnsentCatalog.dailyPromptIndex(activeDetailSign.id, todayStr, activeDetailSign.prompts.size)
        val prompt = activeDetailSign.prompts[(baseIdx + sparkOffset) % activeDetailSign.prompts.size]

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = { detailSignId = null; sparkOffset = 0 }) {
                    Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back to Zodiac", tint = palette.ink)
                    Spacer(Modifier.width(4.dp))
                    Text("Zodiac", color = palette.ink)
                }

                Button(
                    onClick = {
                        onUpdateProfile(
                            zodiacProfile.copy(chosenLens = if (isLens) null else activeDetailSign.id)
                        )
                    },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isLens) palette.ink else palette.surface,
                        contentColor = if (isLens) palette.surface else palette.ink
                    ),
                    border = if (!isLens) BorderStroke(1.dp, palette.divider) else null,
                    modifier = Modifier.heightIn(min = 44.dp)
                ) {
                    if (isLens) {
                        Icon(Icons.Rounded.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                    }
                    Text(if (isLens) "Active Lens" else "Set as Lens")
                }
            }

            // Interactive Rotatable Element Sculpture Card
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = palette.heroBg,
                border = if (palette.isDark) BorderStroke(1.dp, palette.divider) else null
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(210.dp)
                            .pointerInput(Unit) {
                                detectHorizontalDragGestures { _, dragAmount ->
                                    detailRotDeg = (detailRotDeg + dragAmount * 0.6f) % 360f
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        AstralSculptureCanvas(
                            element = activeDetailSign.elementKind,
                            rotationOffsetDeg = detailRotDeg,
                            reducedMotion = reducedMotion,
                            modifier = Modifier.size(180.dp)
                        )
                    }
                    HorizontalDivider(color = palette.heroText.copy(alpha = 0.12f))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${activeDetailSign.element.get(language)} · Drag to rotate",
                            style = MaterialTheme.typography.labelMedium,
                            color = palette.heroMuted
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            IconButton(onClick = { detailRotDeg -= 35f }) {
                                Icon(Icons.Rounded.RotateLeft, contentDescription = "Rotate left", tint = palette.heroText)
                            }
                            TextButton(onClick = { detailRotDeg = 0f }) {
                                Text("Reset", color = palette.heroText)
                            }
                            IconButton(onClick = { detailRotDeg += 35f }) {
                                Icon(Icons.Rounded.RotateRight, contentDescription = "Rotate right", tint = palette.heroText)
                            }
                        }
                    }
                }
            }

            // Sign Copy & Writing Spark Surface
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "${activeDetailSign.element.get(language)} · ${activeDetailSign.modality.get(language)} · Ruler: ${activeDetailSign.vedicRuler.get(language)}",
                                style = MaterialTheme.typography.labelMedium,
                                color = palette.secondaryInk
                            )
                            Text(
                                "${activeDetailSign.westernName.get(language)} · ${activeDetailSign.rashiName.get(language)}",
                                style = MaterialTheme.typography.headlineSmall,
                                color = palette.ink
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(palette.raised),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(activeDetailSign.glyph, fontSize = 26.sp, color = palette.ink)
                        }
                    }

                    HorizontalDivider(color = palette.divider)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Writing spark", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                        OutlinedButton(
                            onClick = { sparkOffset = (sparkOffset + 1) % activeDetailSign.prompts.size },
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, palette.divider)
                        ) {
                            Icon(Icons.Rounded.Refresh, contentDescription = null, modifier = Modifier.size(16.dp), tint = palette.ink)
                            Spacer(Modifier.width(4.dp))
                            Text("Another spark", color = palette.ink)
                        }
                    }

                    Text(
                        text = prompt.spark.get(language),
                        style = MaterialTheme.typography.headlineSmall,
                        color = palette.ink
                    )

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = palette.raised
                    ) {
                        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("2-minute quiet action", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                            Text(prompt.action.get(language), style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { onStartLetterFromSign(activeDetailSign.id, prompt.spark.get(language)) },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                            modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                        ) {
                            Text("Write letter")
                        }
                        OutlinedButton(
                            onClick = { onMakeCardFromSign(activeDetailSign.id, prompt.spark.get(language)) },
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, palette.divider),
                            modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                        ) {
                            Text("Feeling card", color = palette.ink)
                        }
                    }
                }
            }

            Spacer(Modifier.height(84.dp))
        }
        return
    }

    // Main Zodiac Tab (Wheel + 12-Sign Grid OR Pair Alchemy)
    val focusedSign = UnsentCatalog.signById(wheelFocusSignId)
    val focusedPrompt = remember(focusedSign, todayStr) {
        val idx = UnsentCatalog.dailyPromptIndex(focusedSign.id, todayStr, focusedSign.prompts.size)
        focusedSign.prompts[idx]
    }
    val filteredSigns = remember(searchQuery, language) {
        val q = searchQuery.trim().lowercase()
        if (q.isEmpty()) UnsentCatalog.ZODIAC_SIGNS
        else UnsentCatalog.ZODIAC_SIGNS.filter {
            listOf(it.westernName.en, it.westernName.get(language), it.rashiName.en, it.rashiName.get(language))
                .joinToString(" ").lowercase().contains(q)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Zodiac & Rashi", style = MaterialTheme.typography.displaySmall, color = palette.ink)
                zodiacProfile.chosenLens?.let { lens ->
                    Text(
                        "Lens · ${UnsentCatalog.signById(lens).westernName.get(language)}",
                        style = MaterialTheme.typography.labelMedium,
                        color = palette.secondaryInk
                    )
                }
            }
            Button(
                onClick = onOpenLensCalculator,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                modifier = Modifier.heightIn(min = 44.dp).testTag("open_lens_calculator_button")
            ) {
                Icon(Icons.Outlined.Explore, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Find lens")
            }
        }

        // Mode Switcher: Wheel / Pair Alchemy
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(palette.surface)
                .border(1.dp, palette.divider, RoundedCornerShape(14.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf("wheel" to "12-Sign Wheel", "alchemy" to "Two-Sign Alchemy").forEach { (id, label) ->
                val active = zodiacMode == id
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 42.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (active) palette.ink else palette.surface)
                        .clickable { zodiacMode = id },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        style = MaterialTheme.typography.labelLarge,
                        color = if (active) palette.surface else palette.secondaryInk
                    )
                }
            }
        }

        if (zodiacMode == "alchemy") {
            val signA = UnsentCatalog.signById(pairA)
            val signB = UnsentCatalog.signById(pairB)
            val pairCard = remember(pairA, pairB, pairContext) {
                UnsentCatalog.buildTwoSignCard(pairA, pairB, pairContext)
            }

            // Dual Sculpture Stage
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = palette.heroBg,
                border = if (palette.isDark) BorderStroke(1.dp, palette.divider) else null
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().height(150.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AstralSculptureCanvas(
                            element = signA.elementKind,
                            reducedMotion = reducedMotion,
                            modifier = Modifier.size(124.dp)
                        )
                        AstralSculptureCanvas(
                            element = signB.elementKind,
                            rotationOffsetDeg = 45f,
                            reducedMotion = reducedMotion,
                            modifier = Modifier.size(124.dp)
                        )
                    }
                    HorizontalDivider(color = palette.heroText.copy(alpha = 0.14f))
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(signA.westernName.get(language), color = palette.heroText, style = MaterialTheme.typography.titleMedium)
                            Text(signA.element.get(language), color = palette.heroMuted, style = MaterialTheme.typography.labelSmall)
                        }
                        Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(signB.westernName.get(language), color = palette.heroText, style = MaterialTheme.typography.titleMedium)
                            Text(signB.element.get(language), color = palette.heroMuted, style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }

            // Pair Pickers & Reflective Prompts (Zero Compatibility Scores)
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        "Reflective questions between two lenses — no scores, no verdicts.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.secondaryInk
                    )

                    // Sign A & Sign B selectors
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SignDropdownChip(
                            label = "First sign",
                            selected = pairA,
                            language = language,
                            onSelect = { pairA = it },
                            modifier = Modifier.weight(1f)
                        )
                        SignDropdownChip(
                            label = "Second sign",
                            selected = pairB,
                            language = language,
                            onSelect = { pairB = it },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        PairContext.entries.forEach { ctx ->
                            val sel = pairContext == ctx
                            FilterChip(
                                selected = sel,
                                onClick = { pairContext = ctx },
                                label = { Text(ctx.name.lowercase().replaceFirstChar { it.uppercase() }) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Surface(shape = RoundedCornerShape(14.dp), color = palette.raised) {
                        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("${signA.westernName.get(language)} · ${signA.rashiName.get(language)}", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                            Text(pairCard.questionForA.get(language), style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                        }
                    }

                    Surface(shape = RoundedCornerShape(14.dp), color = palette.raised) {
                        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("${signB.westernName.get(language)} · ${signB.rashiName.get(language)}", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                            Text(pairCard.questionForB.get(language), style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = palette.surface,
                        border = BorderStroke(1.dp, palette.divider)
                    ) {
                        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Shared quiet practice", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                            Text(pairCard.sharedActivity.get(language), style = MaterialTheme.typography.bodyMedium, color = palette.ink)
                        }
                    }
                }
            }
        } else {
            // Interactive Wheel Showcase
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = palette.heroBg,
                border = if (palette.isDark) BorderStroke(1.dp, palette.divider) else null
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        ZodiacWheelCanvas(
                            selectedSign = wheelFocusSignId,
                            onSelectSign = { wheelFocusSignId = it },
                            modifier = Modifier.size(144.dp)
                        )
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                "${focusedSign.element.get(language)} · ${focusedSign.modality.get(language)}",
                                style = MaterialTheme.typography.labelSmall,
                                color = palette.heroMuted
                            )
                            Text(
                                "${focusedSign.westernName.get(language)}\n${focusedSign.rashiName.get(language)}",
                                style = MaterialTheme.typography.titleLarge,
                                color = palette.heroText
                            )
                            Text(
                                focusedPrompt.spark.get(language),
                                style = MaterialTheme.typography.bodyMedium,
                                color = palette.heroText.copy(alpha = 0.88f),
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { detailSignId = focusedSign.id },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = palette.ivory, contentColor = palette.ivoryInk),
                            modifier = Modifier.heightIn(min = 44.dp)
                        ) {
                            Text("Open ${focusedSign.westernName.get(language)}")
                        }
                        OutlinedButton(
                            onClick = { onStartLetterFromSign(focusedSign.id, focusedPrompt.spark.get(language)) },
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, palette.heroText.copy(alpha = 0.25f)),
                            modifier = Modifier.heightIn(min = 44.dp)
                        ) {
                            Text("Write from prompt", color = palette.heroText)
                        }
                    }
                }
            }

            // Search Field
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search Western sign or Vedic Rashi…") },
                leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null) },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = palette.surface,
                    unfocusedContainerColor = palette.surface,
                    focusedBorderColor = palette.ink,
                    unfocusedBorderColor = palette.divider
                ),
                modifier = Modifier.fillMaxWidth()
            )

            // 12-Sign Grid (3 columns)
            filteredSigns.chunked(3).forEach { rowSigns ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    rowSigns.forEach { sign ->
                        val isLens = zodiacProfile.chosenLens == sign.id
                        val isFocused = wheelFocusSignId == sign.id
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = palette.surface,
                            border = BorderStroke(
                                width = if (isLens || isFocused) 1.5.dp else 1.dp,
                                color = if (isLens || isFocused) palette.ink else palette.divider
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(16.dp))
                                .clickable {
                                    wheelFocusSignId = sign.id
                                    detailSignId = sign.id
                                }
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(sign.glyph, fontSize = 22.sp, color = palette.ink)
                                    if (isLens) {
                                        Box(
                                            modifier = Modifier
                                                .size(20.dp)
                                                .clip(CircleShape)
                                                .background(palette.ink),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Rounded.Check, contentDescription = "Active lens", tint = palette.surface, modifier = Modifier.size(12.dp))
                                        }
                                    }
                                }
                                Text(
                                    sign.westernName.get(language),
                                    style = MaterialTheme.typography.titleMedium,
                                    color = palette.ink,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    sign.rashiName.get(language),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = palette.secondaryInk,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                    repeat(3 - rowSigns.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }

        Spacer(Modifier.height(84.dp))
    }
}

@Composable
private fun SignDropdownChip(
    label: String,
    selected: SignId,
    language: AppLanguage,
    onSelect: (SignId) -> Unit,
    modifier: Modifier = Modifier
) {
    val palette = LocalVeylPalette.current
    var expanded by remember { mutableStateOf(false) }
    val sign = UnsentCatalog.signById(selected)

    Box(modifier = modifier) {
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 48.dp)
                .clip(RoundedCornerShape(12.dp))
                .clickable { expanded = true }
        ) {
            Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                Text(label, style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                Text(
                    "${sign.glyph} ${sign.westernName.get(language)}",
                    style = MaterialTheme.typography.labelLarge,
                    color = palette.ink,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            UnsentCatalog.ZODIAC_SIGNS.forEach { s ->
                DropdownMenuItem(
                    text = { Text("${s.glyph} ${s.westernName.get(language)} · ${s.rashiName.get(language)}") },
                    onClick = {
                        onSelect(s.id)
                        expanded = false
                    }
                )
            }
        }
    }
}
