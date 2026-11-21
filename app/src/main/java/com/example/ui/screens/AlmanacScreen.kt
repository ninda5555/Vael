package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.data.AstronomyEngine
import com.example.data.UnsentCatalog
import com.example.model.*
import com.example.ui.components.MonochromeMoonCanvas
import com.example.ui.theme.LocalVeylPalette
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun AlmanacScreen(
    language: AppLanguage,
    timeZone: String,
    selectedDate: String,
    zodiacProfile: ZodiacProfile,
    checkIns: List<AlmanacCheckIn>,
    letters: List<LetterRecord>,
    cards: List<FeelingCardRecord>,
    onSelectDate: (String) -> Unit,
    onOpenCheckIn: (String) -> Unit,
    onOpenLensCalculator: () -> Unit,
    onOpenLetter: (LetterRecord) -> Unit,
    onOpenCard: (FeelingCardRecord) -> Unit
) {
    val palette = LocalVeylPalette.current
    val parsedSelected = remember(selectedDate) { AstronomyEngine.parseDateOrToday(selectedDate) }
    val yearMonth = remember(parsedSelected) { YearMonth.of(parsedSelected.year, parsedSelected.monthValue) }

    val activeMoon = remember(selectedDate, timeZone) {
        AstronomyEngine.calculateMoonPhaseForDate(selectedDate, timeZone)
    }
    val monthEvents = remember(yearMonth, timeZone) {
        AstronomyEngine.getMonthMoonEvents(yearMonth.year, yearMonth.monthValue, timeZone)
    }

    val existingCheckIn = checkIns.firstOrNull { it.date == selectedDate }
    val linkedLetters = letters.filter { it.linkedAlmanacDate == selectedDate }
    val linkedCards = cards.filter { it.linkedAlmanacDate == selectedDate }

    val lensSign = UnsentCatalog.signById(
        zodiacProfile.chosenLens ?: zodiacProfile.tropicalSun?.signId ?: SignId.PISCES
    )
    val promptIdx = UnsentCatalog.dailyPromptIndex(lensSign.id, selectedDate, lensSign.prompts.size)
    val invitation = lensSign.prompts[promptIdx].spark.get(language)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header + Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Almanac", style = MaterialTheme.typography.displaySmall, color = palette.ink)
            Button(
                onClick = { onOpenCheckIn(selectedDate) },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                modifier = Modifier.heightIn(min = 44.dp).testTag("record_feeling_button")
            ) {
                Icon(Icons.Outlined.FavoriteBorder, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Check in")
            }
        }

        // Distinct Lens / Tropical Sun / Vedic Moon Strip
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            SummaryLensTile(
                title = "Chosen Lens",
                value = zodiacProfile.chosenLens?.let { UnsentCatalog.signById(it).westernName.get(language) } ?: "—",
                onClick = onOpenLensCalculator,
                modifier = Modifier.weight(1f)
            )
            SummaryLensTile(
                title = "Tropical Sun",
                value = zodiacProfile.tropicalSun?.signId?.let { UnsentCatalog.signById(it).westernName.get(language) }
                    ?: if (zodiacProfile.tropicalSun?.isAmbiguous == true) "Cusp" else "—",
                onClick = onOpenLensCalculator,
                modifier = Modifier.weight(1f)
            )
            SummaryLensTile(
                title = "Vedic Moon",
                value = zodiacProfile.vedicMoonSign?.let { UnsentCatalog.signById(it).rashiName.get(language) } ?: "—",
                onClick = onOpenLensCalculator,
                modifier = Modifier.weight(1f)
            )
        }

        // Dark Sky Fact + Monochrome Moon Card
        Surface(
            shape = RoundedCornerShape(22.dp),
            color = palette.heroBg,
            border = if (palette.isDark) BorderStroke(1.dp, palette.divider) else null
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    MonochromeMoonCanvas(phaseAngle = activeMoon.phaseAngle, size = 56.dp)
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            "Sky fact · $selectedDate",
                            style = MaterialTheme.typography.labelSmall,
                            color = palette.heroMuted
                        )
                        Text(
                            UnsentCatalog.moonPhaseLabel(activeMoon.phaseKey, language),
                            style = MaterialTheme.typography.headlineSmall,
                            color = palette.heroText
                        )
                        Text(
                            "${activeMoon.illumination}% illuminated · ${activeMoon.phaseAngle}° ($timeZone)",
                            style = MaterialTheme.typography.labelSmall,
                            color = palette.heroMuted
                        )
                    }
                }
                HorizontalDivider(color = palette.heroText.copy(alpha = 0.14f))
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Daily writing invitation", style = MaterialTheme.typography.labelSmall, color = palette.heroMuted)
                    Text(invitation, style = MaterialTheme.typography.bodyLarge, color = palette.heroText)
                }
            }
        }

        // Lunar Month Grid Card
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = {
                        val prev = yearMonth.minusMonths(1)
                        onSelectDate(LocalDate.of(prev.year, prev.monthValue, 1).toString())
                    }) {
                        Icon(Icons.Rounded.ChevronLeft, contentDescription = "Previous month", tint = palette.ink)
                    }
                    Text(
                        text = yearMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.getDefault())),
                        style = MaterialTheme.typography.titleMedium,
                        color = palette.ink
                    )
                    IconButton(onClick = {
                        val next = yearMonth.plusMonths(1)
                        onSelectDate(LocalDate.of(next.year, next.monthValue, 1).toString())
                    }) {
                        Icon(Icons.Rounded.ChevronRight, contentDescription = "Next month", tint = palette.ink)
                    }
                }

                // 7-column day grid
                val daysInMonth = yearMonth.lengthOfMonth()
                val dayNumbers = (1..daysInMonth).toList()
                dayNumbers.chunked(7).forEach { weekRow ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        weekRow.forEach { day ->
                            val dStr = LocalDate.of(yearMonth.year, yearMonth.monthValue, day).toString()
                            val isSel = dStr == selectedDate
                            val evt = monthEvents.firstOrNull { it.dateStr == dStr }
                            val hasCheckIn = checkIns.any { it.date == dStr }

                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 44.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSel) palette.ink else palette.surface)
                                    .border(
                                        width = 1.dp,
                                        color = if (isSel) palette.ink else palette.divider.copy(alpha = 0.6f),
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .clickable { onSelectDate(dStr) }
                                    .padding(vertical = 6.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = day.toString(),
                                    style = MaterialTheme.typography.labelLarge,
                                    color = if (isSel) palette.surface else palette.ink
                                )
                                Spacer(Modifier.height(2.dp))
                                Box(modifier = Modifier.height(8.dp), contentAlignment = Alignment.Center) {
                                    when {
                                        evt != null && evt.isFullMoon -> {
                                            Box(
                                                modifier = Modifier
                                                    .size(7.dp)
                                                    .clip(CircleShape)
                                                    .background(if (isSel) palette.surface else palette.ink)
                                            )
                                        }
                                        evt != null && !evt.isFullMoon -> {
                                            Box(
                                                modifier = Modifier
                                                    .size(7.dp)
                                                    .border(
                                                        1.5.dp,
                                                        if (isSel) palette.surface else palette.ink,
                                                        CircleShape
                                                    )
                                            )
                                        }
                                        hasCheckIn -> {
                                            Box(
                                                modifier = Modifier
                                                    .size(5.dp)
                                                    .clip(CircleShape)
                                                    .background(if (isSel) palette.surface.copy(alpha = 0.8f) else palette.clay)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                        repeat(7 - weekRow.size) { Spacer(Modifier.weight(1f)) }
                    }
                }

                HorizontalDivider(color = palette.divider)

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Column(Modifier.weight(1f)) {
                        Text("Next New Moon ○", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                        Text(activeMoon.nextNewMoonLabel, style = MaterialTheme.typography.labelLarge, color = palette.ink)
                    }
                    Column(Modifier.weight(1f)) {
                        Text("Next Full Moon ●", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                        Text(activeMoon.nextFullMoonLabel, style = MaterialTheme.typography.labelLarge, color = palette.ink)
                    }
                }
            }
        }

        // Your Weather + Linked Entries Card
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Your weather", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                    TextButton(onClick = { onOpenCheckIn(selectedDate) }) {
                        Text(
                            if (existingCheckIn != null) "Edit" else "Add",
                            color = palette.ink,
                            textDecoration = TextDecoration.Underline
                        )
                    }
                }

                if (existingCheckIn != null) {
                    Text(existingCheckIn.moodLabel, style = MaterialTheme.typography.titleMedium, color = palette.ink)
                    if (existingCheckIn.note.isNotBlank()) {
                        Text(existingCheckIn.note, style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk)
                    }
                } else {
                    Text(
                        "Nothing recorded for $selectedDate yet.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.secondaryInk
                    )
                }

                if (linkedLetters.isNotEmpty() || linkedCards.isNotEmpty()) {
                    HorizontalDivider(color = palette.divider)
                    Text("Linked entries", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                    linkedLetters.forEach { l ->
                        Text(
                            text = "Letter to ${l.recipientLabel} · ${l.body.take(48)}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.ink,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onOpenLetter(l) }
                                .padding(vertical = 6.dp)
                        )
                    }
                    linkedCards.forEach { c ->
                        Text(
                            text = "Feeling Card · ${c.text.take(48)}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.ink,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onOpenCard(c) }
                                .padding(vertical = 6.dp)
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(84.dp))
    }
}

@Composable
private fun SummaryLensTile(
    title: String,
    value: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val palette = LocalVeylPalette.current
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = palette.surface,
        border = BorderStroke(1.dp, palette.divider),
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk, maxLines = 1)
            Text(
                value,
                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                color = palette.ink,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
