import type { AppLanguage, RecipientCategory } from './types.ts';

export interface RecipientPromptSet {
  category: RecipientCategory;
  defaultSalutation: Record<AppLanguage, string>;
  prompts: Record<AppLanguage, string[]>;
}

export const RECIPIENT_CATEGORIES: RecipientPromptSet[] = [
  {
    category: 'ex',
    defaultSalutation: {
      en: 'Dear you,',
      bn: 'প্রিয়,',
      hi: 'प्रिय,',
      hinglish: 'Dear,',
    },
    prompts: {
      en: [
        'What stayed unfinished in the last room you shared?',
        'If you could return one small memory without asking for anything back, which one is it?',
        'What did you learn to stop apologizing for after they left?',
        'Write the sentence you rehearsed on the train home and never sent.',
        'What kind of peace do you wish for both of you now?',
      ],
      bn: [
        'শেষবার একসাথে থাকা ঘরটাতে কোন কথাটা অসম্পূর্ণ রয়ে গিয়েছিল?',
        'কিছু ফেরত না চেয়ে যদি একটি ছোট স্মৃতি ফিরিয়ে দিতে পারতে, কোনটি দিতে?',
        'চলে যাওয়ার পর কোন বিষয়টার জন্য আর ক্ষমা না চাওয়া শিখেছ?',
        'বাড়ি ফেরার পথে মনে মনে যে লাইনটা ভেবেছিলে, কিন্তু পাঠাওনি—সেটা লেখো।',
        'এখন দুজনের জন্য কোন ধরনের শান্তি চাও?',
      ],
      hi: [
        'आख़िरी बार साथ बिताए कमरे में कौन-सी बात अधूरी रह गई थी?',
        'बिना कुछ वापस मांगे अगर एक छोटी याद लौटानी हो, तो वह कौन-सी होगी?',
        'उनके जाने के बाद आपने किस बात के लिए माफ़ी मांगना बंद किया?',
        'घर लौटते समय मन में जो पंक्ति दोहराई थी पर भेजी नहीं, वह लिखें।',
        'अब आप दोनों के लिए किस तरह के सुकून की कामना करते हैं?',
      ],
      hinglish: [
        'Last time saath rehne ke baad kaun-si baat adhoori reh gayi thi?',
        'Bina kuch wapas maange agar ek chhoti yaad lautani ho, toh kaun-si hogi?',
        'Unke jaane ke baad tumne kis baat ke liye sorry bolna band kiya?',
        'Ghar laut-te waqt jo line mann mein sochi par bheji nahi, woh likho.',
        'Ab tum dono ke liye kis tarah ka sukoon chahte ho?',
      ],
    },
  },
  {
    category: 'mother',
    defaultSalutation: {
      en: 'Dear Ma,',
      bn: 'প্রিয় মা,',
      hi: 'प्रिय माँ,',
      hinglish: 'Dear Ma,',
    },
    prompts: {
      en: [
        'What ordinary sound in the kitchen still reminds you of her?',
        'What did you wish she understood about the way you grew up?',
        'Where do you notice her quiet habit living inside your own hands?',
        'What truth feels easier to put on paper than say across the table?',
        'Thank her for one unseen effort she never called a sacrifice.',
      ],
      bn: [
        'রান্নাঘরের কোন সাধারণ শব্দ এখনো মায়ের কথা মনে করিয়ে দেয়?',
        'তোমার বড় হয়ে ওঠার কোন দিকটা মা বুঝলে ভালো হতো বলে মনে হয়?',
        'নিজের কাজের মধ্যে মায়ের কোন নীরব অভ্যাসটা আজও দেখতে পাও?',
        'মুখোমুখি বসে বলার চেয়ে কাগজে লেখা সহজ—এমন কোন সত্য আছে?',
        'মায়ের এমন একটি নীরব পরিশ্রমের জন্য ধন্যবাদ দাও, যা তিনি কখনো বলেননি।',
      ],
      hi: [
        'रसोई की कौन-सी आम आवाज़ आज भी माँ की याद दिलाती है?',
        'आपके बड़े होने की कौन-सी बात काश वह समझ पातीं?',
        'अपने हाथों की किस आदत में आपको उनकी झलक दिखती है?',
        'आमने-सामने कहने से ज़्यादा कागज़ पर लिखना किस सच के लिए आसान है?',
        'उनकी एक अनकही मेहनत का शुक्रिया अदा करें जिसे उन्होंने कभी जताया नहीं।',
      ],
      hinglish: [
        'Kitchen ki kaun-si roz ki aawaz abhi bhi Ma ki yaad dilati hai?',
        'Tumhare bade hone ki kaun-si baat kaash woh samajh paatin?',
        'Apne kaam karne ke tarike mein Ma ki kaun-si aadat dikhti hai?',
        'Table ke saamne bolne se zyada paper pe likhna kaun-sa sach aasan hai?',
        'Unki ek aisi mehnat ke liye thank you likho jo unhone kabhi jatayi nahi.',
      ],
    },
  },
  {
    category: 'father',
    defaultSalutation: {
      en: 'Dear Baba,',
      bn: 'প্রিয় বাবা,',
      hi: 'प्रिय पापा,',
      hinglish: 'Dear Baba,',
    },
    prompts: {
      en: [
        'What did his silence try to protect you from?',
        'Describe a moment when you saw him tired and pretended not to notice.',
        'What question about his younger days have you been too shy to ask?',
        'Where do you wish the two of you could speak without pride or hurry?',
        'Name one thing he taught you just by doing it every morning.',
      ],
      bn: [
        'বাবার নীরবতা তোমাকে কী থেকে আগলে রাখতে চেয়েছিল?',
        'এমন একটি মুহূর্তের কথা লেখো যখন বাবাকে ক্লান্ত দেখেও না দেখার ভান করেছিলে।',
        'বাবার তরুণ বয়সের কোন প্রশ্নটা লজ্জায় কখনো জিজ্ঞাসা করা হয়নি?',
        'অহংকার বা তাড়াহুড়ো ছাড়া দুজনে কোন বিষয়ে কথা বলতে চাও?',
        'প্রতিদিন সকালে করে দেখিয়ে বাবা তোমাকে কী শিখিয়েছেন?',
      ],
      hi: [
        'उनकी ख़ामोशी आपको किस बात से बचाना चाहती थी?',
        'वह पल लिखें जब आपने उन्हें थका हुआ देखा और अनदेखा करने का नाटक किया।',
        'उनकी जवानी के दिनों का कौन-सा सवाल पूछने में आपको झिझक हुई?',
        'बिना झिझक या जल्दी के आप दोनों किस बात पर खुलकर बोलना चाहते हैं?',
        'हर सुबह सिर्फ़ अपने काम से उन्होंने आपको कौन-सी एक सीख दी?',
      ],
      hinglish: [
        'Unki khamoshi tumhe kis cheez se bachana chahti thi?',
        'Woh pal likho jab tumne unhe thaka hua dekha par notice na karne ka natak kiya.',
        'Unki jawani ke dino ka kaun-sa sawal poochne mein hichkichahat hui?',
        'Bina ego ya jaldi ke tum dono kis topic par baat karna chahte ho?',
        'Roz subah bas karke dikhane se unhone tumhe kya sikhaya?',
      ],
    },
  },
  {
    category: 'friend',
    defaultSalutation: {
      en: 'Dear friend,',
      bn: 'প্রিয় বন্ধু,',
      hi: 'प्रिय दोस्त,',
      hinglish: 'Dear dost,',
    },
    prompts: {
      en: [
        'Which late-night conversation changed how you saw yourself?',
        'If distance made things awkward, what honest warmth still remains?',
        'What inside joke or street corner belongs only to the two of you?',
        'Write the appreciation you thought sounded too cheesy to text.',
        'What do you hope they never forget about who they are?',
      ],
      bn: [
        'কোন গভীর রাতের আড্ডা নিজেকে দেখার চোখ বদলে দিয়েছিল?',
        'দূরত্ব যদি একটু আড়ষ্টতা এনে থাকে, তবুও কোন আন্তরিকতা আজও অটুট?',
        'কোন রাস্তার মোড় বা হাসির কথা শুধু তোমাদের দুজনের?',
        'মেসেজে লিখতে সংকোচ হতো বলে যে প্রশংসাটা করা হয়নি, আজ লেখো।',
        'নিজের সম্পর্কে কোন সত্যটা তারা কখনো না ভুলুক বলে চাও?',
      ],
      hi: [
        'किस देर रात की बातचीत ने खुद को देखने का आपका नज़रिया बदला?',
        'अगर दूरी से थोड़ी झिझक आ गई है, तो भी कौन-सा अपनापन बचा हुआ है?',
        'कौन-सा मज़ाक या गली का कोना सिर्फ़ आप दोनों का है?',
        'वह तारीफ़ लिखें जो मैसेज में भेजने में थोड़ी फ़िल्मी लग रही थी।',
        'आप क्या चाहते हैं कि वे अपने बारे में कभी न भूलें?',
      ],
      hinglish: [
        'Kaun-si late-night baat ne tumhara khud ko dekhne ka nazariya badla?',
        'Agar distance se thodi awkwardness aayi hai, toh bhi kaun-sa warmth baaki hai?',
        'Kaun-sa inside joke ya chai ki tapri sirf tum dono ki hai?',
        'Woh appreciation likho jo text karne mein thoda cheesy lag raha tha.',
        'Tum kya chahte ho ki woh apne baare mein kabhi na bhoolein?',
      ],
    },
  },
  {
    category: 'lost',
    defaultSalutation: {
      en: 'Dearly remembered,',
      bn: 'প্রিয়,',
      hi: 'प्रिय,',
      hinglish: 'Yaad mein,',
    },
    prompts: {
      en: [
        'Tell them about one ordinary thing that happened this week.',
        'What part of their voice or laughter is easiest to remember tonight?',
        'Where do you still look for them out of habit?',
        'What unspoken weight can you set down beside their memory?',
        'Write a quiet lantern note you wish could reach across time.',
      ],
      bn: [
        'এই সপ্তাহে ঘটে যাওয়া একটি খুব সাধারণ ঘটনার কথা তাদের জানাও।',
        'আজ রাতে তাদের কণ্ঠস্বর বা হাসির কোন অংশটা সবচেয়ে স্পষ্ট মনে পড়ছে?',
        'অভ্যাসবশত এখনো কোথায় তাদের খুঁজে ফেরো?',
        'কোন না বলা ভার আজ তাদের স্মৃতির পাশে নামিয়ে রাখতে পারো?',
        'সময়ের ওপারে পৌঁছে দেওয়ার জন্য একটি ছোট আলোর চিঠি লেখো।',
      ],
      hi: [
        'इस हफ़्ते हुई एक बिल्कुल साधारण बात उन्हें बताएं।',
        'आज रात उनकी आवाज़ या हँसी का कौन-सा हिस्सा सबसे साफ़ याद आ रहा है?',
        'आदत के कारण आप आज भी उन्हें कहाँ ढूँढ लेते हैं?',
        'कौन-सा अनकहा बोझ आप उनकी याद के पास रखकर हल्का कर सकते हैं?',
        'समय के पार भेजने के लिए एक शांत चिट्ठी लिखें।',
      ],
      hinglish: [
        'Is hafte hui ek bilkul normal si baat unhe batao.',
        'Aaj raat unki aawaz ya hansi ka kaun-sa hissa sabse saaf yaad aa raha hai?',
        'Aadat ki wajah se tum abhi bhi unhe kahan dhoondh lete ho?',
        'Kaun-sa ankaha bojh tum unki yaad ke paas rakh kar halka ho sakte ho?',
        'Waqt ke paar bhejne ke liye ek shaant si chitthi likho.',
      ],
    },
  },
  {
    category: 'pastSelf',
    defaultSalutation: {
      en: 'Dear younger me,',
      bn: 'প্রিয় ছোটবেলার আমি,',
      hi: 'प्रिय पुराने मैं,',
      hinglish: 'Dear past me,',
    },
    prompts: {
      en: [
        'What were you carrying alone at that age without knowing the word for it?',
        'Which mistake turned out to be protection in disguise?',
        'Sit beside yourself on that difficult evening and say what you needed to hear.',
        'What small joy kept you going back then?',
        'Forgive yourself for not knowing what only time could teach.',
      ],
      bn: [
        'সেই বয়সে নাম না জেনেই কোন ভার তুমি একা বয়ে বেড়াচ্ছিলে?',
        'কোন ভুলটা পরে ছদ্মবেশে তোমার সুরক্ষা হয়ে দাঁড়িয়েছিল?',
        'সেই কঠিন সন্ধ্যায় নিজের পাশে বসে বলো—তখন কী শোনার দরকার ছিল।',
        'তখন কোন ছোট্ট আনন্দ তোমাকে এগিয়ে চলার শক্তি দিত?',
        'যে শিক্ষা কেবল সময়ই দিতে পারত, তা না জানার জন্য নিজেকে ক্ষমা করো।',
      ],
      hi: [
        'उस उम्र में आप बिना नाम जाने कौन-सा बोझ अकेले उठा रहे थे?',
        'कौन-सी गलती बाद में भेष बदलकर आपकी सुरक्षा बन गई?',
        'उस मुश्किल शाम में अपने पास बैठकर वह कहें जो आपको सुनने की ज़रूरत थी।',
        'उस समय किस छोटी-सी खुशी ने आपको चलते रहने की ताकत दी?',
        'जो बात सिर्फ़ वक़्त सिखा सकता था, उसे न जानने के लिए खुद को माफ़ करें।',
      ],
      hinglish: [
        'Us umar mein tum bina naam jaane kaun-sa bojh akele utha rahe the?',
        'Kaun-si galti baad mein tumhari protection ban gayi?',
        'Us mushkil shaam mein apne paas baith kar woh kaho jo sunne ki zaroorat thi.',
        'Tab kis chhoti si khushi ne tumhe chalte rehne ki himmat di?',
        'Jo sirf waqt sikha sakta tha, woh na jaanne ke liye khud ko maaf karo.',
      ],
    },
  },
  {
    category: 'futureSelf',
    defaultSalutation: {
      en: 'Dear future me,',
      bn: 'প্রিয় ভবিষ্যতের আমি,',
      hi: 'प्रिय भविष्य के मैं,',
      hinglish: 'Dear future me,',
    },
    prompts: {
      en: [
        'What feels enormous tonight that you hope looks gentle from a year ahead?',
        'Remind your future self what mattered before everything got busy.',
        'What promise to your own rest do you want to keep?',
        'Describe the exact light in the room where you are writing this.',
        'Ask one tender question to the person you are becoming.',
      ],
      bn: [
        'আজ রাতে যেটা বিশাল মনে হচ্ছে, এক বছর পর সেটা কেমন দেখাবে বলে আশা করো?',
        'সবকিছু ব্যস্ত হয়ে যাওয়ার আগে কোন জিনিসটা সবচেয়ে জরুরি ছিল, মনে করিয়ে দাও।',
        'নিজের বিশ্রামের কাছে কোন প্রতিশ্রুতিটা রাখতে চাও?',
        'যে ঘরে বসে লিখছ, সেখানকার আলোটা ঠিক কেমন তা বর্ণনা করো।',
        'তুমি যে মানুষটা হয়ে উঠছ, তাকে একটি স্নেহভরা প্রশ্ন করো।',
      ],
      hi: [
        'आज रात जो बात बहुत बड़ी लग रही है, एक साल बाद वह कैसी दिखेगी?',
        'सब कुछ व्यस्त होने से पहले क्या मायने रखता था, यह याद दिलाएं।',
        'अपने आराम के लिए आप कौन-सा वादा निभाना चाहते हैं?',
        'जिस कमरे में बैठकर लिख रहे हैं, वहाँ की रोशनी कैसी है?',
        'आप जो इंसान बन रहे हैं, उससे एक कोमल सवाल पूछें।',
      ],
      hinglish: [
        'Aaj raat jo cheez bahut badi lag rahi hai, ek saal baad woh kaisi lagegi?',
        'Sab kuch busy hone se pehle kya zaroori tha, yeh khud ko yaad dilao.',
        'Apne rest ke liye kaun-sa promise nibhana chahte ho?',
        'Jis kamre mein baith kar likh rahe ho, wahan ki roshni kaisi hai?',
        'Tum jo insaan ban rahe ho, usse ek pyaara sa sawal poocho.',
      ],
    },
  },
  {
    category: 'presentSelf',
    defaultSalutation: {
      en: 'Dear me right now,',
      bn: 'প্রিয় এই মুহূর্তের আমি,',
      hi: 'प्रिय अभी के मैं,',
      hinglish: 'Dear me right now,',
    },
    prompts: {
      en: [
        'What are you pretending is fine when it actually feels heavy?',
        'Notice your shoulders, breath, and hands—what are they telling you?',
        'Give yourself credit for one thing you survived quietly today.',
        'If nobody else reads this, what is the truest sentence you can write?',
        'What would make tonight 10% gentler?',
      ],
      bn: [
        'কোনটা আসলে ভারী লাগছে অথচ তুমি ঠিক আছে বলে চালিয়ে দিচ্ছ?',
        'নিজের কাঁধ, শ্বাস আর হাতের দিকে তাকাও—তারা কী বলছে?',
        'আজ নীরবে পার করে আসা একটি কাজের জন্য নিজেকে কৃতিত্ব দাও।',
        'আর কেউ না পড়লে, সবচেয়ে সত্যি কোন বাক্যটা লিখতে পারো?',
        'আজকের রাতটাকে আরেকটু কোমল করতে কী সাহায্য করবে?',
      ],
      hi: [
        'क्या बात असल में भारी लग रही है, जिसे आप ठीक होने का दिखावा कर रहे हैं?',
        'अपने कंधों, सांस और हाथों पर ध्यान दें—वे क्या कह रहे हैं?',
        'आज चुपचाप निभा ली गई एक बात के लिए खुद को श्रेय दें।',
        'अगर कोई और इसे न पढ़े, तो सबसे सच्चा वाक्य क्या होगा?',
        'आज की रात को थोड़ा और कोमल क्या बना सकता है?',
      ],
      hinglish: [
        'Kaun-si baat sach mein bhaari lag rahi hai par tum "sab theek hai" bol rahe ho?',
        'Apne shoulders, saans aur haathon ko notice karo—woh kya keh rahe hain?',
        'Aaj chupchaap survive ki gayi ek cheez ke liye khud ko credit do.',
        'Agar koi aur na padhe, toh sabse sach sentence kya likhoge?',
        'Aaj ki raat ko thoda aur gentle kya bana sakta hai?',
      ],
    },
  },
  {
    category: 'custom',
    defaultSalutation: {
      en: 'Dear …,',
      bn: 'প্রিয় …,',
      hi: 'प्रिय …,',
      hinglish: 'Dear …,',
    },
    prompts: {
      en: [
        'Address a city, a season, a version of home, or someone unnamed.',
        'Begin with what you noticed right before opening this page.',
        'Write without editing—let the first paragraph wander.',
        'What do you need to hand back to the night?',
        'Leave one honest line that does not ask for a reply.',
      ],
      bn: [
        'একটি শহর, একটি ঋতু, ঘরের কোনো স্মৃতি, বা নাম না জানা কাউকে উদ্দেশ্য করে লেখো।',
        'এই পাতা খোলার ঠিক আগে কী লক্ষ্য করলে, তা দিয়ে শুরু করো।',
        'কোনো সম্পাদনা ছাড়াই লেখো—প্রথম অনুচ্ছেদটাকে নিজের মতো চলতে দাও।',
        'রাতের হাতে কী ফিরিয়ে দিয়ে হালকা হতে চাও?',
        'উত্তরের অপেক্ষা না করে একটি সৎ লাইন রেখে যাও।',
      ],
      hi: [
        'किसी शहर, मौसम, घर की याद, या अनजाने नाम को संबोधित करें।',
        'यह पन्ना खोलने से ठीक पहले जो ध्यान में आया, उससे शुरू करें।',
        'बिना काँट-छाँट के लिखें—पहले पैराग्राफ़ को बहने दें।',
        'रात के हवाले क्या सौंपकर आप हल्का महसूस करेंगे?',
        'बिना जवाब की उम्मीद के एक सच्ची पंक्ति छोड़ दें।',
      ],
      hinglish: [
        'Kisi shehar, mausam, ghar ya bina naam wale kisi ko address karo.',
        'Yeh page kholne se theek pehle jo notice kiya, usse shuru karo.',
        'Bina edit kiye likho—pehla paragraph freely behne do.',
        'Raat ke hawale kya chhod kar halka feel karna chahte ho?',
        'Bina reply ki umeed ke ek sach line chhod do.',
      ],
    },
  },
];
