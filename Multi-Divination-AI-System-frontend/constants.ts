import { DivinationMethod } from './types';

export const APP_TITLE = "多元占卜AI系統";
export const GEMINI_MODEL_TEXT = "gemini-2.5-flash";

export const DIVINATION_METHODS_CONFIG: { id: DivinationMethod; name: string; description: string }[] = [
  { id: DivinationMethod.LifePathNumber, name: "生命數字 (Life Path Number)", description: "Uncover your core essence through your birth date." },
  { id: DivinationMethod.Palmistry, name: "手相 (Palmistry)", description: "Interpret lines and mounts on your palm for insights." },
  { id: DivinationMethod.Astrology, name: "占星 (Astrology)", description: "Explore celestial influences based on your birth chart." },
  { id: DivinationMethod.MBTI, name: "MBTI 性格分析", description: "Understand your personality type and preferences." },
  { id: DivinationMethod.Tarot, name: "塔羅牌 (Tarot)", description: "Seek guidance and clarity on your questions through tarot." },
];

export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

export interface MBTIQuizQuestion {
  id: string;
  text: string;
  options: [
    { text: string; value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' },
    { text: string; value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' }
  ];
  dichotomy: 'EI' | 'SN' | 'TF' | 'JP';
}

export const MBTI_QUIZ_QUESTIONS: MBTIQuizQuestion[] = [
  {
    id: 'q1_ei',
    dichotomy: 'EI',
    text: "When you are at a social gathering, do you typically:",
    options: [
      { text: "Feel energized by interacting with many people, including strangers.", value: 'E' },
      { text: "Prefer to spend time with a few people you know well, and feel drained by too much socializing.", value: 'I' }
    ]
  },
  {
    id: 'q2_sn',
    dichotomy: 'SN',
    text: "When learning something new, do you prefer to:",
    options: [
      { text: "Focus on concrete facts, details, and practical applications.", value: 'S' },
      { text: "Look for patterns, connections, and future possibilities.", value: 'N' }
    ]
  },
  {
    id: 'q3_tf',
    dichotomy: 'TF',
    text: "When making important decisions, do you prioritize:",
    options: [
      { text: "Logic, objective principles, and fairness.", value: 'T' },
      { text: "Harmony, empathy, and how the decision will affect others.", value: 'F' }
    ]
  },
  {
    id: 'q4_jp',
    dichotomy: 'JP',
    text: "Regarding your lifestyle and plans, do you prefer to:",
    options: [
      { text: "Have things decided, organized, and planned out.", value: 'J' },
      { text: "Keep your options open and be spontaneous and flexible.", value: 'P' }
    ]
  }
];