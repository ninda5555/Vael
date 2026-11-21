package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AstronomyEngine
import com.example.data.CardPngExporter
import com.example.data.UnsentCatalog
import com.example.model.*
import com.example.ui.CardSeed
import com.example.ui.components.AstralSculptureCanvas
import com.example.ui.theme.CormorantGaramond
import com.example.ui.theme.LocalVeylPalette
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.UUID

private enum class CardToolSheet {
    PAPER, TYPE, MOTIF, DETAILS
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeelingCardStudioScreen(
    seed: CardSeed,
    language: AppLanguage,
    timeZone: String,
    reducedMotion: Boolean,
    onBack: () -> Unit,
    onSaveCard: (FeelingCardRecord) -> Unit
) {
    BackHandler(onBack = onBack)

    val context = LocalContext.current
    val palette = LocalVeylPalette.current

    var text by remember(seed) { mutableStateOf(seed.text) }
    var style by remember(seed) { mutableStateOf(seed.style) }
    var signId by remember(seed) { mutableStateOf(seed.signId) }
    var showMedallion by remember(seed) { mutableStateOf(seed.signId != null) }
    var fontScale by remember { mutableStateOf(FontScaleOption.MEDIUM) }
    var showWatermark by remember { mutableStateOf(true) }
    var showRecipient by remember(seed) { mutableStateOf(seed.recipient.isNotBlank()) }
    var recipientLabel by remember(seed) { mutableStateOf(seed.recipient) }
    var activePageIndex by remember { mutableIntStateOf(0) }
    var activeSheet by remember { mutableStateOf<CardToolSheet?>(null) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    val pages = remember(text) { CardPngExporter.paginateCardText(text, 340) }
    val safeIndex = activePageIndex.coerceIn(0, (pages.size - 1).coerceAtLeast(0))
    val currentPassage = pages[safeIndex]
    val spec = UnsentCatalog.paperSpec(style)
    val signDef = signId?.let { UnsentCatalog.signById(it) }

    val dateLabel = remember(timeZone) {
        val d = AstronomyEngine.parseDateOrToday(AstronomyEngine.todayDateString(timeZone))
        d.format(DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.getDefault()))
    }

    fun buildExportBitmap() = CardPngExporter.renderCardBitmap(
        context = context,
        text = currentPassage,
        style = style,
        fontScale = fontScale,
        signId = signId,
        showMedallion = showMedallion,
        showRecipient = showRecipient,
        recipientLabel = recipientLabel,
        showWatermark = showWatermark,
        dateLabel = dateLabel,
        pageLabel = if (pages.size > 1) "${safeIndex + 1} / ${pages.size}" else null,
        language = language
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            TextButton(onClick = onBack, modifier = Modifier.testTag("card_back_button")) {
                Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back", tint = palette.ink)
                Spacer(Modifier.width(4.dp))
                Text("Back", color = palette.ink)
            }
            Text("9:16 Feeling Card", style = MaterialTheme.typography.titleLarge, color = palette.ink)
            Spacer(Modifier.width(64.dp))
        }

        // Live 9:16 Card Artifact Preview
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .widthIn(max = 280.dp)
                    .fillMaxWidth(0.76f)
                    .aspectRatio(9f / 16f)
                    .clip(RoundedCornerShape(22.dp))
                    .background(Brush.linearGradient(listOf(spec.bg, spec.bgSecondary)))
                    .border(1.dp, spec.border, RoundedCornerShape(22.dp))
                    .padding(14.dp)
            ) {
                // Hairline inner frame
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .border(1.dp, spec.accent.copy(alpha = 0.24f), RoundedCornerShape(14.dp))
                        .padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Top metadata
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            if (signDef != null) {
                                Text(
                                    text = "${signDef.glyph}  ${signDef.westernName.get(language)} · ${signDef.rashiName.get(language)}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = spec.accent
                                )
                            }
                            if (showRecipient && recipientLabel.isNotBlank()) {
                                Text(
                                    text = "To ${recipientLabel.trim()}",
                                    fontFamily = CormorantGaramond,
                                    fontSize = 15.sp,
                                    color = spec.mutedInk
                                )
                            }
                        }

                        // Optional Center Medallion
                        if (showMedallion) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.CenterHorizontally)
                                    .size(92.dp)
                                    .clip(CircleShape)
                                    .background(palette.heroBg.copy(alpha = 0.94f)),
                                contentAlignment = Alignment.Center
                            ) {
                                AstralSculptureCanvas(
                                    element = signDef?.elementKind,
                                    reducedMotion = reducedMotion,
                                    modifier = Modifier.size(72.dp)
                                )
                            }
                        }

                        // Main Serif Passage
                        Text(
                            text = currentPassage.ifBlank { "Write one honest feeling worth keeping…" },
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = when (fontScale) {
                                FontScaleOption.SMALL -> 16.sp
                                FontScaleOption.MEDIUM -> 19.sp
                                FontScaleOption.LARGE -> 23.sp
                            },
                            lineHeight = when (fontScale) {
                                FontScaleOption.SMALL -> 22.sp
                                FontScaleOption.MEDIUM -> 26.sp
                                FontScaleOption.LARGE -> 30.sp
                            },
                            color = if (currentPassage.isBlank()) spec.mutedInk else spec.ink,
                            maxLines = 10,
                            overflow = TextOverflow.Ellipsis
                        )

                        // Footer
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = dateLabel + if (pages.size > 1) " · ${safeIndex + 1}/${pages.size}" else "",
                                style = MaterialTheme.typography.labelSmall,
                                color = spec.mutedInk
                            )
                            if (showWatermark) {
                                Text(
                                    text = "VEYL",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.6.sp
                                    ),
                                    color = spec.mutedInk
                                )
                            }
                        }
                    }
                }
            }
        }

        // Pagination pills when text spans multiple 9:16 cards
        if (pages.size > 1) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Card pages:", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                Spacer(Modifier.width(8.dp))
                pages.indices.forEach { idx ->
                    val selected = idx == safeIndex
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (selected) palette.ink else palette.surface,
                        border = BorderStroke(1.dp, palette.divider),
                        modifier = Modifier
                            .padding(horizontal = 3.dp)
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { activePageIndex = idx }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("${idx + 1}", color = if (selected) palette.surface else palette.ink)
                        }
                    }
                }
            }
        }

        // Text Editor Input
        OutlinedTextField(
            value = text,
            onValueChange = {
                text = it
                activePageIndex = 0
            },
            placeholder = { Text("Write a feeling, line, or memory for this card…") },
            minLines = 3,
            maxLines = 6,
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = palette.surface,
                unfocusedContainerColor = palette.surface,
                focusedBorderColor = palette.ink,
                unfocusedBorderColor = palette.divider
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("card_text_input")
        )

        // 4-Tool Strip: Paper · Type · Motif · Details
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf(
                Triple(CardToolSheet.PAPER, "Paper", Icons.Outlined.Palette),
                Triple(CardToolSheet.TYPE, "Type", Icons.Outlined.FormatSize),
                Triple(CardToolSheet.MOTIF, "Motif", Icons.Outlined.AutoAwesome),
                Triple(CardToolSheet.DETAILS, "Details", Icons.Outlined.Tune)
            ).forEach { (sheet, label, icon) ->
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = palette.surface,
                    border = BorderStroke(1.dp, palette.divider),
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 56.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { activeSheet = sheet }
                ) {
                    Column(
                        modifier = Modifier.padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(icon, contentDescription = label, tint = palette.ink, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.height(4.dp))
                        Text(label, style = MaterialTheme.typography.labelSmall, color = palette.ink)
                    }
                }
            }
        }

        // Primary Share + Save Image + Save to Box actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = {
                    val ok = CardPngExporter.shareCardPng(context, buildExportBitmap())
                    statusMessage = if (ok) "Share sheet opened." else "Unable to share image."
                },
                enabled = text.isNotBlank(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                modifier = Modifier
                    .weight(1.2f)
                    .heightIn(min = 48.dp)
                    .testTag("card_share_button")
            ) {
                Icon(Icons.Outlined.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp))
                Text("Share PNG")
            }

            OutlinedButton(
                onClick = {
                    val ok = CardPngExporter.saveCardToGallery(context, buildExportBitmap())
                    statusMessage = if (ok) "Saved 1080×1920 PNG to Pictures/Veyl." else "Could not save PNG."
                },
                enabled = text.isNotBlank(),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, palette.divider),
                modifier = Modifier
                    .weight(1f)
                    .heightIn(min = 48.dp)
                    .testTag("card_save_png_button")
            ) {
                Icon(Icons.Outlined.Download, contentDescription = null, tint = palette.ink, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(4.dp))
                Text("Save PNG", color = palette.ink)
            }
        }

        OutlinedButton(
            onClick = {
                val now = Instant.now().toString()
                onSaveCard(
                    FeelingCardRecord(
                        id = seed.id ?: UUID.randomUUID().toString(),
                        text = text.trim(),
                        style = style,
                        signId = signId,
                        showWatermark = showWatermark,
                        showRecipient = showRecipient,
                        recipientLabel = if (showRecipient) recipientLabel.trim() else null,
                        linkedAlmanacDate = LocalDate.now().toString(),
                        createdAt = now,
                        updatedAt = now
                    )
                )
                statusMessage = "Saved privately in My Box."
            },
            enabled = text.isNotBlank(),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, palette.divider),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 48.dp)
                .testTag("card_save_box_button")
        ) {
            Icon(Icons.Outlined.BookmarkBorder, contentDescription = null, tint = palette.ink, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text("Save to My Box", color = palette.ink)
        }

        statusMessage?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk)
        }

        Spacer(Modifier.height(32.dp))
    }

    // Tool Sheets
    activeSheet?.let { sheet ->
        ModalBottomSheet(
            onDismissRequest = { activeSheet = null },
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                when (sheet) {
                    CardToolSheet.PAPER -> {
                        Text("Card Paper", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                        PaperStyleId.entries.chunked(2).forEach { pair ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                pair.forEach { sId ->
                                    val p = UnsentCatalog.paperSpec(sId)
                                    val sel = style == sId
                                    Surface(
                                        shape = RoundedCornerShape(14.dp),
                                        color = p.bg,
                                        border = BorderStroke(if (sel) 2.dp else 1.dp, if (sel) palette.ink else p.border),
                                        modifier = Modifier
                                            .weight(1f)
                                            .heightIn(min = 54.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .clickable { style = sId }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(UnsentCatalog.paperName(sId, language), color = p.ink, style = MaterialTheme.typography.labelLarge)
                                            if (sel) Icon(Icons.Rounded.Check, contentDescription = null, tint = p.ink, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }

                    CardToolSheet.TYPE -> {
                        Text("Typography Scale", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FontScaleOption.entries.forEach { opt ->
                                val sel = fontScale == opt
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (sel) palette.ink else palette.surface,
                                    border = BorderStroke(1.dp, palette.divider),
                                    modifier = Modifier
                                        .weight(1f)
                                        .heightIn(min = 48.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .clickable { fontScale = opt }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            opt.name.lowercase().replaceFirstChar { it.uppercase() },
                                            color = if (sel) palette.surface else palette.ink,
                                            style = MaterialTheme.typography.labelLarge
                                        )
                                    }
                                }
                            }
                        }
                    }

                    CardToolSheet.MOTIF -> {
                        Text("Astral Motif & Sign", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Show geometric medallion", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                            Switch(checked = showMedallion, onCheckedChange = { showMedallion = it })
                        }
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(3),
                            modifier = Modifier.heightIn(max = 260.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            item {
                                val sel = signId == null
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (sel) palette.ink else palette.surface,
                                    border = BorderStroke(1.dp, palette.divider),
                                    modifier = Modifier
                                        .heightIn(min = 52.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .clickable { signId = null }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text("None", color = if (sel) palette.surface else palette.ink, style = MaterialTheme.typography.labelMedium)
                                    }
                                }
                            }
                            items(UnsentCatalog.ZODIAC_SIGNS) { s ->
                                val sel = signId == s.id
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (sel) palette.ink else palette.surface,
                                    border = BorderStroke(1.dp, palette.divider),
                                    modifier = Modifier
                                        .heightIn(min = 52.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .clickable {
                                            signId = s.id
                                            showMedallion = true
                                        }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(6.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center
                                    ) {
                                        Text(s.glyph, color = if (sel) palette.surface else palette.ink, fontSize = 16.sp)
                                        Text(
                                            s.westernName.get(language),
                                            color = if (sel) palette.surface else palette.ink,
                                            style = MaterialTheme.typography.labelSmall,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }
                            }
                        }
                    }

                    CardToolSheet.DETAILS -> {
                        Text("Card Details", style = MaterialTheme.typography.titleLarge, color = palette.ink)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Show VEYL watermark", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                            Switch(checked = showWatermark, onCheckedChange = { showWatermark = it })
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Show recipient line", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                            Switch(checked = showRecipient, onCheckedChange = { showRecipient = it })
                        }
                        if (showRecipient) {
                            OutlinedTextField(
                                value = recipientLabel,
                                onValueChange = { recipientLabel = it },
                                label = { Text("Recipient name") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }
    }
}
