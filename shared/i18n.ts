import type { AppLanguage, MoonPhaseInfo, PaperStyleId, RecipientCategory } from './types.ts';

export interface TranslationStrings {
  appName: string;
  nav: {
    today: string;
    zodiac: string;
    almanac: string;
    box: string;
    create: string;
    settings: string;
  };
  today: {
    inlineInvitation: string;
    writeLetterCta: string;
    resumeDraftCta: string;
    lockedArchiveNote: string;
    secondaryPrompt: string;
    useThisPrompt: string;
    emptyDateState: string;
    checkInLink: string;
  };
  welcome: {
    headline: string;
    startWriting: string;
    replayOpening: string;
  };
  checkIn: {
    question: string;
    choices: [string, string, string, string, string];
    save: string;
    back: string;
    close: string;
    notePlaceholder: string;
  };
  createSheet: {
    title: string;
    writeLetterTitle: string;
    writeLetterDesc: string;
    makeCardTitle: string;
    makeCardDesc: string;
    close: string;
  };
  editor: {
    title: string;
    back: string;
    toLabel: string;
    needStartingLine: string;
    customRecipientPlaceholder: string;
    salutationLabel: string;
    paperLabel: string;
    bodyPlaceholder: string;
    wordCount: string;
    savedLocally: string;
    saving: string;
    backedUp: string;
    savedOfflineQueued: string;
    saveErrorMessage: string;
    tryAgain: string;
    copyText: string;
    sealAction: string;
    sealedBadge: string;
    sealedAnnounce: string;
    unsealToEdit: string;
    keepInBox: string;
    shareEllipsis: string;
    letItGo: string;
    dictateAction: string;
    dictateStop: string;
    dictateDisclosureTitle: string;
    dictateDisclosureBody: string;
    dictateAccept: string;
    dictateUnsupported: string;
    aiReflectTitle: string;
    aiSendConfirmTitle: string;
    aiSendConfirmCta: string;
    aiCancel: string;
    hearReflection: string;
    turnToPoem: string;
    releaseModalTitle: string;
    releaseCloudPrompt: string;
    releaseLocalScope: string;
    releaseChooseVisual: string;
    releaseKeepLetter: string;
    releaseRemoveLetter: string;
    releaseDone: string;
    releaseVisuals: {
      ash: string;
      embers: string;
      paperBirds: string;
    };
  };
  cards: {
    title: string;
    feelingLabel: string;
    feelingPlaceholder: string;
    shareEllipsis: string;
    saveImage: string;
    saveToBox: string;
    viewFullSize: string;
    exitFullSize: string;
    tools: {
      paper: string;
      type: string;
      motif: string;
      details: string;
    };
    noneMotif: string;
    fontSizeLabel: string;
    passageSplitLabel: string;
    showWatermark: string;
    showRecipient: string;
    downloadStarted: string;
    savedToBoxStatus: string;
    poemAction: string;
    done: string;
  };
  zodiac: {
    title: string;
    searchPlaceholder: string;
    lensPrefix: string;
    chooseLensBtn: string;
    elementLabel: string;
    modalityLabel: string;
    rulerLabel: string;
    sparkTitle: string;
    anotherSpark: string;
    allSparksSeen: string;
    twoMinActionTitle: string;
    writeFromPrompt: string;
    makeSignCard: string;
    anotherSignQuestion: string;
    howFoundBtn: string;
    skyCardBtn: string;
    twoSignBtn: string;
  };
  lens: {
    title: string;
    subtitle: string;
    manualTab: string;
    birthTab: string;
    skipLens: string;
    saveLens: string;
    birthDate: string;
    birthTimeKnown: string;
    exactTime: string;
    approxTime: string;
    unknownTime: string;
    cityLabel: string;
    manualCoordsOption: string;
    timeZoneLabel: string;
    disclosureTitle: string;
    disclosureBody: string;
    calculateBtn: string;
    sunResultLabel: string;
    moonResultLabel: string;
    awaitingTime: string;
    undetermined: string;
    ambiguousOverlapPrompt: string;
    earlierOffset: string;
    laterOffset: string;
  };
  almanac: {
    title: string;
    nextNewMoon: string;
    nextFullMoon: string;
    skyFactLabel: string;
    writingInvitationLabel: string;
    yourWeatherLabel: string;
    linkedEntriesLabel: string;
    noEventsToday: string;
    calculateBirthBtn: string;
    recordFeelingBtn: string;
  };
  pair: {
    title: string;
    subtitle: string;
    signALabel: string;
    signBLabel: string;
    contextLabel: string;
    contexts: {
      friendship: string;
      family: string;
      creative: string;
    };
    sharedActivityLabel: string;
    noVerdictNotice: string;
  };
  box: {
    title: string;
    searchPlaceholder: string;
    tabs: {
      all: string;
      letters: string;
      cards: string;
      favorites: string;
    };
    lockedTitle: string;
    lockedBody: string;
    unlockBtn: string;
    emptyTitle: string;
    emptyBody: string;
    recapTitle: string;
    recapLettersCount: string;
    recapCardsCount: string;
    recapCheckInsCount: string;
    demoTitle: string;
    demoBadge: string;
    hideDemo: string;
    reread: string;
    duplicateDraft: string;
    deleteItem: string;
    exportItem: string;
    lockNow: string;
    recentShelf: string;
  };
  settings: {
    title: string;
    appearanceGroup: string;
    privacyGroup: string;
    backupGroup: string;
    accountGroup: string;
    languageLabel: string;
    themeLabel: string;
    paperTheme: string;
    inkTheme: string;
    systemTheme: string;
    textSizeLabel: string;
    normalSize: string;
    largeSize: string;
    reducedMotionLabel: string;
    hapticsLabel: string;
    timeZoneLabel: string;
    openWelcomeBtn: string;
    soundtrackLabel: string;
    soundtrackShort: string;
    soundtrackFull: string;
    soundtrackPlaying: string;
    soundtrackPlayBtn: string;
    soundtrackPauseBtn: string;
    vaultLockToggle: string;
    passphrasePlaceholder: string;
    recoveryKeyTitle: string;
    exportBackupBtn: string;
    restoreFromKey: string;
    cloudSyncNote: string;
    aiConsentLabel: string;
    aiConsentDesc: string;
    eraseLocalBtn: string;
    findSupportBtn: string;
  };
  support: {
    title: string;
    gentleMessage: string;
    savePreservedNote: string;
    verifiedLabel: string;
    closeBtn: string;
  };
  recipients: Record<RecipientCategory, string>;
  papers: Record<PaperStyleId, string>;
  moonPhases: Record<MoonPhaseInfo['phaseKey'], string>;
}

const en: TranslationStrings = {
  appName: 'Unsent',
  nav: {
    today: 'Today',
    zodiac: 'Zodiac',
    almanac: 'Almanac',
    box: 'My Box',
    create: 'Create',
    settings: 'Settings',
  },
  today: {
    inlineInvitation: 'What would you like to say?',
    writeLetterCta: 'Write a letter',
    resumeDraftCta: 'Resume draft',
    lockedArchiveNote: 'Your archive is locked',
    secondaryPrompt: 'What do you wish you’d said?',
    useThisPrompt: 'Use this prompt',
    emptyDateState: 'No linked entries or check-in for this date.',
    checkInLink: 'How are you feeling?',
  },
  welcome: {
    headline: 'A place for unsent letters.',
    startWriting: 'Start writing',
    replayOpening: 'Replay opening',
  },
  checkIn: {
    question: 'How are you feeling?',
    choices: ['Heavy', 'Restless', 'Quiet', 'Tender', 'Grounded'],
    save: 'Save check-in',
    back: 'Back',
    close: 'Close',
    notePlaceholder: 'Add a short note in your own words (optional)',
  },
  createSheet: {
    title: 'Create',
    writeLetterTitle: 'Write a letter',
    writeLetterDesc: 'Choose a recipient, write on tactile paper, and seal or let go.',
    makeCardTitle: 'Make a feeling card',
    makeCardDesc: 'Preview and share a 1080 × 1920 keepsake card.',
    close: 'Close',
  },
  editor: {
    title: 'Letter',
    back: 'Back',
    toLabel: 'To',
    needStartingLine: 'Need a starting line?',
    customRecipientPlaceholder: 'Name, city, or season',
    salutationLabel: 'Opening',
    paperLabel: 'Paper',
    bodyPlaceholder: 'Write what you never sent…',
    wordCount: 'words',
    savedLocally: 'Saved on this device',
    saving: 'Saving…',
    backedUp: 'Backed up',
    savedOfflineQueued: 'Saved on this device. Backup will resume when you’re online.',
    saveErrorMessage: 'This draft couldn’t be saved.',
    tryAgain: 'Try again',
    copyText: 'Copy text',
    sealAction: 'Seal letter',
    sealedBadge: 'NEVER SENT',
    sealedAnnounce: 'Letter sealed',
    unsealToEdit: 'Reopen to edit',
    keepInBox: 'Keep in My Box',
    shareEllipsis: 'Share…',
    letItGo: 'Let it go…',
    dictateAction: 'Dictate',
    dictateStop: 'Stop dictation',
    dictateDisclosureTitle: 'Before turning on microphone dictation',
    dictateDisclosureBody:
      'Speech recognition may use your browser or device speech service to transcribe audio into text. You can always type instead.',
    dictateAccept: 'Allow and start',
    dictateUnsupported: 'Voice dictation is not supported in this browser. Typing works everywhere.',
    aiReflectTitle: 'Quiet reflection',
    aiSendConfirmTitle: 'Send this passage to Gemini for a reflection?',
    aiSendConfirmCta: 'Send passage',
    aiCancel: 'Cancel',
    hearReflection: 'Hear a quiet reflection',
    turnToPoem: 'Turn into a poem',
    releaseModalTitle: 'Let this letter go?',
    releaseCloudPrompt: 'Remove this letter from this device and your backup?',
    releaseLocalScope:
      'This removes the letter from active storage on this device. Previously exported PNGs or backup files stay untouched.',
    releaseChooseVisual: 'Choose how to let it go',
    releaseKeepLetter: 'Keep letter',
    releaseRemoveLetter: 'Remove letter',
    releaseDone: 'Letter removed from active storage.',
    releaseVisuals: {
      ash: 'Soft ash',
      embers: 'Warm embers',
      paperBirds: 'Paper birds',
    },
  },
  cards: {
    title: 'Feeling card',
    feelingLabel: 'Your words',
    feelingPlaceholder: 'Write a short line or memory…',
    shareEllipsis: 'Share…',
    saveImage: 'Save image',
    saveToBox: 'Save to My Box',
    viewFullSize: 'View full size',
    exitFullSize: 'Done',
    tools: {
      paper: 'Paper',
      type: 'Type',
      motif: 'Motif',
      details: 'Details',
    },
    noneMotif: 'None',
    fontSizeLabel: 'Text size',
    passageSplitLabel: 'Page',
    showWatermark: 'Show Unsent mark',
    showRecipient: 'Show recipient',
    downloadStarted: 'Download started.',
    savedToBoxStatus: 'Saved on this device.',
    poemAction: 'Turn lines into a 4-line poem',
    done: 'Done',
  },
  zodiac: {
    title: 'Zodiac',
    searchPlaceholder: 'Search Western or Rashi name',
    lensPrefix: 'Chosen lens',
    chooseLensBtn: 'Choose my lens',
    elementLabel: 'Element',
    modalityLabel: 'Modality',
    rulerLabel: 'Vedic ruler',
    sparkTitle: 'Writing question',
    anotherSpark: 'Another spark',
    allSparksSeen: 'Starting from the first spark again',
    twoMinActionTitle: 'Two-minute activity',
    writeFromPrompt: 'Write from this prompt',
    makeSignCard: 'Make a sign card',
    anotherSignQuestion: 'Ask Gemini for a question',
    howFoundBtn: 'How this was found',
    skyCardBtn: 'Sky card',
    twoSignBtn: 'Two-sign cards',
  },
  lens: {
    title: 'Choose my lens',
    subtitle: 'Select a creative lens manually, or compute your Tropical Sun and Vedic Moon (Lahiri) separately.',
    manualTab: 'Choose manually',
    birthTab: 'Birth signs',
    skipLens: 'Browse without saving',
    saveLens: 'Use as my lens',
    birthDate: 'Birth date',
    birthTimeKnown: 'Do you know the birth time?',
    exactTime: 'Exact clock time',
    approxTime: 'Approximate window',
    unknownTime: "I don't know the time",
    cityLabel: 'Birthplace',
    manualCoordsOption: 'Enter coordinates & timezone manually',
    timeZoneLabel: 'IANA Timezone',
    disclosureTitle: 'Before sending birth details',
    disclosureBody:
      'Tropical Sun is computed locally using Astronomy Engine. If Vedic Moon (Lahiri) is requested, only birth date, time, and coordinates (never your name or writing) are sent to the server adapter.',
    calculateBtn: 'Calculate signs',
    sunResultLabel: 'Birth Sun (Tropical)',
    moonResultLabel: 'Birth Moon (Vedic Lahiri)',
    awaitingTime: 'Awaiting birth time',
    undetermined: 'Your Moon sign needs a more precise birth time.',
    ambiguousOverlapPrompt: 'This clock time occurred twice during a DST transition. Choose an offset:',
    earlierOffset: 'Earlier UTC offset',
    laterOffset: 'Later UTC offset',
  },
  almanac: {
    title: 'Almanac',
    nextNewMoon: 'Next New Moon',
    nextFullMoon: 'Next Full Moon',
    skyFactLabel: 'Moon phase',
    writingInvitationLabel: 'Writing invitation',
    yourWeatherLabel: 'Your check-in',
    linkedEntriesLabel: 'Linked entries',
    noEventsToday: 'No New or Full Moon phase instant on this date.',
    calculateBirthBtn: 'Birth signs & lens',
    recordFeelingBtn: 'How are you feeling?',
  },
  pair: {
    title: 'Two-sign conversation cards',
    subtitle: 'Pick any two signs and a shared context. No scores, percentages, or verdicts.',
    signALabel: 'First sign',
    signBLabel: 'Second sign',
    contextLabel: 'Context',
    contexts: {
      friendship: 'Friendship',
      family: 'Family',
      creative: 'Creative collaboration',
    },
    sharedActivityLabel: 'Shared activity',
    noVerdictNotice: 'Creative prompts only—never relationship ratings.',
  },
  box: {
    title: 'My Box',
    searchPlaceholder: 'Search letters and cards',
    tabs: {
      all: 'All',
      letters: 'Letters',
      cards: 'Cards',
      favorites: 'Favorites',
    },
    lockedTitle: 'My Box is locked',
    lockedBody: 'Enter your passphrase to decrypt and read your saved letters.',
    unlockBtn: 'Unlock My Box',
    emptyTitle: 'Your box is empty',
    emptyBody: 'Letters you keep and feeling cards you save appear here, encrypted on this device.',
    recapTitle: 'My year in feelings',
    recapLettersCount: 'Letters',
    recapCardsCount: 'Cards',
    recapCheckInsCount: 'Check-ins',
    demoTitle: 'Sample entries (excluded from recap)',
    demoBadge: 'Examples',
    hideDemo: 'Dismiss',
    reread: 'Open',
    duplicateDraft: 'Duplicate as draft',
    deleteItem: 'Delete',
    exportItem: 'Export JSON',
    lockNow: 'Lock',
    recentShelf: 'Recent',
  },
  settings: {
    title: 'Settings',
    appearanceGroup: 'Appearance & language',
    privacyGroup: 'Privacy & lock',
    backupGroup: 'Backup & recovery',
    accountGroup: 'Account & support',
    languageLabel: 'Language',
    themeLabel: 'Appearance',
    paperTheme: 'Paper',
    inkTheme: 'Ink',
    systemTheme: 'System',
    textSizeLabel: 'Text size',
    normalSize: 'Standard',
    largeSize: 'Larger',
    reducedMotionLabel: 'Reduce motion',
    hapticsLabel: 'Touch feedback (haptics)',
    timeZoneLabel: 'Display timezone',
    openWelcomeBtn: 'About Unsent & replay opening',
    soundtrackLabel: 'Soundtrack · Krishna Eternal Love',
    soundtrackShort: 'Flute Cut (1:45)',
    soundtrackFull: 'Full Song (6:06)',
    soundtrackPlaying: 'Playing',
    soundtrackPlayBtn: 'Play soundtrack',
    soundtrackPauseBtn: 'Pause soundtrack',
    vaultLockToggle: 'Protect My Box with a passphrase',
    passphrasePlaceholder: 'Enter passphrase (min 6 characters)',
    recoveryKeyTitle: '256-bit recovery key',
    exportBackupBtn: 'Export encrypted backup',
    restoreFromKey: 'Restore encrypted backup',
    cloudSyncNote: 'Private letters stay on this device unless you sign in and confirm a recovery key.',
    aiConsentLabel: 'Optional Gemini reflection',
    aiConsentDesc: 'Off by default. Prompts before sending any selected passage.',
    eraseLocalBtn: 'Erase all local data',
    findSupportBtn: 'Find human support',
  },
  support: {
    title: 'You do not have to carry this alone',
    gentleMessage:
      'It sounds like things may feel deeply heavy right now. Your writing stays safe and private here, and real human support is available.',
    savePreservedNote: 'Saving and deleting your letters remains completely available.',
    verifiedLabel: 'Verified resource',
    closeBtn: 'Return to my page',
  },
  recipients: {
    ex: 'Ex',
    mother: 'Mother',
    father: 'Father',
    friend: 'Friend',
    lost: 'Someone I lost',
    pastSelf: 'My past self',
    futureSelf: 'My future self',
    presentSelf: 'Myself right now',
    custom: 'Custom',
  },
  papers: {
    oldParchment: 'Old Parchment',
    midnightBlue: 'Midnight Blue',
    rosePetal: 'Rose Petal',
    rainGlass: 'Rain on Glass',
    tornNotebook: 'Torn Notebook',
    moonlitInk: 'Moonlit Ink',
  },
  moonPhases: {
    new_moon: 'New Moon',
    waxing_crescent: 'Waxing Crescent',
    first_quarter: 'First Quarter',
    waxing_gibbous: 'Waxing Gibbous',
    full_moon: 'Full Moon',
    waning_gibbous: 'Waning Gibbous',
    last_quarter: 'Last Quarter',
    waning_crescent: 'Waning Crescent',
  },
};

const bn: TranslationStrings = {
  ...en,
  nav: {
    today: 'আজ',
    zodiac: 'রাশি',
    almanac: 'পঞ্জিকা',
    box: 'আমার বাক্স',
    create: 'তৈরি',
    settings: 'সেটিংস',
  },
  today: {
    ...en.today,
    inlineInvitation: 'আজ কী বলতে ইচ্ছে করছে?',
    writeLetterCta: 'চিঠি লিখুন',
    resumeDraftCta: 'খসড়া থেকে লিখুন',
    lockedArchiveNote: 'আপনার বাক্স লক করা আছে',
    secondaryPrompt: 'কোন কথাটা বলে ফেলতে ইচ্ছে করে?',
    useThisPrompt: 'এই সূত্রটি নিন',
    emptyDateState: 'এই তারিখে কোনো লেখা বা চেক-ইন নেই।',
    checkInLink: 'কেমন লাগছে এখন?',
  },
  welcome: {
    headline: 'না পাঠানো চিঠির জন্য একটি শান্ত জায়গা।',
    startWriting: 'লেখা শুরু করুন',
    replayOpening: 'শুরুর দৃশ্য দেখুন',
  },
  checkIn: {
    question: 'কেমন লাগছে এখন?',
    choices: ['ভারী', 'অস্থির', 'শান্ত', 'কোমল', 'স্থির'],
    save: 'সংরক্ষণ করুন',
    back: 'পেছনে',
    close: 'বন্ধ করুন',
    notePlaceholder: 'চাইলে নিজের ভাষায় একটি ছোট নোট লিখুন',
  },
  createSheet: {
    title: 'তৈরি করুন',
    writeLetterTitle: 'চিঠি লিখুন',
    writeLetterDesc: 'যাকে লিখছেন তাকে বেছে নিয়ে কাগজে মনের কথা রাখুন।',
    makeCardTitle: 'ফিলিং কার্ড বানান',
    makeCardDesc: '১০৮০ × ১৯২০ ছবির কার্ড দেখুন ও শেয়ার করুন।',
    close: 'বন্ধ করুন',
  },
  editor: {
    ...en.editor,
    title: 'চিঠি',
    back: 'ফিরুন',
    toLabel: 'প্রাপক',
    needStartingLine: 'শুরুর লাইন দরকার?',
    savedLocally: 'এই ডিভাইসে সংরক্ষিত',
    saving: 'সংরক্ষণ হচ্ছে…',
    backedUp: 'ব্যাকআপ হয়েছে',
    saveErrorMessage: 'এই খসড়াটি সংরক্ষণ করা যায়নি।',
    tryAgain: 'আবার চেষ্টা করুন',
    copyText: 'লেখা কপি করুন',
    sealAction: 'চিঠি সিল করুন',
    sealedAnnounce: 'চিঠি সিল হয়েছে',
    keepInBox: 'আমার বাক্সে রাখুন',
    shareEllipsis: 'শেয়ার…',
    letItGo: 'ছেড়ে দিন…',
    releaseKeepLetter: 'চিঠি রাখুন',
    releaseRemoveLetter: 'চিঠি সরান',
  },
  cards: {
    ...en.cards,
    title: 'ফিলিং কার্ড',
    shareEllipsis: 'শেয়ার…',
    saveImage: 'ছবি সেভ করুন',
    saveToBox: 'বাক্সে রাখুন',
    downloadStarted: 'ডাউনলোড শুরু হয়েছে।',
    tools: { paper: 'কাগজ', type: 'লেখা', motif: 'প্রতীক', details: 'বিবরণ' },
    done: 'সম্পন্ন',
  },
  zodiac: {
    ...en.zodiac,
    title: 'রাশি',
    writeFromPrompt: 'এই প্রশ্ন থেকে লিখুন',
    anotherSpark: 'আরেকটি সূত্র',
  },
  box: {
    ...en.box,
    title: 'আমার বাক্স',
    emptyTitle: 'আপনার বাক্স খালি',
    emptyBody: 'আপনার রাখা চিঠি ও ফিলিং কার্ডগুলো এই ডিভাইসে এনক্রিপ্টেড থাকবে।',
    tabs: { all: 'সব', letters: 'চিঠি', cards: 'কার্ড', favorites: 'প্রিয়' },
    unlockBtn: 'বাক্স খুলুন',
    lockNow: 'লক করুন',
  },
  settings: {
    ...en.settings,
    title: 'সেটিংস',
    paperTheme: 'কাগজ',
    inkTheme: 'কালি',
    systemTheme: 'সিস্টেম',
    soundtrackLabel: 'সঙ্গীত · কৃষ্ণ প্রেম',
    soundtrackShort: 'সংক্ষিপ্ত বাঁশি (১:৪৫)',
    soundtrackFull: 'সম্পূর্ণ গান (৬:০৬)',
    soundtrackPlaying: 'চলছে',
    soundtrackPlayBtn: 'সঙ্গীত চালান',
    soundtrackPauseBtn: 'সঙ্গীত থামান',
    findSupportBtn: 'মানবিক সহায়তা খুঁজুন',
  },
  recipients: {
    ex: 'প্রাক্তন',
    mother: 'মা',
    father: 'বাবা',
    friend: 'বন্ধু',
    lost: 'হারিয়ে ফেলা প্রিয়জন',
    pastSelf: 'অতীতের আমি',
    futureSelf: 'ভবিষ্যতের আমি',
    presentSelf: 'এই মুহূর্তের আমি',
    custom: 'অন্য কেউ',
  },
  moonPhases: {
    new_moon: 'অমাবস্যা',
    waxing_crescent: 'শুক্লা প্রতিপদ',
    first_quarter: 'শুক্লা অষ্টমী',
    waxing_gibbous: 'শুক্লপক্ষ',
    full_moon: 'পূর্ণিমা',
    waning_gibbous: 'কৃষ্ণপক্ষ',
    last_quarter: 'কৃষ্ণা অষ্টমী',
    waning_crescent: 'কৃষ্ণা চতুর্দশী',
  },
};

const hi: TranslationStrings = {
  ...en,
  nav: {
    today: 'आज',
    zodiac: 'राशि',
    almanac: 'पंचांग',
    box: 'मेरा बक्सा',
    create: 'लिखें',
    settings: 'सेटिंग्स',
  },
  today: {
    ...en.today,
    inlineInvitation: 'आज आप क्या कहना चाहेंगे?',
    writeLetterCta: 'पत्र लिखें',
    resumeDraftCta: 'ड्राफ़्ट जारी रखें',
    lockedArchiveNote: 'आपका बक्सा लॉक है',
    secondaryPrompt: 'काश आपने क्या कह दिया होता?',
    useThisPrompt: 'यह संकेत चुनें',
    emptyDateState: 'इस तारीख के लिए कोई चिट्ठी या चेक-इन नहीं है।',
    checkInLink: 'आप कैसा महसूस कर रहे हैं?',
  },
  welcome: {
    headline: 'अनकही चिट्ठियों के लिए एक शांत जगह।',
    startWriting: 'लिखना शुरू करें',
    replayOpening: 'शुरुआत दोबारा देखें',
  },
  checkIn: {
    question: 'आप कैसा महसूस कर रहे हैं?',
    choices: ['भारी', 'बेचैन', 'शांत', 'कोमल', 'स्थिर'],
    save: 'सहेजें',
    back: 'पीछे',
    close: 'बंद करें',
    notePlaceholder: 'चाहें तो अपने शब्दों में छोटा नोट जोड़ें',
  },
  createSheet: {
    title: 'बनाएं',
    writeLetterTitle: 'पत्र लिखें',
    writeLetterDesc: 'कागज़ चुनें, अपनी बात लिखें और सहेजें या मुक्त करें।',
    makeCardTitle: 'फ़ीलिंग कार्ड बनाएं',
    makeCardDesc: '1080 × 1920 कार्ड देखें और साझा करें।',
    close: 'बंद करें',
  },
  editor: {
    ...en.editor,
    title: 'पत्र',
    back: 'वापस',
    toLabel: 'प्रेषित',
    needStartingLine: 'शुरुआती पंक्ति चाहिए?',
    savedLocally: 'इस डिवाइस पर सहेजा गया',
    saving: 'सहेजा जा रहा है…',
    backedUp: 'बैकअप हो गया',
    saveErrorMessage: 'यह ड्राफ़्ट सहेजा नहीं जा सका।',
    tryAgain: 'फिर कोशिश करें',
    copyText: 'टेक्स्ट कॉपी करें',
    sealAction: 'चिट्ठी सील करें',
    keepInBox: 'मेरा बक्सा में रखें',
    shareEllipsis: 'साझा करें…',
    letItGo: 'मुक्त करें…',
  },
  cards: {
    ...en.cards,
    title: 'फ़ीलिंग कार्ड',
    shareEllipsis: 'साझा करें…',
    saveImage: 'इमेज सहेजें',
    downloadStarted: 'डाउनलोड शुरू हुआ।',
    tools: { paper: 'कागज़', type: 'अक्षर', motif: 'प्रतीक', details: 'विवरण' },
    done: 'हो गया',
  },
  box: {
    ...en.box,
    title: 'मेरा बक्सा',
    emptyTitle: 'आपका बक्सा खाली है',
    unlockBtn: 'बक्सा खोलें',
  },
  settings: {
    ...en.settings,
    title: 'सेटिंग्स',
    paperTheme: 'कागज़',
    inkTheme: 'स्याही',
    systemTheme: 'सिस्टम',
    soundtrackLabel: 'संगीत · कृष्ण प्रेम',
    soundtrackShort: 'छोटा बांसुरी कट (1:45)',
    soundtrackFull: 'पूरा गीत (6:06)',
    soundtrackPlaying: 'चल रहा है',
    soundtrackPlayBtn: 'संगीत चलाएं',
    soundtrackPauseBtn: 'संगीत रोकें',
    findSupportBtn: 'मानवीय सहायता पाएं',
  },
  recipients: {
    ex: 'एक्स',
    mother: 'माँ',
    father: 'पापा',
    friend: 'दोस्त',
    lost: 'जिन्हें खो दिया',
    pastSelf: 'पुराना मैं',
    futureSelf: 'भविष्य का मैं',
    presentSelf: 'अभी का मैं',
    custom: 'अन्य',
  },
  moonPhases: {
    new_moon: 'अमावस्या',
    waxing_crescent: 'शुक्ल पक्ष',
    first_quarter: 'शुक्ल अष्टमी',
    waxing_gibbous: 'बढ़ता चाँद',
    full_moon: 'पूर्णिमा',
    waning_gibbous: 'कृष्ण पक्ष',
    last_quarter: 'कृष्ण अष्टमी',
    waning_crescent: 'घटता चाँद',
  },
};

const hinglish: TranslationStrings = {
  ...en,
  nav: {
    today: 'Aaj',
    zodiac: 'Zodiac',
    almanac: 'Almanac',
    box: 'My Box',
    create: 'Likho',
    settings: 'Settings',
  },
  today: {
    ...en.today,
    inlineInvitation: 'Aaj kya kehna chahte ho?',
    writeLetterCta: 'Letter likhein',
    resumeDraftCta: 'Draft continue karein',
    lockedArchiveNote: 'Aapka box locked hai',
    secondaryPrompt: 'Kaash kya bol diya hota?',
    useThisPrompt: 'Yeh prompt lein',
    emptyDateState: 'Is date par koi entry ya check-in nahi hai.',
    checkInLink: 'Kaisa feel ho raha hai?',
  },
  recipients: {
    ex: 'Ex',
    mother: 'Ma',
    father: 'Baba',
    friend: 'Dost',
    lost: 'Kisi ko khoya',
    pastSelf: 'Past me',
    futureSelf: 'Future me',
    presentSelf: 'Abhi ka main',
    custom: 'Custom',
  },
};

const DICTS: Record<AppLanguage, TranslationStrings> = { en, bn, hi, hinglish };

export function t(lang: AppLanguage): TranslationStrings {
  return DICTS[lang] ?? en;
}
