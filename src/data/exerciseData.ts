// Comprehensive speech therapy exercises following the Linguistic Hierarchy
// From isolated sounds (Beginner) to phrases/sentences (Intermediate) to spontaneous speech (Advanced)

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus?: string;
}

export interface ExerciseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  focus: string;
  beginner: Exercise[];
  intermediate: Exercise[];
  advanced: Exercise[];
}

export const exerciseCategories: ExerciseCategory[] = [
  {
    id: "breathing",
    title: "Belly Breathing",
    description: "Deep controlled breathing for relaxation",
    icon: "💨",
    color: "from-blue-500/20 to-cyan-500/10",
    focus: "Transitions from static breathing to breath support for speech",
    beginner: [
      { id: "breath-b1", name: "Balloon Breath", description: "Inhale for 3, belly out; exhale for 3, belly in.", duration: "2 min", difficulty: "beginner" },
      { id: "breath-b2", name: "The S-Hiss", description: "Inhale deeply, exhale on a steady \"sssss\" for 5 seconds.", duration: "2 min", difficulty: "beginner" },
      { id: "breath-b3", name: "Book Balance", description: "Lie down with a book on your belly; make it rise on inhale.", duration: "3 min", difficulty: "beginner" },
      { id: "breath-b4", name: "4-7-8 Relaxer", description: "Inhale for 4, hold for 7, exhale for 8.", duration: "3 min", difficulty: "beginner" },
      { id: "breath-b5", name: "Shoulder Lock", description: "Inhale while consciously keeping shoulders and chest still.", duration: "2 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "breath-i1", name: "Vowel Stretch", description: "Inhale, then say \"Ahhhhh\" for the full exhale duration.", duration: "3 min", difficulty: "intermediate" },
      { id: "breath-i2", name: "The Z-Hum", description: "Inhale, exhale on a gentle \"zzzzz\" to feel vocal vibration.", duration: "3 min", difficulty: "intermediate" },
      { id: "breath-i3", name: "Counting 1-5", description: "One deep breath, count 1 to 5 slowly on the exhale.", duration: "3 min", difficulty: "intermediate" },
      { id: "breath-i4", name: "Pitch Glide", description: "Inhale, exhale while sliding your voice from low to high.", duration: "4 min", difficulty: "intermediate" },
      { id: "breath-i5", name: "Pulsed Exhale", description: "Inhale, then four sharp \"sh-sh-sh-sh\" pulses using the diaphragm.", duration: "3 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "breath-a1", name: "Sentence Topping", description: "Say a long sentence; \"top up\" your breath at a natural pause.", duration: "4 min", difficulty: "advanced" },
      { id: "breath-a2", name: "Staircase Breathing", description: "Inhale, say a short phrase, inhale, say a longer phrase.", duration: "5 min", difficulty: "advanced" },
      { id: "breath-a3", name: "Walking Talk", description: "Practice 1:1 breathing (one breath per sentence) while walking.", duration: "5 min", difficulty: "advanced" },
      { id: "breath-a4", name: "Emotive Breath", description: "Practice a \"surprised\" breath in, followed by a calm \"Hello.\"", duration: "4 min", difficulty: "advanced" },
      { id: "breath-a5", name: "Public Projection", description: "Breath in deeply and project \"Can you hear me?\" to the back of a room.", duration: "4 min", difficulty: "advanced" },
    ],
  },
  {
    id: "easy-onset",
    title: "Easy Onset",
    description: "Start gently with an 'h' sound",
    icon: "🌊",
    color: "from-green-500/20 to-emerald-500/10",
    focus: "Transitioning from exaggerated \"breathy\" starts to natural speech",
    beginner: [
      { id: "onset-b1", name: "hhh-Apple", description: "Practice with exaggerated 2-second 'h' before \"Apple\".", duration: "2 min", difficulty: "beginner" },
      { id: "onset-b2", name: "hhh-Eat", description: "Gentle breathy start with \"Eat\".", duration: "2 min", difficulty: "beginner" },
      { id: "onset-b3", name: "hhh-Over", description: "Soft onset practice with \"Over\".", duration: "2 min", difficulty: "beginner" },
      { id: "onset-b4", name: "hhh-Island", description: "Easy start with \"Island\".", duration: "2 min", difficulty: "beginner" },
      { id: "onset-b5", name: "hhh-Always", description: "Gentle beginning with \"Always\".", duration: "2 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "onset-i1", name: "Ask Me Later", description: "Practice \"hhh-Ask me later\" as a phrase.", duration: "3 min", difficulty: "intermediate" },
      { id: "onset-i2", name: "I Don't Know", description: "Easy onset on \"hhh-I don't know\".", duration: "3 min", difficulty: "intermediate" },
      { id: "onset-i3", name: "Every Day Is New", description: "Phrase practice: \"hhh-Every day is new\".", duration: "3 min", difficulty: "intermediate" },
      { id: "onset-i4", name: "Under The Bridge", description: "Practice \"hhh-Under the bridge\".", duration: "3 min", difficulty: "intermediate" },
      { id: "onset-i5", name: "Open The Door", description: "Easy start with \"hhh-Open the door\".", duration: "3 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "onset-a1", name: "Reading Onset", description: "Read a paragraph, using easy onset on every word starting with a vowel.", duration: "5 min", difficulty: "advanced" },
      { id: "onset-a2", name: "Telephone Start", description: "Practice \"hhh-Hello, this is [Name]\" into a phone.", duration: "4 min", difficulty: "advanced" },
      { id: "onset-a3", name: "The \"I\" Challenge", description: "Describe your day, using easy onset every time you say \"I.\"", duration: "5 min", difficulty: "advanced" },
      { id: "onset-a4", name: "Fast Answer", description: "Have someone ask \"What is your name?\" and respond with easy onset.", duration: "4 min", difficulty: "advanced" },
      { id: "onset-a5", name: "Speech Intro", description: "Start a 30-second speech using a breathy easy onset on the first word.", duration: "5 min", difficulty: "advanced" },
    ],
  },
  {
    id: "light-contact",
    title: "Light Contact",
    description: "Soft lips and tongue, like a feather touch",
    icon: "🪶",
    color: "from-pink-500/20 to-rose-500/10",
    focus: "Reducing \"hard\" articulatory contact on plosives (B, P, T, D, K, G)",
    beginner: [
      { id: "light-b1", name: "Baby", description: "Say \"Baby\" - lips touch like a feather.", duration: "2 min", difficulty: "beginner" },
      { id: "light-b2", name: "Paper", description: "Practice \"Paper\" with gentle lip contact.", duration: "2 min", difficulty: "beginner" },
      { id: "light-b3", name: "Table", description: "Say \"Table\" - tongue tip barely touches the ridge.", duration: "2 min", difficulty: "beginner" },
      { id: "light-b4", name: "Cookie", description: "Soft 'k' sound in \"Cookie\".", duration: "2 min", difficulty: "beginner" },
      { id: "light-b5", name: "Dime", description: "Light 'd' contact in \"Dime\".", duration: "2 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "light-i1", name: "Big Blue Boat", description: "Practice light contact on all B sounds.", duration: "3 min", difficulty: "intermediate" },
      { id: "light-i2", name: "Two Tiny Tigers", description: "Gentle T sounds throughout.", duration: "3 min", difficulty: "intermediate" },
      { id: "light-i3", name: "Keep The Keys", description: "Soft K sounds in the phrase.", duration: "3 min", difficulty: "intermediate" },
      { id: "light-i4", name: "Good Green Grapes", description: "Light G contact practice.", duration: "3 min", difficulty: "intermediate" },
      { id: "light-i5", name: "Peter Picked Paper", description: "Feather-touch P sounds.", duration: "3 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "light-a1", name: "The Bird Built", description: "\"The bird built a cozy nest.\" Focus on all bold letters.", duration: "4 min", difficulty: "advanced" },
      { id: "light-a2", name: "Pizza Please", description: "\"Please pass the pizza pie.\" Light P contact.", duration: "4 min", difficulty: "advanced" },
      { id: "light-a3", name: "Danny Danced", description: "\"Danny danced during the dinner.\" Gentle D sounds.", duration: "4 min", difficulty: "advanced" },
      { id: "light-a4", name: "Ingredient Reading", description: "Read a list of ingredients, using light contact on every 'k' and 'g' sound.", duration: "5 min", difficulty: "advanced" },
      { id: "light-a5", name: "Mock Order", description: "\"I'd like a beef burger and a coke, please.\" Real-world practice.", duration: "4 min", difficulty: "advanced" },
    ],
  },
  {
    id: "pacing",
    title: "Slow & Steady",
    description: "Slow your rate with pauses between words",
    icon: "🐢",
    color: "from-amber-500/20 to-yellow-500/10",
    focus: "Breaking speech into manageable \"chunks\"",
    beginner: [
      { id: "pace-b1", name: "Finger Tapping", description: "Say \"I / am / here\" while tapping one finger per word.", duration: "3 min", difficulty: "beginner" },
      { id: "pace-b2", name: "Metronome 60BPM", description: "One syllable per beat (e.g., \"U / ni / ver / si / ty\").", duration: "3 min", difficulty: "beginner" },
      { id: "pace-b3", name: "Robot Talk", description: "Speak with deliberate, equal pauses between every single word.", duration: "3 min", difficulty: "beginner" },
      { id: "pace-b4", name: "Counting 1-20", description: "One number per slow, controlled breath.", duration: "4 min", difficulty: "beginner" },
      { id: "pace-b5", name: "Nursery Rhyme", description: "\"Twinkle / Twinkle / Little / Star\" (Slow motion).", duration: "3 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "pace-i1", name: "Thought Groups", description: "\"Today / I will study / at home.\" Natural pauses.", duration: "4 min", difficulty: "intermediate" },
      { id: "pace-i2", name: "Commas Matter", description: "Read a list of items, pausing for 2 seconds at every comma.", duration: "4 min", difficulty: "intermediate" },
      { id: "pace-i3", name: "The 3-Word Rule", description: "Speak in bursts of exactly three words, then pause.", duration: "4 min", difficulty: "intermediate" },
      { id: "pace-i4", name: "News Reading", description: "Read a news headline at half-speed.", duration: "4 min", difficulty: "intermediate" },
      { id: "pace-i5", name: "Directions", description: "Give directions to a place, pausing after every landmark mentioned.", duration: "5 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "pace-a1", name: "The Slow Interview", description: "Answer \"Tell me about yourself\" at 120 words per minute.", duration: "5 min", difficulty: "advanced" },
      { id: "pace-a2", name: "Presentation Pacing", description: "Deliver a topic you are passionate about with intentional pauses.", duration: "6 min", difficulty: "advanced" },
      { id: "pace-a3", name: "Topic Shift", description: "Explain a complex concept, slowing down when the topic gets harder.", duration: "5 min", difficulty: "advanced" },
      { id: "pace-a4", name: "Phone Pacing", description: "Leave a voicemail, ensuring your phone number is said very slowly.", duration: "4 min", difficulty: "advanced" },
      { id: "pace-a5", name: "Debate", description: "Argue a point while consciously keeping your rate slow even when \"excited.\"", duration: "6 min", difficulty: "advanced" },
    ],
  },
  {
    id: "articulation",
    title: "Tongue Twisters",
    description: "Clear sounds and articulation practice",
    icon: "👅",
    color: "from-red-500/20 to-orange-500/10",
    focus: "Coordination of articulators at varying speeds",
    beginner: [
      { id: "twist-b1", name: "Truly Rural", description: "Say it 5 times, focusing on 'r' and 'l' separation.", duration: "3 min", difficulty: "beginner" },
      { id: "twist-b2", name: "Specific Pacific", description: "Focus on the 's' and 'p' sounds.", duration: "3 min", difficulty: "beginner" },
      { id: "twist-b3", name: "Six Sticky Skeletons", description: "Practice the 'sk' cluster.", duration: "3 min", difficulty: "beginner" },
      { id: "twist-b4", name: "Red Leather Yellow Leather", description: "Alternate between sounds smoothly.", duration: "3 min", difficulty: "beginner" },
      { id: "twist-b5", name: "Toy Boat", description: "Focus on the 't' at the end of 'boat'.", duration: "3 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "twist-i1", name: "She Sells Seashells", description: "Maintain a rhythmic beat throughout.", duration: "4 min", difficulty: "intermediate" },
      { id: "twist-i2", name: "Unique New York", description: "Repeat 10 times without stopping.", duration: "4 min", difficulty: "intermediate" },
      { id: "twist-i3", name: "Rubber Baby Buggy Bumpers", description: "Focus on light contact on 'b'.", duration: "4 min", difficulty: "intermediate" },
      { id: "twist-i4", name: "A Happy Hippo Hopped", description: "Practice the 'h' sounds.", duration: "4 min", difficulty: "intermediate" },
      { id: "twist-i5", name: "Double Bubble Gum", description: "\"Double bubble gum, bubbles double.\"", duration: "4 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "twist-a1", name: "Peter Piper Full", description: "Say the whole stanza as fast as possible without a single trip.", duration: "5 min", difficulty: "advanced" },
      { id: "twist-a2", name: "Irish Wristwatch", description: "The hardest for 'sh' and 'ch' precision.", duration: "5 min", difficulty: "advanced" },
      { id: "twist-a3", name: "The Sixth Sick Sheik", description: "\"The Sixth Sick Sheik's Sixth Sheep's Sick.\"", duration: "5 min", difficulty: "advanced" },
      { id: "twist-a4", name: "Betty Botter", description: "Focus on the 't' and 'b' under pressure.", duration: "5 min", difficulty: "advanced" },
      { id: "twist-a5", name: "Walking Twister", description: "Recite a complex twister while walking at a brisk pace.", duration: "6 min", difficulty: "advanced" },
    ],
  },
  {
    id: "mirror",
    title: "Mirror Practice",
    description: "Build awareness with visual feedback",
    icon: "🪞",
    color: "from-sky-500/20 to-blue-500/10",
    focus: "Eliminating \"secondary behaviours\" or tension",
    beginner: [
      { id: "mirror-b1", name: "Mouth Shapes", description: "Silently form \"A-E-I-O-U\" exaggerating the stretch.", duration: "3 min", difficulty: "beginner" },
      { id: "mirror-b2", name: "Smile/Pout", description: "Watch for symmetry in the lips.", duration: "3 min", difficulty: "beginner" },
      { id: "mirror-b3", name: "Tongue Target", description: "Watch your tongue touch the roof of the mouth for 'L'.", duration: "3 min", difficulty: "beginner" },
      { id: "mirror-b4", name: "Jaw Drop", description: "Open your mouth wide; ensure the jaw doesn't \"swing\" to one side.", duration: "3 min", difficulty: "beginner" },
      { id: "mirror-b5", name: "Neutral Face", description: "Simply look at yourself for 1 minute while breathing deeply.", duration: "2 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "mirror-i1", name: "The 'S' Scan", description: "Say \"sssss\" and check if your teeth are clenching too hard.", duration: "3 min", difficulty: "intermediate" },
      { id: "mirror-i2", name: "Sentence Scan", description: "Say \"Hello, how are you?\" and watch for eyebrow raises.", duration: "4 min", difficulty: "intermediate" },
      { id: "mirror-i3", name: "Blink Check", description: "Maintain natural eye contact with yourself while speaking.", duration: "4 min", difficulty: "intermediate" },
      { id: "mirror-i4", name: "Neck Tension", description: "Watch your neck muscles while saying a loud \"Stop!\"", duration: "3 min", difficulty: "intermediate" },
      { id: "mirror-i5", name: "Lip Seal", description: "Watch for a gentle \"M\" closure on words like \"Mom\" or \"Maybe.\"", duration: "3 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "mirror-a1", name: "Emotional Mirror", description: "Tell yourself a sad story and then a happy one; watch for tension changes.", duration: "5 min", difficulty: "advanced" },
      { id: "mirror-a2", name: "Stutter Simulation", description: "Intentionally stutter (pseudo-stuttering) and watch how your face reacts.", duration: "5 min", difficulty: "advanced" },
      { id: "mirror-a3", name: "Complex Explanation", description: "Explain a topic to the mirror; maintain eye contact throughout.", duration: "5 min", difficulty: "advanced" },
      { id: "mirror-a4", name: "The 2-Minute Monologue", description: "Watch your face for the entire duration of a 2-minute talk.", duration: "5 min", difficulty: "advanced" },
      { id: "mirror-a5", name: "Shadowing", description: "Watch a video and \"shadow\" (repeat) the speaker while watching your reflection.", duration: "6 min", difficulty: "advanced" },
    ],
  },
  {
    id: "free-talk",
    title: "Free Talk",
    description: "Chat with your animal buddy!",
    icon: "💬",
    color: "from-indigo-500/20 to-violet-500/10",
    focus: "Generalisation of all techniques to real-world scenarios",
    beginner: [
      { id: "talk-b1", name: "The Ordering Script", description: "\"I'd like a latte, please.\" Practice ordering.", duration: "3 min", difficulty: "beginner" },
      { id: "talk-b2", name: "The Self-Intro", description: "\"Hi, I'm [Name], and I am from [Place].\"", duration: "3 min", difficulty: "beginner" },
      { id: "talk-b3", name: "Picture Description", description: "Look at a photo and describe 5 things you see.", duration: "4 min", difficulty: "beginner" },
      { id: "talk-b4", name: "Daily Schedule", description: "List what you did today in order.", duration: "4 min", difficulty: "beginner" },
      { id: "talk-b5", name: "The Weather Report", description: "Describe the current weather in 3 sentences.", duration: "3 min", difficulty: "beginner" },
    ],
    intermediate: [
      { id: "talk-i1", name: "The Historian", description: "Explain one historical fact you find interesting.", duration: "4 min", difficulty: "intermediate" },
      { id: "talk-i2", name: "The Tech Guide", description: "Explain how to use a simple app to a \"beginner.\"", duration: "5 min", difficulty: "intermediate" },
      { id: "talk-i3", name: "The Travel Agent", description: "Recommend a city to visit and give 3 reasons why.", duration: "5 min", difficulty: "intermediate" },
      { id: "talk-i4", name: "The Chef", description: "Describe the steps to boil an egg.", duration: "4 min", difficulty: "intermediate" },
      { id: "talk-i5", name: "The Librarian", description: "Summarise the plot of your favourite book.", duration: "5 min", difficulty: "intermediate" },
    ],
    advanced: [
      { id: "talk-a1", name: "The Debate Opponent", description: "Argue against a random topic (e.g., \"Is cereal a soup?\").", duration: "5 min", difficulty: "advanced" },
      { id: "talk-a2", name: "The Future Self", description: "Describe your life in 10 years without any preparation.", duration: "5 min", difficulty: "advanced" },
      { id: "talk-a3", name: "The Alien", description: "Explain a \"smartphone\" to someone from another planet.", duration: "5 min", difficulty: "advanced" },
      { id: "talk-a4", name: "The Critic", description: "Give a 2-minute critique of a movie you hated.", duration: "5 min", difficulty: "advanced" },
      { id: "talk-a5", name: "The Interviewer", description: "Answer: \"What is the biggest challenge facing education today?\"", duration: "6 min", difficulty: "advanced" },
    ],
  },
];

// Map quest levels to exercise categories by difficulty
export const questLevelMapping = [
  {
    id: 1,
    name: "Easy Start",
    description: "Begin your journey with simple breathing and sound exercises",
    difficulty: "beginner",
    requiredGems: 0,
    categories: ["breathing", "easy-onset"],
  },
  {
    id: 2,
    name: "Sound Safari",
    description: "Explore light contact and pacing at the beginner level",
    difficulty: "beginner",
    requiredGems: 12,
    categories: ["light-contact", "pacing"],
  },
  {
    id: 3,
    name: "Word Builder",
    description: "Practice intermediate breathing and onset techniques",
    difficulty: "intermediate",
    requiredGems: 27,
    categories: ["breathing", "easy-onset", "light-contact"],
  },
  {
    id: 4,
    name: "Story Time",
    description: "Challenge yourself with intermediate pacing and articulation",
    difficulty: "intermediate",
    requiredGems: 47,
    categories: ["pacing", "articulation", "mirror"],
  },
  {
    id: 5,
    name: "Chat Champion",
    description: "Master advanced techniques and free conversation",
    difficulty: "advanced",
    requiredGems: 72,
    categories: ["articulation", "mirror", "free-talk"],
  },
];

// Get exercises for a specific quest level
export const getExercisesForQuestLevel = (questId: number) => {
  const questLevel = questLevelMapping.find(q => q.id === questId);
  if (!questLevel) return [];

  const exercises: { category: ExerciseCategory; exercises: Exercise[] }[] = [];
  
  for (const categoryId of questLevel.categories) {
    const category = exerciseCategories.find(c => c.id === categoryId);
    if (category) {
      const difficultyExercises = category[questLevel.difficulty as 'beginner' | 'intermediate' | 'advanced'];
      exercises.push({
        category,
        exercises: difficultyExercises,
      });
    }
  }

  return exercises;
};

// AI recommendation engine (mock - would integrate with actual analytics)
export const getAIRecommendation = (questId: number, userAnalytics?: any) => {
  const questLevel = questLevelMapping.find(q => q.id === questId);
  if (!questLevel) return null;

  const exercises = getExercisesForQuestLevel(questId);
  if (exercises.length === 0) return null;

  // Mock AI recommendation based on quest level
  const recommendations: Record<number, { exerciseId: string; reason: string }> = {
    1: { 
      exerciseId: "breath-b1", 
      reason: "Balloon Breath is perfect for starting! It helps you feel calm and ready to speak smoothly." 
    },
    2: { 
      exerciseId: "light-b1", 
      reason: "Baby word practice helps you learn soft sounds - great for your current progress!" 
    },
    3: { 
      exerciseId: "breath-i1", 
      reason: "Vowel Stretch combines breathing with sounds - you're ready for this challenge!" 
    },
    4: { 
      exerciseId: "pace-i1", 
      reason: "Thought Groups will help you speak in natural phrases - perfect for reading practice!" 
    },
    5: { 
      exerciseId: "talk-a1", 
      reason: "The Debate Opponent is the ultimate challenge - use all your skills together!" 
    },
  };

  return recommendations[questId] || null;
};

// Get difficulty color and label
export const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return { color: 'bg-success/20 text-success', label: 'Beginner', emoji: '🌱' };
    case 'intermediate':
      return { color: 'bg-amber-500/20 text-amber-600', label: 'Intermediate', emoji: '🌟' };
    case 'advanced':
      return { color: 'bg-purple-500/20 text-purple-600', label: 'Advanced', emoji: '🏆' };
    default:
      return { color: 'bg-muted text-muted-foreground', label: difficulty, emoji: '📚' };
  }
};
