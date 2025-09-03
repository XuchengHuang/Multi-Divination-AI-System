
export enum DivinationMethod {
  LifePathNumber = "Life Path Number",
  Palmistry = "Palmistry",
  Astrology = "Astrology",
  MBTI = "MBTI",
  Tarot = "Tarot",
}

export interface LifePathNumberInputData {
  dob: string; // YYYY-MM-DD
}

export interface PalmistryInputData {
  imageData?: string; // Base64 encoded image data
  fileName?: string; // Optional: name of the uploaded file
}

export interface AstrologyInputData {
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  pob: string; // Place of birth
}

export interface MBTIInputData {
  type: string; // e.g., "INFJ"
}

export interface TarotInputData {
  // Question is now global, so this might become empty or represent "drawing" action
  initiateReading?: boolean; 
}

export interface UserInputs {
  [DivinationMethod.LifePathNumber]?: LifePathNumberInputData;
  [DivinationMethod.Palmistry]?: PalmistryInputData;
  [DivinationMethod.Astrology]?: AstrologyInputData;
  [DivinationMethod.MBTI]?: MBTIInputData;
  [DivinationMethod.Tarot]?: TarotInputData;
}

export interface Report {
  title: string;
  content: string;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface GeminiCandidate {
  groundingMetadata?: GroundingMetadata;
}

export interface GeminiGenerateContentResponse {
  text: string;
  candidates?: GeminiCandidate[];
}

// Defines the steps in the application flow
export type AppStep =
  | 'demographics'        // User enters name and main question
  | 'methodSelection'     // User selects divination methods
  | 'inputForm'           // User fills out forms for selected methods sequentially
  | 'generatingReport'    // AI is processing
  | 'displayReport'       // Reports are shown
  | 'chatWithAI';         // User chats with AI about their reports

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
