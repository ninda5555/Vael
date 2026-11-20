# Creative App Concepts & UNSENT Master Prompt

## Part 1: Top Pick — A Feeling-to-Art Journal ("Feeling Cards")

### The Idea
The user types or speaks one messy feeling (*“I feel behind everyone and tired of pretending”*). The app turns it into a beautiful shareable card: a short poem line, a color mood, and an animated background in a **9:16 format** made for Instagram Stories and Reels. Think of it as a mood ring plus a poet.

### Why It Fits Sensitive, Creative People
They feel deeply but often can’t say it, and they don’t want to be “fixed.” They want to be understood and to make something beautiful from the pain. Most wellness apps feel clinical, and most journaling apps feel like homework. This one makes feelings feel like art.

### Why It Can Go Viral
* **Every card is an ad:** People already post aesthetic quotes and relatable text. A card carries a small watermark, so each share advertises the app.
* **Identity sharing:** Cards titled *“Your emotional weather today: foggy with a chance of hope”* get shared because they say something about the person.
* **Relatability:** *“This is exactly me”* is the strongest trigger for sharing.
* **Language edge:** Supporting **Bengali, Hindi, and Hinglish** gives you a big advantage. Almost every polished app in this space is English-only, and millions of young Indians feel things in their mother tongue.
* **Daily ritual:** One card a day, plus a monthly “year in feelings” recap like Spotify Wrapped, gives people a reason to come back.

### What to Build First (2–4 Weeks)
1. A single screen where you write or speak a feeling.
2. An AI-generated 2–3 line poem plus a matching gradient or animation.
3. A one-tap share to Stories.
4. A private “my cards” archive.

*Leave out accounts, social feeds, and premium tiers until people are actually using it.*

### How to Grow It With No Budget
* Post your own cards daily on Instagram and YouTube Shorts, with a story about why you built it. A founder who says *“I’m building this because I struggled too”* is far more believable than an ad.
* Offer *“send me your feeling and I’ll turn it into art”* in comments.
* Partner with small poetry, aesthetic, and mental-health-awareness pages.

### Two Things to Get Right
1. **Framing & Crisis Safety:** Don’t call it therapy. Say *“a creative space for your feelings.”* If someone writes something that suggests serious distress, have the app gently show a helpline and a human-support option instead of a poem.
2. **Privacy Promise:** People will share raw emotions, so entries should be private by default, with sharing always their choice.

---

## Part 2: 5 Great App Ideas for Sensitive, Creative People

1. **Feeling Cards**
   * **Concept:** Type or speak a messy feeling and get a shareable 9:16 art card with a short poem, a mood color, and a soft animation.
   * **Viral hook:** Every card carries a small watermark, so each share is an ad. People post what feels like them.

2. **Unsent**
   * **Concept:** Write the message you’ll never send—to an ex, a parent, or your past self. The app turns it into a beautiful letter page with a “never sent” stamp. You can keep it private or share it anonymously.
   * **Viral hook:** *“Things I’ll never send”* is already a huge trend. This gives it a home and a format.

3. **Message in a Bottle**
   * **Concept:** Write one honest feeling and “throw it into the sea.” A stranger receives it and sends back one kind reply. There are no profiles, likes, or followers.
   * **Viral hook:** People screenshot the reply they got (*“a stranger understood me”*). Needs careful moderation and crisis detection, so build it second, not first.

4. **Dreamer’s Almanac**
   * **Concept:** A daily ritual page with an “emotional forecast” (*“soft rain, clearing by evening”*), a moon phase, a tiny journaling prompt, and a poem. Built for dreamy, intuitive personalities, with astrology as a playful layer rather than a promise.
   * **Viral hook:** Identity sharing. People post their forecast the way they post their horoscope, plus a monthly “your year in feelings” recap.

5. **Voice to Mini-Film**
   * **Concept:** Speak for 30 seconds about your day. The app makes a cinematic 9:16 reel with your words as subtitles over ambient visuals and music. Your voice never leaves your phone unless you choose to share.
   * **Viral hook:** It makes people feel like the main character of a film, which is very shareable on Reels.

**Which to start with:** **Feeling Cards** or **Unsent**. Both are simple, with one screen, one AI call, and one share button, and you can launch in 2–4 weeks.

---

## Part 3: Master Prompt for Google AI Studio (Build Mode)

Copy everything inside the prompt block below and paste it directly into **Google AI Studio → Build**:

```text
You are a world-class product designer and senior React engineer. Build a complete, polished, mobile-first web app called "UNSENT".

## CONCEPT
Unsent is a quiet, beautiful space to write the messages you will never send: to an ex, a parent, a friend, a lost version of yourself. The user writes, and the app turns the words into a gorgeous letter page stamped "NEVER SENT". They can keep it private, export it as a shareable image, or let it go with a symbolic "release" ritual.

Audience: sensitive, creative, deeply feeling people (18-30) who are tired of clinical wellness apps. Tone: gentle, poetic, non-judgmental. Never say "therapy" or "treatment". Describe the app as "a creative space for your feelings".

## CORE FLOW
1. **Welcome screen**: a soft animated background and the line "Some things are meant to be written, not sent." A single button: "Write something".
2. **Choose who it's for**: soft pill buttons: Ex · Mother · Father · Friend · Someone I lost · My past self · My future self · Myself right now · Someone else (custom name).
3. **Write screen**: a distraction-free full-screen writing space.
   - Opening line auto-filled: "Dear [name]," (editable).
   - A "Need a spark?" button gives one gentle prompt for that person, e.g. "What do you wish they knew?" or "What did you never get to say?" Provide 5+ prompts per recipient type.
   - Live word count, no limits, no timers, no pressure.
   - Voice input via the browser Web Speech API (mic button), with graceful fallback if unsupported.
4. **Choose a paper**: before sealing, the user picks a letter style, previewed live:
   - Old Parchment (warm cream, ink stains, torn edge)
   - Midnight Blue (dark paper, silver handwriting)
   - Rose Petal (blush paper, pressed flower)
   - Rain on Glass (blurred droplets, white text)
   - Torn Notebook (lined paper, scribbles)
   - Moonlit Ink (deep indigo, gold stars)
5. **Seal it**: the letter page appears with a realistic rotated red ink stamp "NEVER SENT" (with the date), slight paper texture, soft shadow, and a subtle handwriting font (Caveat or Homemade Apple for English; Hind Siliguri or Tiro Bangla for Bengali; Kalam or Tiro Devanagari Hindi for Hindi). The stamp should "thud" onto the paper with a quick scale and fade animation.
6. **After sealing, three choices**:
   - **Keep it**: saves to My Unsent Box (private, stored only in the device's localStorage).
   - **Share as image**: exports a 9:16 PNG (1080x1920) of the letter, with a small tasteful "unsent" watermark at the bottom. Add an option to hide the recipient's name ("To someone I loved"). Use html-to-image or html2canvas, with the Web Share API where available and a download fallback.
   - **Let it go**: a beautiful ritual animation where the letter slowly crumbles into glowing particles, ash, or floating paper birds (user can pick one) and the letter is permanently deleted, with the closing line "It's out of you now."

## MY UNSENT BOX
A private archive shown as a grid of folded/sealed letters. Tap to open and re-read. Each shows recipient and date. Allow delete. Include a "Lock with PIN" option (4-digit, stored locally) so nobody else can open it.

## OPTIONAL AI FEATURE (use the Gemini API)
After the user seals a letter, offer a gentle optional button: "Hear a quiet reflection". Send the letter to Gemini with this system instruction:
"You are a warm, poetic companion. In 2-3 short sentences, reflect back the feeling you sense in this letter, without advice, diagnosis, judgment, or fixing. Never say you are a therapist. Never quote the letter at length. Match the language the user wrote in (English, Bengali, Hindi, or Hinglish)."
Show the result in a soft card beneath the letter. Also offer "Turn into a poem": a 4-line poem inspired by the letter, optional to include in the shareable image.
Handle API errors gracefully with a kind message. Keep the whole app fully usable without AI.

## SAFETY (very important)
- If the letter contains words or themes suggesting self-harm, suicide, or hopelessness (in English, Hindi, Bengali, or Hinglish), do NOT generate a poem or reflection. Instead show a gentle, non-alarming card: "It sounds like you're carrying something really heavy. You deserve real support from a real person." Include a helpline button: India Tele-MANAS 14416 (make the number configurable in one constants file so it can be changed by country), plus a "Talk to someone you trust" prompt. Never block the user from saving their letter.
- Include a plain-language privacy note: "Your letters stay on your device unless you choose to share them. We never read them."
- Add a small footer: "Unsent is a creative space, not a substitute for professional care."

## LANGUAGE
Support English, Hindi, Bengali, and Hinglish. Add a language switcher for UI text, and make the writing area accept any script. Include proper font stacks for Bengali and Devanagari.

## DESIGN SYSTEM
- Mood: moonlit, intimate, cinematic, like a diary under a night sky. Think soft grain, deep indigo, ink black, candle gold, and dusty rose.
- Typography: an elegant serif (Cormorant Garamond or Playfair Display) for headings, a clean sans (Inter) for UI, a handwriting font for letters.
- Palette (CSS variables): --ink #0e0b1a, --midnight #1b1740, --dusk #3a2f6b, --rose #e8b4b8, --gold #d9b26f, --paper #f5ead6, --stamp #b3202a.
- Glassmorphism cards, large rounded corners, generous spacing, subtle film grain overlay, gentle floating particle background (stars/dust).
- Smooth micro-interactions with Framer Motion (motion/react): page transitions, button presses, stamp thud, letter crumble.
- Support dark mode by default, with a light "daylight" option.
- Fully responsive, designed for a 390px mobile viewport first, with a nice centered layout on desktop.
- Accessibility: proper contrast, focus states, aria-labels, and a "reduce motion" setting that disables animations.

## TECH
- React + TypeScript + Tailwind CSS + Framer Motion + lucide-react icons.
- All data in localStorage (letters, settings, PIN). No login, no backend.
- Clean component structure: Welcome, RecipientPicker, Writer, PaperPicker, LetterView, Ritual, UnsentBox, Settings, SafetyCard.
- Include sample demo letters in the Unsent Box on first launch (clearly marked as examples, deletable) so the app looks alive.
- No placeholder text anywhere; every screen should look finished.

## QUALITY BAR
This should feel like a premium, award-winning indie app, not a template. Pay obsessive attention to spacing, typography, animation timing, and emotional tone. The first 10 seconds must make someone say "oh, this is beautiful". Build everything fully and make sure it runs without errors.
```

---

## Part 4: How to Iterate on Your App in AI Studio
1. Paste the full prompt above and let AI Studio build the first working version.
2. Refine **one thing per follow-up message**:
   * *“Make the stamp animation more satisfying and add a paper-sound-like haptic feel.”*
   * *“Make the ‘Let it go’ ritual more cinematic with floating paper birds.”*
   * *“Improve the 9:16 share image so it looks like a screenshot someone would proudly post on Instagram Stories.”*
3. Test the safety card by typing a heavy sentence, and test image sharing on your mobile phone.
4. Before launch, add your own social handle to the bottom watermark so every shared card carries your brand.