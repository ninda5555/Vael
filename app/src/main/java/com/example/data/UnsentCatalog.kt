package com.example.data

import androidx.compose.ui.graphics.Color
import com.example.model.*

object UnsentCatalog {

    val SUPPORTED_TIMEZONES = listOf(
        "Asia/Kolkata",
        "Asia/Dhaka",
        "UTC",
        "Europe/London",
        "America/New_York",
        "America/Los_Angeles",
        "Asia/Tokyo"
    )

    val PAPER_SPECS: Map<PaperStyleId, PaperVisualSpec> = mapOf(
        PaperStyleId.OLD_PARCHMENT to PaperVisualSpec(
            id = PaperStyleId.OLD_PARCHMENT,
            bg = Color(0xFFF3EEE3), bgSecondary = Color(0xFFE7DFCE),
            ink = Color(0xFF19191B), mutedInk = Color(0xFF59595F),
            accent = Color(0xFFA63A32), border = Color(0x2419191B),
            bgHex = 0xFFF3EEE3.toInt(), bgSecondaryHex = 0xFFE7DFCE.toInt(),
            inkHex = 0xFF19191B.toInt(), mutedInkHex = 0xFF59595F.toInt(), accentHex = 0xFFA63A32.toInt()
        ),
        PaperStyleId.MIDNIGHT_BLUE to PaperVisualSpec(
            id = PaperStyleId.MIDNIGHT_BLUE,
            bg = Color(0xFF161D2B), bgSecondary = Color(0xFF101520),
            ink = Color(0xFFEEF2FA), mutedInk = Color(0xFFA8B3C7),
            accent = Color(0xFFC7D3EA), border = Color(0x2EDCE6F8),
            bgHex = 0xFF161D2B.toInt(), bgSecondaryHex = 0xFF101520.toInt(),
            inkHex = 0xFFEEF2FA.toInt(), mutedInkHex = 0xFFA8B3C7.toInt(), accentHex = 0xFFC7D3EA.toInt()
        ),
        PaperStyleId.ROSE_PETAL to PaperVisualSpec(
            id = PaperStyleId.ROSE_PETAL,
            bg = Color(0xFFF4E8E9), bgSecondary = Color(0xFFEAD9DB),
            ink = Color(0xFF25181A), mutedInk = Color(0xFF6A4E52),
            accent = Color(0xFFA63A32), border = Color(0x296E323A),
            bgHex = 0xFFF4E8E9.toInt(), bgSecondaryHex = 0xFFEAD9DB.toInt(),
            inkHex = 0xFF25181A.toInt(), mutedInkHex = 0xFF6A4E52.toInt(), accentHex = 0xFFA63A32.toInt()
        ),
        PaperStyleId.RAIN_GLASS to PaperVisualSpec(
            id = PaperStyleId.RAIN_GLASS,
            bg = Color(0xFFE4E9EE), bgSecondary = Color(0xFFD6DEE6),
            ink = Color(0xFF1A222B), mutedInk = Color(0xFF4F5C6A),
            accent = Color(0xFF2B3A4A), border = Color(0x291A222B),
            bgHex = 0xFFE4E9EE.toInt(), bgSecondaryHex = 0xFFD6DEE6.toInt(),
            inkHex = 0xFF1A222B.toInt(), mutedInkHex = 0xFF4F5C6A.toInt(), accentHex = 0xFF2B3A4A.toInt()
        ),
        PaperStyleId.TORN_NOTEBOOK to PaperVisualSpec(
            id = PaperStyleId.TORN_NOTEBOOK,
            bg = Color(0xFFFFFFFF), bgSecondary = Color(0xFFF3F3F5),
            ink = Color(0xFF19191B), mutedInk = Color(0xFF59595F),
            accent = Color(0xFF19191B), border = Color(0xFFDADADD),
            bgHex = 0xFFFFFFFF.toInt(), bgSecondaryHex = 0xFFF3F3F5.toInt(),
            inkHex = 0xFF19191B.toInt(), mutedInkHex = 0xFF59595F.toInt(), accentHex = 0xFF19191B.toInt()
        ),
        PaperStyleId.MOONLIT_INK to PaperVisualSpec(
            id = PaperStyleId.MOONLIT_INK,
            bg = Color(0xFF1D1F20), bgSecondary = Color(0xFF151617),
            ink = Color(0xFFF3F1EC), mutedInk = Color(0xFFB3B4B1),
            accent = Color(0xFFA63A32), border = Color(0xFF363839),
            bgHex = 0xFF1D1F20.toInt(), bgSecondaryHex = 0xFF151617.toInt(),
            inkHex = 0xFFF3F1EC.toInt(), mutedInkHex = 0xFFB3B4B1.toInt(), accentHex = 0xFFA63A32.toInt()
        )
    )

    fun paperSpec(id: PaperStyleId): PaperVisualSpec =
        PAPER_SPECS[id] ?: PAPER_SPECS.getValue(PaperStyleId.OLD_PARCHMENT)

    fun paperName(id: PaperStyleId, lang: AppLanguage): String = when (id) {
        PaperStyleId.OLD_PARCHMENT -> LocalizedText("Old Parchment", "পুরোনো পার্চমেন্ট", "पुराना चर्मपत्र", "Old Parchment").get(lang)
        PaperStyleId.MIDNIGHT_BLUE -> LocalizedText("Midnight Blue", "মধ্যরাতের নীল", "मिडनाइट ब्लू", "Midnight Blue").get(lang)
        PaperStyleId.ROSE_PETAL -> LocalizedText("Rose Petal", "গোলাপ পাপড়ি", "गुलाब पंखुड़ी", "Rose Petal").get(lang)
        PaperStyleId.RAIN_GLASS -> LocalizedText("Rain Glass", "বৃষ্টির কাঁচ", "बारिश का काँच", "Rain Glass").get(lang)
        PaperStyleId.TORN_NOTEBOOK -> LocalizedText("Torn Notebook", "ছেঁড়া খাতা", "फटी कॉपी", "Torn Notebook").get(lang)
        PaperStyleId.MOONLIT_INK -> LocalizedText("Moonlit Ink", "জ্যোৎস্না কালি", "चाँदनी स्याही", "Moonlit Ink").get(lang)
    }

    fun recipientLabel(cat: RecipientCategory, lang: AppLanguage): String = when (cat) {
        RecipientCategory.EX -> LocalizedText("An Ex", "প্রাক্তন", "पूर्व साथी", "An Ex").get(lang)
        RecipientCategory.MOTHER -> LocalizedText("Mother", "মা", "माँ", "Ma").get(lang)
        RecipientCategory.FATHER -> LocalizedText("Father", "বাবা", "पापा", "Baba").get(lang)
        RecipientCategory.FRIEND -> LocalizedText("A Friend", "বন্ধু", "दोस्त", "Dost").get(lang)
        RecipientCategory.LOST -> LocalizedText("Someone Lost", "হারিয়ে যাওয়া কেউ", "खोया हुआ कोई", "Someone Lost").get(lang)
        RecipientCategory.PAST_SELF -> LocalizedText("Past Self", "অতীতের আমি", "पुराना मैं", "Past Me").get(lang)
        RecipientCategory.FUTURE_SELF -> LocalizedText("Future Self", "ভবিষ্যতের আমি", "भविष्य का मैं", "Future Me").get(lang)
        RecipientCategory.PRESENT_SELF -> LocalizedText("Present Self", "এই মুহূর্তের আমি", "अभी का मैं", "Me Right Now").get(lang)
        RecipientCategory.CUSTOM -> LocalizedText("Custom", "নিজস্ব", "अपना नाम", "Custom").get(lang)
    }

    fun defaultSalutation(cat: RecipientCategory, lang: AppLanguage): String = when (cat) {
        RecipientCategory.EX -> LocalizedText("Dear you,", "প্রিয়,", "प्रिय,", "Dear,").get(lang)
        RecipientCategory.MOTHER -> LocalizedText("Dear Ma,", "প্রিয় মা,", "प्रिय माँ,", "Dear Ma,").get(lang)
        RecipientCategory.FATHER -> LocalizedText("Dear Baba,", "প্রিয় বাবা,", "प्रिय पापा,", "Dear Baba,").get(lang)
        RecipientCategory.FRIEND -> LocalizedText("Dear friend,", "প্রিয় বন্ধু,", "प्रिय दोस्त,", "Dear dost,").get(lang)
        RecipientCategory.LOST -> LocalizedText("Dearly remembered,", "প্রিয়,", "प्रिय,", "Yaad mein,").get(lang)
        RecipientCategory.PAST_SELF -> LocalizedText("Dear younger me,", "প্রিয় ছোটবেলার আমি,", "प्रिय पुराने मैं,", "Dear past me,").get(lang)
        RecipientCategory.FUTURE_SELF -> LocalizedText("Dear future me,", "প্রিয় ভবিষ্যতের আমি,", "प्रिय भविष्य के मैं,", "Dear future me,").get(lang)
        RecipientCategory.PRESENT_SELF -> LocalizedText("Dear me right now,", "প্রিয় এই মুহূর্তের আমি,", "प्रिय अभी के मैं,", "Dear me right now,").get(lang)
        RecipientCategory.CUSTOM -> LocalizedText("Dear …,", "প্রিয় …,", "प्रिय …,", "Dear …,").get(lang)
    }

    fun recipientPrompts(cat: RecipientCategory, lang: AppLanguage): List<String> = when (cat) {
        RecipientCategory.EX -> listOf(
            LocalizedText("What stayed unfinished in the last room you shared?", "শেষবার একসাথে থাকা ঘরটাতে কোন কথাটা অসম্পূর্ণ রয়ে গিয়েছিল?", "आख़िरी बार साथ बिताए कमरे में कौन-सी बात अधूरी रह गई थी?", "Last time saath rehne ke baad kaun-si baat adhoori reh gayi thi?"),
            LocalizedText("If you could return one small memory without asking for anything back, which one is it?", "কিছু ফেরত না চেয়ে যদি একটি ছোট স্মৃতি ফিরিয়ে দিতে পারতে, কোনটি দিতে?", "बिना कुछ वापस मांगे अगर एक छोटी याद लौटानी हो, तो वह कौन-सी होगी?", "Bina kuch wapas maange agar ek chhoti yaad lautani ho, toh kaun-si hogi?"),
            LocalizedText("Write the sentence you rehearsed on the train home and never sent.", "বাড়ি ফেরার পথে মনে মনে যে লাইনটা ভেবেছিলে, কিন্তু পাঠাওনি—সেটা লেখো।", "घर लौटते समय मन में जो पंक्ति दोहराई थी पर भेजी नहीं, वह लिखें।", "Ghar laut-te waqt jo line mann mein sochi par bheji nahi, woh likho."),
            LocalizedText("What kind of peace do you wish for both of you now?", "এখন দুজনের জন্য কোন ধরনের শান্তি চাও?", "अब आप दोनों के लिए किस तरह के सुकून की कामना करते हैं?", "Ab tum dono ke liye kis tarah ka sukoon chahte ho?")
        )
        RecipientCategory.MOTHER -> listOf(
            LocalizedText("What ordinary sound in the kitchen still reminds you of her?", "রান্নাঘরের কোন সাধারণ শব্দ এখনো মায়ের কথা মনে করিয়ে দেয়?", "रसोई की कौन-सी आम आवाज़ आज भी माँ की याद दिलाती है?", "Kitchen ki kaun-si roz ki aawaz abhi bhi Ma ki yaad dilati hai?"),
            LocalizedText("What truth feels easier to put on paper than say across the table?", "মুখোমুখি বসে বলার চেয়ে কাগজে লেখা সহজ—এমন কোন সত্য আছে?", "आमने-सामने कहने से ज़्यादा कागज़ पर लिखना किस सच के लिए आसान है?", "Table ke saamne bolne se zyada paper pe likhna kaun-sa sach aasan hai?"),
            LocalizedText("Thank her for one unseen effort she never called a sacrifice.", "মায়ের এমন একটি নীরব পরিশ্রমের জন্য ধন্যবাদ দাও, যা তিনি কখনো বলেননি।", "उनकी एक अनकही मेहनत का शुक्रिया अदा करें जिसे उन्होंने कभी जताया नहीं।", "Unki ek aisi mehnat ke liye thank you likho jo unhone kabhi jatayi nahi.")
        )
        RecipientCategory.FATHER -> listOf(
            LocalizedText("What did his silence try to protect you from?", "বাবার নীরবতা তোমাকে কী থেকে আগলে রাখতে চেয়েছিল?", "उनकी ख़ामोशी आपको किस बात से बचाना चाहती थी?", "Unki khamoshi tumhe kis cheez se bachana chahti thi?"),
            LocalizedText("What question about his younger days have you been too shy to ask?", "বাবার তরুণ বয়সের কোন প্রশ্নটা লজ্জায় কখনো জিজ্ঞাসা করা হয়নি?", "उनकी जवानी के दिनों का कौन-सा सवाल पूछने में आपको झिझक हुई?", "Unki jawani ke dino ka kaun-sa sawal poochne mein hichkichahat hui?"),
            LocalizedText("Name one thing he taught you just by doing it every morning.", "প্রতিদিন সকালে করে দেখিয়ে বাবা তোমাকে কী শিখিয়েছেন?", "हर सुबह सिर्फ़ अपने काम से उन्होंने आपको कौन-सी एक सीख दी?", "Roz subah bas karke dikhane se unhone tumhe kya sikhaya?")
        )
        RecipientCategory.FRIEND -> listOf(
            LocalizedText("Which late-night conversation changed how you saw yourself?", "কোন গভীর রাতের আড্ডা নিজেকে দেখার চোখ বদলে দিয়েছিল?", "किस देर रात की बातचीत ने खुद को देखने का आपका नज़रिया बदला?", "Kaun-si late-night baat ne tumhara khud ko dekhne ka nazariya badla?"),
            LocalizedText("Write the appreciation you thought sounded too cheesy to text.", "মেসেজে লিখতে সংকোচ হতো বলে যে প্রশংসাটা করা হয়নি, আজ লেখো।", "वह तारीफ़ लिखें जो मैसेज में भेजने में थोड़ी फ़िल्मी लग रही थी।", "Woh appreciation likho jo text karne mein thoda cheesy lag raha tha."),
            LocalizedText("What do you hope they never forget about who they are?", "নিজের সম্পর্কে কোন সত্যটা তারা কখনো না ভুলুক বলে চাও?", "आप क्या चाहते हैं कि वे अपने बारे में कभी न भूलें?", "Tum kya chahte ho ki woh apne baare mein kabhi na bhoolein?")
        )
        RecipientCategory.LOST -> listOf(
            LocalizedText("Tell them about one ordinary thing that happened this week.", "এই সপ্তাহে ঘটে যাওয়া একটি খুব সাধারণ ঘটনার কথা তাদের জানাও।", "इस हफ़्ते हुई एक बिल्कुल साधारण बात उन्हें बताएं।", "Is hafte hui ek bilkul normal si baat unhe batao."),
            LocalizedText("What part of their voice or laughter is easiest to remember tonight?", "আজ রাতে তাদের কণ্ঠস্বর বা হাসির কোন অংশটা সবচেয়ে স্পষ্ট মনে পড়ছে?", "आज रात उनकी आवाज़ या हँसी का कौन-सा हिस्सा सबसे साफ़ याद आ रहा है?", "Aaj raat unki aawaz ya hansi ka kaun-sa hissa sabse saaf yaad aa raha hai?"),
            LocalizedText("Write a quiet lantern note you wish could reach across time.", "সময়ের ওপারে পৌঁছে দেওয়ার জন্য একটি ছোট আলোর চিঠি লেখো।", "समय के पार भेजने के लिए एक शांत चिट्ठी लिखें।", "Waqt ke paar bhejne ke liye ek shaant si chitthi likho.")
        )
        RecipientCategory.PAST_SELF -> listOf(
            LocalizedText("What were you carrying alone at that age without knowing the word for it?", "সেই বয়সে নাম না জেনেই কোন ভার তুমি একা বয়ে বেড়াচ্ছিলে?", "उस उम्र में आप बिना नाम जाने कौन-सा बोझ अकेले उठा रहे थे?", "Us umar mein tum bina naam jaane kaun-sa bojh akele utha rahe the?"),
            LocalizedText("Which mistake turned out to be protection in disguise?", "কোন ভুলটা পরে ছদ্মবেশে তোমার সুরক্ষা হয়ে দাঁড়িয়েছিল?", "कौन-सी गलती बाद में भेष बदलकर आपकी सुरक्षा बन गई?", "Kaun-si galti baad mein tumhari protection ban gayi?"),
            LocalizedText("Forgive yourself for not knowing what only time could teach.", "যে শিক্ষা কেবল সময়ই দিতে পারত, তা না জানার জন্য নিজেকে ক্ষমা করো।", "जो बात सिर्फ़ वक़्त सिखा सकता था, उसे न जानने के लिए खुद को माफ़ करें।", "Jo sirf waqt sikha sakta tha, woh na jaanne ke liye khud ko maaf karo.")
        )
        RecipientCategory.FUTURE_SELF -> listOf(
            LocalizedText("What feels enormous tonight that you hope looks gentle from a year ahead?", "আজ রাতে যেটা বিশাল মনে হচ্ছে, এক বছর পর সেটা কেমন দেখাবে বলে আশা করো?", "आज रात जो बात बहुत बड़ी लग रही है, एक साल बाद वह कैसी दिखेगी?", "Aaj raat jo cheez bahut badi lag rahi hai, ek saal baad woh kaisi lagegi?"),
            LocalizedText("Remind your future self what mattered before everything got busy.", "সবকিছু ব্যস্ত হয়ে যাওয়ার আগে কোন জিনিসটা সবচেয়ে জরুরি ছিল, মনে করিয়ে দাও।", "सब कुछ व्यस्त होने से पहले क्या मायने रखता था, यह याद दिलाएं।", "Sab kuch busy hone se pehle kya zaroori tha, yeh khud ko yaad dilao."),
            LocalizedText("Describe the exact light in the room where you are writing this.", "যে ঘরে বসে লিখছ, সেখানকার আলোটা ঠিক কেমন তা বর্ণনা করো।", "जिस कमरे में बैठकर लिख रहे हैं, वहाँ की रोशनी कैसी है?", "Jis kamre mein baith kar likh rahe ho, wahan ki roshni kaisi hai?")
        )
        RecipientCategory.PRESENT_SELF -> listOf(
            LocalizedText("What are you pretending is fine when it actually feels heavy?", "কোনটা আসলে ভারী লাগছে অথচ তুমি ঠিক আছে বলে চালিয়ে দিচ্ছ?", "क्या बात असल में भारी लग रही है, जिसे आप ठीक होने का दिखावा कर रहे हैं?", "Kaun-si baat sach mein bhaari lag rahi hai par tum sab theek hai bol rahe ho?"),
            LocalizedText("Give yourself credit for one thing you survived quietly today.", "আজ নীরবে পার করে আসা একটি কাজের জন্য নিজেকে কৃতিত্ব দাও।", "आज चुपचाप निभा ली गई एक बात के लिए खुद को श्रेय दें।", "Aaj chupchaap survive ki gayi ek cheez ke liye khud ko credit do."),
            LocalizedText("If nobody else reads this, what is the truest sentence you can write?", "আর কেউ না পড়লে, সবচেয়ে সত্যি কোন বাক্যটা লিখতে পারো?", "अगर कोई और इसे न पढ़े, तो सबसे सच्चा वाक्य क्या होगा?", "Agar koi aur na padhe, toh sabse sach sentence kya likhoge?")
        )
        RecipientCategory.CUSTOM -> listOf(
            LocalizedText("Address a city, a season, a version of home, or someone unnamed.", "একটি শহর, একটি ঋতু, ঘরের কোনো স্মৃতি, বা নাম না জানা কাউকে উদ্দেশ্য করে লেখো।", "किसी शहर, मौसम, घर की याद, या अनजाने नाम को संबोधित करें।", "Kisi shehar, mausam, ghar ya bina naam wale kisi ko address karo."),
            LocalizedText("Write without editing—let the first paragraph wander.", "কোনো সম্পাদনা ছাড়াই লেখো—প্রথম অনুচ্ছেদটাকে নিজের মতো চলতে দাও।", "बिना काँट-छाँट के लिखें—पहले पैराग्राफ़ को बहने दें।", "Bina edit kiye likho—pehla paragraph freely behne do."),
            LocalizedText("Leave one honest line that does not ask for a reply.", "উত্তরের অপেক্ষা না করে একটি সৎ লাইন রেখে যাও।", "बिना जवाब की उम्मीद के एक सच्ची पंक्ति छोड़ दें।", "Bina reply ki umeed ke ek sach line chhod do.")
        )
    }.map { it.get(lang) }

    val ZODIAC_SIGNS: List<ZodiacSignDef> = listOf(
        ZodiacSignDef(
            id = SignId.ARIES, glyph = "♈", elementKind = ElementKind.FIRE,
            westernName = LocalizedText("Aries", "মেষ (Aries)", "मेष (Aries)", "Aries"),
            rashiName = LocalizedText("Mesha", "মেষ", "मेष", "Mesha"),
            element = LocalizedText("Fire", "অগ্নি", "अग्नि", "Fire"),
            modality = LocalizedText("Cardinal", "চর", "चर", "Cardinal"),
            vedicRuler = LocalizedText("Mars", "মঙ্গল", "मंगल", "Mars (Mangal)"),
            prompts = listOf(
                SignPromptItem("aries-1", "startingAgain",
                    LocalizedText("What would you begin if the first attempt could be small?", "প্রথম চেষ্টাটা খুব ছোট হলেও ক্ষতি নেই জানলে আজ কী শুরু করতে?", "अगर पहली कोशिश बहुत छोटी हो सकती, तो आज आप क्या शुरू करते?", "Agar pehli koshish chhoti ho sakti, toh aaj kya shuru karte?"),
                    LocalizedText("Write the first sentence of something you have delayed.", "অনেক দিন ধরে পিছিয়ে রাখা কোনো কাজের প্রথম বাক্যটা লেখো।", "जिस बात को आप टाल रहे थे, उसका पहला वाक्य लिखें।", "Jo baat tum taal rahe the, uska pehla sentence likho.")),
                SignPromptItem("aries-2", "rest",
                    LocalizedText("What battle can you step away from tonight without losing yourself?", "আজ রাতে কোন লড়াইটা ছেড়ে দিলে তোমার নিজের কিছু কমবে না?", "आज रात आप किस लड़ाई से बिना खुद को खोए पीछे हट सकते हैं?", "Aaj raat kis ladai se bina haare peeche hat sakte ho?"),
                    LocalizedText("Name one task that can wait until morning.", "একটি কাজের নাম লেখো যা সকাল পর্যন্ত অপেক্ষা করতে পারে।", "एक ऐसे काम का नाम लिखें जो सुबह तक इंतज़ार कर सकता है।", "Ek aise kaam ka naam likho jo subah tak wait kar sakta hai.")),
                SignPromptItem("aries-3", "boundaries",
                    LocalizedText("Where did you say yes too fast when your body meant pause?", "শরীর একটু থামতে চাইলেও কোথায় তুমি খুব তাড়াতাড়ি হ্যাঁ বলে ফেলেছ?", "कहाँ आपने बहुत जल्दी हाँ कह दिया, जबकि आपका मन रुकना चाहता था?", "Kahan tumne jaldi haan bol diya jabki mann rukna chahta tha?"),
                    LocalizedText("Draft a gentle, clear \"not tonight\" line for yourself.", "নিজের জন্য একটি নরম কিন্তু স্পষ্ট \"আজ রাতে নয়\" লাইন লেখো।", "अपने लिए एक नरम लेकिन साफ़ \"आज रात नहीं\" वाक्य लिखें।", "Apne liye ek soft par clear \"aaj raat nahi\" line likho."))
            )
        ),
        ZodiacSignDef(
            id = SignId.TAURUS, glyph = "♉", elementKind = ElementKind.EARTH,
            westernName = LocalizedText("Taurus", "বৃষ (Taurus)", "वृषभ (Taurus)", "Taurus"),
            rashiName = LocalizedText("Vrishabha", "বৃষ", "वृषभ", "Vrishabha"),
            element = LocalizedText("Earth", "পৃথিবী", "पृथ्वी", "Earth"),
            modality = LocalizedText("Fixed", "স্থির", "स्थिर", "Fixed"),
            vedicRuler = LocalizedText("Venus", "শুক্র", "शुक्र", "Venus (Shukra)"),
            prompts = listOf(
                SignPromptItem("taurus-1", "comfort",
                    LocalizedText("Which ordinary comfort would you miss tomorrow?", "কোন সাধারণ আরামটা কাল না থাকলে খুব মনে পড়বে?", "कौन-सा साधारण सुकून कल न हो, तो आपको बहुत याद आएगा?", "Kaun-sa simple comfort kal na ho toh bahut miss karoge?"),
                    LocalizedText("Describe one thing near you by touch, smell, and color.", "পাশে থাকা একটি জিনিসকে স্পর্শ, গন্ধ আর রঙ দিয়ে বর্ণনা করো।", "अपने पास की एक चीज़ को स्पर्श, गंध और रंग से लिखें।", "Paas rakhi ek cheez ko touch, smell aur color se describe karo.")),
                SignPromptItem("taurus-2", "friendship",
                    LocalizedText("Who makes silence feel comfortable instead of awkward?", "কার পাশে বসে চুপ করে থাকলেও কোনো আড়ষ্টতা লাগে না?", "किसके साथ चुप रहना भी अजीब नहीं, बल्कि सुकून भरा लगता है?", "Kiske saath chup rehna bhi awkward nahi, comfortable lagta hai?"),
                    LocalizedText("Recall one quiet meal or walk you shared.", "একসাথে কাটানো একটি শান্ত হাঁটা বা খাওয়ার কথা মনে করো।", "साथ बिताए एक शांत खाने या टहलने की याद लिखें।", "Saath bitaye ek shaant chai ya walk ki yaad likho.")),
                SignPromptItem("taurus-3", "creativity",
                    LocalizedText("What grows slowly in your life right now that still deserves patience?", "তোমার জীবনে এখন কোন জিনিসটা ধীরে বাড়ছে তবুও ধৈর্যের যোগ্য?", "आपके जीवन में अभी क्या धीरे-धीरे बढ़ रहा है जो धैर्य के लायक है?", "Tumhari life mein abhi kya dheere grow ho raha hai jo patience deserve karta hai?"),
                    LocalizedText("Write one grounded paragraph without rushing the ending.", "শেষ করার তাড়া ছাড়াই একটি স্থির অনুচ্ছেদ লেখো।", "अंत की जल्दी किए बिना एक ठहरा हुआ पैराग्राफ़ लिखें।", "End karne ki jaldi ke bina ek grounded paragraph likho."))
            )
        ),
        ZodiacSignDef(
            id = SignId.GEMINI, glyph = "♊", elementKind = ElementKind.AIR,
            westernName = LocalizedText("Gemini", "মিথুন (Gemini)", "मिथुन (Gemini)", "Gemini"),
            rashiName = LocalizedText("Mithuna", "মিথুন", "मिथुन", "Mithuna"),
            element = LocalizedText("Air", "বায়ু", "वायु", "Air"),
            modality = LocalizedText("Mutable", "দ্ব্যাত্মক", "द्विस्वभाव", "Mutable"),
            vedicRuler = LocalizedText("Mercury", "বুধ", "बुध", "Mercury (Budh)"),
            prompts = listOf(
                SignPromptItem("gemini-1", "curiosity",
                    LocalizedText("What are the two honest sides of this thought?", "এই ভাবনাটার দুটি সৎ দিক কী কী?", "इस विचार के दो सच्चे पहलू क्या हैं?", "Is khayal ke do sachche sides kya hain?"),
                    LocalizedText("Write a line for each side and give them both room.", "প্রতিটি দিকের জন্য একটি করে লাইন লেখো এবং দুটোকেই জায়গা দাও।", "हर पहलू के लिए एक पंक्ति लिखें और दोनों को जगह दें।", "Dono sides ke liye ek-ek line likho aur dono ko jagah do.")),
                SignPromptItem("gemini-2", "rest",
                    LocalizedText("Which open tab in your mind can close for the night?", "মনের ভেতর খোলা থাকা কোন চিন্তাটা আজ রাতের মতো বন্ধ করা যায়?", "मन में खुला कौन-सा विचार आज रात के लिए बंद किया जा सकता है?", "Dimag mein khula kaun-sa tab aaj raat ke liye band kar sakte ho?"),
                    LocalizedText("Park the worry in one sentence so your mind can sleep.", "চিন্তাটাকে এক বাক্যে এখানে রেখে মনকে একটু বিশ্রাম দাও।", "चिंता को एक वाक्य में यहाँ रखकर मन को आराम दें।", "Tension ko ek sentence mein yahan park karke mind ko rest do."))
            )
        ),
        ZodiacSignDef(
            id = SignId.CANCER, glyph = "♋", elementKind = ElementKind.WATER,
            westernName = LocalizedText("Cancer", "কর্কট (Cancer)", "कर्क (Cancer)", "Cancer"),
            rashiName = LocalizedText("Karka", "কর্কট", "कर्क", "Karka"),
            element = LocalizedText("Water", "জল", "जल", "Water"),
            modality = LocalizedText("Cardinal", "চর", "चर", "Cardinal"),
            vedicRuler = LocalizedText("Moon", "চন্দ্র", "चंद्र", "Moon (Chandra)"),
            prompts = listOf(
                SignPromptItem("cancer-1", "gratitude",
                    LocalizedText("Who or what makes a place feel like home?", "কে বা কী একটি জায়গাকে ঘরের মতো অনুভূতি দেয়?", "कौन या क्या किसी जगह को घर जैसा महसूस कराता है?", "Kaun ya kya kisi jagah ko ghar jaisa feel karata hai?"),
                    LocalizedText("Start a private thank-you with one specific memory.", "একটি নির্দিষ্ট স্মৃতি দিয়ে মনে মনে ধন্যবাদ লেখা শুরু করো।", "एक ख़ास याद के साथ निजी धन्यवाद लिखना शुरू करें।", "Ek specific memory ke saath private thank-you likhna shuru karo.")),
                SignPromptItem("cancer-2", "rest",
                    LocalizedText("Whose feelings have you been carrying that were never yours to hold?", "অন্য কার মন খারাপ তুমি নিজের কাঁধে বয়ে বেড়াচ্ছ?", "आप किसकी भावनाओं का बोझ उठा रहे हैं जो आपका नहीं था?", "Tum kiski feelings ka bojh utha rahe ho jo tumhara tha hi nahi?"),
                    LocalizedText("Write one line returning responsibility gently.", "নরমভাবে সেই ভার ফিরিয়ে দেওয়ার একটি লাইন লেখো।", "नरमी से वह बोझ लौटाने की एक पंक्ति लिखें।", "Pyaar se woh bojh wapas dene ki ek line likho."))
            )
        ),
        ZodiacSignDef(
            id = SignId.LEO, glyph = "♌", elementKind = ElementKind.FIRE,
            westernName = LocalizedText("Leo", "সিংহ (Leo)", "सिंह (Leo)", "Leo"),
            rashiName = LocalizedText("Simha", "সিংহ", "सिंह", "Simha"),
            element = LocalizedText("Fire", "অগ্নি", "अग्नि", "Fire"),
            modality = LocalizedText("Fixed", "স্থির", "स्थिर", "Fixed"),
            vedicRuler = LocalizedText("Sun", "সূর্য", "सूर्य", "Sun (Surya)"),
            prompts = listOf(
                SignPromptItem("leo-1", "gratitude",
                    LocalizedText("When did you do something brave without an audience?", "কোনো দর্শক ছাড়াই কবে তুমি একটা সাহসী কাজ করেছিলে?", "बिना किसी दर्शक के आपने कब कोई साहसी काम किया था?", "Bina kisi audience ke tumne kab koi brave kaam kiya tha?"),
                    LocalizedText("Give that moment a title you would keep.", "সেই মুহূর্তটার একটা নাম দাও যা তুমি যত্ন করে রাখবে।", "उस पल को एक ऐसा शीर्षक दें जिसे आप सहेज सकें।", "Us moment ko ek aisa title do jo tum sambhal kar rakho.")),
                SignPromptItem("leo-2", "rest",
                    LocalizedText("Where are you tired of looking strong for everyone else?", "সবার সামনে শক্ত থাকার অভিনয় করতে করতে কোথায় আজ ক্লান্ত লাগছে?", "सबके सामने मज़बूत दिखते-दिखते आप कहाँ थक गए हैं?", "Sabke saamne strong dikhte-dikhte kahan thak gaye ho?"),
                    LocalizedText("Let this page hold the tired truth.", "এই পাতায় ক্লান্ত সত্যটুকু নামিয়ে রাখো।", "इस पन्ने पर अपनी थकान का सच रख दें।", "Is page par apni thakaan ka sach rakh do."))
            )
        ),
        ZodiacSignDef(
            id = SignId.VIRGO, glyph = "♍", elementKind = ElementKind.EARTH,
            westernName = LocalizedText("Virgo", "কন্যা (Virgo)", "कन्या (Virgo)", "Virgo"),
            rashiName = LocalizedText("Kanya", "কন্যা", "कन्या", "Kanya"),
            element = LocalizedText("Earth", "পৃথিবী", "पृथ्वी", "Earth"),
            modality = LocalizedText("Mutable", "দ্ব্যাত্মক", "द्विस्वभाव", "Mutable"),
            vedicRuler = LocalizedText("Mercury", "বুধ", "बुध", "Mercury (Budh)"),
            prompts = listOf(
                SignPromptItem("virgo-1", "curiosity",
                    LocalizedText("Which detail tells the real story of your day?", "কোন ছোট্ট খুঁটিনাটি আজকের দিনের আসল গল্পটা বলে দেয়?", "कौन-सी छोटी बारीकी आपके दिन की असली कहानी कहती है?", "Kaun-si chhoti detail tumhare din ki asli kahani kehti hai?"),
                    LocalizedText("Write three observations. Circle the one you want to remember.", "তিনটি পর্যবেক্ষণ লেখো। যেটি মনে রাখতে চাও সেটি চিহ্নিত করো।", "तीन बारीक बातें लिखें। जिसे याद रखना है उसे चुनें।", "Teen observations likho. Jo yaad rakhna hai usse mark karo.")),
                SignPromptItem("virgo-2", "rest",
                    LocalizedText("What flaw did you magnify today that would soften in kinder light?", "কোন ছোট ত্রুটিটা আজ বড় করে দেখেছ যা একটু স্নেহের আলোয় মিলিয়ে যেত?", "आज आपने किस कमी को बड़ा मान लिया जो नरम रोशनी में छोटी दिखती?", "Aaj kis chhoti kami ko bada bana diya jo thode pyaar se halka lagta?"),
                    LocalizedText("Write one forgiving sentence to yourself.", "নিজের উদ্দেশ্যে একটি ক্ষমাশীল বাক্য লেখো।", "अपने लिए एक माफ़ करने वाला वाक्य लिखें।", "Apne liye ek forgiving sentence likho."))
            )
        ),
        ZodiacSignDef(
            id = SignId.LIBRA, glyph = "♎", elementKind = ElementKind.AIR,
            westernName = LocalizedText("Libra", "তুলা (Libra)", "तुला (Libra)", "Libra"),
            rashiName = LocalizedText("Tula", "তুলা", "तुला", "Tula"),
            element = LocalizedText("Air", "বায়ু", "वायु", "Air"),
            modality = LocalizedText("Cardinal", "চর", "चर", "Cardinal"),
            vedicRuler = LocalizedText("Venus", "শুক্র", "शुक्र", "Venus (Shukra)"),
            prompts = listOf(
                SignPromptItem("libra-1", "boundaries",
                    LocalizedText("Where have you kept the peace on the outside while feeling tilted inside?", "বাইরে শান্তি বজায় রাখতে গিয়ে ভেতরে কোথায় ভারসাম্য হারিয়েছ?", "बाहर शांति बनाए रखने के चक्कर में अंदर से आप कहाँ असंतुलित हैं?", "Bahar peace rakhne ke chakkar mein andar kahan imbalance feel ho raha hai?"),
                    LocalizedText("Write what an honest balance would look like tonight.", "আজ রাতে সত্যিকারের ভারসাম্য কেমন হতো তা লেখো।", "आज रात सच्चा संतुलन कैसा दिखेगा, यह लिखें।", "Aaj raat real balance kaisa dikhega, woh likho.")),
                SignPromptItem("libra-2", "creativity",
                    LocalizedText("What small piece of beauty steadied your eyes today?", "আজ কোন ছোট্ট সৌন্দর্য তোমার চোখকে একটু শান্তি দিল?", "आज किस छोटी-सी सुंदरता ने आपकी आँखों को सुकून दिया?", "Aaj kis chhoti khoobsurti ne tumhari aankhon ko sukoon diya?"),
                    LocalizedText("Capture it in two quiet lines.", "দুটি শান্ত লাইনে সেটি ধরে রাখো।", "इसे दो शांत पंक्तियों में सहेजें।", "Isse do quiet lines mein capture karo."))
            )
        ),
        ZodiacSignDef(
            id = SignId.SCORPIO, glyph = "♏", elementKind = ElementKind.WATER,
            westernName = LocalizedText("Scorpio", "বৃশ্চিক (Scorpio)", "वृश्चिक (Scorpio)", "Scorpio"),
            rashiName = LocalizedText("Vrishchika", "বৃশ্চিক", "वृश्चिक", "Vrishchika"),
            element = LocalizedText("Water", "জল", "जल", "Water"),
            modality = LocalizedText("Fixed", "স্থির", "स्थिर", "Fixed"),
            vedicRuler = LocalizedText("Mars", "মঙ্গল", "मंगल", "Mars (Mangal)"),
            prompts = listOf(
                SignPromptItem("scorpio-1", "startingAgain",
                    LocalizedText("What old skin are you ready to lay down quietly without drama?", "কোন পুরোনো অভ্যাস বা ভার কোনো নাটক ছাড়াই আজ নীরবে নামিয়ে রাখতে চাও?", "किस पुराने बोझ को आप बिना शोर के चुपचाप उतारना चाहते हैं?", "Kis purane bojh ko bina drama ke chupchaap chhodna chahte ho?"),
                    LocalizedText("Name it plainly, then let the page hold it.", "স্পষ্ট করে নাম লেখো, আর পাতাটাকে তা ধারণ করতে দাও।", "इसका साफ़ नाम लिखें और पन्ने को इसे थामने दें।", "Seedha naam likho aur page ko usse hold karne do.")),
                SignPromptItem("scorpio-2", "curiosity",
                    LocalizedText("What truth sits quietly beneath the surface of your week?", "এই সপ্তাহের চাপা স্রোতের নিচে কোন নীরব সত্য লুকিয়ে আছে?", "इस हफ़्ते की सतह के नीचे कौन-सा शांत सच छिपा है?", "Is hafte ki surface ke neeche kaun-sa quiet sach chhupa hai?"),
                    LocalizedText("Write one sentence nobody else needs to understand.", "এমন একটি বাক্য লেখো যা আর কারো বোঝার দরকার নেই।", "एक ऐसा वाक्य लिखें जिसे किसी और को समझने की ज़रूरत न हो।", "Ek line likho jo kisi aur ko samajhne ki zaroorat nahi."))
            )
        ),
        ZodiacSignDef(
            id = SignId.SAGITTARIUS, glyph = "♐", elementKind = ElementKind.FIRE,
            westernName = LocalizedText("Sagittarius", "ধনু (Sagittarius)", "धनु (Sagittarius)", "Sagittarius"),
            rashiName = LocalizedText("Dhanu", "ধনু", "धनु", "Dhanu"),
            element = LocalizedText("Fire", "অগ্নি", "अग्नि", "Fire"),
            modality = LocalizedText("Mutable", "দ্ব্যাত্মক", "द्विस्वभाव", "Mutable"),
            vedicRuler = LocalizedText("Jupiter", "বৃহস্পতি", "बृहस्पति", "Jupiter (Guru)"),
            prompts = listOf(
                SignPromptItem("sag-1", "curiosity",
                    LocalizedText("Which distant horizon still pulls gently at your imagination?", "কোন দূরের দিগন্ত এখনো তোমার কল্পনাকে আলতো করে টানে?", "कौन-सा दूर का क्षितिज अब भी आपकी कल्पना को खींचता है?", "Kaun-sa door ka horizon abhi bhi tumhe khinchta hai?"),
                    LocalizedText("Write one postcard sentence to that future place.", "ভবিষ্যতের সেই জায়গার উদ্দেশ্যে এক লাইনের পোস্টকার্ড লেখো।", "उस भविष्य की जगह के लिए एक पंक्ति का पोस्टकार्ड लिखें।", "Us future jagah ke liye ek line ka postcard likho.")),
                SignPromptItem("sag-2", "gratitude",
                    LocalizedText("What detour taught you something the straight road never could?", "কোন ঘুরপথ তোমাকে এমন কিছু শিখিয়েছে যা সোজা রাস্তা শেখাতে পারত না?", "किस घुमावदार रास्ते ने वह सिखाया जो सीधी राह नहीं सिखा सकती थी?", "Kis detour ne woh sikhaya jo seedha rasta nahi sikha sakta tha?"),
                    LocalizedText("Thank the unexpected turn in three lines.", "অপ্রত্যাশিত সেই মোড়টিকে তিন লাইনে ধন্যবাদ দাও।", "उस अप्रत्याशित मोड़ को तीन पंक्तियों में धन्यवाद दें।", "Us unexpected turn ko teen lines mein thank you bolo."))
            )
        ),
        ZodiacSignDef(
            id = SignId.CAPRICORN, glyph = "♑", elementKind = ElementKind.EARTH,
            westernName = LocalizedText("Capricorn", "মকর (Capricorn)", "मकर (Capricorn)", "Capricorn"),
            rashiName = LocalizedText("Makara", "মকর", "मकर", "Makara"),
            element = LocalizedText("Earth", "পৃথিবী", "पृथ्वी", "Earth"),
            modality = LocalizedText("Cardinal", "চর", "चर", "Cardinal"),
            vedicRuler = LocalizedText("Saturn", "শনি", "शनि", "Saturn (Shani)"),
            prompts = listOf(
                SignPromptItem("cap-1", "rest",
                    LocalizedText("What responsibility are you carrying tonight that can rest until dawn?", "আজ রাতে কোন দায়িত্বটা ভোর পর্যন্ত নামিয়ে রাখা যায়?", "कौन-सी ज़िम्मेदारी आज रात सुबह तक के लिए आराम कर सकती है?", "Kaun-si zimmedari aaj raat subah tak rakh sakte ho?"),
                    LocalizedText("Write a permission slip to pause for twenty minutes.", "বিশ মিনিট বিশ্রামের জন্য নিজেকে একটি অনুমতিপত্র লেখো।", "बीस मिनट आराम के लिए खुद को अनुमति लिखें।", "20 minute rest ke liye khud ko ek permission note likho.")),
                SignPromptItem("cap-2", "gratitude",
                    LocalizedText("Which quiet discipline built a foundation you rarely pause to admire?", "কোন নীরব অভ্যাসটা এমন ভিত্তি গড়েছে যা তুমি ঘুরে দেখার সময় পাও না?", "किस शांत अनुशासन ने एक मज़बूत नींव बनाई जिस पर आप कम ध्यान देते हैं?", "Kis quiet discipline ne aisi foundation banayi jispe tum kam notice karte ho?"),
                    LocalizedText("Acknowledge one steady mile you already climbed.", "ইতিমধ্যে পেরিয়ে আসা একটি কঠিন ধাপকে স্বীকৃতি দাও।", "पहले से चढ़े गए एक कठिन कदम को सराहें।", "Jo steady mile tum paar kar chuke ho, usse acknowledge karo."))
            )
        ),
        ZodiacSignDef(
            id = SignId.AQUARIUS, glyph = "♒", elementKind = ElementKind.AIR,
            westernName = LocalizedText("Aquarius", "কুম্ভ (Aquarius)", "कुंभ (Aquarius)", "Aquarius"),
            rashiName = LocalizedText("Kumbha", "কুম্ভ", "कुंभ", "Kumbha"),
            element = LocalizedText("Air", "বায়ু", "वायु", "Air"),
            modality = LocalizedText("Fixed", "স্থির", "स्थिर", "Fixed"),
            vedicRuler = LocalizedText("Saturn", "শনি", "शनि", "Saturn (Shani)"),
            prompts = listOf(
                SignPromptItem("aqu-1", "creativity",
                    LocalizedText("What quiet idea feels slightly ahead of the room you are in?", "কোন নীরব ভাবনাটা তোমার চারপাশের সময়ের চেয়ে একটু এগিয়ে মনে হয়?", "कौन-सा शांत विचार आपके आसपास के माहौल से थोड़ा आगे लगता है?", "Kaun-sa quiet idea tumhare aaspaas ke room se thoda aage lagta hai?"),
                    LocalizedText("Sketch it freely without defending it to anyone.", "কাউকে ব্যাখ্যা না করেই স্বাধীনভাবে সেটি লিখে রাখো।", "किसी को समझाए बिना इसे आज़ादी से लिख दें।", "Kisi ko justify kiye bina usse freely likh lo.")),
                SignPromptItem("aqu-2", "friendship",
                    LocalizedText("Where do you feel most understood without having to edit yourself?", "কোথায় নিজেকে বদলে না ফেলেই সবচেয়ে বেশি বোঝাপড়া অনুভব করো?", "कहाँ खुद को बदले बिना आप सबसे ज़्यादा समझे हुए महसूस करते हैं?", "Kahan khud ko edit kiye bina sabse zyada understood feel karte ho?"),
                    LocalizedText("Write a brief note honoring that rare space.", "সেই বিরল জায়গাটির সম্মানে একটি ছোট নোট লেখো।", "उस दुर्लभ जगह के सम्मान में एक छोटा नोट लिखें।", "Us rare space ke liye ek chhota note likho."))
            )
        ),
        ZodiacSignDef(
            id = SignId.PISCES, glyph = "♓", elementKind = ElementKind.WATER,
            westernName = LocalizedText("Pisces", "মীন (Pisces)", "मीन (Pisces)", "Pisces"),
            rashiName = LocalizedText("Meena", "মীন", "मीन", "Meena"),
            element = LocalizedText("Water", "জল", "जल", "Water"),
            modality = LocalizedText("Mutable", "দ্ব্যাত্মক", "द्विस्वभाव", "Mutable"),
            vedicRuler = LocalizedText("Jupiter", "বৃহস্পতি", "बृहस्पति", "Jupiter (Guru)"),
            prompts = listOf(
                SignPromptItem("pisces-1", "comfort",
                    LocalizedText("What half-remembered dream or song is still drifting through your evening?", "কোন আধো-মনে থাকা স্বপ্ন বা সুর এখনো তোমার সন্ধ্যায় ভেসে বেড়াচ্ছে?", "कौन-सा अधूरा सपना या सुर अभी भी आपकी शाम में तैर रहा है?", "Kaun-sa adhoora sapna ya gaana abhi bhi tumhari shaam mein ghoom raha hai?"),
                    LocalizedText("Catch three fragments before they dissolve.", "মিলিয়ে যাওয়ার আগে তিনটি টুকরো লিখে রাখো।", "घुलने से पहले तीन छोटे अंश लिख लें।", "Fade hone se pehle teen chhote fragments note karo.")),
                SignPromptItem("pisces-2", "boundaries",
                    LocalizedText("Where do you need a gentle shore so empathy does not drain you?", "কোথায় একটি নরম তীর দরকার যাতে সহানুভূতি তোমাকে ক্লান্ত না করে?", "कहाँ एक नरम किनारा चाहिए ताकि करुणा आपको थका न दे?", "Kahan ek gentle boundary chahiye taaki empathy tumhe drain na kare?"),
                    LocalizedText("Write one kind sentence returning to yourself.", "নিজের কাছে ফিরে আসার একটি কোমল বাক্য লেখো।", "खुद के पास लौटने का एक कोमल वाक्य लिखें।", "Apne paas wapas aane ki ek soft line likho."))
            )
        )
    )

    fun signById(id: SignId): ZodiacSignDef = ZODIAC_SIGNS.first { it.id == id }

    fun dailyPromptIndex(signId: SignId, dateStr: String, count: Int): Int {
        if (count <= 1) return 0
        val hash = "${signId.name}:$dateStr".fold(0) { acc, c -> (acc * 31 + c.code) and 0x7fffffff }
        return hash % count
    }

    fun buildTwoSignCard(a: SignId, b: SignId, context: PairContext): PairPromptCard {
        val signA = signById(a)
        val signB = signById(b)
        return when (context) {
            PairContext.FRIENDSHIP -> PairPromptCard(
                questionForA = LocalizedText(
                    "As ${signA.westernName.en}, what steady warmth do you notice when ${signB.westernName.en} is simply being themselves?",
                    "${signA.rashiName.bn} হিসেবে, ${signB.rashiName.bn} যখন সহজ থাকে তখন কোন উষ্ণতাটা তোমার চোখে পড়ে?",
                    "${signA.rashiName.hi} के रूप में, ${signB.rashiName.hi} के सहज होने पर आप कौन-सी गर्माहट महसूस करते हैं?",
                    "${signA.westernName.en} lens se, jab ${signB.westernName.en} natural hota hai toh kaun-si warmth dikhti hai?"
                ),
                questionForB = LocalizedText(
                    "As ${signB.westernName.en}, what unspoken encouragement would you offer ${signA.westernName.en} this week?",
                    "${signB.rashiName.bn} হিসেবে, এই সপ্তাহে ${signA.rashiName.bn}-কে কোন নীরব সাহসটা দিতে চাও?",
                    "${signB.rashiName.hi} के रूप में, इस हफ़्ते ${signA.rashiName.hi} को कौन-सा शांत हौसला देना चाहेंगे?",
                    "${signB.westernName.en} lens se, is hafte ${signA.westernName.en} ko kaun-sa quiet encouragement doge?"
                ),
                sharedActivity = LocalizedText(
                    "Take a 15-minute unhurried walk or tea break and trade one small detail from your week.",
                    "১৫ মিনিটের শান্ত হাঁটা বা চায়ের আড্ডায় সপ্তাহের একটি ছোট ঘটনা ভাগ করে নাও।",
                    "15 मिनट की शांत चाय या सैर में इस हफ़्ते की एक छोटी बात साझा करें।",
                    "15 minute ki unhurried chai ya walk lo aur hafte ki ek chhoti detail share karo."
                )
            )
            PairContext.FAMILY -> PairPromptCard(
                questionForA = LocalizedText(
                    "What quiet care does ${signA.westernName.en} offer at home that rarely gets named out loud?",
                    "বাড়িতে ${signA.rashiName.bn} কোন নীরব যত্নটা করে যা প্রায়ই বলা হয়ে ওঠে না?",
                    "घर में ${signA.rashiName.hi} कौन-सी शांत परवाह करता है जिसका ज़िक्र कम होता है?",
                    "Ghar mein ${signA.westernName.en} kaun-si quiet care karta hai jo kam boli jaati hai?"
                ),
                questionForB = LocalizedText(
                    "What small family ritual softens the room between ${signA.westernName.en} and ${signB.westernName.en}?",
                    "কোন ছোট পারিবারিক অভ্যাস ${signA.rashiName.bn} আর ${signB.rashiName.bn}-এর মাঝে পরিবেশটাকে নরম করে?",
                    "कौन-सी छोटी पारिवारिक आदत ${signA.rashiName.hi} और ${signB.rashiName.hi} के बीच नरमी लाती है?",
                    "Kaun-si chhoti family aadat ${signA.westernName.en} aur ${signB.westernName.en} ke beech warmth laati hai?"
                ),
                sharedActivity = LocalizedText(
                    "Write one memory from the kitchen or porch and keep it tucked inside your private box.",
                    "রান্নাঘর বা বারান্দার একটি স্মৃতি লিখে নিজের প্রাইভেট বক্সে রেখে দাও।",
                    "रसोई या बरामदे की एक याद लिखें और अपने निजी बॉक्स में सहेजें।",
                    "Kitchen ya balcony ki ek memory likho aur apne private box mein rakho."
                )
            )
            PairContext.CREATIVE -> PairPromptCard(
                questionForA = LocalizedText(
                    "How does ${signA.element.en} energy start a draft differently from ${signB.element.en} energy?",
                    "${signA.element.bn} শক্তি কীভাবে ${signB.element.bn} শক্তির চেয়ে আলাদাভাবে একটি লেখা শুরু করে?",
                    "${signA.element.hi} ऊर्जा ${signB.element.hi} ऊर्जा से अलग तरह से ड्राफ़्ट कैसे शुरू करती है?",
                    "${signA.element.en} energy ${signB.element.en} se alag tarah draft kaise shuru karti hai?"
                ),
                questionForB = LocalizedText(
                    "What happens when ${signB.westernName.en} slows down to witness ${signA.westernName.en}'s rough first sketch?",
                    "${signB.rashiName.bn} যখন থেমে ${signA.rashiName.bn}-এর কাঁচা খসড়াটা দেখে তখন কী ঘটে?",
                    "${signB.rashiName.hi} जब रुककर ${signA.rashiName.hi} के कच्चे स्केच को देखता है तो क्या होता है?",
                    "Jab ${signB.westernName.en} ruk kar ${signA.westernName.en} ka rough sketch dekhta hai toh kya hota hai?"
                ),
                sharedActivity = LocalizedText(
                    "Co-create a 4-line Feeling Card: two lines of observation, two lines of wonder.",
                    "একসাথে ৪ লাইনের একটি ফিলিং কার্ড বানাও: দুটি পর্যবেক্ষণের, দুটি বিস্ময়ের।",
                    "4 पंक्तियों का फ़ीलिंग कार्ड बनाएं: दो अवलोकन की, दो विस्मय की।",
                    "4 line ka Feeling Card banao: do lines observation ki, do lines wonder ki."
                )
            )
        }
    }

    fun moonPhaseLabel(key: MoonPhaseKey, lang: AppLanguage): String = when (key) {
        MoonPhaseKey.NEW_MOON -> LocalizedText("New Moon", "অমাবস্যা", "अमावस्या", "New Moon").get(lang)
        MoonPhaseKey.WAXING_CRESCENT -> LocalizedText("Waxing Crescent", "শুক্ল প্রতিপদ", "शुक्ल पक्ष", "Waxing Crescent").get(lang)
        MoonPhaseKey.FIRST_QUARTER -> LocalizedText("First Quarter", "শুক্ল অষ্টমী", "प्रथम चतुर्थांश", "First Quarter").get(lang)
        MoonPhaseKey.WAXING_GIBBOUS -> LocalizedText("Waxing Gibbous", "শুক্ল দ্বাদশী", "बढ़ता चाँद", "Waxing Gibbous").get(lang)
        MoonPhaseKey.FULL_MOON -> LocalizedText("Full Moon", "পূর্ণিমা", "पूर्णिमा", "Full Moon").get(lang)
        MoonPhaseKey.WANING_GIBBOUS -> LocalizedText("Waning Gibbous", "কৃষ্ণ প্রতিপদ", "कृष्ण पक्ष", "Waning Gibbous").get(lang)
        MoonPhaseKey.LAST_QUARTER -> LocalizedText("Last Quarter", "কৃষ্ণ অষ্টমী", "अंतिम चतुर्थांश", "Last Quarter").get(lang)
        MoonPhaseKey.WANING_CRESCENT -> LocalizedText("Waning Crescent", "কৃষ্ণ ত্রয়োদশী", "घटता चाँद", "Waning Crescent").get(lang)
    }

    val MOOD_PRESETS = listOf(
        "Quiet & steady",
        "Heavy but honest",
        "Tender & nostalgic",
        "Restless",
        "Grateful",
        "Hopeful",
        "Tired — needing rest"
    )
}
