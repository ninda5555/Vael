# Google AI Studio Build · Regenerate UNSENT with iOS-style visual polish

Rebuild the interface in the existing UNSENT / ASTRAL 3D web app. Implement the design in the active project, run it and inspect the rendered screens. Preserve the product's existing data and Firebase integrations. Deliver the same thoughtful experience on an iPhone in Safari, as an installed web app, and on Android. Keep desktop responsive.

## 1. Use the three Stoic and two Bond screenshots as the primary visual references

| Positive reference | What to translate into UNSENT |
|---|---|
| The welcome screen with the large black bird | One short, upright headline on cool off-white; generous open space; one original, confidently cropped black silhouette. For UNSENT draw a folded letter with a lifted flap. Carry the fold through the empty archive and seal animation. |
| The illustrated question with the slider | One task per screen. Place a small monochrome illustration above the question, and put the answer or tool near the thumb. Use back, close and progress only where their behavior is meaningful. Apply this to an optional check-in or existing guided writing flow. |
| The home screen with the seven dates and dark feature card | Small centered title, quiet calendar strip, one large ink-colored writing card, lighter secondary content, balanced bottom navigation with a central create action. Keep UNSENT’s own language, information architecture and symbols. |
| Bond opening | A small, memorable mark and strong centered wordmark on an open canvas. Give UNSENT an original folded-envelope mark. Use its inked crease as the visual signature. The Bond screenshot is a still; implement the original motion storyboard below. |
| Bond story shelf | Small paper objects overlap slightly and cast a soft contact shadow. Use this for unlocked My Box previews, with at most two sheets behind a cover. Keep names, social avatars, friend suggestions and feeds outside this private archive. |

Use ChatGPT and Claude as secondary references for input focus and typography. Use the earlier graphite examples for the dark appearance. The purple UNSENT screenshots in AI Studio show the rejected result. Override earlier purple backgrounds, serif hero text, pastel zodiac tiles, gold controls and default-dark styling. Exclude Stoic’s bird, logo and text, Mobbin’s footer, simulated status bars, battery icons, fake home indicators and device frames. The phone supplies its own system chrome.

## 2. Compose the actual first screen

On first use open **Today**, directly usable without an account. Default to the light **Paper** appearance for a new profile. Respect saved theme choices, with system and dark options in Settings. Use a cool paper canvas, near-black type and a single ink-colored hero. At 390 × 844, arrange the screen as follows; let it expand for larger type.

1. **Header.** Center “Today” in a 50–56 px navigation row. Put a settings control at the trailing edge. Balance the title optically with space on the leading edge. Do not invent a streak counter.
2. **Week.** Seven evenly spaced date buttons, short localized weekday above date, one fine rounded outline for selection. Default to the user's current local date. Selecting a date opens its real Almanac detail or linked entries. If selected content is empty, give that date an honest empty state. Show a localized full date to screen readers. At large text sizes let the strip scroll.
3. **Letter.** Use 18–20 px side margins, a near-black surface, generous internal spacing and about 24–28 px corners. At its visual center put one editable invitation, **“What would you like to say?”** Below it, one ivory **“Write a letter”** button. The invitation is a real quick-entry field. Tapping the button brings up the editor immediately, carrying any typed text and selection. Use a subtle folded-paper edge in a corner only if the words remain dominant. A returning writer can resume their draft; a locked archive never reveals an excerpt. The main action fits above the fold at 360 × 740 with default type.
4. **One secondary invitation.** A white card offers a real writing prompt, for example **“What do you wish you’d said?”** with the action **“Use this prompt.”** This opens the editor with the question as context, separate from the author's text. Show a Feeling card shortcut through Create and sign exploration through Zodiac; keep the first screen short.
5. **Navigation.** Four real destinations are Today, Zodiac, Almanac and My Box. Put an accessible circular **Create** button between the second and third tabs. It opens a compact sheet with “Write a letter” and “Make a feeling card.” The plus is an action; it never becomes a selected tab. Preserve selected destination, scroll position and draft when returning. Use a quiet background and a single selected icon/label treatment.

**Welcome and check-in.** Borrow the welcome composition for a dismissible introduction available through Settings. Use **“A place for unsent letters.”**, a cropped original envelope silhouette and **“Start writing.”** Daily writing has no onboarding gate. For an existing optional mood check-in show the original paper illustration, **“How are you feeling?”**, and one accessible five-position control with visible plain-language choices. Store a value only after an explicit save. Back preserves the selection; Close exits without submitting. Omit sleep tracking and health assertions. A progress indicator must correspond to real steps.

## 3. One visual system

| Element | Specification |
|---|---|
| Ink · dark option | Canvas #151617, primary surface #1D1F20, raised surface #252729, subtle divider #363839, main text #F3F1EC, secondary text #B3B4B1. Primary button ivory #EEEAE2 with ink #1A1B1C. |
| Paper · light default | Canvas #F3F3F5, surface #FFFFFF, primary text #19191B, secondary #59595F, divider #DADADD, primary action #19191B on light surfaces and ivory on the ink hero. Maintain hierarchy in both themes. |
| Signature color | A restrained clay-red ink stamp on finished paper. Reserve destructive styling for the final confirmed removal action. Support visible keyboard focus in both themes. Verify actual rendered contrast. |
| Typography | Use system-ui, -apple-system, BlinkMacSystemFont and an appropriate local sans fallback. Let each device render its own system face. Wordmark 20–22/26, screen titles 26–30/34 medium, body and inputs 16–18/24–28, row labels 15–16/22, metadata 13/18. Use a literary serif only for the user's letter or a chosen card face. No italic decorative copy. |
| Spacing and geometry | Use 4, 8, 12, 16, 20, 24 and 32 px steps. Start with 20 px phone gutters. Align the screen title, composer and lists on one vertical line. Buttons 44–48 px high, 10–12 px radius; ordinary surfaces 16–18 px radius and the home feature card 24–28 px. Reserve pills for actual choices. |
| Icons and imagery | Use one consistent 20–24 px outline icon family. Draw the 12 zodiac marks as monochrome paths in matching viewboxes; OS emoji tiles are a failure. Use original flat ink-and-paper illustrations with a static first frame. Keep detailed art inside the artifact preview or sign detail. |
| Motion | Press feedback 100–140 ms, sheets 180–240 ms, one short tactile stamp on seal. Remove transform effects for reduced motion. Load heavier 3D art only on demand. Writing, browsing and export must work without WebGL. |

Use space and tonal separation before adding a border. No gradient coverage across the shell, repeating dots, glowing outlines, ornamental badges, extra card around every row, or permanent explanatory footer. Let each major screen have one visually dominant action. A destructive action belongs apart from the main action group.

## Motion and touch direction

**Signature opening — “Unfold.”** Build a small, original envelope from two or three paper planes with a single dark crease. On the first cold launch of a session, match the initial document background to the selected theme and show the mark centered above the “Unsent” wordmark. At 0–160 ms the folded shape resolves from a low-contrast silhouette. From 160–420 ms its flap lifts around the crease. From 420–700 ms the inner sheet expands toward the position of the writing surface as Today resolves around it. Finish in the real, tappable Today state. If a shared-element transition is unavailable, use matching scale and opacity. Include the mark locally so fonts, WebGL, networking and Firebase initialization cannot stall the opening.

Mount the real screen immediately; the decorative layer ignores pointer events, is hidden from screen readers and disappears on the first interaction. A first tap on Write must open the actual editor. Skip the sequence on warm resume, tab changes, deep links, restored editing sessions and reduced motion. A replay in the optional introduction is fine. No fake system splash, looping loader, delayed taps, forced Continue button or sound on launch.

| Interaction | What the finger sees and feels |
|---|---|
| Primary buttons and central plus | On pointer-down darken the fill slightly and compress the visual face to 0.98 within 80 ms. Keep the hit area stationary. On release settle in 120–160 ms. Cancel cleanly if the user drags away. Keyboard and switch activation receive equivalent focus and confirmation. |
| Open a letter from My Box | The chosen paper thumbnail straightens and expands toward the reading surface over about 240 ms. Back returns to the same shelf item and scroll position. A locked preview contains no readable text, even for one frame. |
| Paper, type and zodiac choices | Change the selected indicator on contact. Crossfade only the paper or sign artwork over 120–160 ms. Keep the text, selection, and preview geometry stable so users can compare styles quickly. |
| Bottom sheets | The sheet follows a downward drag from its handle. A short drag settles back; a deliberate drag dismisses. Scrolling inside a long list stays independent. Crossfade the backdrop; support Close, Escape and Back, plus confirmation when dismissing would discard edits. |
| Seal | Fold the paper, then apply the ink stamp once with a single 180–240 ms impression. Announce “Letter sealed” only after the action succeeds. A repeated tap must never create a second letter. |
| Release | After explicit confirmation, reuse the existing ritual. For the paper-bird option, a folded corner lifts away and exits over 400–600 ms. Distinguish the visual release from the server’s deletion acknowledgement. Restore the correct state if sync fails. |
| Navigation and editing | Use a quick tonal change for tabs; reserve lateral movement for drilling into a screen. Preserve caret, keyboard and scroll through autosave. No repeated bounce, typewriter effect or pulse while someone writes. |

**Touch feedback and accessibility.** Use a single small motion/feedback module so related controls share timings. For explicit actions, allow one subtle selection or success haptic only if a supported platform API or existing native bridge is present, the user has enabled it, and the action has reached the intended state. Provide the same visual and spoken feedback without vibration. Do not simulate haptics with audio. Keep autosave, scrolling and navigation silent. Respect system reduced motion and the in-app override from the very first frame. Replace traveling/folding/scaling motion with an immediate state change or brief opacity transition. Use transform and opacity for moving layers, avoid animating layout size frame by frame, and interrupt an in-progress transition rather than queuing several.

## 4. Regenerate each screen

**Writer.** Use a compact back button, “Letter” and a small save status. Make the rest a comfortable, edge-aligned writing surface. Recipient begins as an editable “To” row, with existing recipient presets and a custom name in a sheet. Use “Need a starting line?” as an optional text action. Put “Seal letter” within reach when the keyboard is open; allow natural scrolling on small phones and at large text sizes. Do not cover the last line or reset the cursor on autosave. Preserve existing draft recovery and offer optional dictation only after the appropriate permission and disclosure. Empty input cannot seal a blank letter.

**Paper and sealed letter.** Present all six papers as distinct tactile samples: Old Parchment, Midnight Blue, Rose Petal, Rain on Glass, Torn Notebook and Moonlit Ink. Show the same actual excerpt on each preview for comparison. Use a visual checkmark and accessible selected state. Once sealed, the paper becomes the dominant object. Date and the small red “NEVER SENT” impression belong on the paper. “Keep in My Box” is primary, “Share…” opens preview, and “Let it go…” opens the existing release options and a confirmation describing the selected copies. Run the chosen ash, embers or birds effect only after confirmation. Keep pending cloud deletion visible and retryable.

**Feeling Card / export studio.** Reverse the hierarchy visible in the rejected export screen. Start with title “Feeling card,” an editable 9:16 preview and one “Share…” action, with “Save image” available. Put a compact tool strip under the preview: **Paper · Type · Motif · Details**. Tapping a tool opens one accessible sheet with its current choice. Paper displays six swatches, Type offers readable sizes, Motif shows custom glyphs and “None,” Details holds “Show recipient” (off by default) and “Show Unsent mark.” The preview updates immediately. Every style retains contrasting text. Shrink the preview to fit compact phones with a “View full size” control; keep the main action reachable. Native semantics and keyboard support apply to all controls. Export exactly what the user previewed at 1080 × 1920. If a letter is long, select a passage or paginate. Test Bengali conjuncts, Hindi marks, emoji and long lines in the exported PNG. Sharing cancellation returns to the editor without a success message.

**Zodiac.** Use a compact sign library with three columns of four rows on screens where both names fit and two columns where larger text or narrow widths require it. All tiles share one neutral surface, equal spacing and the same icon weight. Each includes one original line mark, its Western name and its Rashi name. Keep full names and text scaling intact. Example: a finely drawn fish pair, “Pisces,” “Meena.” A subtle selection treatment and a checkmark identify the chosen lens. Put element, ruler, modality and longer copy in the detail screen. Include the full set: Aries/Mesha, Taurus/Vrishabha, Gemini/Mithuna, Cancer/Karka, Leo/Simha, Virgo/Kanya, Libra/Tula, Scorpio/Vrishchika, Sagittarius/Dhanu, Capricorn/Makara, Aquarius/Kumbha, Pisces/Meena.

**Sign detail and Almanac.** A large single sign print can carry the visual personality. Below it show one actual writing question and “Write from this prompt.” For Pisces, use “If today had a sound, what would it be?” The action opens a draft with the prompt as context, separate from the author’s words. Keep the existing two-minute activity, another spark, two-sign conversation card and sky-card creation accessible through secondary actions. In Almanac use a legible lunar month and a date-detail sheet. Keep a chosen lens, a Western birth Sun, a Vedic birth Moon and the current Moon phase distinct. Present calculations with source and uncertainty, including unknown birth time. Settings for birth data and provider consent appear only when someone requests a calculation. Preserve the ability to explore without entering birth data.

**My Box.** For unlocked recent items use a compact paper shelf inspired by the Bond reference, showing up to three covers with a subtle layer behind each. Below it use a calm library list with folded-paper thumbnails, user-authored titles or neutral defaults, and localized dates. Search and filters appear when useful. Tapping an entry opens it; the overflow menu holds export, duplicate and delete. Retain letters, cards, favorites, check-ins and recaps where implemented. An empty box shows one envelope, “Your box is empty” and “Write a letter.” An unlocked private preview is allowed according to the user's privacy preferences. Provide recovery for loading, storage failure, pending sync and version conflict.

**Settings.** Group Appearance and language, Privacy and lock, Backup and recovery, and Account into clear list sections. Settings uses normal labels, toggles and navigation rows. Destructive controls need a separate confirmation. Consent copy belongs beside actions that send a passage or birth details to a provider. Preserve local guest mode, encrypted backups, account switching, verified restore, rate limits and erasure. If a server feature is unavailable, offer a genuinely working local path or a precise configuration state.

## 5. Write like a finished product

Every line must help someone decide, act, understand a consequence, or recover. Use sentence case. Pick one name per feature and use it across headings, buttons, sheets and navigation. Remove “Morning light on fresh paper,” the “Find a thought…” manifesto, the account-status sentence and “Private local mode” from Today. Avoid generic reassurance and privacy claims that the app cannot verify.

| Moment | English launch copy |
|---|---|
| Autosave confirmed locally | “Saved on this device” |
| Backup acknowledged by server | “Backed up” |
| Saved offline with requested backup | “Saved on this device. Backup will resume when you’re online.” |
| Local save failed | “This draft couldn’t be saved.” Keep the editor open and offer “Try again” and “Copy text.” |
| Release with a cloud copy selected | “Remove this letter from this device and your backup?” Buttons “Keep letter” and “Remove letter.” State the actual scope. |
| Request a reflection | “Send this passage to Gemini for a reflection?” Show the selected passage. Buttons “Cancel” and “Send passage.” |
| Birth time unknown | “Your Moon sign needs a more precise birth time.” Offer manual sign exploration when the result is undetermined. |
| Export succeeded | “Image saved” only after a verifiable save. For browser downloads use “Download started.” |

Localize the complete interface. For “Write a letter” use “চিঠি লিখুন” in Bengali, “पत्र लिखें” in Hindi, and “Letter likhein” in Hinglish as launch examples. Keep the user's content in its original language. Use suitable Bengali and Devanagari font fallbacks, script-aware line heights, and human-readable localized dates. Let rows expand instead of clipping translations. Announce important status changes to assistive technology without narrating every keystroke.

## 6. Responsive and implementation rules

Build one coherent component system for app shell, buttons, list rows, editor, previews, glyphs, sheets and status messages. Keep functional components and storage code where they already work. Inspect the route/router, live DOM, design tokens, event handlers and core model before editing. Apply the tokens to actual rendered components. Remove or scope old global CSS that forces purple fills, uppercase text, generic card borders, or a fixed-width phone container.

On mobile use one main vertical scroll surface and safe-area padding. In a modal sheet, lock background scroll, trap focus, support Escape, restore focus on dismissal, and stop controls slipping behind the keyboard. Keep visible scroll affordances where needed; fix nested scrolling through layout. On tablet widen the canvas. At desktop widths use a restrained left navigation rail and a 640–760 px writing column. For the card studio, a larger preview can sit beside the editing controls. No permanent phone-sized frame floating in a blank desktop window.

**iOS-style interaction contract.** Use safe-area insets for the top bar, tab bar and visible sheet actions. Use dynamic viewport sizing with a fallback and flexible content height when the software keyboard appears. Keep pinch zoom enabled. Provide a visible Back control, make the browser Back action unwind the current screen or sheet once, and retain editor text through Back and reopen. Keep focused inputs readable without forced zoom. Present the Paper picker and Create chooser as rounded bottom sheets with a labeled Close or Done control; if swipe-to-dismiss is available the explicit control must also work. Keep the reading position and restore focus to the invoking button. Present sheets as centered dialogs on wide screens. Use a restrained, interruptible transition and a reduced-motion equivalent. An animation or vibration must never be the only confirmation.

The private repository ninda5555/unsent-studio contains the product brief, ASTRAL visual transcripts and an earlier Firebase draft. Use the active project for live behavior and the supplied backend brief for contracts. Keep the 37 MB references/LLM.pdf as development reference for evaluating outputs. Keep it and private research outside public assets and runtime AI calls. Connect existing save, seal, restore, share, reflection, zodiac and release actions. New visual components must consume the real application state. A mock success message, screenshot of an input, or disconnected demo screen fails the task.

## 7. Visual acceptance and delivery

Implement Today, Writer, Zodiac, Sign detail and Card studio first, then carry the same system through My Box, Settings, recovery and every empty/error state. Continue through implementation and verification without waiting for another design instruction.

Before delivery, render and **inspect actual screenshots** of Today, focused Writer, Zodiac, Card studio with the Paper sheet, and My Box. Check at 360 × 740, 390 × 844 and 1440 × 900. Also inspect the Ink dark option, an iPhone Safari-sized viewport with safe-area insets, an Android-sized viewport with keyboard open, a Bengali export, 200% text zoom, and reduced motion. Use synthetic journal text for review. If screenshot or device tools are unavailable, report exactly which visual checks remain unverified. Do not invent screenshots or claim to have tested a physical device.

First compare the new Today screenshot with the positive Stoic home reference at the same apparent phone width. Look for the centered title, functional week strip, one dominant dark surface on cool white, a clearly reachable writing action and an uncluttered bottom bar. Check the optional guided flow separately for one question, a legible response and an accessible exit. Confirm the old serif/purple home and the operating-system emoji are absent. Capture actual iOS Safari checks separately from browser emulation.

Fail the build and fix it if any of these are true:

- A warm resume replays the intro, the first tap gets swallowed, rapid taps duplicate a save, a sheet steals a scrolling gesture, or reduced-motion mode still shows the flying-paper sequence.
- The first mobile viewport spends more space on explanations than on writing; its primary action is below the fold at default text size.
- The result still looks like the rejected screenshot after swapping a background color. The new home must contain a working inline composer, Zodiac must use custom monochrome marks, and Card studio must lead with the artifact.
- The card editor shows an always-open stack of checkboxes, selects and paper buttons; the preview is hidden while the user chooses a style.
- Desktop retains a fixed phone width; the mobile keyboard or bottom navigation covers the final line, a button, or a sheet option.
- Important text clips at larger sizes; focus becomes invisible; selected state relies on color alone; glyphs turn into system emoji.
- A locked box leaks an excerpt, a privacy label overstates what is implemented, or a redesigned flow loses a draft, mixes accounts or pretends backup succeeded.
- A first-time user cannot write one line, choose paper, seal it, reopen it, and export the preview using the actual controls.

Return the rendered app, screenshots you actually captured, plus a short capture of cold launch → type → seal when recording is available, a short list of concrete changes, and a pass/fail table with any remaining integration or device checks. Judge the work by three things someone can see and do: start writing immediately, recognize any sign without visual clutter, and share a card that looks exactly like its preview.
