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
];
