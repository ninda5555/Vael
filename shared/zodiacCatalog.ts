import type { AppLanguage, SignId } from './types.ts';

export type PromptTheme =
  | 'startingAgain'
  | 'comfort'
  | 'curiosity'
  | 'gratitude'
  | 'creativity'
  | 'rest'
  | 'boundaries'
  | 'friendship';

export interface SignPromptItem {
  id: string;
  theme: PromptTheme;
  spark: Record<AppLanguage, string>;
  action: Record<AppLanguage, string>;
}

export interface ZodiacSignDefinition {
  id: SignId;
  glyph: string;
  westernName: Record<AppLanguage, string>;
  rashiName: Record<AppLanguage, string>;
  element: Record<AppLanguage, string>;
  modality: Record<AppLanguage, string>;
  vedicRuler: Record<AppLanguage, string>;
  artDirection: string;
  paperBg: string;
  paperInk: string;
  accentColor: string;
  motif: 'match' | 'clay' | 'notes' | 'rain' | 'stage' | 'leaf' | 'scales' | 'drop' | 'trail' | 'steps' | 'ripples' | 'fish';
  prompts: SignPromptItem[];
}

export const ZODIAC_SIGNS: ZodiacSignDefinition[] = [
  {
    id: 'aries',
    glyph: '♈',
    westernName: { en: 'Aries', bn: 'মেষ (Aries)', hi: 'मेष (Aries)', hinglish: 'Aries' },
    rashiName: { en: 'Mesha', bn: 'মেষ', hi: 'मेष', hinglish: 'Mesha' },
    element: { en: 'Fire', bn: 'অগ্নি', hi: 'अग्नि', hinglish: 'Fire' },
    modality: { en: 'Cardinal', bn: 'চর', hi: 'चर', hinglish: 'Cardinal' },
    vedicRuler: { en: 'Mars', bn: 'মঙ্গল', hi: 'मंगल', hinglish: 'Mars (Mangal)' },
    artDirection: 'A vermilion match flaring against charcoal',
    paperBg: '#23161B',
    paperInk: '#F7EFE6',
    accentColor: '#E05A47',
    motif: 'match',
    prompts: [
      {
        id: 'aries-1',
        theme: 'startingAgain',
        spark: {
          en: 'What would you begin if the first attempt could be small?',
          bn: 'প্রথম চেষ্টাটা খুব ছোট হলেও ক্ষতি নেই জানলে আজ কী শুরু করতে?',
          hi: 'अगर पहली कोशिश बहुत छोटी हो सकती, तो आज आप क्या शुरू करते?',
          hinglish: 'Agar pehli koshish chhoti ho sakti, toh aaj kya shuru karte?',
        },
        action: {
          en: 'Write the first sentence of something you have delayed.',
          bn: 'অনেক দিন ধরে পিছিয়ে রাখা কোনো কাজের প্রথম বাক্যটা লেখো।',
          hi: 'जिस बात को आप टाल रहे थे, उसका पहला वाक्य लिखें।',
          hinglish: 'Jo baat tum taal rahe the, uska pehla sentence likho.',
        },
      },
      {
        id: 'aries-2',
        theme: 'friendship',
        spark: {
          en: 'Which friend brings out your honest courage without making you perform?',
          bn: 'কোন বন্ধু কোনো ভান ছাড়াই তোমার সৎ সাহসটাকে জাগিয়ে তোলে?',
          hi: 'कौन-सा दोस्त बिना दिखावे के आपका सच्चा साहस जगाता है?',
          hinglish: 'Kaun-sa dost bina show-off ke tumhara sachcha courage jagata hai?',
        },
        action: {
          en: 'Write two lines acknowledging how they steady you.',
          bn: 'তারা কীভাবে তোমাকে স্থির রাখে, সে বিষয়ে দুটি লাইন লেখো।',
          hi: 'वे आपको कैसे संभालते हैं, इस पर दो पंक्तियाँ लिखें।',
          hinglish: 'Woh tumhe kaise steady rakhte hain, uspe do lines likho.',
        },
      },
      {
        id: 'aries-3',
        theme: 'creativity',
        spark: {
          en: 'Where does impatience show you what you actually care about?',
          bn: 'তোমার অস্থিরতা কোন জায়গায় দেখিয়ে দেয় তুমি আসলেই কী চাও?',
          hi: 'आपकी बेचैनी कहाँ दिखाती है कि आप असल में किस बात की परवाह करते हैं?',
          hinglish: 'Tumhari bechaini kahan dikhati hai ki tumhe sach mein kya matter karta hai?',
        },
        action: {
          en: 'Sketch a rough 30-second note with zero polish.',
          bn: 'কোনো ঘষামাজা ছাড়াই ৩০ সেকেন্ডের একটি খসড়া নোট লেখো।',
          hi: 'बिना सँवारे 30 सेकंड का एक कच्चा नोट लिखें।',
          hinglish: 'Bina polish kiye 30 second ka ek rough note likho.',
        },
      },
      {
        id: 'aries-4',
        theme: 'rest',
        spark: {
          en: 'What battle can you step away from tonight without losing yourself?',
          bn: 'আজ রাতে কোন লড়াইটা ছেড়ে দিলে তোমার নিজের কিছু কমবে না?',
          hi: 'आज रात आप किस लड़ाई से बिना खुद को खोए पीछे हट सकते हैं?',
          hinglish: 'Aaj raat kis ladai se bina haare peeche hat sakte ho?',
        },
        action: {
          en: 'Name one task that can wait until morning.',
          bn: 'একটি কাজের নাম লেখো যা সকাল পর্যন্ত অপেক্ষা করতে পারে।',
          hi: 'एक ऐसे काम का नाम लिखें जो सुबह तक इंतज़ार कर सकता है।',
          hinglish: 'Ek aise kaam ka naam likho jo subah tak wait kar sakta hai.',
        },
      },
      {
        id: 'aries-5',
        theme: 'boundaries',
        spark: {
          en: 'Where did you say yes too fast when your body meant pause?',
          bn: 'শরীর একটু থামতে চাইলেও কোথায় তুমি খুব তাড়াতাড়ি হ্যাঁ বলে ফেলেছ?',
          hi: 'कहाँ आपने बहुत जल्दी हाँ कह दिया, जबकि आपका मन रुकना चाहता था?',
          hinglish: 'Kahan tumne jaldi haan bol diya jabki mann rukna chahta tha?',
        },
        action: {
          en: 'Draft a gentle, clear "not tonight" line for yourself.',
          bn: 'নিজের জন্য একটি নরম কিন্তু স্পষ্ট "আজ রাতে নয়" লাইন লেখো।',
          hi: 'अपने लिए एक नरम लेकिन साफ़ "आज रात नहीं" वाक्य लिखें।',
          hinglish: 'Apne liye ek soft par clear "aaj raat nahi" line likho.',
        },
      },
      {
        id: 'aries-6',
        theme: 'gratitude',
        spark: {
          en: 'What risk from last year quietly protected your peace today?',
          bn: 'গত বছরের কোন সাহসী সিদ্ধান্ত আজ তোমার শান্তি রক্ষা করছে?',
          hi: 'पिछले साल के किस जोखिम ने आज आपकी शांति बचाई है?',
          hinglish: 'Pichhle saal ke kis risk ne aaj tumhara sukoon bachaya hai?',
        },
        action: {
          en: 'Write a short thank-you to your braver past self.',
          bn: 'তোমার সাহসী অতীতের আমিকে একটি ছোট ধন্যবাদ লেখো।',
          hi: 'अपने साहसी पुराने रूप को एक छोटा शुक्रिया लिखें।',
          hinglish: 'Apne brave past self ko ek chhota thank you likho.',
        },
      },
      {
        id: 'aries-7',
        theme: 'curiosity',
        spark: {
          en: 'If you dropped the fear of looking like a beginner, what would you ask?',
          bn: 'নতুনদের মতো দেখানোর ভয় না থাকলে আজ কী প্রশ্ন করতে?',
          hi: 'अगर नौसिखिया दिखने का डर न हो, तो आप क्या पूछेंगे?',
          hinglish: 'Agar beginner lagne ka dar na ho, toh aaj kya sawal poochoge?',
        },
        action: {
          en: 'Write three unguarded questions on a fresh line.',
          bn: 'নতুন লাইনে তিনটি খোলামেলা প্রশ্ন লেখো।',
          hi: 'नई पंक्ति में तीन बेझिझक सवाल लिखें।',
          hinglish: 'Nayi line mein teen bina filter wale sawal likho.',
        },
      },
    ],
  },
  {
    id: 'taurus',
    glyph: '♉',
    westernName: { en: 'Taurus', bn: 'বৃষ (Taurus)', hi: 'वृषभ (Taurus)', hinglish: 'Taurus' },
    rashiName: { en: 'Vrishabha', bn: 'বৃষ', hi: 'वृषभ', hinglish: 'Vrishabha' },
    element: { en: 'Earth', bn: 'পৃথিবী', hi: 'पृथ्वी', hinglish: 'Earth' },
    modality: { en: 'Fixed', bn: 'স্থির', hi: 'स्थिर', hinglish: 'Fixed' },
    vedicRuler: { en: 'Venus', bn: 'শুক্র', hi: 'शुक्र', hinglish: 'Venus (Shukra)' },
    artDirection: 'Terracotta rings in wet clay',
    paperBg: '#F4EAE0',
    paperInk: '#251B16',
    accentColor: '#A64B2A',
    motif: 'clay',
    prompts: [
      {
        id: 'taurus-1',
        theme: 'comfort',
        spark: {
          en: 'Which ordinary comfort would you miss tomorrow?',
          bn: 'কোন সাধারণ আরামটা কাল না থাকলে খুব মনে পড়বে?',
          hi: 'कौन-सा साधारण सुकून कल न हो, तो आपको बहुत याद आएगा?',
          hinglish: 'Kaun-sa simple comfort kal na ho toh bahut miss karoge?',
        },
        action: {
          en: 'Describe one thing near you by touch, smell, and color.',
          bn: 'পাশে থাকা একটি জিনিসকে স্পর্শ, গন্ধ আর রঙ দিয়ে বর্ণনা করো।',
          hi: 'अपने पास की एक चीज़ को स्पर्श, गंध और रंग से लिखें।',
          hinglish: 'Paas rakhi ek cheez ko touch, smell aur color se describe karo.',
        },
      },
      {
        id: 'taurus-2',
        theme: 'friendship',
        spark: {
          en: 'Who makes silence feel comfortable instead of awkward?',
          bn: 'কার পাশে বসে চুপ করে থাকলেও কোনো আড়ষ্টতা লাগে না?',
          hi: 'किसके साथ चुप रहना भी अजीब नहीं, बल्कि सुकून भरा लगता है?',
          hinglish: 'Kiske saath chup rehna bhi awkward nahi, comfortable lagta hai?',
        },
        action: {
          en: 'Recall one quiet meal or walk you shared.',
          bn: 'একসাথে কাটানো একটি শান্ত হাঁটা বা খাওয়ার কথা মনে করো।',
          hi: 'साथ बिताए एक शांत खाने या टहलने की याद लिखें।',
          hinglish: 'Saath bitaye ek shaant chai ya walk ki yaad likho.',
        },
      },
      {
        id: 'taurus-3',
        theme: 'creativity',
        spark: {
          en: 'What grows slowly in your life right now that still deserves patience?',
          bn: 'তোমার জীবনে এখন কোন জিনিসটা ধীরে বাড়ছে তবুও ধৈর্যের যোগ্য?',
          hi: 'आपके जीवन में अभी क्या धीरे-धीरे बढ़ रहा है जो धैर्य के लायक है?',
          hinglish: 'Tumhari life mein abhi kya dheere grow ho raha hai jo patience deserve karta hai?',
        },
        action: {
          en: 'Write one grounded paragraph without rushing the ending.',
          bn: 'শেষ করার তাড়া ছাড়াই একটি স্থির অনুচ্ছেদ লেখো।',
          hi: 'अंत की जल्दी किए बिना एक ठहरा हुआ पैराग्राफ़ लिखें।',
          hinglish: 'End karne ki jaldi ke bina ek grounded paragraph likho.',
        },
      },
      {
        id: 'taurus-4',
        theme: 'rest',
        spark: {
          en: 'What physical tension is your jaw or shoulders holding tonight?',
          bn: 'আজ রাতে তোমার কাঁধ বা চোয়ালে কোন চাপা ক্লান্তি জমে আছে?',
          hi: 'आज रात आपके कंधों या मन में कौन-सी अनकही थकान रुकी है?',
          hinglish: 'Aaj raat tumhare shoulders mein kaun-si chhupi thakaan jama hai?',
        },
        action: {
          en: 'Drop your shoulders and write three slow sensory words.',
          bn: 'কাঁধ নামিয়ে শান্ত হয়ে তিনটি অনুভূতির শব্দ লেখো।',
          hi: 'कंधे ढीले छोड़ें और तीन शांत संवेदी शब्द लिखें।',
          hinglish: 'Shoulders relax karke teen slow sensory words likho.',
        },
      },
      {
        id: 'taurus-5',
        theme: 'boundaries',
        spark: {
          en: 'Which routine protects your calm even when people call it stubborn?',
          bn: 'কোন অভ্যাসটা তোমার শান্তি বাঁচিয়ে রাখে, লোকে জেদ বললেও?',
          hi: 'कौन-सी आदत आपकी शांति बचाती है, भले कोई उसे ज़िद कहे?',
          hinglish: 'Kaun-si aadat tumhara sukoon bachati hai, chahe koi usse zidd bole?',
        },
        action: {
          en: 'Write down one boundary you want to keep unhurried.',
          bn: 'একটি সীমারেখা লেখো যা তুমি তাড়াহুড়ো না করে বজায় রাখতে চাও।',
          hi: 'एक ऐसी सीमा लिखें जिसे आप बिना हड़बड़ी के निभाना चाहते हैं।',
          hinglish: 'Ek boundary likho jo tum bina rush kiye rakhna chahte ho.',
        },
      },
      {
        id: 'taurus-6',
        theme: 'gratitude',
        spark: {
          en: 'Which small object on your desk has stayed with you through big changes?',
          bn: 'টেবিলের কোন ছোট্ট জিনিসটা অনেক পরিবর্তনের মাঝেও তোমার সাথে রয়ে গেছে?',
          hi: 'आपकी मेज़ की कौन-सी छोटी चीज़ बड़े बदलावों में भी साथ रही?',
          hinglish: 'Tumhari table ki kaun-si chhoti cheez bade changes mein bhi saath rahi?',
        },
        action: {
          en: 'Note its story in four gentle lines.',
          bn: 'তার গল্পটা চারটি নরম লাইনে লিখে রাখো।',
          hi: 'उसकी कहानी चार कोमल पंक्तियों में लिखें।',
          hinglish: 'Uski story chaar soft lines mein likho.',
        },
      },
      {
        id: 'taurus-7',
        theme: 'curiosity',
        spark: {
          en: 'What texture or song feels like your real mood right now?',
          bn: 'কোন সুর বা স্পর্শ ঠিক এই মুহূর্তের মনের অবস্থার সাথে মেলে?',
          hi: 'कौन-सा सुर या एहसास अभी आपके असली मन से मेल खाता है?',
          hinglish: 'Kaun-sa gaana ya texture abhi tumhare real mood se match karta hai?',
        },
        action: {
          en: 'Start a Feeling Card with just five honest words.',
          bn: 'মাত্র পাঁচটি সৎ শব্দ দিয়ে একটি ফিলিং কার্ড শুরু করো।',
          hi: 'सिर्फ़ पाँच सच्चे शब्दों से एक फ़ीलिंग कार्ड शुरू करें।',
          hinglish: 'Bas paanch sachche words se ek Feeling Card start karo.',
        },
      },
    ],
  },
  {
    id: 'gemini',
    glyph: '♊',
    westernName: { en: 'Gemini', bn: 'মিথুন (Gemini)', hi: 'मिथुन (Gemini)', hinglish: 'Gemini' },
    rashiName: { en: 'Mithuna', bn: 'মিথুন', hi: 'मिथुन', hinglish: 'Mithuna' },
    element: { en: 'Air', bn: 'বায়ু', hi: 'वायु', hinglish: 'Air' },
    modality: { en: 'Mutable', bn: 'দ্ব্যাত্মক', hi: 'द्विस्वभाव', hinglish: 'Mutable' },
    vedicRuler: { en: 'Mercury', bn: 'বুধ', hi: 'बुध', hinglish: 'Mercury (Budh)' },
    artDirection: 'Two folded notes in mint ink',
    paperBg: '#EBF3EE',
    paperInk: '#122620',
    accentColor: '#1E6F5C',
    motif: 'notes',
    prompts: [
      {
        id: 'gemini-1',
        theme: 'curiosity',
        spark: {
          en: 'What are the two honest sides of this thought?',
          bn: 'এই ভাবনাটার দুটি সৎ দিক কী কী?',
          hi: 'इस विचार के दो सच्चे पहलू क्या हैं?',
          hinglish: 'Is khayal ke do sachche sides kya hain?',
        },
        action: {
          en: 'Write a line for each side and give them both room.',
          bn: 'প্রতিটি দিকের জন্য একটি করে লাইন লেখো এবং দুটোকেই জায়গা দাও।',
          hi: 'हर पहलू के लिए एक पंक्ति लिखें और दोनों को जगह दें।',
          hinglish: 'Dono sides ke liye ek-ek line likho aur dono ko jagah do.',
        },
      },
      {
        id: 'gemini-2',
        theme: 'friendship',
        spark: {
          en: 'What message did you draft in your head for a friend and never hit send on?',
          bn: 'বন্ধুর জন্য মনে মনে কোন মেসেজটা লিখেও আর পাঠানো হয়নি?',
          hi: 'दोस्त के लिए मन में कौन-सा संदेश सोचा और कभी भेजा नहीं?',
          hinglish: 'Dost ke liye mann mein kaun-sa message likha par send nahi kiya?',
        },
        action: {
          en: 'Put it safely in an unsent letter here.',
          bn: 'এখানে একটি না পাঠানো চিঠিতে নিরাপদে লিখে রাখো।',
          hi: 'यहाँ एक अनसेंट चिट्ठी में सुरक्षित लिख दें।',
          hinglish: 'Yahan ek unsent letter mein safely likh do.',
        },
      },
      {
        id: 'gemini-3',
        theme: 'creativity',
        spark: {
          en: 'If tonight had two voices—one anxious, one playful—what would they tell each other?',
          bn: 'আজ রাতের দুটি কণ্ঠ—একটি চিন্তিত, একটি চঞ্চল—একে অন্যকে কী বলত?',
          hi: 'अगर आज रात दो आवाज़ें हों—एक चिंतित, एक चंचल—तो वे क्या कहेंगी?',
          hinglish: 'Agar aaj raat do aawazein hon—ek worried, ek playful—toh woh kya kahengi?',
        },
        action: {
          en: 'Write a four-line dialogue between them.',
          bn: 'তাদের দুজনের মধ্যে চার লাইনের একটি কথোপকথন লেখো।',
          hi: 'उनके बीच चार पंक्तियों का संवाद लिखें।',
          hinglish: 'Unke beech chaar line ka ek dialogue likho.',
        },
      },
      {
        id: 'gemini-4',
        theme: 'rest',
        spark: {
          en: 'Which open tab in your mind can close for the night?',
          bn: 'মনের ভেতর খোলা থাকা কোন চিন্তাটা আজ রাতের মতো বন্ধ করা যায়?',
          hi: 'मन में खुला कौन-सा विचार आज रात के लिए बंद किया जा सकता है?',
          hinglish: 'Dimag mein khula kaun-sa tab aaj raat ke liye band kar sakte ho?',
        },
        action: {
          en: 'Park the worry in one sentence so your mind can sleep.',
          bn: 'চিন্তাটাকে এক বাক্যে এখানে রেখে মনকে একটু বিশ্রাম দাও।',
          hi: 'चिंता को एक वाक्य में यहाँ रखकर मन को आराम दें।',
          hinglish: 'Tension ko ek sentence mein yahan park karke mind ko rest do.',
        },
      },
      {
        id: 'gemini-5',
        theme: 'boundaries',
        spark: {
          en: 'Where do you explain too much when a simple sentence would be enough?',
          bn: 'একটি সহজ কথায় কাজ হয়ে গেলেও কোথায় তুমি অতিরিক্ত ব্যাখ্যা দাও?',
          hi: 'एक साधारण बात काफ़ी होने पर भी आप कहाँ ज़्यादा सफाई देते हैं?',
          hinglish: 'Simple baat kaafi hone par bhi kahan zyada explain karte ho?',
        },
        action: {
          en: 'Rewrite an explanation down to twelve clear words.',
          bn: 'একটি বড় ব্যাখ্যাকে মাত্র বারোটি স্পষ্ট শব্দে নামিয়ে আনো।',
          hi: 'एक लंबी सफाई को बारह साफ़ शब्दों में समेटें।',
          hinglish: 'Ek lambi explanation ko bas 12 clear words mein likho.',
        },
      },
      {
        id: 'gemini-6',
        theme: 'gratitude',
        spark: {
          en: 'What overheard line or book quote stayed warm in your pocket this week?',
          bn: 'এই সপ্তাহে শোনা কোন কথা বা বইয়ের লাইন মনের কোণে জমে আছে?',
          hi: 'इस हफ़्ते सुनी कौन-सी बात या किताब की पंक्ति मन में बसी रही?',
          hinglish: 'Is hafte suni kaun-si line ya book quote mann mein reh gayi?',
        },
        action: {
          en: 'Save it alongside why it mattered to you.',
          bn: 'কেন লাইনটা ভালো লাগল তা সহ লিখে রাখো।',
          hi: 'यह क्यों अच्छी लगी, इसके साथ इसे सहेजें।',
          hinglish: 'Woh kyun achhi lagi, uske saath note kar lo.',
        },
      },
      {
        id: 'gemini-7',
        theme: 'startingAgain',
        spark: {
          en: 'What small question feels lighter than trying to solve everything?',
          bn: 'সব সমস্যার সমাধান খোঁজার চেয়ে কোন ছোট প্রশ্নটা আজ হালকা লাগে?',
          hi: 'सब कुछ सुलझाने के बजाय कौन-सा छोटा सवाल आज हल्का लगता है?',
          hinglish: 'Sab kuch solve karne ke bajay kaun-sa chhota sawal aaj halka lagta hai?',
        },
        action: {
          en: 'Begin a letter with "I am wondering…"',
          bn: '"আমি ভাবছি…" দিয়ে একটি চিঠি শুরু করো।',
          hi: '"मैं सोच रहा हूँ…" से एक चिट्ठी शुरू करें।',
          hinglish: '"Main soch raha hoon…" se ek letter start karo.',
        },
      },
    ],
  },
  {
    id: 'cancer',
    glyph: '♋',
    westernName: { en: 'Cancer', bn: 'কর্কট (Cancer)', hi: 'कर्क (Cancer)', hinglish: 'Cancer' },
    rashiName: { en: 'Karka', bn: 'কর্কট', hi: 'कर्क', hinglish: 'Karka' },
    element: { en: 'Water', bn: 'জল', hi: 'जल', hinglish: 'Water' },
    modality: { en: 'Cardinal', bn: 'চর', hi: 'चर', hinglish: 'Cardinal' },
    vedicRuler: { en: 'Moon', bn: 'চন্দ্র', hi: 'चंद्र', hinglish: 'Moon (Chandra)' },
    artDirection: 'Rain collecting on a blue window',
    paperBg: '#E6EEF5',
    paperInk: '#142236',
    accentColor: '#2B5B84',
    motif: 'rain',
    prompts: [
      {
        id: 'cancer-1',
        theme: 'gratitude',
        spark: {
          en: 'Who or what makes a place feel like home?',
          bn: 'কে বা কী একটি জায়গাকে ঘরের মতো অনুভূতি দেয়?',
          hi: 'कौन या क्या किसी जगह को घर जैसा महसूस कराता है?',
          hinglish: 'Kaun ya kya kisi jagah ko ghar jaisa feel karata hai?',
        },
        action: {
          en: 'Start a private thank-you with one specific memory.',
          bn: 'একটি নির্দিষ্ট স্মৃতি দিয়ে মনে মনে ধন্যবাদ লেখা শুরু করো।',
          hi: 'एक ख़ास याद के साथ निजी धन्यवाद लिखना शुरू करें।',
          hinglish: 'Ek specific memory ke saath private thank-you likhna shuru karo.',
        },
      },
      {
        id: 'cancer-2',
        theme: 'friendship',
        spark: {
          en: 'Who notices when your voice drops slightly on a phone call?',
          bn: 'ফোনে কথা বলার সময় তোমার গলার স্বর একটু নরম হয়ে গেলে কে ঠিক ধরে ফেলে?',
          hi: 'फ़ोन पर आपकी आवाज़ हल्की होते ही कौन भाँप लेता है?',
          hinglish: 'Phone call par tumhari aawaz dheemi hote hi kaun samajh jata hai?',
        },
        action: {
          en: 'Write what you wish you could tell them tonight.',
          bn: 'আজ রাতে তাদের কী বলতে ইচ্ছে করছে, তা লেখো।',
          hi: 'आज रात आप उनसे क्या कहना चाहते हैं, वह लिखें।',
          hinglish: 'Aaj raat unse kya kehne ka mann hai, woh likho.',
        },
      },
      {
        id: 'cancer-3',
        theme: 'creativity',
        spark: {
          en: 'What childhood monsoon evening or room comes back when it rains?',
          bn: 'বৃষ্টি নামলে ছোটবেলার কোন সন্ধ্যা বা ঘরের কথা মনে পড়ে যায়?',
          hi: 'बारिश होने पर बचपन की कौन-सी शाम या कमरा याद आ जाता है?',
          hinglish: 'Baarish hone par bachpan ki kaun-si shaam ya kamra yaad aata hai?',
        },
        action: {
          en: 'Capture three details of that evening.',
          bn: 'সেই সন্ধ্যার তিনটি খুঁটিনাটি ধরে রাখো।',
          hi: 'उस शाम की तीन छोटी बातें लिख लें।',
          hinglish: 'Us shaam ki teen chhoti details likho.',
        },
      },
      {
        id: 'cancer-4',
        theme: 'rest',
        spark: {
          en: 'Whose feelings have you been carrying that were never yours to hold?',
          bn: 'অন্য কার মন খারাপ তুমি নিজের কাঁধে বয়ে বেড়াচ্ছ?',
          hi: 'आप किसकी भावनाओं का बोझ उठा रहे हैं जो आपका नहीं था?',
          hinglish: 'Tum kiski feelings ka bojh utha rahe ho jo tumhara tha hi nahi?',
        },
        action: {
          en: 'Write one line returning responsibility gently.',
          bn: 'নরমভাবে সেই ভার ফিরিয়ে দেওয়ার একটি লাইন লেখো।',
          hi: 'नरमी से वह बोझ लौटाने की एक पंक्ति लिखें।',
          hinglish: 'Pyaar se woh bojh wapas dene ki ek line likho.',
        },
      },
      {
        id: 'cancer-5',
        theme: 'boundaries',
        spark: {
          en: 'What kind of gentleness do you need before you can show up for others?',
          bn: 'অন্যদের পাশে দাঁড়ানোর আগে নিজের জন্য কতটুকু কোমলতা দরকার?',
          hi: 'दूसरों के साथ खड़े होने से पहले आपको खुद के लिए कितनी नरमी चाहिए?',
          hinglish: 'Doosron ke liye khade hone se pehle tumhe apne liye kitni softness chahiye?',
        },
        action: {
          en: 'Name one promise to protect your quiet hour.',
          bn: 'নিজের নিরিবিলি সময়টুকু বাঁচিয়ে রাখার একটি প্রতিশ্রুতি লেখো।',
          hi: 'अपने शांत समय को बचाने का एक वादा लिखें।',
          hinglish: 'Apne shaant time ko bachane ka ek promise likho.',
        },
      },
      {
        id: 'cancer-6',
        theme: 'curiosity',
        spark: {
          en: 'If your nostalgia is asking for something today—not the past, what is it?',
          bn: 'পুরোনো স্মৃতি যদি অতীত নয়, আজকের কোনো কিছুর ইঙ্গিত দেয়—তা কী?',
          hi: 'अगर पुरानी यादें अतीत नहीं, बल्कि आज की कोई ज़रूरत दिखा रही हैं, तो वह क्या है?',
          hinglish: 'Agar nostalgia past nahi, aaj ki kisi need ki taraf ishara kar raha hai, toh woh kya hai?',
        },
        action: {
          en: 'Write "What I actually miss is…"',
          bn: '"আমি আসলে যেটা মিস করছি তা হলো…" লিখে শুরু করো।',
          hi: '"मुझे असल में जिसकी कमी लगती है वह है…" लिखें।',
          hinglish: '"Mujhe sach mein jiski kami lagti hai woh hai…" likho.',
        },
      },
      {
        id: 'cancer-7',
        theme: 'startingAgain',
        spark: {
          en: 'What small ritual helps you arrive back in your own room?',
          bn: 'কোন ছোট অভ্যাসটা তোমাকে নিজের ঘরের শান্তিতে ফিরিয়ে আনে?',
          hi: 'कौन-सा छोटा रिवाज़ आपको अपने कमरे के सुकून में लौटाता है?',
          hinglish: 'Kaun-si chhoti aadat tumhe apne room ke sukoon mein wapas laati hai?',
        },
        action: {
          en: 'Note one soothing step for tonight.',
          bn: 'আজ রাতের জন্য একটি শান্ত পদক্ষেপ লিখে রাখো।',
          hi: 'आज रात के लिए एक सुकून भरा कदम लिखें।',
          hinglish: 'Aaj raat ke liye ek soothing step note karo.',
        },
      },
    ],
  },
  {
    id: 'leo',
    glyph: '♌',
    westernName: { en: 'Leo', bn: 'সিংহ (Leo)', hi: 'सिंह (Leo)', hinglish: 'Leo' },
    rashiName: { en: 'Simha', bn: 'সিংহ', hi: 'सिंह', hinglish: 'Simha' },
    element: { en: 'Fire', bn: 'অগ্নি', hi: 'अग्नि', hinglish: 'Fire' },
    modality: { en: 'Fixed', bn: 'স্থির', hi: 'स्थिर', hinglish: 'Fixed' },
    vedicRuler: { en: 'Sun', bn: 'সূর্য', hi: 'सूर्य', hinglish: 'Sun (Surya)' },
    artDirection: 'Amber light on a small stage',
    paperBg: '#F9F0DF',
    paperInk: '#2B1D0E',
    accentColor: '#B87318',
    motif: 'stage',
    prompts: [
      {
        id: 'leo-1',
        theme: 'gratitude',
        spark: {
          en: 'When did you do something brave without an audience?',
          bn: 'কোনো দর্শক ছাড়াই কবে তুমি একটা সাহসী কাজ করেছিলে?',
          hi: 'बिना किसी दर्शक के आपने कब कोई साहसी काम किया था?',
          hinglish: 'Bina kisi audience ke tumne kab koi brave kaam kiya tha?',
        },
        action: {
          en: 'Give that moment a title you would keep.',
          bn: 'সেই মুহূর্তটার একটা নাম দাও যা তুমি যত্ন করে রাখবে।',
          hi: 'उस पल को एक ऐसा शीर्षक दें जिसे आप सहेज सकें।',
          hinglish: 'Us moment ko ek aisa title do jo tum sambhal kar rakho.',
        },
      },
      {
        id: 'leo-2',
        theme: 'friendship',
        spark: {
          en: 'Who celebrates your small wins as warmly as your big ones?',
          bn: 'বড় সাফল্যের মতোই তোমার ছোট্ট জয়গুলোতেও কে মন খুলে আনন্দ পায়?',
          hi: 'आपकी बड़ी जीत की तरह छोटी खुशियों का भी जश्न कौन मनाता है?',
          hinglish: 'Tumhari badi jeet ki tarah chhoti wins par bhi kaun dil se khush hota hai?',
        },
        action: {
          en: 'Write them a note they never asked for.',
          bn: 'তাদের জন্য একটি অপ্রত্যাশিত ধন্যবাদ নোট লেখো।',
          hi: 'उनके लिए एक अनकहा धन्यवाद नोट लिखें।',
          hinglish: 'Unke liye ek unsent appreciation note likho.',
        },
      },
      {
        id: 'leo-3',
        theme: 'creativity',
        spark: {
          en: 'What would you make if nobody ever scored or compared it?',
          bn: 'কেউ নম্বর দেবে না বা তুলনা করবে না জানলে আজ কী তৈরি করতে?',
          hi: 'अगर कोई इसे आंकेगा या तुलना नहीं करेगा, तो आप क्या बनाएंगे?',
          hinglish: 'Agar koi judge ya compare na kare, toh tum kya banaoge?',
        },
        action: {
          en: 'Write four joyful, unpolished lines.',
          bn: 'আনন্দ নিয়ে চারটি অগোছালো লাইন লেখো।',
          hi: 'बेफ़िक्र होकर चार खुशनुमा पंक्तियाँ लिखें।',
          hinglish: 'Bindaas chaar joyful lines likho.',
        },
      },
      {
        id: 'leo-4',
        theme: 'rest',
        spark: {
          en: 'Where are you tired of looking strong for everyone else?',
          bn: 'সবার সামনে শক্ত থাকার অভিনয় করতে করতে কোথায় আজ ক্লান্ত লাগছে?',
          hi: 'सबके सामने मज़बूत दिखते-दिखते आप कहाँ थक गए हैं?',
          hinglish: 'Sabke saamne strong dikhte-dikhte kahan thak gaye ho?',
        },
        action: {
          en: 'Let this page hold the tired truth.',
          bn: 'এই পাতায় ক্লান্ত সত্যটুকু নামিয়ে রাখো।',
          hi: 'इस पन्ने पर अपनी थकान का सच रख दें।',
          hinglish: 'Is page par apni thakaan ka sach rakh do.',
        },
      },
      {
        id: 'leo-5',
        theme: 'boundaries',
        spark: {
          en: 'Which room dims your warmth—and how can you step back kindly?',
          bn: 'কোন পরিবেশে তোমার উজ্জ্বলতা ম্লান হয়ে যায়, এবং ভদ্রভাবে কীভাবে সরে আসা যায়?',
          hi: 'कौन-सा माहौल आपकी गर्माहट कम करता है, और आप नरमी से कैसे हट सकते हैं?',
          hinglish: 'Kaun-si jagah tumhari warmth kam karti hai, aur pyaar se kaise door hat sakte ho?',
        },
        action: {
          en: 'Write one dignified sentence protecting your energy.',
          bn: 'নিজের মনকে বাঁচাতে একটি মর্যাদাপূর্ণ বাক্য লেখো।',
          hi: 'अपनी ऊर्जा बचाने के लिए एक गरिमामय वाक्य लिखें।',
          hinglish: 'Apni energy bachane ke liye ek dignified line likho.',
        },
      },
      {
        id: 'leo-6',
        theme: 'curiosity',
        spark: {
          en: 'What felt genuinely radiant to you this week, even for five minutes?',
          bn: 'এই সপ্তাহে মাত্র পাঁচ মিনিটের জন্য হলেও কোন জিনিসটা ভীষণ প্রাণবন্ত লেগেছে?',
          hi: 'इस हफ़्ते पाँच मिनट के लिए ही सही, क्या सचमुच चमकदार लगा?',
          hinglish: 'Is hafte bas paanch minute ke liye hi sahi, kya dil se bright laga?',
        },
        action: {
          en: 'Turn that five-minute spark into a Feeling Card.',
          bn: 'সেই পাঁচ মিনিটের আলোটা দিয়ে একটি ফিলিং কার্ড বানাও।',
          hi: 'उस पाँच मिनट की रोशनी से एक फ़ीलिंग कार्ड बनाएं।',
          hinglish: 'Us 5 minute ki spark se ek Feeling Card banao.',
        },
      },
      {
        id: 'leo-7',
        theme: 'startingAgain',
        spark: {
          en: 'If pride stepped aside for one minute, what would you ask for?',
          bn: 'অভিমান এক মিনিট পাশে সরিয়ে রাখলে আজ কী চাইতে?',
          hi: 'अगर अभिमान एक मिनट के लिए हट जाए, तो आप क्या मांगेंगे?',
          hinglish: 'Agar ego ek minute side hat jaye, toh aaj kya maangoge?',
        },
        action: {
          en: 'Write a letter starting with "Honestly, I hoped…"',
          bn: '"সত্যি বলতে, আমি আশা করেছিলাম…" দিয়ে শুরু করো।',
          hi: '"सच कहूँ तो मुझे उम्मीद थी…" से शुरू करें।',
          hinglish: '"Sach bolun toh mujhe umeed thi…" se start karo.',
        },
      },
    ],
  },
  {
    id: 'virgo',
    glyph: '♍',
    westernName: { en: 'Virgo', bn: 'কন্যা (Virgo)', hi: 'कन्या (Virgo)', hinglish: 'Virgo' },
    rashiName: { en: 'Kanya', bn: 'কন্যা', hi: 'कन्या', hinglish: 'Kanya' },
    element: { en: 'Earth', bn: 'পৃথিবী', hi: 'पृथ्वी', hinglish: 'Earth' },
    modality: { en: 'Mutable', bn: 'দ্ব্যাত্মক', hi: 'द्विस्वभाव', hinglish: 'Mutable' },
    vedicRuler: { en: 'Mercury', bn: 'বুধ', hi: 'बुध', hinglish: 'Mercury (Budh)' },
    artDirection: 'Olive ink beside a pressed leaf',
    paperBg: '#EEF2E8',
    paperInk: '#1D2418',
    accentColor: '#4A6332',
    motif: 'leaf',
    prompts: [
      {
        id: 'virgo-1',
        theme: 'curiosity',
        spark: {
          en: 'Which detail tells the real story of your day?',
          bn: 'কোন ছোট্ট খুঁটিনাটি আজকের দিনের আসল গল্পটা বলে দেয়?',
          hi: 'कौन-सी छोटी बारीकी आपके दिन की असली कहानी कहती है?',
          hinglish: 'Kaun-si chhoti detail tumhare din ki asli kahani kehti hai?',
        },
        action: {
          en: 'Write three observations. Circle the one you want to remember.',
          bn: 'তিনটি পর্যবেক্ষণ লেখো। যেটি মনে রাখতে চাও সেটি চিহ্নিত করো।',
          hi: 'तीन बारीक बातें लिखें। जिसे याद रखना है उसे चुनें।',
          hinglish: 'Teen observations likho. Jo yaad rakhna hai usse mark karo.',
        },
      },
      {
        id: 'virgo-2',
        theme: 'friendship',
        spark: {
          en: 'How do you show care through small practical gestures instead of speeches?',
          bn: 'বড় কথার বদলে কোন ছোট ছোট কাজের মাধ্যমে তুমি ভালোবাসা দেখাও?',
          hi: 'बड़े शब्दों के बजाय आप छोटे कामों से परवाह कैसे जताते हैं?',
          hinglish: 'Badi baaton ke bajay tum chhote actions se care kaise dikhate ho?',
        },
        action: {
          en: 'Notice one quiet act of care you offered or received.',
          bn: 'আজ করা বা পাওয়া একটি নীরব যত্নের কথা লেখো।',
          hi: 'आज की गई या मिली एक शांत परवाह को लिखें।',
          hinglish: 'Aaj ki ya mili ek quiet care ko note karo.',
        },
      },
      {
        id: 'virgo-3',
        theme: 'creativity',
        spark: {
          en: 'What draft have you been editing in your head before writing a single word?',
          bn: 'একটি শব্দও লেখার আগে মনে মনে কোন লেখাটা বারবার ঠিক করছ?',
          hi: 'एक भी शब्द लिखने से पहले आप मन में किस ड्राफ़्ट को सुधार रहे हैं?',
          hinglish: 'Ek word likhne se pehle dimag mein kaun-sa draft edit kar rahe ho?',
        },
        action: {
          en: 'Write two imperfect sentences on purpose.',
          bn: 'ইচ্ছে করেই দুটি অসম্পূর্ণ বা অগোছালো বাক্য লেখো।',
          hi: 'जानबूझकर दो अधूरे, सहज वाक्य लिखें।',
          hinglish: 'Jaan-boojh kar do imperfect sentences likho.',
        },
      },
      {
        id: 'virgo-4',
        theme: 'rest',
        spark: {
          en: 'What flaw did you magnify today that would soften in kinder light?',
          bn: 'কোন ছোট ত্রুটিটা আজ বড় করে দেখেছ যা একটু স্নেহের আলোয় মিলিয়ে যেত?',
          hi: 'आज आपने किस कमी को बड़ा मान लिया जो नरम रोशनी में छोटी दिखती?',
          hinglish: 'Aaj kis chhoti kami ko bada bana diya jo thode pyaar se halka lagta?',
        },
        action: {
          en: 'Write one forgiving sentence to yourself.',
          bn: 'নিজের উদ্দেশ্যে একটি ক্ষমাশীল বাক্য লেখো।',
          hi: 'अपने लिए एक माफ़ करने वाला वाक्य लिखें।',
          hinglish: 'Apne liye ek forgiving sentence likho.',
        },
      },
      {
        id: 'virgo-5',
        theme: 'boundaries',
        spark: {
          en: 'Where are you fixing someone else’s mess while neglecting your own quiet?',
          bn: 'অন্যের অগোছালো কাজ সামলাতে গিয়ে কোথায় নিজের শান্তিটা ভুলে যাচ্ছ?',
          hi: 'दूसरों की उलझन सुलझाते हुए आप अपनी शांति कहाँ भूल रहे हैं?',
          hinglish: 'Doosron ka mess fix karte hue apna sukoon kahan bhool rahe ho?',
        },
        action: {
          en: 'List one thing that is not your responsibility tonight.',
          bn: 'আজ রাতে তোমার দায়িত্ব নয়—এমন একটি বিষয় লেখো।',
          hi: 'एक ऐसी बात लिखें जो आज रात आपकी ज़िम्मेदारी नहीं है।',
          hinglish: 'Ek cheez likho jo aaj raat tumhari responsibility nahi hai.',
        },
      },
      {
        id: 'virgo-6',
        theme: 'gratitude',
        spark: {
          en: 'Which ordinary system—a kettle, a notebook, a morning bus—held your week together?',
          bn: 'চায়ের কাপ, খাতা, বা সকালের বাস—কোন ছোট অভ্যাসটা সপ্তাহটা সামলে রেখেছে?',
          hi: 'कौन-सी साधारण चीज़—चाय, डायरी, या सुबह की सैर—ने आपका हफ़्ता संभाला?',
          hinglish: 'Kaun-si roz ki cheez—chai, diary ya morning walk—ne tumhara hafta sambhala?',
        },
        action: {
          en: 'Thank that quiet anchor in two lines.',
          bn: 'সেই নীরব অবলম্বনকে দুটি লাইনে ধন্যবাদ জানাও।',
          hi: 'उस शांत सहारे को दो पंक्तियों में धन्यवाद दें।',
          hinglish: 'Us quiet sahare ko do lines mein thank you likho.',
        },
      },
      {
        id: 'virgo-7',
        theme: 'startingAgain',
        spark: {
          en: 'What is "good enough for tonight"?',
          bn: 'আজ রাতের জন্য "এটুকুই যথেষ্ট"—তা কী?',
          hi: 'आज रात के लिए "इतना काफ़ी है" क्या होगा?',
          hinglish: 'Aaj raat ke liye "itna kaafi hai" kya hoga?',
        },
        action: {
          en: 'Close the day with one honest check-in.',
          bn: 'একটি সৎ মনের খোঁজ নিয়ে দিনটা শেষ করো।',
          hi: 'एक सच्चे चेक-इन के साथ दिन पूरा करें।',
          hinglish: 'Ek honest check-in ke saath din close karo.',
        },
      },
    ],
  },
  {
    id: 'libra',
    glyph: '♎',
    westernName: { en: 'Libra', bn: 'তুলা (Libra)', hi: 'तुला (Libra)', hinglish: 'Libra' },
    rashiName: { en: 'Tula', bn: 'তুলা', hi: 'तुला', hinglish: 'Tula' },
    element: { en: 'Air', bn: 'বায়ু', hi: 'वायु', hinglish: 'Air' },
    modality: { en: 'Cardinal', bn: 'চর', hi: 'चर', hinglish: 'Cardinal' },
    vedicRuler: { en: 'Venus', bn: 'শুক্র', hi: 'शुक्र', hinglish: 'Venus (Shukra)' },
    artDirection: 'Two rose-colored paper forms in balance',
    paperBg: '#F6EBEB',
    paperInk: '#2B1820',
    accentColor: '#9E4760',
    motif: 'scales',
    prompts: [
      {
        id: 'libra-1',
        theme: 'boundaries',
        spark: {
          en: 'Where do you need a little more give and take?',
          bn: 'কোথায় তোমার আরেকটু ভারসাম্য বা দেওয়া-নেওয়ার প্রয়োজন?',
          hi: 'कहाँ आपको थोड़ा और संतुलन और पारस्परिकता चाहिए?',
          hinglish: 'Kahan tumhe thoda aur give and take chahiye?',
        },
        action: {
          en: 'Draft one kind sentence asking for what you need.',
          bn: 'তোমার যা প্রয়োজন তা চেয়ে একটি নরম বাক্য খসড়া করো।',
          hi: 'आपको जो चाहिए वह माँगने के लिए एक विनम्र वाक्य लिखें।',
          hinglish: 'Jo tumhe chahiye woh maangne ke liye ek kind sentence draft karo.',
        },
      },
      {
        id: 'libra-2',
        theme: 'friendship',
        spark: {
          en: 'Where have you kept the peace at the cost of being truly known?',
          bn: 'শান্তি বজায় রাখতে গিয়ে কোথায় নিজের আসল কথাটা চেপে রেখেছ?',
          hi: 'शांति बनाए रखने के चक्कर में आपने कहाँ अपनी असली बात दबा दी?',
          hinglish: 'Peace maintain karne ke chakkar mein kahan apni asli baat chhupa li?',
        },
        action: {
          en: 'Write the gentle truth you kept polite.',
          bn: 'ভদ্রতার আড়ালে রাখা নরম সত্যটুকু লেখো।',
          hi: 'शिष्टाचार के पीछे छिपा अपना नरम सच लिखें।',
          hinglish: 'Politeness ke peeche chhupa apna gentle sach likho.',
        },
      },
      {
        id: 'libra-3',
        theme: 'creativity',
        spark: {
          en: 'What small beauty caught your eye on an otherwise ordinary walk?',
          bn: 'একটি সাধারণ পথে হাঁটতে গিয়ে কোন সুন্দর দৃশ্যটা চোখে আটকে গিয়েছিল?',
          hi: 'एक आम रास्ते पर चलते हुए किस छोटी खूबसूरती ने आपका ध्यान खींचा?',
          hinglish: 'Ek normal walk par kis chhoti khoobsurti ne tumhara dhyan khincha?',
        },
        action: {
          en: 'Describe its color and shadow in two lines.',
          bn: 'তার রঙ আর ছায়া দুটি লাইনে বর্ণনা করো।',
          hi: 'उसके रंग और छाया को दो पंक्तियों में लिखें।',
          hinglish: 'Uske color aur shadow ko do lines mein describe karo.',
        },
      },
      {
        id: 'libra-4',
        theme: 'rest',
        spark: {
          en: 'Which decision are you weighing ten times when both options are decent?',
          bn: 'কোন সিদ্ধান্তটা বারবার ওজন করছ, অথচ দুটো পথই ভালো?',
          hi: 'किस फ़ैसले को आप बार-बार तौल रहे हैं, जबकि दोनों रास्ते ठीक हैं?',
          hinglish: 'Kis decision ko baar-baar weigh kar rahe ho jabki dono options theek hain?',
        },
        action: {
          en: 'Give yourself permission to choose lightly tomorrow.',
          bn: 'কাল হালকা মনে বেছে নেওয়ার অনুমতি দাও নিজেকে।',
          hi: 'कल हल्के मन से चुनने की अनुमति खुद को दें।',
          hinglish: 'Kal halka mann rakh kar choose karne ki permission do khud ko.',
        },
      },
      {
        id: 'libra-5',
        theme: 'gratitude',
        spark: {
          en: 'Who meets you halfway without keeping score?',
          bn: 'কোনো হিসাব না রেখে কে তোমার দিকে অর্ধেক পথ এগিয়ে আসে?',
          hi: 'बिना हिसाब रखे कौन आपके साथ आधे रास्ते चलकर आता है?',
          hinglish: 'Bina hisaab rakhe kaun tumhare liye halfway aata hai?',
        },
        action: {
          en: 'Write one memory of feeling genuinely heard.',
          bn: 'মন দিয়ে শোনা হয়েছিল এমন একটি মুহূর্তের কথা লেখো।',
          hi: 'सचमुच सुने जाने के एक अनुभव को लिखें।',
          hinglish: 'Sach mein sune jaane ki ek yaad likho.',
        },
      },
      {
        id: 'libra-6',
        theme: 'curiosity',
        spark: {
          en: 'What conversation feels overdue because you waited for the "right tone"?',
          bn: '"ঠিক সুর" খুঁজতে গিয়ে কোন জরুরি কথাটা আটকে আছে?',
          hi: '"सही लहज़ा" ढूँढते-ढूँढते कौन-सी बातचीत अटकी हुई है?',
          hinglish: '"Sahi tone" dhoondhte-dhoondhte kaun-si baat ruki hui hai?',
        },
        action: {
          en: 'Write the clumsy first draft here safely.',
          bn: 'এখানে নিরাপদে একটি অগোছালো প্রথম খসড়া লেখো।',
          hi: 'यहाँ सुरक्षित रूप से उसका पहला कच्चा ड्राफ़्ट लिखें।',
          hinglish: 'Yahan safely uska clumsy first draft likho.',
        },
      },
      {
        id: 'libra-7',
        theme: 'startingAgain',
        spark: {
          en: 'If fairness included you too tonight, what would change?',
          bn: 'আজ রাতে ন্যায়বিচারে তোমার নিজের জায়গাটাও থাকলে কী বদলাতো?',
          hi: 'अगर आज रात के इंसाफ़ में आप खुद भी शामिल हों, तो क्या बदलेगा?',
          hinglish: 'Agar aaj raat fairness mein tum khud bhi shamil ho, toh kya badlega?',
        },
        action: {
          en: 'Write a short note to yourself as an equal.',
          bn: 'সম্মান জানিয়ে নিজের জন্য একটি ছোট নোট লেখো।',
          hi: 'बराबरी के सम्मान से खुद के लिए एक छोटा नोट लिखें।',
          hinglish: 'Khud ko equal maante hue ek chhota note likho.',
        },
      },
    ],
  },
  {
    id: 'scorpio',
    glyph: '♏',
    westernName: { en: 'Scorpio', bn: 'বৃশ্চিক (Scorpio)', hi: 'वृश्चिक (Scorpio)', hinglish: 'Scorpio' },
    rashiName: { en: 'Vrishchika', bn: 'বৃশ্চিক', hi: 'वृश्चिक', hinglish: 'Vrishchika' },
    element: { en: 'Water', bn: 'জল', hi: 'जल', hinglish: 'Water' },
    modality: { en: 'Fixed', bn: 'স্থির', hi: 'स्थिर', hinglish: 'Fixed' },
    vedicRuler: { en: 'Mars', bn: 'মঙ্গল', hi: 'मंगल', hinglish: 'Mars (Mangal)' },
    artDirection: 'A plum ink drop spreading in water',
    paperBg: '#1D1528',
    paperInk: '#F4EAF3',
    accentColor: '#C574A8',
    motif: 'drop',
    prompts: [
      {
        id: 'scorpio-1',
        theme: 'boundaries',
        spark: {
          en: 'What feels safe enough to put into words today?',
          bn: 'আজ কাগজে লিখে ফেলার মতো নিরাপদ কোন অনুভূতিটা মনে হচ্ছে?',
          hi: 'आज शब्दों में रखने के लिए क्या पर्याप्त सुरक्षित महसूस हो रहा है?',
          hinglish: 'Aaj words mein rakhne ke liye kya safe feel ho raha hai?',
        },
        action: {
          en: 'Write a private line you can keep or release.',
          bn: 'একটি ব্যক্তিগত লাইন লেখো যা পরে রাখতে বা ভাসিয়ে দিতে পারো।',
          hi: 'एक निजी पंक्ति लिखें जिसे आप सहेज या मुक्त कर सकें।',
          hinglish: 'Ek private line likho jise tum rakh ya release kar sakte ho.',
        },
      },
      {
        id: 'scorpio-2',
        theme: 'friendship',
        spark: {
          en: 'Who earned your trust slowly through consistency rather than charm?',
          bn: 'চটকদার কথায় নয়, সময়ের পরীক্ষায় কে ধীরে তোমার বিশ্বাস অর্জন করেছে?',
          hi: 'मीठी बातों से नहीं, बल्कि लगातार साथ से किसने आपका भरोसा जीता?',
          hinglish: 'Badi baaton se nahi, time aur consistency se kisne tumhara trust jeeta?',
        },
        action: {
          en: 'Write one honest sentence about what loyalty feels like.',
          bn: 'বিশ্বস্ততা কেমন অনুভূতি দেয়, সে বিষয়ে একটি সৎ বাক্য লেখো।',
          hi: 'वफ़ादारी कैसी महसूस होती है, इस पर एक सच्चा वाक्य लिखें।',
          hinglish: 'Loyalty kaisi feel hoti hai, uspe ek sach sentence likho.',
        },
      },
      {
        id: 'scorpio-3',
        theme: 'creativity',
        spark: {
          en: 'What quiet transformation happened inside you that nobody outside noticed?',
          bn: 'তোমার ভেতরে কোন নীরব পরিবর্তনটা ঘটেছে যা বাইরের কেউ টের পায়নি?',
          hi: 'आपके भीतर कौन-सा शांत बदलाव आया जिसे बाहर किसी ने नहीं देखा?',
          hinglish: 'Tumhare andar kaun-sa silent change aaya jo bahar kisi ne notice nahi kiya?',
        },
        action: {
          en: 'Give that hidden turning point three honest lines.',
          bn: 'সেই গোপন বাঁকবদলটাকে তিনটি সৎ লাইনে লেখো।',
          hi: 'उस अनदेखे मोड़ को तीन सच्ची पंक्तियों में लिखें।',
          hinglish: 'Us hidden turning point ko teen honest lines mein likho.',
        },
      },
      {
        id: 'scorpio-4',
        theme: 'rest',
        spark: {
          en: 'What secret vigilance can you soften while sitting alone tonight?',
          bn: 'আজ রাতে একা বসে কোন গোপন সতর্কতাটা একটু শিথিল করতে পারো?',
          hi: 'आज रात अकेले बैठकर आप कौन-सी भीतर की चौकसी ढीली कर सकते हैं?',
          hinglish: 'Aaj raat akele baith kar kaun-sa guard thoda neeche rakh sakte ho?',
        },
        action: {
          en: 'Write a letter you intend to release as embers or birds.',
          bn: 'একটি চিঠি লেখো যা লেখার পর ভাসিয়ে দেওয়ার কথা ভাবতে পারো।',
          hi: 'एक ऐसी चिट्ठी लिखें जिसे आप बाद में मुक्त कर सकें।',
          hinglish: 'Ek letter likho jise tum release karne ke liye rakh sakte ho.',
        },
      },
      {
        id: 'scorpio-5',
        theme: 'gratitude',
        spark: {
          en: 'What ending made room for something truer than what you clung to?',
          bn: 'কোন সমাপ্তিটা তোমার আঁকড়ে ধরা জিনিসের চেয়েও সত্যি কিছুর জায়গা করে দিল?',
          hi: 'किस अंत ने उस चीज़ से ज़्यादा सच्ची जगह बनाई जिसे आप थामे हुए थे?',
          hinglish: 'Kis ending ne us cheez se zyada sachchi jagah banayi jise tum pakde hue the?',
        },
        action: {
          en: 'Name one chapter you are finally ready to close kindly.',
          bn: 'একটি অধ্যায়ের নাম লেখো যা তুমি নরমভাবে শেষ করতে প্রস্তুত।',
          hi: 'एक अध्याय का नाम लिखें जिसे आप नरमी से बंद करने को तैयार हैं।',
          hinglish: 'Ek chapter ka naam likho jise tum gently close karne ke liye ready ho.',
        },
      },
      {
        id: 'scorpio-6',
        theme: 'curiosity',
        spark: {
          en: 'Beneath the anger or distance, what tender wish is actually sitting there?',
          bn: 'রাগ বা দূরত্বের নিচে আসলে কোন কোমল ইচ্ছেটা লুকিয়ে আছে?',
          hi: 'गुस्से या दूरी के नीचे असल में कौन-सी कोमल चाह छिपी है?',
          hinglish: 'Gusse ya doori ke neeche sach mein kaun-si soft wish chhupi hai?',
        },
        action: {
          en: 'Complete: "Underneath it all, I wanted…"',
          bn: '"সবকিছুর নিচে আমি আসলে চেয়েছিলাম…" সম্পূর্ণ করো।',
          hi: '"इन सबके नीचे मैं असल में चाहता था…" पूरा करें।',
          hinglish: '"Sabke neeche main sach mein chahta tha…" poora karo.',
        },
      },
      {
        id: 'scorpio-7',
        theme: 'startingAgain',
        spark: {
          en: 'What truth feels clean once it is finally spoken to the dark?',
          bn: 'অন্ধকারের কাছে বলে ফেলার পর কোন সত্যটা পরিষ্কার ও হালকা লাগে?',
          hi: 'रात के सन्नाटे में कह देने के बाद कौन-सा सच साफ़ और हल्का लगता है?',
          hinglish: 'Raat ke sannate mein bol dene ke baad kaun-sa sach clean aur halka lagta hai?',
        },
        action: {
          en: 'Seal one private truth for your own box.',
          bn: 'নিজের বাক্সের জন্য একটি ব্যক্তিগত সত্য সিল করে রাখো।',
          hi: 'अपने बक्से के लिए एक निजी सच सील करें।',
          hinglish: 'Apne box ke liye ek private sach seal karo.',
        },
      },
    ],
  },
  {
    id: 'sagittarius',
    glyph: '♐',
    westernName: { en: 'Sagittarius', bn: 'ধনু (Sagittarius)', hi: 'धनु (Sagittarius)', hinglish: 'Sagittarius' },
    rashiName: { en: 'Dhanu', bn: 'ধনু', hi: 'धनु', hinglish: 'Dhanu' },
    element: { en: 'Fire', bn: 'অগ্নি', hi: 'अग्नि', hinglish: 'Fire' },
    modality: { en: 'Mutable', bn: 'দ্ব্যাত্মক', hi: 'द्विस्वभाव', hinglish: 'Mutable' },
    vedicRuler: { en: 'Jupiter', bn: 'বৃহস্পতি', hi: 'बृहस्पति', hinglish: 'Jupiter (Brihaspati)' },
    artDirection: 'An ochre trail crossing a map',
    paperBg: '#F6EFE0',
    paperInk: '#261C12',
    accentColor: '#A66A19',
    motif: 'trail',
    prompts: [
      {
        id: 'sagittarius-1',
        theme: 'curiosity',
        spark: {
          en: 'What are you curious enough to try once?',
          bn: 'একবার চেষ্টা করে দেখার মতো কৌতূহল এখন কোন বিষয়ে হচ্ছে?',
          hi: 'एक बार आज़माने के लिए आपके भीतर किस बात की जिज्ञासा है?',
          hinglish: 'Ek baar try karne ke liye kis cheez ki curiosity hai abhi?',
        },
        action: {
          en: 'Name one question and one place you could explore it.',
          bn: 'একটি প্রশ্ন এবং সেটি খুঁজে দেখার একটি জায়গার নাম লেখো।',
          hi: 'एक सवाल और उसे तलाशने की एक जगह का नाम लिखें।',
          hinglish: 'Ek sawal aur usse explore karne ki ek jagah ka naam likho.',
        },
      },
      {
        id: 'sagittarius-2',
        theme: 'friendship',
        spark: {
          en: 'Who makes the world feel larger after just ten minutes of talking?',
          bn: 'মাত্র দশ মিনিট কথা বললেই কার সাথে পৃথিবীটা বড় মনে হয়?',
          hi: 'सिर्फ़ दस मिनट बात करने से किसके साथ दुनिया बड़ी लगने लगती है?',
          hinglish: 'Bas 10 minute baat karke kiske saath duniya badi lagne lagti hai?',
        },
        action: {
          en: 'Write down one wild idea you only share with them.',
          bn: 'শুধু তাদের সাথে ভাগ করে নেওয়ার মতো একটি ভাবনা লেখো।',
          hi: 'एक ऐसा विचार लिखें जो आप सिर्फ़ उनसे साझा करते हैं।',
          hinglish: 'Ek idea likho jo tum sirf unse share karte ho.',
        },
      },
      {
        id: 'sagittarius-3',
        theme: 'creativity',
        spark: {
          en: 'What journey—on a train, down a street, or through a book—changed your perspective?',
          bn: 'ট্রেনে, রাস্তায়, বা বইয়ের পাতায় কোন যাত্রা তোমার দেখার চোখ বদলে দিয়েছিল?',
          hi: 'ट्रेन, सड़क, या किताब के किस सफ़र ने आपका नज़रिया बदला?',
          hinglish: 'Train, sadak ya book ki kis journey ne tumhara nazariya badla?',
        },
        action: {
          en: 'Write a postcard-length memory from that day.',
          bn: 'সেই দিনের একটি পোস্টকার্ড সমান স্মৃতি লেখো।',
          hi: 'उस दिन की एक पोस्टकार्ड जितनी याद लिखें।',
          hinglish: 'Us din ki ek postcard jitni yaad likho.',
        },
      },
      {
        id: 'sagittarius-4',
        theme: 'rest',
        spark: {
          en: 'When you turn pain into humor too quickly, what quiet feeling gets skipped?',
          bn: 'কষ্টকে তাড়াতাড়ি রসিকতায় বদলে দিলে কোন আসল অনুভূতিটা বাদ পড়ে যায়?',
          hi: 'दर्द को जल्दी मज़ाक में बदलने पर कौन-सी शांत भावना छूट जाती है?',
          hinglish: 'Dard ko jaldi joke mein badalne par kaun-si sachchi feeling chhoot jati hai?',
        },
        action: {
          en: 'Let two sentences stay serious without a punchline.',
          bn: 'কোনো রসিকতা ছাড়া দুটি বাক্য গম্ভীর ও সৎ থাকতে দাও।',
          hi: 'बिना किसी मज़ाक के दो पंक्तियों को सच्चा रहने दें।',
          hinglish: 'Bina joke ke do lines ko serious aur sach rehne do.',
        },
      },
      {
        id: 'sagittarius-5',
        theme: 'boundaries',
        spark: {
          en: 'Where does promising "yes, everywhere" leave no room for staying present?',
          bn: 'সব জায়গায় হ্যাঁ বলতে গিয়ে কোথায় বর্তমান মুহূর্তে থাকার সময় কমে যায়?',
          hi: 'हर जगह हाँ कहने से कहाँ अभी मौजूद रहने की जगह कम हो जाती है?',
          hinglish: 'Har jagah haan bolne se kahan present rehne ki jagah kam padti hai?',
        },
        action: {
          en: 'Pick one direction for tomorrow instead of five.',
          bn: 'পাঁচটির বদলে কালকের জন্য একটি মাত্র দিক বেছে নাও।',
          hi: 'पाँच के बजाय कल के लिए सिर्फ़ एक दिशा चुनें।',
          hinglish: 'Paanch ke bajay kal ke liye sirf ek direction choose karo.',
        },
      },
      {
        id: 'sagittarius-6',
        theme: 'gratitude',
        spark: {
          en: 'What unexpected detour brought you somewhere better than the original plan?',
          bn: 'কোন অপ্রত্যাশিত পথবদল তোমাকে আসল পরিকল্পনার চেয়ে ভালো জায়গায় নিয়ে এসেছে?',
          hi: 'किस अनचाहे मोड़ ने आपको असली योजना से बेहतर जगह पहुँचाया?',
          hinglish: 'Kis unexpected detour ne tumhe original plan se behtar jagah pahunchaya?',
        },
        action: {
          en: 'Write a thank-you to that detour.',
          bn: 'সেই অপ্রত্যাশিত মোড়কে একটি ধন্যবাদ লেখো।',
          hi: 'उस अनचाहे मोड़ को एक धन्यवाद लिखें।',
          hinglish: 'Us detour ko ek thank you likho.',
        },
      },
      {
        id: 'sagittarius-7',
        theme: 'startingAgain',
        spark: {
          en: 'What map in your life needs updating because you have outgrown the old borders?',
          bn: 'পুরোনো সীমানা পেরিয়ে আসার কারণে জীবনের কোন মানচিত্রটা নতুন করে আঁকা দরকার?',
          hi: 'पुरानी सीमाओं से आगे बढ़ने के कारण जीवन का कौन-सा नक़्शा नया बनाना है?',
          hinglish: 'Purani limits se aage badhne ke baad life ka kaun-sa map update karna hai?',
        },
        action: {
          en: 'Write one honest headline for your next season.',
          bn: 'তোমার আগামী ঋতুর জন্য একটি সৎ শিরোনাম লেখো।',
          hi: 'अपने अगले मौसम के लिए एक सच्चा शीर्षक लिखें।',
          hinglish: 'Apne agle season ke liye ek honest headline likho.',
        },
      },
    ],
  },
  {
    id: 'capricorn',
    glyph: '♑',
    westernName: { en: 'Capricorn', bn: 'মকর (Capricorn)', hi: 'मकर (Capricorn)', hinglish: 'Capricorn' },
    rashiName: { en: 'Makara', bn: 'মকর', hi: 'मकर', hinglish: 'Makara' },
    element: { en: 'Earth', bn: 'পৃথিবী', hi: 'पृथ्वी', hinglish: 'Earth' },
    modality: { en: 'Cardinal', bn: 'চর', hi: 'चर', hinglish: 'Cardinal' },
    vedicRuler: { en: 'Saturn', bn: 'শনি', hi: 'शनि', hinglish: 'Saturn (Shani)' },
    artDirection: 'Slate steps caught by morning light',
    paperBg: '#EAECEF',
    paperInk: '#171C24',
    accentColor: '#3B4D63',
    motif: 'steps',
    prompts: [
      {
        id: 'capricorn-1',
        theme: 'gratitude',
        spark: {
          en: 'What quiet effort deserves credit?',
          bn: 'কোন নীরব পরিশ্রমটা আজ স্বীকৃতি পাওয়ার যোগ্য?',
          hi: 'कौन-सी शांत मेहनत आज श्रेय की हक़दार है?',
          hinglish: 'Kaun-si quiet mehnat aaj credit deserve karti hai?',
        },
        action: {
          en: 'Leave a two-line progress note for your future self.',
          bn: 'ভবিষ্যতের নিজের জন্য দুই লাইনের একটি অগ্রগতির নোট রেখে যাও।',
          hi: 'अपने भविष्य के रूप के लिए दो पंक्तियों का प्रगति नोट छोड़ें।',
          hinglish: 'Apne future self ke liye do line ka progress note chhod do.',
        },
      },
      {
        id: 'capricorn-2',
        theme: 'friendship',
        spark: {
          en: 'Who can you lean on without feeling like you are failing?',
          bn: 'ব্যর্থ মনে না করেই কার ওপর আজ একটু ভরসা করা যায়?',
          hi: 'खुद को कमज़ोर समझे बिना आप किस पर भरोसा कर सकते हैं?',
          hinglish: 'Khud ko weak maane bina tum kis par bharosa kar sakte ho?',
        },
        action: {
          en: 'Write what help would look like if you let yourself accept it.',
          bn: 'সাহায্য মেনে নিলে তা কেমন দেখাত, সে বিষয়ে লেখো।',
          hi: 'अगर आप मदद स्वीकार करें, तो वह कैसी दिखेगी, यह लिखें।',
          hinglish: 'Agar tum help accept kar lo, toh woh kaisi dikhegi, likho.',
        },
      },
      {
        id: 'capricorn-3',
        theme: 'creativity',
        spark: {
          en: 'What are you building patiently that needs care rather than speed?',
          bn: 'গতি নয়, যত্ন দিয়ে ধৈর্য ধরে তুমি কী গড়ে তুলছ?',
          hi: 'आप धैर्य से ऐसा क्या बना रहे हैं जिसे रफ़्तार नहीं, देखभाल चाहिए?',
          hinglish: 'Tum patience se aisa kya bana rahe ho jise speed nahi, care chahiye?',
        },
        action: {
          en: 'Note one step you completed this month.',
          bn: 'এই মাসে সম্পন্ন করা একটি ধাপ লিখে রাখো।',
          hi: 'इस महीने पूरा किया गया एक कदम लिखें।',
          hinglish: 'Is mahine complete kiya hua ek step note karo.',
        },
      },
      {
        id: 'capricorn-4',
        theme: 'rest',
        spark: {
          en: 'If your worth did not depend on today’s productivity, how would tonight feel?',
          bn: 'আজকের কাজের পরিমাণের ওপর তোমার মূল্য নির্ভর না করলে রাতটা কেমন লাগত?',
          hi: 'अगर आपकी क़ीमत आज के काम पर निर्भर न हो, तो आज की रात कैसी लगेगी?',
          hinglish: 'Agar tumhari value aaj ke kaam par depend na kare, toh aaj raat kaisi lagegi?',
        },
        action: {
          en: 'Write a permission slip to clock out completely.',
          bn: 'কাজ থেকে পুরোপুরি ছুটি নেওয়ার একটি ছোট নোট লেখো।',
          hi: 'काम से पूरी छुट्टी लेने की एक छोटी पर्ची लिखें।',
          hinglish: 'Kaam se poori tarah off lene ki ek chhoti note likho.',
        },
      },
      {
        id: 'capricorn-5',
        theme: 'boundaries',
        spark: {
          en: 'Which standard you hold yourself to came from someone else’s fear?',
          bn: 'নিজের ওপর চাপানো কোন কঠোর নিয়মটা আসলে অন্য কারো ভয় থেকে এসেছে?',
          hi: 'खुद पर लगाया कौन-सा कड़ा नियम असल में किसी और के डर से आया है?',
          hinglish: 'Khud par lagaya kaun-sa strict rule kisi aur ke dar se aaya tha?',
        },
        action: {
          en: 'Set down one rule that no longer fits.',
          bn: 'একটি পুরোনো নিয়ম নামিয়ে রাখো যা আর মানায় না।',
          hi: 'एक ऐसा नियम छोड़ दें जो अब फिट नहीं बैठता।',
          hinglish: 'Ek purana rule neeche rakh do jo ab fit nahi hota.',
        },
      },
      {
        id: 'capricorn-6',
        theme: 'curiosity',
        spark: {
          en: 'What playful thing did you used to love before everything had to be "useful"?',
          bn: 'সবকিছু "কাজের" হওয়ার আগে কোন খেলাধুলা বা শখটা তুমি ভালোবাসতে?',
          hi: 'हर चीज़ के "उपयोगी" होने से पहले आपको क्या बेवजह पसंद था?',
          hinglish: 'Har cheez ke "useful" hone se pehle tumhe kya bewajah pasand tha?',
        },
        action: {
          en: 'Give ten minutes to something purely unmonetized.',
          bn: 'লাভ-ক্ষতির হিসাব ছাড়া কোনো শখের কথা লেখো।',
          hi: 'बिना फ़ायदे के किसी शौक़ के बारे में लिखें।',
          hinglish: 'Bina kisi outcome ke ek shauk ke baare mein likho.',
        },
      },
      {
        id: 'capricorn-7',
        theme: 'startingAgain',
        spark: {
          en: 'What mountain looks smaller when you only look at tomorrow’s step?',
          bn: 'শুধু কালকের এক ধাপের দিকে তাকালে কোন বড় চাপটা ছোট মনে হয়?',
          hi: 'सिर्फ़ कल के एक कदम को देखने पर कौन-सा पहाड़ छोटा लगता है?',
          hinglish: 'Sirf kal ke ek step par dhyan dene se kaun-sa pahad chhota lagta hai?',
        },
        action: {
          en: 'Write just step one for tomorrow.',
          bn: 'কালকের জন্য শুধু প্রথম ধাপটা লেখো।',
          hi: 'कल के लिए सिर्फ़ पहला कदम लिखें।',
          hinglish: 'Kal ke liye bas step one likho.',
        },
      },
    ],
  },
  {
    id: 'aquarius',
    glyph: '♒',
    westernName: { en: 'Aquarius', bn: 'কুম্ভ (Aquarius)', hi: 'कुंभ (Aquarius)', hinglish: 'Aquarius' },
    rashiName: { en: 'Kumbha', bn: 'কুম্ভ', hi: 'कुंभ', hinglish: 'Kumbha' },
    element: { en: 'Air', bn: 'বায়ু', hi: 'वायु', hinglish: 'Air' },
    modality: { en: 'Fixed', bn: 'স্থির', hi: 'स्थिर', hinglish: 'Fixed' },
    vedicRuler: { en: 'Saturn', bn: 'শনি', hi: 'शनि', hinglish: 'Saturn (Shani)' },
    artDirection: 'Cobalt ripples on silver paper',
    paperBg: '#E9EEF6',
    paperInk: '#121B2E',
    accentColor: '#254E96',
    motif: 'ripples',
    prompts: [
      {
        id: 'aquarius-1',
        theme: 'creativity',
        spark: {
          en: 'Which familiar rule would you redesign?',
          bn: 'কোন পরিচিত নিয়মটা তুমি নতুন করে সাজাতে চাও?',
          hi: 'किस परिचित नियम को आप नए सिरे से बनाना चाहेंगे?',
          hinglish: 'Kaun-sa familiar rule tum redesign karna chahoge?',
        },
        action: {
          en: 'Sketch an alternative in a sentence or two.',
          bn: 'এক-দুটি বাক্যে একটি বিকল্প রূপরেখা লেখো।',
          hi: 'एक-दो वाक्यों में उसका एक नया विकल्प लिखें।',
          hinglish: 'Ek ya do sentences mein ek alternative sketch karo.',
        },
      },
      {
        id: 'aquarius-2',
        theme: 'friendship',
        spark: {
          en: 'What kind of community or friendship lets you stay eccentric and honest?',
          bn: 'কেমন বন্ধুত্বে তুমি নিজের অদ্ভুত ভাবনাগুলো নিয়েও নিশ্চিন্তে থাকতে পারো?',
          hi: 'किस दोस्ती में आप अपने अनोखेपन के साथ भी बिल्कुल सहज रहते हैं?',
          hinglish: 'Kaisi friendship mein tum apne weird aur honest self mein reh sakte ho?',
        },
        action: {
          en: 'Describe your kind of people in three lines.',
          bn: 'তোমার মনের মতো মানুষদের কথা তিন লাইনে লেখো।',
          hi: 'अपने जैसे लोगों की तीन ख़ूबियाँ लिखें।',
          hinglish: 'Apne tarah ke logon ke baare mein teen lines likho.',
        },
      },
      {
        id: 'aquarius-3',
        theme: 'curiosity',
        spark: {
          en: 'What quiet future are you already prototyping in how you treat people today?',
          bn: 'আজ মানুষের সাথে আচরণে তুমি কোন শান্ত ভবিষ্যতের মহড়া দিচ্ছ?',
          hi: 'आज लोगों से व्यवहार में आप किस शांत भविष्य की शुरुआत कर रहे हैं?',
          hinglish: 'Aaj logon ke saath behave karne mein tum kis future ko practice kar rahe ho?',
        },
        action: {
          en: 'Note one small way you refused cynicism today.',
          bn: 'আজ হতাশাকে প্রশ্রয় না দেওয়ার একটি ছোট ঘটনা লেখো।',
          hi: 'आज निराशा को मना करने का एक छोटा उदाहरण लिखें।',
          hinglish: 'Aaj cynicism ko mana karne ka ek chhota example note karo.',
        },
      },
      {
        id: 'aquarius-4',
        theme: 'rest',
        spark: {
          en: 'When you step up into thinking about everything, what is your heart feeling?',
          bn: 'সবকিছু মাথায় বসে বিশ্লেষণ করতে গিয়ে হৃদয় আসলে কী অনুভব করছে?',
          hi: 'सब कुछ दिमाग से सोचते-सोचते आपका दिल असल में क्या महसूस कर रहा है?',
          hinglish: 'Sab kuch dimag se analyze karte waqt tumhara dil kya feel kar raha hai?',
        },
        action: {
          en: 'Name one emotion without explaining why it makes sense.',
          bn: 'যুক্তি না দিয়েই একটি অনুভূতির নাম লেখো।',
          hi: 'बिना तर्क दिए एक भावना का नाम लिखें।',
          hinglish: 'Bina logic diye bas ek feeling ka naam likho.',
        },
      },
      {
        id: 'aquarius-5',
        theme: 'boundaries',
        spark: {
          en: 'Where do you pull away to feel safe when you actually wanted to stay close?',
          bn: 'কাছে থাকতে চেয়েও নিজেকে বাঁচাতে গিয়ে কখন তুমি দূরে সরে যাও?',
          hi: 'पास रहना चाहकर भी खुद को बचाने के लिए आप कब दूर हट जाते हैं?',
          hinglish: 'Paas rehna chahte hue bhi safe rehne ke liye kab door hat jaate ho?',
        },
        action: {
          en: 'Write what staying at a comfortable distance looks like.',
          bn: 'স্বস্তিকর দূরত্বে থেকেও যুক্ত থাকার উপায় লেখো।',
          hi: 'सुकून भरी दूरी के साथ जुड़े रहने का तरीका लिखें।',
          hinglish: 'Comfortable space ke saath connected rehne ka tarika likho.',
        },
      },
      {
        id: 'aquarius-6',
        theme: 'gratitude',
        spark: {
          en: 'Which strange idea of yours turned out to be useful or comforting to someone?',
          bn: 'তোমার কোন অদ্ভুত ভাবনাটা শেষ পর্যন্ত কারো কাজে বা আরামে লেগেছে?',
          hi: 'आपका कौन-सा अनोखा विचार किसी के काम या सुकून में आया?',
          hinglish: 'Tumhara kaun-sa ajeeb idea kisi ke kaam ya comfort mein aaya?',
        },
        action: {
          en: 'Keep that reminder in your Feeling Card.',
          bn: 'সেই মনে রাখা কথাটা একটি ফিলিং কার্ডে রাখো।',
          hi: 'उस याद को एक फ़ीलिंग कार्ड में सहेजें।',
          hinglish: 'Us reminder ko Feeling Card mein rakho.',
        },
      },
      {
        id: 'aquarius-7',
        theme: 'startingAgain',
        spark: {
          en: 'What noise from screens or expectations can you mute for an hour?',
          bn: 'স্ক্রিন বা প্রত্যাশার কোন কোলাহলটা এক ঘণ্টার জন্য মিউট করা যায়?',
          hi: 'स्क्रीन या उम्मीदों का कौन-सा शोर आप एक घंटे के लिए शांत कर सकते हैं?',
          hinglish: 'Screens ya expectations ka kaun-sa shor ek ghante ke liye mute kar sakte ho?',
        },
        action: {
          en: 'Write offline in silence for five minutes.',
          bn: 'নীরবতায় পাঁচ মিনিট অফলাইনে লেখো।',
          hi: 'सन्नाटे में पाँच मिनट ऑफ़लाइन लिखें।',
          hinglish: 'Khamoshi mein paanch minute offline likho.',
        },
      },
    ],
  },
  {
    id: 'pisces',
    glyph: '♓',
    westernName: { en: 'Pisces', bn: 'মীন (Pisces)', hi: 'मीन (Pisces)', hinglish: 'Pisces' },
    rashiName: { en: 'Meena', bn: 'মীন', hi: 'मीन', hinglish: 'Meena' },
    element: { en: 'Water', bn: 'জল', hi: 'जल', hinglish: 'Water' },
    modality: { en: 'Mutable', bn: 'দ্ব্যাত্মক', hi: 'द्विस्वभाव', hinglish: 'Mutable' },
    vedicRuler: { en: 'Jupiter', bn: 'বৃহস্পতি', hi: 'बृहस्पति', hinglish: 'Jupiter (Brihaspati)' },
    artDirection: 'Two ink fish moving through indigo',
    paperBg: '#161A33',
    paperInk: '#EDF0FA',
    accentColor: '#8CA3E8',
    motif: 'fish',
    prompts: [
      {
        id: 'pisces-1',
        theme: 'creativity',
        spark: {
          en: "If today's feeling had a sound, what would it be?",
          bn: 'আজকের অনুভূতিটার যদি কোনো শব্দ থাকত, সেটা কেমন শোনাত?',
          hi: 'अगर आज के एहसास की कोई आवाज़ होती, तो वह कैसी होती?',
          hinglish: 'Agar aaj ki feeling ki koi aawaz hoti, toh woh kaisi hoti?',
        },
        action: {
          en: 'Write two lines beginning “Today sounds like…” and turn them into a card.',
          bn: '“আজকের দিনটা শোনাচ্ছে…” দিয়ে দুটি লাইন লেখো এবং কার্ড বানাও।',
          hi: '“आज की आवाज़ ऐसी है…” से दो पंक्तियाँ लिखकर कार्ड बनाएं।',
          hinglish: '“Aaj ki aawaz aisi lagti hai…” se do lines likh kar card banao.',
        },
      },
      {
        id: 'pisces-2',
        theme: 'friendship',
        spark: {
          en: 'Who understands what you mean even when your words trail off?',
          bn: 'তোমার কথা মাঝপথে থেমে গেলেও কে ঠিক বুঝে নেয় তুমি কী বলতে চাইছ?',
          hi: 'आपकी बात अधूरी छूटने पर भी कौन समझ जाता है कि आप क्या कहना चाहते हैं?',
          hinglish: 'Tumhari baat beech mein rukne par bhi kaun samajh jata hai?',
        },
        action: {
          en: 'Send them an unsent blessing or memory tonight.',
          bn: 'আজ রাতে তাদের জন্য একটি না পাঠানো শুভকামনা লেখো।',
          hi: 'आज रात उनके लिए एक अनकही दुआ लिखें।',
          hinglish: 'Aaj raat unke liye ek unsent dua ya memory likho.',
        },
      },
      {
        id: 'pisces-3',
        theme: 'rest',
        spark: {
          en: 'Where do you need soft edges instead of hard answers tonight?',
          bn: 'আজ রাতে কঠিন উত্তরের বদলে কোথায় একটু নরম আশ্রয় দরকার?',
          hi: 'आज रात कड़े जवाबों के बजाय आपको कहाँ नरम सहारा चाहिए?',
          hinglish: 'Aaj raat hard answers ke bajay kahan thodi narmi chahiye?',
        },
        action: {
          en: 'Let a question stay unanswered on purpose.',
          bn: 'একটি প্রশ্নকে ইচ্ছে করেই উত্তরহীন থাকতে দাও।',
          hi: 'एक सवाल को जानबूझकर अनसुलझा रहने दें।',
          hinglish: 'Ek sawal ko jaan-boojh kar bina answer ke rehne do.',
        },
      },
      {
        id: 'pisces-4',
        theme: 'boundaries',
        spark: {
          en: 'Which emotion belongs to the room or the news, not your own heart?',
          bn: 'কোন অস্থিরতাটা চারপাশের বা খবরের, তোমার নিজের মনের নয়?',
          hi: 'कौन-सी बेचैनी आसपास के माहौल की है, आपके अपने दिल की नहीं?',
          hinglish: 'Kaun-si bechaini aas-paas ki hai, tumhare apne dil ki nahi?',
        },
        action: {
          en: 'Separate "mine" and "not mine" in two gentle lines.',
          bn: '"আমার" আর "আমার নয়"—দুটি নরম লাইনে আলাদা করো।',
          hi: '"मेरा" और "मेरा नहीं" को दो शांत पंक्तियों में अलग करें।',
          hinglish: '"Mera" aur "mera nahi" ko do soft lines mein alag karo.',
        },
      },
      {
        id: 'pisces-5',
        theme: 'gratitude',
        spark: {
          en: 'What small kindness from a stranger or neighbor lingered today?',
          bn: 'কোনো অচেনা মানুষ বা প্রতিবেশীর কোন ছোট্ট দয়া আজ মনে থেকে গেল?',
          hi: 'किसी अनजान या पड़ोसी की कौन-सी छोटी भलाई आज याद रह गई?',
          hinglish: 'Kisi stranger ya padosi ki kaun-si chhoti kindness aaj dil mein reh gayi?',
        },
        action: {
          en: 'Record that tiny detail before sleep.',
          bn: 'ঘুমানোর আগে সেই ছোট্ট ঘটনাটা লিখে রাখো।',
          hi: 'सोने से पहले उस छोटी-सी बात को लिख लें।',
          hinglish: 'Sone se pehle us chhoti si detail ko note kar lo.',
        },
      },
      {
        id: 'pisces-6',
        theme: 'curiosity',
        spark: {
          en: 'What dream fragment or image refuses to fade this week?',
          bn: 'এই সপ্তাহে কোন স্বপ্নের টুকরো বা ছবি কিছুতেই মুছে যাচ্ছে না?',
          hi: 'इस हफ़्ते कौन-सा सपना या छवि धुंधली होने से मना कर रही है?',
          hinglish: 'Is hafte kaun-sa dream ya image dimag se ja nahi raha?',
        },
        action: {
          en: 'Write it down without trying to decode it.',
          bn: 'অর্থ খোঁজার চেষ্টা না করেই সেটি লিখে রাখো।',
          hi: 'उसका मतलब निकाले बिना उसे लिख दें।',
          hinglish: 'Meaning dhoondhe bina bas usse likh lo.',
        },
      },
      {
        id: 'pisces-7',
        theme: 'startingAgain',
        spark: {
          en: 'If tomorrow began like calm water at dawn, what floats first?',
          bn: 'কালকের সকালটা যদি ভোরের শান্ত জলের মতো শুরু হয়, কী সবার আগে ভেসে উঠবে?',
          hi: 'अगर कल की शुरुआत भोर के शांत पानी जैसी हो, तो सबसे पहले क्या उभरेगा?',
          hinglish: 'Agar kal subah shaant paani jaisi shuru ho, toh sabse pehle kya aayega?',
        },
        action: {
          en: 'Start a letter to your future self.',
          bn: 'ভবিষ্যতের নিজের কাছে একটি চিঠি শুরু করো।',
          hi: 'भविष्य के खुद के लिए एक चिट्ठी शुरू करें।',
          hinglish: 'Future self ke liye ek letter start karo.',
        },
      },
    ],
  },
];

export function getSignById(id: SignId): ZodiacSignDefinition {
  return ZODIAC_SIGNS.find((s) => s.id === id) ?? ZODIAC_SIGNS[0];
}

export function getDailyPromptIndex(signId: SignId, localDateStr: string, totalPrompts: number): number {
  const seed = `${signId}:${localDateStr}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % totalPrompts;
}

export type PairContext = 'friendship' | 'family' | 'creative';

export interface TwoSignConversationCard {
  signA: SignId;
  signB: SignId;
  context: PairContext;
  questionForA: Record<AppLanguage, string>;
  questionForB: Record<AppLanguage, string>;
  sharedActivity: Record<AppLanguage, string>;
}

const PAIR_ACTIVITIES: Record<PairContext, Array<Record<AppLanguage, string>>> = {
  friendship: [
    {
      en: 'Describe the same memory twice: once as a newspaper headline, and once as a color.',
      bn: 'একই স্মৃতি দুবার বর্ণনা করো—একবার খবরের শিরোনামে, আর একবার রঙে।',
      hi: 'एक ही याद को दो तरह से लिखें: एक बार अख़बार की सुर्ख़ी की तरह, एक बार रंग की तरह।',
      hinglish: 'Ek hi memory do baar describe karo: ek baar headline ki tarah, aur ek baar color ki tarah.',
    },
    {
      en: 'Swap one song each that fits tonight’s mood, then listen without talking for three minutes.',
      bn: 'আজকের মনের মতো একটি করে গান বিনিময় করো এবং তিন মিনিট চুপচাপ শোনো।',
      hi: 'आज के मूड जैसा एक-एक गाना साझा करें और तीन मिनट चुपचाप सुनें।',
      hinglish: 'Aaj ke mood ka ek-ek gaana share karo aur teen minute chupchaap suno.',
    },
  ],
  family: [
    {
      en: 'Each person names one ordinary household sound that still means safety.',
      bn: 'দুজনই বাড়ির একটি সাধারণ শব্দের নাম বলো যা এখনো নিশ্চয়তার অনুভূতি দেয়।',
      hi: 'दोनों घर की एक ऐसी आम आवाज़ का नाम बताएं जो आज भी सुकून देती है।',
      hinglish: 'Dono ghar ki ek simple aawaz ka naam batao jo abhi bhi safe feel karati hai.',
    },
    {
      en: 'Write down one small family story you remember differently, without arguing which version is right.',
      bn: 'কোনটি ঠিক তা নিয়ে তর্ক না করে পরিবারের একটি পুরোনো গল্প নিজেদের মতো লেখো।',
      hi: 'सही-ग़लत की बहस किए बिना परिवार की एक पुरानी कहानी अपने-अपने नज़रिए से लिखें।',
      hinglish: 'Sahi-galat argue kiye bina family ki ek purani story apne tarike se likho.',
    },
  ],
  creative: [
    {
      en: 'One person writes a three-word scene; the other responds with a four-line Feeling Card.',
      bn: 'একজন তিন শব্দের একটি দৃশ্য লেখো; অন্যজন তা দিয়ে চার লাইনের একটি ফিলিং কার্ড বানাও।',
      hi: 'एक व्यक्ति तीन शब्दों का दृश्य लिखे; दूसरा उस पर चार पंक्तियों का फ़ीलिंग कार्ड बनाए।',
      hinglish: 'Ek banda teen words ka scene likhe; doosra uspe chaar line ka Feeling Card banaye.',
    },
    {
      en: 'Pick a shared object in the room and write two completely different openings for its story.',
      bn: 'ঘরের একটি জিনিস বেছে নিয়ে তার গল্পের দুটি ভিন্ন শুরু লেখো।',
      hi: 'कमरे की एक चीज़ चुनें और उसकी कहानी की दो अलग शुरुआत लिखें।',
      hinglish: 'Room ki ek cheez chuno aur uski kahani ki do bilkul alag openings likho.',
    },
  ],
};

export function buildTwoSignCard(signA: SignId, signB: SignId, context: PairContext): TwoSignConversationCard {
  const defA = getSignById(signA);
  const defB = getSignById(signB);
  const idxA = context === 'friendship' ? 1 : context === 'family' ? 4 : 2;
  const idxB = context === 'friendship' ? 5 : context === 'family' ? 3 : 6;
  const actList = PAIR_ACTIVITIES[context];
  const actIndex = (SIGN_ORDER_INDEX(signA) + SIGN_ORDER_INDEX(signB)) % actList.length;
  return {
    signA,
    signB,
    context,
    questionForA: defA.prompts[idxA % defA.prompts.length].spark,
    questionForB: defB.prompts[idxB % defB.prompts.length].spark,
    sharedActivity: actList[actIndex],
  };
}

function SIGN_ORDER_INDEX(id: SignId): number {
  return ZODIAC_SIGNS.findIndex((s) => s.id === id);
}
