# Veyl (Android)

Veyl is a quiet, privacy-first native Android application built with Kotlin and Jetpack Compose for unsent letters, 9:16 feeling cards, and a deterministic lunar & zodiac writing almanac.

## Highlights

- **Paper & Ink Editorial Aesthetic**: Warm Paper and dark Ink themes with system-following support, `Cormorant Garamond` display typography, and `Plus Jakarta Sans` UI typography.
- **Unsent Letter Studio**: 6 tactile paper styles (`Clean`, `Ruled`, `Washi`, `Midnight`, `Parchment`, `Minimal`), 9 recipient categories, multilingual writing prompts (`English`, `বাংলা`, `हिन्दी`, `Hinglish`), wax seal & symbolic release ritual (`Paper Birds`, `Ash`, `Embers`), and an instant crisis/support helpline sheet when needed.
- **9:16 Feeling Card Studio**: Compose shareable 1080×1920 feeling cards with live preview, optional **VEYL** watermark, and native Android `FileProvider` PNG export and share sheet.
- **Deterministic Zodiac & Rashi Almanac**: Offline solar & lunar astronomy engine supporting Tropical Sun Sign, Vedic Moon Rashi (Lahiri ayanamsa), zodiac wheel, two-sign reflection lens, and monthly moon-phase calendar with private check-ins.
- **Encrypted On-Device Vault**: Letters, cards, and check-ins are stored privately on-device with AES-256-GCM encryption, optional PBKDF2 passphrase lock, recovery code, and one-tap local vault erase.
- **Opt-in Ambient Audio**: Bundled calming flute audio toggleable from the top bar.

## Build

```bash
gradle :app:assembleDebug
```
