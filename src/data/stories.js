// Short Amharic children's stories for heritage-speaker script-reading
// practice in Read mode's Passages tab (see SentenceReader.jsx). These are
// real, existing stories reused with attribution under their original open
// licenses, not written or AI-generated for this app (see `credit` on each).
// Sourced from the African Storybook Initiative (africanstorybook.org),
// via its open-source text mirror at github.com/global-asp/asp-source.
//
// Each page has an English `meaning`, hidden until tapped (same reveal
// pattern as DialogueCard's lines). For "Young Abera", the English original
// (github.com/global-asp/asp-source, en/0088_young-palinyang.md) uses
// different character names (Palinyang', Sausau, Lokeyokoni, Alinyang') and
// a different call-song than the Amharic translation actually reads, so the
// meaning fields here are a direct translation of the Amharic text itself
// (Abera, Solomon, Laqew, Bora), not a copy-paste of the English edition,
// to avoid the names on screen contradicting the gloss.

export const STORIES = [
  {
    id: 'story_look_at_animals',
    type: 'story',
    title: 'እንስሳቱን ተመልከቱ',
    titleMeaning: 'Look at the Animals',
    pages: [
      { amharic: 'እንስሳቱን ተመልከቷቸው።', meaning: 'Look at the animals.' },
      { amharic: 'ላሚቷ «እምቧ» ትላለች።', meaning: 'The cow says, "Moo."' },
      { amharic: 'ፍየሏ ደግሞ «ሚሂሂሂ ……» ትላለች።', meaning: 'The goat says, "Meh, meh."' },
      { amharic: 'ፈረሱም እያስካካ ነው።', meaning: 'The horse neighs.' },
      { amharic: 'አሳማውም ያጉረመርማል።', meaning: 'The pig grunts.' },
      { amharic: 'ዶሮዋ ደግሞ ታስካካለች።', meaning: 'The chicken clucks.' },
      { amharic: 'ውሻው «ዋው…ዋው…ዋው…» እያለ ይጮሀል።', meaning: 'The dog barks, "Woof, woof, woof."' },
      { amharic: 'ገበሬው ደግሞ ዝም እንዲሉ «እሽሽሽሽ» እያለ ድምፅ ያሰማል።', meaning: 'The farmer makes a "shhh" sound so they quiet down.' },
    ],
    credit: {
      text: 'Jenny Katz',
      illustration: 'Sandy Campbell',
      translation: 'ፋሲል አሠፋ (Fasil Assefa)',
      license: 'CC BY-NC',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_porridge',
    type: 'story',
    title: 'ገንፎ',
    titleMeaning: 'Porridge',
    pages: [
      { amharic: 'አየለ ወደ ት/ቤት ለመሄድ እየተዘጋጀ ነው።', meaning: 'Ayele is getting ready to go to school.' },
      { amharic: 'አባት ለቁርስ ገንፎ እያዘጋጀ ነው።', meaning: 'Father is making porridge for breakfast.' },
      { amharic: '«እናቴ ምርጥ ገንፎ ትሰራለች!» አለ አየለ።', meaning: '"My mother makes the best porridge!" said Ayele.' },
      { amharic: 'ገንፎ ለአየለ ሀይል ሰጠው።', meaning: 'The porridge gave Ayele energy.' },
      { amharic: 'ገንፎው ተዘጋጅቷል።', meaning: 'The porridge is ready.' },
      { amharic: 'አባቱ በፍቅር ወተቱን ቀዳለት።', meaning: 'His father poured the milk in lovingly.' },
      { amharic: '«አባቴ ይህ ገንፎ ተጨማሪ ስኳር ያስፈልገዋል» አለ አየለ።', meaning: '"Father, this porridge needs more sugar," said Ayele.' },
      { amharic: '«የናቴ ገንፎ ከአባቴ በጣም የተሻለ ነው» ብሎ አየለ አሰበ።', meaning: '"My mother\'s porridge is much better than my father\'s," Ayele thought.' },
      { amharic: '«አባቴ እባክህ ተጨማሪ ስኳር ማግኘት እችላለሁ?» አየለ ጠየቀ።', meaning: '"Father, please, can I have more sugar?" Ayele asked.' },
      { amharic: 'አባቱ ለአየለ ተጨማሪ ስኳር አደረገለት።', meaning: 'His father added more sugar for him.' },
      { amharic: '«ዋው! አባቴ! ገንፎዬ ውስጥ ጨው ጨመርክበት!»', meaning: '"Wow! Father! You put salt in my porridge!"' },
      { amharic: '«አባቴ መቼ ነው እናቴ ቤት የምትመጣው?»', meaning: '"Father, when is Mother coming home?"' },
    ],
    credit: {
      text: 'Zimbili Dlamini, Hlengiwe Zondi',
      illustration: 'Catherine Groenewald',
      translation: 'ሂሩት, መዘምር ግርማ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_come_back_my_cat',
    type: 'story',
    title: 'ተመለሽ ድመቴ',
    titleMeaning: 'Come Back, My Cat',
    pages: [
      { amharic: 'ተመለሽ ድመቴ! ከኔ ጋር ተጫወች።', meaning: 'Come back, my cat! Play with me.' },
      { amharic: 'በቅርጫትሽ ውስጥ ተቀመጭ። እዚሁ ቆዪ!', meaning: 'Sit in your basket. Stay right here!' },
      { amharic: 'ተመለሽ ድመቴ! ያ በጣም ይርቅሻል።', meaning: "Come back, my cat! That's too far for you." },
      { amharic: 'ተመለሽ ድመቴ! ውጭ አትውጭ።', meaning: "Come back, my cat! Don't go outside." },
      { amharic: 'ተመለሽ ድመቴ! ያ ያንች አይደለም።', meaning: "Come back, my cat! That's not yours." },
      { amharic: 'ተመለሽ ድመቴ! ምን አገኘሽ?', meaning: 'Come back, my cat! What did you find?' },
      { amharic: 'ተመለሽ ድመቴ! ያ ያንች ጓደኛ አይደለም።', meaning: "Come back, my cat! That's not your friend." },
      { amharic: 'ታዲያስ ድመቴ! ተመለስሽ?', meaning: 'Well then, my cat! Have you come back?' },
      { amharic: 'በቅርጫትሽ ውስጥ ቆዪ። አሁን የእንቅልፍ ሰዓት ነው።', meaning: "Stay in your basket. It's nap time now." },
      { amharic: 'ድመቴ?', meaning: 'My cat?' },
    ],
    credit: {
      text: 'Nicola Rijsdijk',
      illustration: 'Karen Lilje',
      translation: 'መዘምር ግርማ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_young_abera',
    type: 'story',
    title: 'ታዳጊው አበራ',
    titleMeaning: 'Young Abera',
    pages: [
      {
        amharic: 'ከዘመናት በፊት አበራ የተባለ ወላጅ አልባ የሆነ ህፃን ነበር። ወላጆቹ ገና የስድስት ወር ህፃን እያለ ነበር በወረበላዎች የተገደሉት። የሰፈሩ ሰዎች በሃዘን ላይ ሆነው \'አበራ\' ምን እንደሚሆን ያስቡ ነበር።',
        meaning: 'Long ago there was an orphan child named Abera. His parents were killed by bandits when he was only six months old. The people of the neighborhood, in mourning, wondered what would become of Abera.',
      },
      {
        amharic: 'የሰፈሩ ሰዎች የህፃኑን ወላጆች ከቀበሩ በኋላ የቀበሌው አስተዳደር አቶ ሰሎሞን ስብሰባ ጠሩ። አቶ ሰሎሞን ፀጉረ ረዥም እና በአካባቢው ስዎች ዘንድ እጅግ የሚከበርና የሚፈራ ነበር። አቶ ሰለሞን ድሮ ድሮ ዛፎች ሳይቆረጡ እና ቤቶች ሳይገነቡ በጫካ ውስጥ ይኖር ነበር ተብሎ ይታመናል።',
        meaning: 'After burying the child\'s parents, the local administrator Mr. Solomon called a meeting. Mr. Solomon had long hair and was greatly respected and feared by the people of the area. It was believed that he used to live in the forest long ago, before trees were cut down and houses were built.',
      },
      {
        amharic: 'አቶ ሰሎሞን ስብሰባ የጠሩት ስለ ህፃኑ ለመወያየት ስለነበር አንድ የመንደሩ ከበርቴ የሆነ ላቀው የተባለ ሰው አበራን ለማሳደግ ይወስደዋል። አቶ ላቀው ብዙ ሴት እና ወንድ ልጆች ነበሩት። ሴቶቹ እናታቸውን በቤት ውስጥ ስራ ሲያግዙ ወንዶቹ ደግሞ የአባታቸውን ከብቶች እንዲጠብቁ ይላኩ ነበር።',
        meaning: 'Mr. Solomon had called the meeting to discuss the child, and a wealthy villager named Mr. Laqew took Abera in to raise him. Mr. Laqew had many daughters and sons; the daughters helped their mother with housework, while the sons were sent to look after their father\'s cattle.',
      },
      {
        amharic: 'አበራም በቤተሰቡ ውስጥ አደገ እናም በጣም ደስተኛ ነበር። በጣም ተወዳጅ እና ሁሉንም የሚወድ ነበር። በሜዳ ላይ ሆኖ ከብቶቹን መጠበቅ በጣም ያዝናናው ነበር።',
        meaning: 'Abera grew up in that family and was very happy. He was well-liked and loved everyone. He greatly enjoyed watching over the cattle out in the fields.',
      },
      {
        amharic: 'አበራ አንዷን ላም በጣም ይወዳት ስለነበር \'ቦራ\' ብሎ ስም አወጣላት። ቦራ ከከብቶቹ ሁሉ በጣም ያገለገለች ነበርች። በዚህም ምክንያት ባለቤትየው ከፍተኛ ዋጋ ይሰጧት ነበር።',
        meaning: 'Abera loved one particular cow so much that he named her "Bora." Bora served better than all the other cattle, and because of this her owner valued her highly.',
      },
      {
        amharic: 'አንድ ቀን እነ አበራ ከብት በመጠበቅ ላይ እያሉ ሃይለኛ ዝናብ ይጥል ጀመር እነርሱም ዝናቡ እስኪያባራ ብለው ዛፍ ሥር ቁጭ አሉ። ነገር ግን መሽቶ እስኪጨልም ድረስ ዝናቡ አላባራም ነበር። ጨልሞ ከቆየ በኋላ ዝናቡ አባራ ነገር ግን ከብቶቹን ወደ ቤት ለመውሰድ ሲፈልጓቸው የሉም።',
        meaning: 'One day, while Abera and the others were watching the cattle, heavy rain began to fall, and they sat under a tree waiting for it to stop. But the rain did not let up until it grew dark. After it finally stopped, they went to gather the cattle to take them home, but the cattle were nowhere to be found.',
      },
      {
        amharic: 'ከብቶቹን ሳናገኝ ወደ ቤት ከሄድን አባታችን አያስገባንም አሉና ሁለት ልጆች ወደ አጎታቸው ቤት ሄዱ ሁለቱ ልጆች ደግሞ ወደ አክስታቸው ቤት ሄዱ። ነገር ግን አበራ አጎትም ሆነ አክስት የለውም እና መሄጃ ስለሌለው ከብቶቹን እስኪያገኛቸው ድረስ ለመፈለግ ወሰነ።',
        meaning: 'Fearing what their father would do if they came home without the cattle, two of the boys went to their uncle\'s house, and the other two went to their aunt\'s house. But Abera had no uncle or aunt, and with nowhere to go, he decided to keep searching until he found the cattle.',
      },
      {
        amharic: 'አበራ የሚወደውን ላም ዘፈን እየዘፈነ ከብቶቹን በሚያውቀው መንገድ ሁሉ ፈለጋቸው። እምቧ በይ ላሜ ቦራ እምቧ በይ እንቧ በይ ላሜ ቦራ እማቧ በይ ---እያለ ፍለጋውን ቀጠለ።',
        meaning: 'Abera searched every path he knew, singing the song of his beloved cow: "Moo, answer me, my cow Bora, moo, moo, answer me, my cow Bora, moo" — and so he continued his search.',
      },
      {
        amharic: 'አበራም ዘፈኑን እየዘፈነ ሌሊቱን በሙሉ ፍለጋውን ቀጠለ። የላም እበት ላይ እግሩ አረፈ ግን ቀዝቃዛ ነበር። የላም ሽንትም ላይ እግሩ አረፈ ግን ቀዝቃዛ ነበር። አበራ ግን ተስፋ አልቆረጠም።',
        meaning: 'Abera kept singing the song and searched all through the night. His foot landed on cow dung, but it was cold. His foot landed on cow urine too, but it was also cold. Still, Abera did not give up.',
      },
      {
        amharic: 'ለሊቱን በሙሉ ሲፈልግ ከቆየ በኋላ ሊነጋ ሲል አንዲት ትንሽዬ መንደር አገኘ ከብቶቹም በመንደሩ አስተዳደር ቤት አገኛቸው። ለመንደሩ ሊቀመንበሩ ከብቶቹ እንዲሰጡት ተማፀ ነገር ግን ሊቀመንበሩ አይሆንም አልሠጥም አለው።',
        meaning: 'After searching all night, just before dawn, he came upon a small village and found the cattle being kept at the village office. He begged the village chairman to give him the cattle, but the chairman refused.',
      },
      {
        amharic: 'በዚህ ተስፋ የቆረጠው አበራ ዘፈኑን እየዘፈነ ወደቤቱ መመለስ ጀመረ። እምቧ በይ ላሜ ቦራ እምቧ በይ እምቧ በይ ላሜ ቦራ እምቧ በይ ሲል ቦራ ተከተለችው ከዛም ሁሉም ከብቶች በረቱን ጥሰው ወጡና አበራን ተከትለው ሄዱ። እሱም ወደ ቤት መራቸው።',
        meaning: 'Discouraged, Abera began singing his song again as he turned to head home: "Moo, answer me, my cow Bora, moo, moo, answer me, my cow Bora, moo." When Bora heard this, she followed him, and then all the cattle broke out of their pen and followed Abera. He led them home.',
      },
      {
        amharic: 'አበራ ቤቱ ሲደርስ የሠፈሩ ሰው እንዳለ ወጥቶ ስሙን እየጠራ እና እያወደሰ ተቀበሉት። አቶ ላቀው በጣም አመስገነው ቀይ የትምህርት ቤት ቦርሳ ገዝተው ሸለሙት እናም ትምህርት እንዲማር አደረጉት።',
        meaning: 'When Abera reached home, the people of the neighborhood came out, calling his name and praising him. Mr. Laqew thanked him greatly, bought him a red school bag, and had him enrolled in school.',
      },
    ],
    credit: {
      text: 'Gaspah Emukuru Juma',
      illustration: 'Wiehan de Jager',
      translation: 'ከድር ኢብራሂም, ፋሲካ ምንዳ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_i_love_to_read',
    type: 'story',
    title: 'ማንበብ እወዳለሁ',
    titleMeaning: 'I Love to Read',
    pages: [
      { amharic: 'ማንበብ እወዳለሁ።', meaning: 'I love to read.' },
      { amharic: 'ለማን ላንብብ?', meaning: 'Who can I read to?' },
      { amharic: 'ሕጻኗ ተኝታለች።', meaning: 'My baby sister is asleep.' },
      { amharic: 'ለማን ላንብብ?', meaning: 'Who can I read to?' },
      { amharic: 'እናቴ እና አያቴ ምግብ እያበሰሉ ነው።', meaning: 'My mother and grandmother are cooking.' },
      { amharic: 'ለማን ላንብብ?', meaning: 'Who can I read to?' },
      { amharic: 'አባቴ እና አያቴ መኪናዋን እየሰሩ ነው።', meaning: 'My father and grandfather are fixing the car.' },
      { amharic: 'ለማን ላንብብ? ቁጭ ብዬ ለራሴው አነባለሁ።', meaning: "Who can I read to? I'll sit down and read to myself." },
    ],
    credit: {
      text: 'Letta Machoga',
      illustration: 'Wiehan de Jager',
      translation: 'ስሂን ተፈራ, መዘምር ግርማ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_tell_me_happy_sad',
    type: 'story',
    title: 'ንገሩኝ ደስተኛ እና የተከፋ',
    titleMeaning: 'Tell Me! Happy and Sad',
    pages: [
      { amharic: 'ህጻኗ ለምን ታለቅሳለች?', meaning: 'Why is the baby girl crying?' },
      { amharic: 'ርቧት ይመስለኛል።', meaning: "I think she's hungry." },
      { amharic: 'ልጁ ለምን አዘነ?', meaning: 'Why is the boy sad?' },
      { amharic: 'አባቱ ናፍቆት መሰለኝ።', meaning: 'I think he misses his father.' },
      { amharic: 'ልጅቷ ለምን ተደሰተች?', meaning: 'Why is the girl happy?' },
      { amharic: 'አዲስ ቀሚስ አላት።', meaning: 'She has a new dress.' },
      { amharic: 'አዛውንቱ ሰውዬ ለምን ይስቃሉ?', meaning: 'Why is the old man laughing?' },
      { amharic: 'አስቂኝ ቀልድ አንብበው ነው።', meaning: 'He read a funny joke.' },
      { amharic: 'ወይዘሮዋ ለምን ፈገግ አሉ?', meaning: 'Why is the woman smiling?' },
      { amharic: 'ልጆቻቸው በጥሞና እያነበቡ ነው።', meaning: 'Her children are reading quietly.' },
      { amharic: 'እኝህ ሴት ምን ተሰምቷቸው ነው?', meaning: 'What is this woman feeling?' },
      { amharic: 'ያፈሩ ይመስለኛል።', meaning: "I think she's feeling shy." },
    ],
    credit: {
      text: 'Madhav Chavan',
      illustration: 'Rijuta Ghate',
      translation: 'ስሂን ተፈራ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_counting_animals',
    type: 'story',
    title: 'እንሰሳትን እንቁጠር',
    titleMeaning: "Let's Count Animals",
    pages: [
      { amharic: 'አንድ ዝሆን ዉሃ ለመጠጣት እየሄደ ነው።', meaning: 'One elephant is going to drink water.' },
      { amharic: 'ሁለት ቀጭኔዎችም ዉሀ እየጠጡ ነው።', meaning: 'Two giraffes are drinking water too.' },
      { amharic: 'ሁለት ጎሽ እና አራት ወፎች በእንድ ላይ ውሀ ሊጠጡ እየሄዱ ነው።', meaning: 'Two buffalo and four birds are going to drink water together.' },
      { amharic: 'አምስት ድኩላ እና ከርከሮዎች እየተራመዱ ዉሀ ለመጠጣት እየተጔዙ ነው።', meaning: 'Five antelope and warthogs are walking toward the water to drink.' },
      { amharic: 'ሰባት የሜዳ አህያዎች እየሮጡ ውሀ ሊጠጡ እየሄዱ ነው።', meaning: 'Seven zebras are running to drink water.' },
      { amharic: 'ስምንት እንቁራሪቶችና ዘጠኝ አሳዎች ውሃ ውስጥ እየዋኙ ነው።', meaning: 'Eight frogs and nine fish are swimming in the water.' },
      { amharic: 'አንድ አንበሳ እያጔራ ነው። እሱም ውሀ ለመጠጣት ፈልጔል። ከእንሰሳዎቹ ውስጥ አንበሳውን ማን የፈራ ይመስላችኋል?', meaning: 'A lion roars. He wants to drink water too. Which of the animals do you think is afraid of the lion?' },
      { amharic: 'አንድ ዝሆን ከአንበሳው ጋር ዉሃ እየጠጣ ነው።', meaning: 'One elephant is drinking water together with the lion.' },
    ],
    credit: {
      text: 'Zanele Buthelezi, Thembani Dladla, Clare Verbeek',
      illustration: 'Rob Owen',
      translation: 'ፋሲል አሰፋ (Fasil Assefa)',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_counting_cats',
    type: 'story',
    title: 'ድመቶችን እንቁጠር',
    titleMeaning: "Let's Count Cats",
    pages: [
      { amharic: 'ስንት ድመቶች አሉ? ዜሮ ድመቶች።', meaning: 'How many cats are there? Zero cats.' },
      { amharic: 'ስንት ድመቶች አሉ? አንድ ድመት።', meaning: 'How many cats are there? One cat.' },
      { amharic: 'ስንት ድመቶች አሉ? ሁለት ድመቶች።', meaning: 'How many cats are there? Two cats.' },
      { amharic: 'ስንት ድመቶች አሉ? ሶስት ድመቶች።', meaning: 'How many cats are there? Three cats.' },
      { amharic: 'ስንት ድመቶች አሉ? አራት ድመቶች።', meaning: 'How many cats are there? Four cats.' },
      { amharic: 'ስንት ድመቶች አሉ? አምስት ድመቶች።', meaning: 'How many cats are there? Five cats.' },
      { amharic: 'ስንት ድመቶች አሉ? ስድስት ድመቶች።', meaning: 'How many cats are there? Six cats.' },
      { amharic: 'ስንት ድመቶች አሉ? ሰባት ድመቶች።', meaning: 'How many cats are there? Seven cats.' },
      { amharic: 'ስንት ድመቶች አሉ? ስምንት ድመቶች።', meaning: 'How many cats are there? Eight cats.' },
      { amharic: 'እዚህ የምናየው ምንድን ነው? ውሮ ከዛፍ ላይ መውጣት ተቸግራ! «እኔ አወርድሻለሁ!»', meaning: 'What do we see here? Uro is stuck up in the tree! "I\'ll get you down!"' },
      { amharic: '«እማዬ ውሮን እንውሰዳት? አንዷን ብቻ» ስንት ድመቶች? ዘጠኝ ድመቶች።', meaning: '"Mom, can we keep Uro? Just this one?" How many cats? Nine cats.' },
    ],
    credit: {
      text: 'Nina Orange',
      illustration: 'Jesse Breytenbach',
      translation: 'ስሂን ተፈራ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_house_for_mouse',
    type: 'story',
    title: 'የአይጢት ቤት',
    titleMeaning: 'A House for Mouse',
    pages: [
      { amharic: 'አይጧ አዲስ ቤት እየፈለገች ነው።', meaning: 'Mouse was looking for a new house.' },
      { amharic: 'ይሄ ቤት ጥሩ ይመስላል።', meaning: 'This house looks nice.' },
      { amharic: '«መጥተሽ ከእኔ ጋር መተኛት ትችያለሽ።» አላት አንድ ቡችላ። «አመሰግናለሁ።» አለች አይጥ።', meaning: '"You can come sleep with me," said a puppy. "Thank you," said Mouse.' },
      { amharic: 'በዚያ ሌሊት አይጧ ደስ የማይል ነገር በህልሟ እየመጣ ስትረበሽ አደረች።', meaning: 'That night, unpleasant things kept coming into her dreams and troubling her.' },
      { amharic: '«መጥተሽ ከእኔ ጋር መተኛት ትችያለሽ።» አለቻት በቀቀን። «አመሰግናለሁ።» አለች አይጥ።', meaning: '"You can come sleep with me," said a parrot. "Thank you," said Mouse.' },
      { amharic: 'በዚያ ሌሊት አይጧ ጫጫታ የበዛበት እና አስፈሪ ህልም ስታይ አደረች።', meaning: 'That night, Mouse had noisy, scary dreams.' },
      { amharic: '«መጥተሽ ከእኔ ጋር መተኛት ትችያለሽ።» አላት አሳ። «አመሰግናለሁ።» አለች አይጥ።', meaning: '"You can come sleep with me," said a fish. "Thank you," said Mouse.' },
      { amharic: 'በዚያ ሌሊት አይጧ ያየችው ህልም ቀዝቃዛና ርጥበታማ ነበር።', meaning: "That night, Mouse's dream was cold and wet." },
      { amharic: 'አይጧ ሞቃትና ደረቅ የሆነ ቦታ ፈለገች።', meaning: 'Mouse wanted somewhere warm and dry.' },
      { amharic: 'ከዚያም በአቅራቢያዋ የመጽሐፍ መደርደሪያ አገኘች።', meaning: 'Then she found a bookshelf nearby.' },
      { amharic: 'በዚያ ሌሊት አይጧ ሞቃትና ደስ የሚል ህልም አየች። መልካም እንቅልፍ፣ አይጢት!', meaning: 'That night, Mouse had a warm, lovely dream. Good night, little Mouse!' },
    ],
    credit: {
      text: 'Michele Fry',
      illustration: 'Amy Uzzell',
      translation: 'ዳዊት ግርማ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_wise_man',
    type: 'story',
    title: 'አዋቂው ሰውዬ',
    titleMeaning: 'The Wise Man',
    // Amharic's closing proverb differs from the English edition's ("shoulders
    // never grow taller than the head") — this translates the Amharic text's
    // actual proverb, not the English original, same reasoning as Young Abera.
    pages: [
      {
        amharic: 'ከዕለታት አንድ ቀን ወጣቶች ከታላላቆቻቸው ይበልጥ አዋቂ ናቸው ብሎ የሚያስብ ሰውዬ ነበር። ይህ ሰውዬ እኔ ወጣት ነኝ ከታላቆቼ ሁሉ ይበልጥ አዋቂ ኘኝ አላት ለባለቤቱ ባለቤቱ ደግሞ «አንተ ከአባቴ ይልቅ አዋቂ አይደለህም» አለችው።',
        meaning: 'Once there was a man who believed young people were wiser than their elders. He told his wife, "Even though I\'m young, I\'m wiser than all my elders." His wife replied, "You are not wiser than my father."',
      },
      {
        amharic: 'አንድ ቀን የሰውዬው ባለቤት ወላጆቿን ለማየት ትሔዳለች ከዛም ባሏ ያለውን ነገር ለአባቷ ትናገራለች። ከዛም አባቷ በይ ልጄ አሁን ሄደሽ ካንተና ከአባቴ ማነው አዋቂ ብለሽ ጠይቂው አላት።',
        meaning: 'One day the man\'s wife went to visit her parents and told her father what her husband had said. Her father told her, "Go back now and ask him: between him and me, who is wiser?"',
      },
      {
        amharic: 'የሰውዬው ባለቤት አባቷን ያላትን ነገር ሄዳ ለባለቤቷ ትነግረዋለች። ባለቤቷም ሄደሽ አባትሽን «ከጭጋግ ጠላ አዘጋጅልኝ» ብሎሃል በይው ብሎ ይልካታል። «አሁን በጣም አዋቂ ሰው እንደሆንኩ አማቴ ይረዳል» ሳቅ አለ። ማንም ከጭጋግ ጠላ መስራት አይችልም።',
        meaning: 'The wife went and told her husband what her father had said. He sent her back, saying, "Tell your father he must brew me beer from fog." He laughed, "Now my father-in-law will see how wise I really am," since no one can brew beer from fog.',
      },
      {
        amharic: 'እሷም መልክቱን ለማድረስ ወደ አባቷ ሄዳ ነገረችው። አባትየው በጣም ሳቀ ምክንያቱም ምንም አይነት ጠላ ከጭጋግ አይሰራም። አባቷም በይ ልጄ አሁን ሄደሽ እሺ ከጭጋግ ጠላ አዘጋጅልሃለሁ ነገር ግን ጠላውን የሚወስደው ወንድም ሴትም መሆን የለበትም በይ ልላታል።',
        meaning: 'She went and delivered the message to her father, who laughed heartily, since no beer can be brewed from fog. Then he said, "Go tell him: fine, I will brew him beer from fog, but whoever comes to collect it must be neither a man nor a woman."',
      },
      {
        amharic: 'አሁን ይህን መልእክት ሄዳ ለባለቤቷ ስትነግረው ባለቤቷ በመልሱ ተገረመና «ልጅ ይሮጣል እንጂ አባቱን አይቀድምም» የሚባለው ነገር ለካ እውነት ነው አለ።',
        meaning: 'When she told her husband this reply, he was stunned, and admitted, "It\'s true what they say: a child may run fast, but never outruns his father."',
      },
    ],
    credit: {
      text: 'Cornelius Wekunya',
      illustration: 'Joshua Waswa',
      translation: 'ከድር ኢብራሂም, ፋሲካ ምንዳ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_askale',
    type: 'story',
    title: 'አስካለ',
    titleMeaning: 'Askale',
    // The Amharic translator renamed the title character entirely (English
    // original: "Akatope") — meanings here translate the Amharic text as
    // written, using the name actually on screen, same reasoning as Young Abera.
    pages: [
      { amharic: 'በጥንት ጊዜ ልጅ እንዲኖራቸው አጥብቀው ይፈልጉ የነበሩ አንዲት አሮጊት ሴትዮ ይኖሩ ነበር።', meaning: 'Long ago there lived an old woman who deeply wished to have a child.' },
      { amharic: 'ሴትዮዋ ምርጥ የሸክላ አፈር አምጥተው ሴት ልጅ ያበጁ ጀመር።', meaning: 'The woman brought the finest clay and began to shape a daughter out of it.' },
      { amharic: 'ከጭቃ የተሰራችው ሴት ልጅ፣ ወደ እውነተኛ ሴት ልጅነት ተቀየረች።', meaning: 'The girl made of clay turned into a real human girl.' },
      { amharic: 'አሮጊቷ ሴትዮ በጣም ተደሰቱ። ልጂቷን አስካለ ብላ ስም አወጣችላት። ሴትዮዋ አስካለን በጣም ወደዷት።', meaning: 'The old woman was overjoyed. She named the girl Askale and loved her dearly.' },
      { amharic: 'አስካለን እናቷ ከቤት እንዳትወጣ ብታስጠነቅቃትም አስካለ ግን ልትሰማ አልቻለችም። እናትዬዋ ሳታውቅ አስካለ ቀስ ብላ ከቤት ወጥታ ከሌሎች ህጻናት ጋር ለመጫወት ትሄዳለቸች።', meaning: "Askale's mother warned her not to leave the house, but Askale couldn't help herself. Without her mother knowing, Askale would quietly slip out to play with the other children." },
      { amharic: 'አንድ ቀን አስካለ ከሌሎች ልጆች ጋር ልትጫወት እንደወጣች ሃይለኛ ዝናብ መዝነብ ጀመረ።', meaning: 'One day, while Askale was out playing with the other children, heavy rain began to fall.' },
      { amharic: 'ሌሎቹ ልጆች ወደየቤታቸው ሮጡ፤ አስካለ ግን ወደቤቷ እየሮጠች እያለ እግሯ ተሰበረ። ኩርምት ብላ ከቁጥቋጦዎች መሃል ተቀመጠች።', meaning: 'The other children ran home, but as Askale ran for her house, her legs began to dissolve in the rain. She curled up and sat down among the bushes.' },
      { amharic: 'ሌሎቹ ህጻናት ለወላጆቻቸው አስካለን ምን እንዳጋጠማት ተናገሩ። በጣም አዝነውና ተደናግጠው ነበር።', meaning: 'The other children told their parents what had happened to Askale. They were very sad and shaken.' },
      { amharic: 'አሮጊቷ ሴትዮ በብቸኛዋ ልጃቸው ላይ ምን እንደደረሰ በሰሙ ጊዜ ለብዙ ቀናት አለቀሱ። ከዚያም አሮጊቷን ሊያጽናኑ የሄዱ የመንደሩ ሰዎች አስካለን ልትተካ የምትችል ትንሽዬ ልጅ ጉዲፈቻ ሊያመጡላቸው ወሰኑ።', meaning: 'When the old woman heard what had happened to her only daughter, she cried for many days. The neighbors, coming to comfort her, decided to bring her another little orphan girl to take Askale\'s place.' },
      { amharic: 'ይሄ ግን አስፈላጊ አልነበረም። ትልቅ አስደናቂ ገጸ በረከት ለአሮጊቷ ሴትዮ!', meaning: "But that wasn't necessary. A wonderful surprise awaited the old woman!" },
      { amharic: 'ጉዲፈቻዋ ልጅ ወደ አሮጊቷ ዘንድ ከመጣች ከጥቂት ቀናት በኋላ ቤቱ በቀስታ ተንኳኳ።', meaning: "A few days after the adopted girl arrived at the old woman's home, there was a soft knock at the door." },
      { amharic: '«ማን ሊሆን ይችላል?» አሉ አሮጊቷ በመደነቅ። በሩን ከፍታ ስትመለከት፤ ያችውን ነገር ማመን አልቻለችም።', meaning: '"Who could that be?" the old woman wondered in surprise. She opened the door and could hardly believe what she saw.' },
      { amharic: 'አስካለ ወደ ቤቷ ተመልሳ ነበር። ነገር ግን ደካክማና አሟትም ነበር።', meaning: 'Askale had come home. But she was weak and unwell.' },
      { amharic: 'የአስካለ እናት ያላቸውን ንብረት በሙሉ ሸጡ። ገብዘባቸውንም አስካለን ለማሳከም አዋሉት። አስካለ የሰፈሩ በጣም ቆንጅዬ ልጅ ሆና አደገች።', meaning: "Askale's mother sold everything she owned and used the money to nurse Askale back to health. Askale grew up to be the most beautiful girl in the neighborhood." },
    ],
    credit: {
      text: 'Alice Kapolondo',
      illustration: 'Catherine Groenewald, Microsoft Clip Art, Wiehan de Jager',
      translation: 'ዳዊት ግርማ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
  {
    id: 'story_greedy_kinde',
    type: 'story',
    title: 'ገብጋባው ክንዴ',
    titleMeaning: 'Greedy Kinde',
    pages: [
      { amharic: 'ከረጅም ጊዜ በፊት በብርቃ መንደር ክንዴ የሚባል ሰው ይኖር ነበር። ሥጋ መብላትም በጣም ይወድ ነበር።', meaning: 'Long ago there lived a man named Kinde in Birqa village. He loved eating meat very much.' },
      { amharic: 'አንድ ቀን የብርቃ መንደር አለቃ ሁሉንም መንደርተኞች በወንድ ልጁ ሰርግ ላይ እንዲገኙ ጋበዛቸው።', meaning: "One day the chief of Birqa village invited all the villagers to his son's wedding." },
      { amharic: 'ክንዴ ደግሞ በሌላ እንቧይባድ በተባለች መንደርም ሌላ ድግስ እንዳለ ሰማ። «አሃ! ሁለት ድግስ በአንድ ቀን!» ሲል አሰበ ክንዴ።', meaning: '"Aha! Two feasts in one day!" Kinde thought, on hearing there was another feast in a village called Enqoybad too.' },
      { amharic: '«ሁለቱንም ድግሶች መብላት አለብኝ፣» አለ ክንዴ። መጀመሪያ ወደ እንቧይባድ እሄድና ከዚያ ወደ ብርቃ ተመልሼ እመጣለሁ።', meaning: '"I have to eat at both feasts," said Kinde. "I\'ll go to Enqoybad first, then come back to Birqa."' },
      { amharic: 'ክንዴ በጠዋት ተነስቶ ወደ እንቧይባድ ሄደ። ዘወር ዘወር ብሎ ሲያይ ድግሱ ገና እንዳልጀመረ ተረዳ። «ወደ ብርቃ እመለስና ወደ እንቧይባድ ደግሞ በኋላ ላይ እመለሳለሁ» በማለት ወሰነ።', meaning: "Kinde got up early and went to Enqoybad. Looking around, he realized the feast hadn't started yet. \"I'll go back to Birqa and come back to Enqoybad later,\" he decided." },
      { amharic: 'ክንዴ ወደ ብርቃ ሥጋው ተዘጋጅቶ ይጠብቀኛል ብሎ አስቦ ለመብላት ሄደ። በጣም ርቦት ነበር በዚህ ወቅት። ሲደርስ ወንዶቹና ሴቶቹ ምግቡን ገና እያዘገጃጁ ነበር።', meaning: 'Kinde went to Birqa thinking the meat would be ready and waiting for him. He was very hungry by now, but when he arrived, the men and women were still preparing the food.' },
      { amharic: '«እንቧይባድ ላይ ወጥ ሰሪዎቹ ለመስራት ሲዘገጃጁ ነበር ወደዚህ የመጣሁት» በማለት አሰበ። «ምግቡ አሁን ደርሶ ይሆናል።» ክንዴ ወደ እንቧይባድ ለመመለስ ወሰነ።', meaning: '"The cooks at Enqoybad were just getting ready when I left," he thought. "The food must be ready by now." Kinde decided to go back to Enqoybad.' },
      { amharic: 'ክንዴ እንቧይባዱ ድግስ ጋ ሲደርስ ሰዎቹ በልተው ጨርሰዋል። እንግዶች ለሙሽሪትና ለሙሽራው ስጦታ እየሰጡ ነበር። ክንዴ በጣም ስስታም ነበር። የሚሰጠው ስጦታ አልነበረውም። መብላት ብቻ ነበር የፈለገው።', meaning: 'When Kinde reached the Enqoybad feast, people had already finished eating. Guests were giving gifts to the bride and groom. Kinde was very stingy; he had no gift to give, he only wanted to eat.' },
      { amharic: 'ክንዴ ምግቡን በማጣቱ በጣም ተበሳጭቶ ነበር። ወደ ብርቃ መንደር ለመመለስ ወሰነ። ስለተራበና ስለደከመው በፍጥነት ሊጓዝ አልቻለም ነበር።', meaning: "Kinde was very upset about missing the food. He decided to head back to Birqa. Hungry and tired, he couldn't walk quickly." },
      { amharic: 'ብርቃ ሰዎቹ ሲጨፍሩና ሲዘፍኑ ደረሰ። ምግቡን ሁሉ በልተው ጨርሰው ነበር።', meaning: 'He arrived in Birqa to find people singing and dancing, having already finished eating all the food.' },
      { amharic: 'ምግብ ምንም እንዳልቀረ ሲሰማ ክንዴ ወድቆ ራሱን ሳተ። የሁለቱም ድግስ ስጋ አምልጦት ነበር። ያገኛት በትንሽ ስኒ የነበረች ገንፎ ብቻ ነበረች።', meaning: 'When he heard there was no food left at all, Kinde collapsed and fainted. He had missed the meat at both feasts, all he got was a little porridge in a small cup.' },
      { amharic: 'ተናዶና ተርቦ ቀስ ብሎ ወደ ቤቱ እያዘገመ ሄደ።', meaning: 'Angry and hungry, he trudged slowly home.' },
    ],
    credit: {
      text: 'Mutugi Kamundi',
      illustration: 'Zablon Alex Nguku',
      translation: 'መዘምር ግርማ',
      license: 'CC BY',
      source: 'African Storybook (africanstorybook.org)',
    },
  },
];
