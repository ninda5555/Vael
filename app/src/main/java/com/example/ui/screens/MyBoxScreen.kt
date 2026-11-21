package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.UnsentCatalog
import com.example.model.*
import com.example.ui.theme.CormorantGaramond
import com.example.ui.theme.LocalVeylPalette

private sealed interface BoxEntry {
    val id: String
    val updatedAt: String
    val favorite: Boolean

    data class Letter(val record: LetterRecord) : BoxEntry {
        override val id = record.id
        override val updatedAt = record.updatedAt
        override val favorite = record.favorite
    }

    data class Card(val record: FeelingCardRecord) : BoxEntry {
        override val id = record.id
        override val updatedAt = record.updatedAt
        override val favorite = record.favorite
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyBoxScreen(
    locked: Boolean,
    canLock: Boolean,
    letters: List<LetterRecord>,
    cards: List<FeelingCardRecord>,
    checkInsCount: Int,
    demoDismissed: Boolean,
    onUnlock: (String, (Boolean) -> Unit) -> Unit,
    onLockNow: () -> Unit,
    onStartWriting: () -> Unit,
    onOpenLetter: (LetterRecord) -> Unit,
    onOpenCard: (FeelingCardRecord) -> Unit,
    onDuplicateLetter: (LetterRecord) -> Unit,
    onToggleLetterFav: (String) -> Unit,
    onToggleCardFav: (String) -> Unit,
    onDeleteLetter: (String) -> Unit,
    onDeleteCard: (String) -> Unit,
    onDismissDemo: () -> Unit
) {
    val palette = LocalVeylPalette.current

    // Locked Vault Gate: zero excerpt leakage
    if (locked) {
        var passphrase by remember { mutableStateOf("") }
        var error by remember { mutableStateOf<String?>(null) }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider),
                modifier = Modifier.fillMaxWidth().widthIn(max = 420.dp)
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(palette.raised),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Outlined.Lock, contentDescription = null, tint = palette.ink)
                    }
                    Text("My Box is locked", style = MaterialTheme.typography.headlineSmall, color = palette.ink)
                    Text(
                        "Enter your passphrase to decrypt your letters and feeling cards on this device.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.secondaryInk,
                        textAlign = TextAlign.Center
                    )
                    OutlinedTextField(
                        value = passphrase,
                        onValueChange = { passphrase = it; error = null },
                        placeholder = { Text("Enter passphrase") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().testTag("vault_passphrase_input")
                    )
                    error?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = palette.clay) }
                    Button(
                        onClick = {
                            onUnlock(passphrase) { ok ->
                                if (ok) passphrase = "" else error = "Passphrase did not unlock this box."
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("vault_unlock_button")
                    ) {
                        Icon(Icons.Outlined.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Unlock Box")
                    }
                }
            }
        }
        return
    }

    var filterTab by remember { mutableStateOf("all") }
    var searchQuery by remember { mutableStateOf("") }
    var menuEntry by remember { mutableStateOf<BoxEntry?>(null) }

    val allEntries = remember(letters, cards) {
        (letters.map { BoxEntry.Letter(it) } + cards.map { BoxEntry.Card(it) })
            .sortedByDescending { it.updatedAt }
    }
    val filtered = remember(allEntries, filterTab, searchQuery) {
        val q = searchQuery.trim().lowercase()
        allEntries.filter { entry ->
            val tabOk = when (filterTab) {
                "letters" -> entry is BoxEntry.Letter
                "cards" -> entry is BoxEntry.Card
                "favorites" -> entry.favorite
                else -> true
            }
            if (!tabOk) return@filter false
            if (q.isEmpty()) return@filter true
            when (entry) {
                is BoxEntry.Letter -> "${entry.record.recipientLabel} ${entry.record.salutation} ${entry.record.body}".lowercase().contains(q)
                is BoxEntry.Card -> entry.record.text.lowercase().contains(q)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // Header + Lock Now
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("My Box", style = MaterialTheme.typography.displaySmall, color = palette.ink)
            if (canLock) {
                OutlinedButton(
                    onClick = onLockNow,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, palette.divider),
                    modifier = Modifier.heightIn(min = 44.dp)
                ) {
                    Icon(Icons.Outlined.Lock, contentDescription = null, tint = palette.ink, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Lock now", color = palette.ink)
                }
            }
        }

        if (allEntries.isEmpty()) {
            // Calm Empty Box State
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        Icons.Outlined.MarkunreadMailbox,
                        contentDescription = null,
                        tint = palette.ink,
                        modifier = Modifier.size(48.dp)
                    )
                    Text("Your private box is quiet", style = MaterialTheme.typography.headlineSmall, color = palette.ink)
                    Text(
                        "Letters and 9:16 feeling cards stay encrypted on this device unless you choose to release or share them.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = palette.secondaryInk,
                        textAlign = TextAlign.Center
                    )
                    Button(
                        onClick = onStartWriting,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                        modifier = Modifier.heightIn(min = 48.dp).testTag("empty_box_write_button")
                    ) {
                        Text("Write a letter")
                    }
                }
            }
        } else {
            // Recent Paper Shelf (up to 3 tactile cards with layered backing sheet)
            val recent = allEntries.take(3)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Recent paper", style = MaterialTheme.typography.labelMedium, color = palette.secondaryInk)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    recent.forEach { entry ->
                        val spec = when (entry) {
                            is BoxEntry.Letter -> UnsentCatalog.paperSpec(entry.record.paper)
                            is BoxEntry.Card -> UnsentCatalog.paperSpec(entry.record.style)
                        }
                        val title = when (entry) {
                            is BoxEntry.Letter -> entry.record.salutation.ifBlank { entry.record.recipientLabel }
                            is BoxEntry.Card -> "Feeling Card"
                        }
                        val excerpt = when (entry) {
                            is BoxEntry.Letter -> entry.record.body
                            is BoxEntry.Card -> entry.record.text
                        }

                        Box(modifier = Modifier.width(232.dp)) {
                            // Subtle backing sheet
                            Box(
                                modifier = Modifier
                                    .matchParentSize()
                                    .offset(x = 5.dp, y = 5.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(palette.raised)
                                    .border(1.dp, palette.divider, RoundedCornerShape(16.dp))
                            )
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = spec.bg,
                                border = BorderStroke(1.dp, spec.border),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 124.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .clickable {
                                        when (entry) {
                                            is BoxEntry.Letter -> onOpenLetter(entry.record)
                                            is BoxEntry.Card -> onOpenCard(entry.record)
                                        }
                                    }
                            ) {
                                Column(
                                    modifier = Modifier.padding(14.dp),
                                    verticalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = when (entry) {
                                                    is BoxEntry.Letter -> entry.record.recipientLabel
                                                    is BoxEntry.Card -> "9:16 Card"
                                                },
                                                style = MaterialTheme.typography.labelSmall,
                                                color = spec.mutedInk
                                            )
                                            if (entry is BoxEntry.Letter && entry.record.sealed) {
                                                Text("SEALED", style = MaterialTheme.typography.labelSmall, color = palette.clay)
                                            }
                                        }
                                        Text(
                                            text = title,
                                            fontFamily = CormorantGaramond,
                                            fontWeight = FontWeight.SemiBold,
                                            fontSize = 18.sp,
                                            color = spec.ink,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            text = excerpt.ifBlank { "…" },
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = spec.mutedInk,
                                            maxLines = 2,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                    Text(
                                        text = entry.updatedAt.take(10),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = spec.mutedInk
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Recap Strip
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Inside your box", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                    Row(modifier = Modifier.fillMaxWidth()) {
                        RecapCount(letters.size, "Letters", Modifier.weight(1f))
                        RecapCount(cards.size, "Cards", Modifier.weight(1f))
                        RecapCount(checkInsCount, "Check-ins", Modifier.weight(1f))
                    }
                }
            }

            // Filter Pills + Search
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("all" to "All", "letters" to "Letters", "cards" to "Cards", "favorites" to "Favorites").forEach { (id, label) ->
                    val sel = filterTab == id
                    FilterChip(
                        selected = sel,
                        onClick = { filterTab = id },
                        label = { Text(label) }
                    )
                }
            }

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search letters and cards…") },
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

            // Calm Library List
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    filtered.forEachIndexed { idx, entry ->
                        val spec = when (entry) {
                            is BoxEntry.Letter -> UnsentCatalog.paperSpec(entry.record.paper)
                            is BoxEntry.Card -> UnsentCatalog.paperSpec(entry.record.style)
                        }
                        val title = when (entry) {
                            is BoxEntry.Letter -> entry.record.salutation.ifBlank { entry.record.recipientLabel }
                            is BoxEntry.Card -> entry.record.text.take(44)
                        }
                        val subtitle = when (entry) {
                            is BoxEntry.Letter -> "${entry.record.recipientLabel}${if (entry.record.sealed) " · Sealed" else ""} · ${entry.updatedAt.take(10)}"
                            is BoxEntry.Card -> "Feeling Card · ${entry.updatedAt.take(10)}"
                        }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    when (entry) {
                                        is BoxEntry.Letter -> onOpenLetter(entry.record)
                                        is BoxEntry.Card -> onOpenCard(entry.record)
                                    }
                                }
                                .padding(horizontal = 14.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Stacked paper thumbnail
                            Box(modifier = Modifier.size(width = 36.dp, height = 44.dp)) {
                                Box(
                                    modifier = Modifier
                                        .matchParentSize()
                                        .offset(x = 3.dp, y = 3.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(palette.raised)
                                        .border(1.dp, palette.divider, RoundedCornerShape(6.dp))
                                )
                                Box(
                                    modifier = Modifier
                                        .matchParentSize()
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(spec.bg)
                                        .border(1.dp, spec.border, RoundedCornerShape(6.dp))
                                )
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                Text(title, style = MaterialTheme.typography.titleMedium, color = palette.ink, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = palette.secondaryInk, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }

                            IconButton(onClick = {
                                when (entry) {
                                    is BoxEntry.Letter -> onToggleLetterFav(entry.id)
                                    is BoxEntry.Card -> onToggleCardFav(entry.id)
                                }
                            }) {
                                Icon(
                                    imageVector = if (entry.favorite) Icons.Rounded.Star else Icons.Outlined.StarOutline,
                                    contentDescription = "Favorite",
                                    tint = if (entry.favorite) palette.ink else palette.secondaryInk
                                )
                            }

                            IconButton(onClick = { menuEntry = entry }) {
                                Icon(Icons.Rounded.MoreHoriz, contentDescription = "Entry options", tint = palette.ink)
                            }
                        }

                        if (idx < filtered.lastIndex) {
                            HorizontalDivider(color = palette.divider)
                        }
                    }
                }
            }
        }

        // Dismissible Sample Preview Card
        if (!demoDismissed) {
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = palette.surface,
                border = BorderStroke(1.dp, palette.divider)
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Sample preview · Never mixed with your data", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                        Text(
                            "Hide",
                            style = MaterialTheme.typography.labelSmall,
                            color = palette.ink,
                            textDecoration = TextDecoration.Underline,
                            modifier = Modifier.clickable(onClick = onDismissDemo).padding(4.dp)
                        )
                    }
                    Surface(shape = RoundedCornerShape(12.dp), color = palette.raised) {
                        Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("To: My younger self · Old Parchment", style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
                            Text(
                                "You did not have to understand the whole monsoon before taking the first step across the street.",
                                fontFamily = CormorantGaramond,
                                fontSize = 16.sp,
                                color = palette.ink
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(84.dp))
    }

    // Entry Overflow Sheet
    menuEntry?.let { entry ->
        ModalBottomSheet(
            onDismissRequest = { menuEntry = null },
            containerColor = palette.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = {
                        menuEntry = null
                        when (entry) {
                            is BoxEntry.Letter -> onOpenLetter(entry.record)
                            is BoxEntry.Card -> onOpenCard(entry.record)
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = palette.ink, contentColor = palette.surface),
                    modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
                ) {
                    Text("Reread")
                }

                if (entry is BoxEntry.Letter) {
                    OutlinedButton(
                        onClick = {
                            menuEntry = null
                            onDuplicateLetter(entry.record)
                        },
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, palette.divider),
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
                    ) {
                        Text("Duplicate draft", color = palette.ink)
                    }
                }

                TextButton(
                    onClick = {
                        menuEntry = null
                        when (entry) {
                            is BoxEntry.Letter -> onDeleteLetter(entry.id)
                            is BoxEntry.Card -> onDeleteCard(entry.id)
                        }
                    },
                    modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
                ) {
                    Text("Delete permanently", color = palette.clay)
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun RecapCount(count: Int, label: String, modifier: Modifier = Modifier) {
    val palette = LocalVeylPalette.current
    Column(modifier = modifier) {
        Text(count.toString(), style = MaterialTheme.typography.headlineMedium, color = palette.ink)
        Text(label, style = MaterialTheme.typography.labelSmall, color = palette.secondaryInk)
    }
}
