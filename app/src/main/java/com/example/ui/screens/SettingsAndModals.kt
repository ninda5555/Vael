package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.data.AstronomyEngine
import com.example.data.UnsentCatalog
import com.example.model.*
import com.example.ui.components.VeylWordmark
import com.example.ui.theme.LocalVeylPalette

@Composable
fun SettingsScreen(
    prefs: UserPreferences,
    recoveryCode: String?,
    passphraseEnabled: Boolean,
    audioPlaying: Boolean,
    onBack: () -> Unit,
    onUpdatePrefs: ((UserPreferences) -> UserPreferences) -> Unit,
    onToggleAudio: () -> Unit,
    onEnablePassphrase: (String) -> String?,
    onDisablePassphrase: () -> Unit,
    onEraseAll: () -> Unit,
    onOpenWelcome: () -> Unit,
    onOpenSupport: () -> Unit
) {
    BackHandler(onBack = onBack)

    val palette = LocalVeylPalette.current
    var newPassphrase by remember { mutableStateOf("") }
    var passMessage by remember { mutableStateOf<String?>(null) }
    var showRecovery by remember { mutableStateOf(false) }
    var confirmErase by remember { mutableStateOf(false) }
    var tzExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack, modifier = Modifier.testTag("settings_back_button")) {
                Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back", tint = palette.ink)
                Spacer(Modifier.width(4.dp))
                Text("Back", color = palette.ink)
            }
            Spacer(Modifier.width(8.dp))
            Text("Settings", style = MaterialTheme.typography.headlineMedium, color = palette.ink)
        }

        // Group 1: Appearance & Language
        Text("Appearance & language", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Theme Mode
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Theme", style = MaterialTheme.typography.titleMedium, color = palette.ink)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(
                            ThemeMode.PAPER to "Paper",
                            ThemeMode.INK to "Ink",
                            ThemeMode.SYSTEM to "System"
                        ).forEach { (mode, label) ->
                            val sel = prefs.theme == mode
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (sel) palette.ink else palette.surface,
                                border = BorderStroke(1.dp, if (sel) palette.ink else palette.divider),
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 44.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { onUpdatePrefs { it.copy(theme = mode) } }
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(label, color = if (sel) palette.surface else palette.ink, style = MaterialTheme.typography.labelLarge)
                                }
                            }
                        }
                    }
                }
                HorizontalDivider(color = palette.divider)

                // Language
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Language", style = MaterialTheme.typography.titleMedium, color = palette.ink)
                    AppLanguage.entries.chunked(2).forEach { pair ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            pair.forEach { lang ->
                                val sel = prefs.language == lang
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = if (sel) palette.ink else palette.surface,
                                    border = BorderStroke(1.dp, if (sel) palette.ink else palette.divider),
                                    modifier = Modifier
                                        .weight(1f)
                                        .heightIn(min = 44.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .clickable { onUpdatePrefs { it.copy(language = lang) } }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(lang.displayName, color = if (sel) palette.surface else palette.ink, style = MaterialTheme.typography.labelLarge)
                                    }
                                }
                            }
                        }
                    }
                }
                HorizontalDivider(color = palette.divider)

                // Text Size
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Text size", style = MaterialTheme.typography.titleMedium, color = palette.ink)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(TextSize.NORMAL to "Normal", TextSize.LARGE to "Large").forEach { (sz, label) ->
                            val sel = prefs.textSize == sz
                            FilterChip(
                                selected = sel,
                                onClick = { onUpdatePrefs { it.copy(textSize = sz) } },
                                label = { Text(label) }
                            )
                        }
                    }
                }
                HorizontalDivider(color = palette.divider)

                // Reduced motion
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Reduce motion", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                    Switch(
                        checked = prefs.reducedMotion,
                        onCheckedChange = { checked -> onUpdatePrefs { it.copy(reducedMotion = checked) } }
                    )
                }
                HorizontalDivider(color = palette.divider)

                // Timezone
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Almanac timezone", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                    Box {
                        OutlinedButton(onClick = { tzExpanded = true }, shape = RoundedCornerShape(10.dp)) {
                            Text(prefs.timeZone, color = palette.ink)
                        }
                        DropdownMenu(expanded = tzExpanded, onDismissRequest = { tzExpanded = false }) {
                            UnsentCatalog.SUPPORTED_TIMEZONES.forEach { tz ->
                                DropdownMenuItem(
                                    text = { Text(tz) },
                                    onClick = {
                                        onUpdatePrefs { it.copy(timeZone = tz) }
                                        tzExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }
                HorizontalDivider(color = palette.divider)

                // Ambient Flute Soundtrack
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Icon(
                            if (audioPlaying) Icons.Rounded.VolumeUp else Icons.Outlined.MusicNote,
                            contentDescription = null,
                            tint = if (audioPlaying) palette.clay else palette.ink
                        )
                        Text("Ambient flute", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                    }
                    Button(
                        onClick = onToggleAudio,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (audioPlaying) palette.ink else palette.raised,
                            contentColor = if (audioPlaying) palette.surface else palette.ink
                        )
                    ) {
                        Text(if (audioPlaying) "Playing" else "Play")
                    }
                }
                HorizontalDivider(color = palette.divider)

                // Replay Welcome
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onOpenWelcome)
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("About Veyl", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                    Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = palette.secondaryInk)
                }
            }
        }

        // Group 2: Privacy & Encrypted Vault Lock
        Text("Privacy & on-device encryption", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Outlined.Key, contentDescription = null, tint = palette.ink, modifier = Modifier.size(18.dp))
                        Text("Passphrase lock for My Box", style = MaterialTheme.typography.titleMedium, color = palette.ink)
                    }
                    if (!passphraseEnabled) {
                        OutlinedTextField(
                            value = newPassphrase,
                            onValueChange = { newPassphrase = it; passMessage = null },
                            placeholder = { Text("Create passphrase (min 4 chars)") },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Button(
                            onClick = {
                                val err = onEnablePassphrase(newPassphrase)
                                if (err == null) {
                                    newPassphrase = ""
                                    passMessage = "Passphrase lock active (PBKDF2-SHA-256 + AES-256-GCM)."
                                } else {
                                    passMessage = err
                                }
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                            modifier = Modifier.heightIn(min = 44.dp)
                        ) {
                            Text("Enable lock")
                        }
                    } else {
                        Text(
                            "Passphrase lock is active (AES-256-GCM).",
                            style = MaterialTheme.typography.bodyMedium,
                            color = palette.secondaryInk
                        )
                        OutlinedButton(
                            onClick = {
                                onDisablePassphrase()
                                passMessage = "Passphrase lock removed."
                            },
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Remove lock", color = palette.ink)
                        }
                    }
                    passMessage?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk) }
                }

                HorizontalDivider(color = palette.divider)

                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Device recovery key", style = MaterialTheme.typography.bodyLarge, color = palette.ink)
                        TextButton(onClick = { showRecovery = !showRecovery }) {
                            Text(if (showRecovery) "Hide" else "Reveal", color = palette.ink)
                        }
                    }
                    if (showRecovery && recoveryCode != null) {
                        Surface(shape = RoundedCornerShape(10.dp), color = palette.raised) {
                            Text(
                                text = recoveryCode,
                                style = MaterialTheme.typography.labelSmall,
                                color = palette.ink,
                                modifier = Modifier.fillMaxWidth().padding(12.dp)
                            )
                        }
                    }
                }

                HorizontalDivider(color = palette.divider)

                // Erase Local Vault
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "Clears all encrypted letters, feeling cards, and check-ins from this device.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.secondaryInk
                    )
                    if (!confirmErase) {
                        OutlinedButton(
                            onClick = { confirmErase = true },
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, palette.clay)
                        ) {
                            Text("Erase local box", color = palette.clay)
                        }
                    } else {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedButton(onClick = { confirmErase = false }) {
                                Text("Cancel", color = palette.ink)
                            }
                            Button(
                                onClick = {
                                    onEraseAll()
                                    confirmErase = false
                                    passMessage = "All local data erased."
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = palette.clay, contentColor = palette.surface)
                            ) {
                                Text("Confirm erase")
                            }
                        }
                    }
                }
            }
        }

        // Group 3: Support & Care
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = palette.surface,
            border = BorderStroke(1.dp, palette.divider),
            modifier = Modifier.clip(RoundedCornerShape(18.dp)).clickable(onClick = onOpenSupport)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Icon(Icons.Outlined.VolunteerActivism, contentDescription = null, tint = palette.clay)
                    Text("Support & listening helplines", style = MaterialTheme.typography.titleMedium, color = palette.clay)
                }
                Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = palette.secondaryInk)
            }
        }

        Spacer(Modifier.height(48.dp))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateChooserSheet(
    onDismiss: () -> Unit,
    onWriteLetter: () -> Unit,
    onMakeCard: () -> Unit
) {
    val palette = LocalVeylPalette.current
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = palette.surface) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Create quietly", style = MaterialTheme.typography.titleLarge, color = palette.ink)

            Surface(
                shape = RoundedCornerShape(16.dp),
                color = palette.ink,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .clickable(onClick = onWriteLetter)
                    .testTag("chooser_write_letter")
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(Icons.Outlined.Edit, contentDescription = null, tint = palette.surface)
                    Column {
                        Text("Write an unsent letter", style = MaterialTheme.typography.titleMedium, color = palette.surface)
                        Text("Private on-device paper with seal & release ritual", style = MaterialTheme.typography.bodyMedium, color = palette.surface.copy(alpha = 0.78f))
                    }
                }
            }

            Surface(
                shape = RoundedCornerShape(16.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider),
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .clickable(onClick = onMakeCard)
                    .testTag("chooser_make_card")
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(Icons.Outlined.Style, contentDescription = null, tint = palette.ink)
                    Column {
                        Text("Create a 9:16 Feeling Card", style = MaterialTheme.typography.titleMedium, color = palette.ink)
                        Text("Export crisp 1080×1920 PNG for stories or your box", style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk)
                    }
                }
            }
            Spacer(Modifier.height(14.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoodCheckInSheet(
    dateStr: String,
    existing: AlmanacCheckIn?,
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit
) {
    val palette = LocalVeylPalette.current
    var mood by remember(existing) { mutableStateOf(existing?.moodLabel ?: UnsentCatalog.MOOD_PRESETS.first()) }
    var note by remember(existing) { mutableStateOf(existing?.note ?: "") }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = palette.surface) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("How did $dateStr feel?", style = MaterialTheme.typography.titleLarge, color = palette.ink)
            UnsentCatalog.MOOD_PRESETS.chunked(2).forEach { pair ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    pair.forEach { preset ->
                        val sel = mood == preset
                        FilterChip(
                            selected = sel,
                            onClick = { mood = preset },
                            label = { Text(preset, maxLines = 1) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (pair.size == 1) Spacer(Modifier.weight(1f))
                }
            }
            OutlinedTextField(
                value = note,
                onValueChange = { note = it },
                label = { Text("Quiet note (optional)") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth()
            )
            Button(
                onClick = { onSave(mood, note) },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
            ) {
                Text("Save check-in")
            }
            Spacer(Modifier.height(14.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LensCalculatorSheet(
    language: AppLanguage,
    timeZone: String,
    zodiacProfile: ZodiacProfile,
    onDismiss: () -> Unit,
    onSaveProfile: (ZodiacProfile) -> Unit
) {
    val palette = LocalVeylPalette.current
    var birthDate by remember { mutableStateOf("1998-03-04") }
    var birthTime by remember { mutableStateOf("") }
    var sunResult by remember { mutableStateOf(zodiacProfile.tropicalSun) }
    var vedicMoon by remember { mutableStateOf(zodiacProfile.vedicMoonSign) }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = palette.surface) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Birth Lens Calculator", style = MaterialTheme.typography.titleLarge, color = palette.ink)
            Text(
                "Deterministic offline astronomical calculation for Tropical Sun & Lahiri Vedic Moon (Rashi). Birth time is optional.",
                style = MaterialTheme.typography.bodyMedium,
                color = palette.secondaryInk
            )
            OutlinedTextField(
                value = birthDate,
                onValueChange = { birthDate = it },
                label = { Text("Birth date (YYYY-MM-DD)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = birthTime,
                onValueChange = { birthTime = it },
                label = { Text("Birth time optional (HH:mm, 24h)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Button(
                onClick = {
                    val sun = AstronomyEngine.calculateTropicalSun(birthDate.trim(), birthTime.trim().ifEmpty { null }, timeZone)
                    val moon = AstronomyEngine.calculateVedicMoonSign(birthDate.trim(), birthTime.trim().ifEmpty { null }, timeZone)
                    sunResult = sun
                    vedicMoon = moon
                },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
            ) {
                Text("Calculate sky positions")
            }

            sunResult?.let { res ->
                Surface(shape = RoundedCornerShape(14.dp), color = palette.raised) {
                    Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = res.signId?.let {
                                val s = UnsentCatalog.signById(it)
                                "Tropical Sun: ${s.glyph} ${s.westernName.get(language)} (${res.degreeInSign ?: 0.0}°)"
                            } ?: "Tropical Sun: Cusp / Ambiguous",
                            style = MaterialTheme.typography.titleMedium,
                            color = palette.ink
                        )
                        vedicMoon?.let { m ->
                            val ms = UnsentCatalog.signById(m)
                            Text(
                                text = "Vedic Moon (Rashi): ${ms.glyph} ${ms.rashiName.get(language)}",
                                style = MaterialTheme.typography.titleMedium,
                                color = palette.ink
                            )
                        }
                        res.note?.let {
                            Text(it, style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk)
                        }
                        val chosen = res.signId ?: vedicMoon
                        if (chosen != null) {
                            Button(
                                onClick = {
                                    onSaveProfile(
                                        zodiacProfile.copy(
                                            chosenLens = chosen,
                                            tropicalSun = res,
                                            vedicMoonSign = vedicMoon
                                        )
                                    )
                                    onDismiss()
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface)
                            ) {
                                Text("Save as my writing lens")
                            }
                        }
                    }
                }
            }
            Spacer(Modifier.height(14.dp))
        }
    }
}

@Composable
fun WelcomeDialog(onDismiss: () -> Unit) {
    val palette = LocalVeylPalette.current
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = palette.surface,
        title = { VeylWordmark(color = palette.ink, fontSizeSp = 22f, showSwash = true) },
        text = {
            Text(
                "Veyl is a quiet, privacy-first sanctuary for unsent letters, 9:16 feeling cards, and a deterministic lunar & zodiac writing almanac.\n\nEverything you write stays encrypted on this device unless you choose to share a card.",
                style = MaterialTheme.typography.bodyMedium,
                color = palette.secondaryInk
            )
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface)
            ) {
                Text("Enter quietly")
            }
        }
    )
}

@Composable
fun SupportDialog(onDismiss: () -> Unit) {
    val palette = LocalVeylPalette.current
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = palette.surface,
        title = { Text("You do not have to carry this alone", style = MaterialTheme.typography.titleLarge, color = palette.ink) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    "If tonight feels heavier than paper can hold, trained listeners are available confidentially:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = palette.secondaryInk
                )
                Text("• India (Tele-MANAS): 14416 or 1-800-891-4416 (24/7)", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = palette.ink)
                Text("• India (KIRAN): 1800-599-0019", style = MaterialTheme.typography.bodyMedium, color = palette.ink)
                Text("• US & Canada: Call or text 988", style = MaterialTheme.typography.bodyMedium, color = palette.ink)
                Text("• UK: Samaritans 116 123", style = MaterialTheme.typography.bodyMedium, color = palette.ink)
                Text("• Worldwide: findahelpline.com", style = MaterialTheme.typography.bodyMedium, color = palette.ink)
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface)
            ) {
                Text("Close")
            }
        }
    )
}
