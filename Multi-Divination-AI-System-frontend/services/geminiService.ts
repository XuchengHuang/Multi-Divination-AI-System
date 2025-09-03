
import { GoogleGenAI, GenerateContentResponse as GeminiInternalResponse, Part, Chat } from "@google/genai";
import { DivinationMethod, UserInputs, Report, GeminiGenerateContentResponse, LifePathNumberInputData, PalmistryInputData, AstrologyInputData, MBTIInputData, TarotInputData } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';


const API_KEY = process.env.API_KEY;


if (!API_KEY) {
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_PLACEHOLDER" });

// Store active chat session at module level
let activeChatSession: Chat | null = null;

function createPromptParts(method: DivinationMethod, data: any, mainQuestion?: string, userName?: string): { promptText?: string, parts?: Part[] } {
  const userContext = userName ? `The user's name is ${userName}. ` : "";
  const questionContext = mainQuestion ? `They are generally seeking insights related to: "${mainQuestion}". ` : "";

  // 语言适应性指令
  const languageInstruction = "IMPORTANT: Respond in the same language as the user's input. If the user's name or question is in Chinese, respond in Chinese. If in English, respond in English. If mixed or unclear, use the primary language of their question or name.";

  const commonInstructions = "${languageInstruction} Format as a professional divination report. Use markdown for structure. Keep the report concise and focused on the most impactful insights."

  switch (method) {
    case DivinationMethod.LifePathNumber:
      const lifePathData = data as LifePathNumberInputData;
      return { 
        promptText: `${userContext}${questionContext}Analyze the Life Path Number derived from the birth date ${lifePathData.dob}. Provide a detailed personality analysis, strengths, weaknesses, life purpose, and career suggestions. ${commonInstructions} Aim for approximately 200-300 words.`
      };
    case DivinationMethod.Palmistry:
      const palmData = data as PalmistryInputData;
      if (!palmData.imageData) throw new Error("Image data is required for Palmistry analysis.");
      return {
        parts: [
          { text: `${userContext}${questionContext}Analyze the uploaded palm image. Provide insights into personality, potential future trends, and key life areas based on traditional palmistry. Focus on major lines and overall hand shape. ${commonInstructions} Deliver a concise reading, around 200-300 words, highlighting key palm features and their meanings.` },
          { inlineData: { mimeType: 'image/jpeg', data: palmData.imageData } } 
        ]
      };
    case DivinationMethod.Astrology:
      const astroData = data as AstrologyInputData;
      return {
        promptText: `${userContext}${questionContext}Generate an astrological profile for ${userName || 'the user'} based on: Date of Birth ${astroData.dob}, Time of Birth ${astroData.tob}, Place of Birth ${astroData.pob}. Focus on core personality traits, potential challenges, life themes. ${commonInstructions} Generate a concise astrological summary, around 200-300 words.`
      };
    case DivinationMethod.MBTI:
      const mbtiData = data as MBTIInputData;
      return {
        promptText: `${userContext}${questionContext}Provide a detailed analysis of the MBTI type: ${mbtiData.type} for ${userName || 'the user'}. Include common traits, cognitive functions (briefly), strengths, weaknesses, career inclinations, and relationship patterns. ${commonInstructions} Offer a brief yet insightful overview, around 200-300 words.`
      };
    case DivinationMethod.Tarot:
      return {
        promptText: `${userContext}Perform a conceptual tarot reading for ${userName || 'the user'} regarding their primary question: "${mainQuestion}". Interpret the 'cards' (conceptually, as an AI) to provide guidance, insights, potential outcomes, and advice. ${commonInstructions} Deliver a brief, focused tarot interpretation (around 150-250 words) directly addressing the user's question with actionable advice. If the question seems recent/news-related, use search.`
      };
    default:
      const _exhaustiveCheck: never = method;
      console.error("Unhandled divination method in createPromptParts:", _exhaustiveCheck);
      return {};
  }
}

const mapGeminiResponse = (response: GeminiInternalResponse): GeminiGenerateContentResponse => {
  return {
    text: response.text,
    candidates: response.candidates?.map(c => ({
      ...c,
      groundingMetadata: c.groundingMetadata ? {
        ...c.groundingMetadata,
        groundingChunks: c.groundingMetadata.groundingChunks?.map(gc => ({
          web: gc.web ? { uri: gc.web.uri, title: gc.web.title } : undefined,
        }))
      } : undefined
    }))
  };
};

export const generateDivinationReport = async (
  method: DivinationMethod, 
  data: UserInputs[DivinationMethod],
  mainQuestion?: string,
  userName?: string
): Promise<GeminiGenerateContentResponse> => {
  if (!API_KEY) throw new Error("API Key for Gemini not configured.");
  
  const { promptText, parts } = createPromptParts(method, data, mainQuestion, userName);

  if (!promptText && (!parts || parts.length === 0)) {
    throw new Error("Invalid divination method or missing data for prompt generation.");
  }

  try {
    const contents = parts ? { parts } : promptText!;
    
    const geminiResponse: GeminiInternalResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: contents,
      config: {
        tools: method === DivinationMethod.Tarot && mainQuestion?.toLowerCase().includes("recent") ? [{googleSearch: {}}] : undefined,
      }
    });
    return mapGeminiResponse(geminiResponse);
  } catch (error: any) {
    console.error(`Error generating ${method} report for ${userName}:`, error);
    throw new Error(`Failed to generate ${method} report. ${error.message || String(error)}`);
  }
};

export const generateIntegratedReport = async (
  individualReports: Report[],
  userName?: string,
  mainQuestion?: string,
): Promise<GeminiGenerateContentResponse> => {
  if (!API_KEY) throw new Error("API Key for Gemini not configured.");
  if (individualReports.length === 0) return { text: "No individual reports to integrate."};

  const userContext = userName ? `This report is for ${userName}. ` : "";
  const questionContext = mainQuestion ? `They are seeking insights on: "${mainQuestion}". ` : "";

  // 语言适应性指令
  const languageInstruction = "IMPORTANT: Respond in the same language as the user's input. If the user's name or question suggests Chinese, respond in Chinese. If English, respond in English. Match the user's primary language.";

  const combinedInputs = individualReports.map(report => `## ${report.title}\n${report.content}`).join("\n\n---\n\n");
  const prompt = `${userContext}${questionContext}You are a Multi-Divination AI. Synthesize the following divination results into a single, **concise yet impactful** comprehensive report (around 300-400 words). Identify common themes, highlight synergies, explain potential contradictions briefly, and provide an overarching narrative about the user's personality, strengths, challenges, and potential life path. Conclude with **3 key actionable pieces of advice.** Format as a professional, empathetic, and empowering comprehensive analysis. Use markdown.

${combinedInputs}

Begin the Integrated Comprehensive Analysis:`;

  try {
    const geminiResponse: GeminiInternalResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return mapGeminiResponse(geminiResponse);
  } catch (error: any) {
    console.error("Error generating integrated report:", error);
    throw new Error(`Failed to generate integrated report. ${error.message || String(error)}`);
  }
};

export const generateCharacterTags = async (
  analysisText: string,
  userName?: string
): Promise<GeminiGenerateContentResponse> => {
  if (!API_KEY) throw new Error("API Key for Gemini not configured.");
  const userContext = userName ? ` for ${userName}` : "";

  // 语言适应性指令
  const languageInstruction = "IMPORTANT: Generate tags in the same language as the analysis text or user's name. If Chinese context, use Chinese tags. If English context, use English tags.";

  const prompt = `Based on the following comprehensive divination analysis${userContext}, generate 3-5 concise, fun, insightful, and accurate 'Character Archetype' tags (each tag ideally 1-3 words) that capture the essence of the user's personality. Present these tags as a JSON array of strings. For example: ["The Mentor", "Insightful Explorer", "Quirky Friend"].

Divination Analysis:
---
${analysisText.substring(0, 15000)} 
---
Character Archetype Tags (JSON array of strings):`;

  try {
    const geminiResponse: GeminiInternalResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    let jsonStr = geminiResponse.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); 
    }
    
    return {
        text: jsonStr, // This is the potentially cleaned JSON string
        candidates: mapGeminiResponse(geminiResponse).candidates
    };

  } catch (error: any) {
    console.error("Error generating character tags:", error);
    throw new Error(`Failed to generate character tags. ${error.message || String(error)}`);
  }
};

export const startChatSessionWithReports = async (
  reports: Report[], // Could be integrated + individual
  characterTags: string[],
  userName: string,
  mainQuestion: string
): Promise<string> => { // Returns initial AI greeting
  if (!API_KEY) throw new Error("API Key for Gemini not configured.");

  const reportSummary = reports.map(r => `### ${r.title}\n${r.content.substring(0, 500)}...`).join("\n\n");
  const tagsString = characterTags.join(", ");

  const systemInstruction = `You are "Aura", an insightful, empathetic, and supportive AI companion. Your approach should be grounded in principles of psychology and compassionate counseling, like a supportive therapist or counselor.

The user, ${userName}, has just received a comprehensive set of divination reports based on their question: "${mainQuestion}".
Their character archetypes have been identified as: [${tagsString}].
A summary of their reports is:
---
${reportSummary}
---

Your role is to discuss these reports with ${userName}. While you acknowledge the divinatory context, your primary focus is to help them understand the insights through a lens of psychological understanding and personal growth.
Help them explore their feelings about the readings, offer comfort if needed, and engage in a supportive conversation about their life, potential, and challenges.
Your primary goal is to provide emotional value, offering comfort, validation, and a safe space for the user to explore their feelings and thoughts.
Help ${userName} gain a deeper understanding of themselves, their patterns, and their potential by gently highlighting connections and offering psychological perspectives on their experiences. Offer actionable, psychologically-informed suggestions that can empower them to navigate their challenges and foster well-being. The emphasis should be on genuine psychological support and helping them feel understood and consoled.

CRITICAL: Always respond in the same language as the user's messages. If the user writes in Chinese, respond in Chinese. If they write in English, respond in English. If the language is mixed or unclear, try to match the language of their name or main question. This is very important for user comfort and understanding.

Speak in a natural, conversational tone. Your responses should match the language of the user's messages. For example, if the user writes in Chinese, you should respond in Chinese. If they write in English, respond in English. If the language is mixed or unclear, default to the language of their main question, or English if that's also unclear.
Be gentle, understanding, curious, and encouraging. You are here to help them process this information, find meaning, and feel psychologically supported.
Do not use markdown formatting in your chat responses; provide plain text suitable for a chat bubble.

Start by warmly greeting ${userName} (try to match the language of their name or mainQuestion for the greeting if possible, otherwise use a general greeting). Acknowledge their reports and question, and invite them to share their thoughts or ask any questions they might have about their readings, focusing on how these insights resonate with their personal experiences, feelings, and psychological well-being.`;

  try {
    activeChatSession = ai.chats.create({
      model: GEMINI_MODEL_TEXT,
      config: { systemInstruction },
    });
    
    const firstAIMessageResponse = await activeChatSession.sendMessage({ message: "Hello Aura, I'm ready to discuss my reports."}); 
    
    return firstAIMessageResponse.text;

  } catch (error: any) {
    console.error("Error starting chat session:", error);
    activeChatSession = null;
    throw new Error(`Failed to start chat session. ${error.message || String(error)}`);
  }
};

export const sendMessageInChat = async (userMessage: string): Promise<string> => {
  if (!activeChatSession) {
    console.warn("Chat session not initialized. Attempting to re-establish with placeholder data if needed.");
    throw new Error("Chat session not active. Please try ending the chat and starting a new one.");
  }
  if (!API_KEY) throw new Error("API Key for Gemini not configured.");

  try {
    const response: GeminiInternalResponse = await activeChatSession.sendMessage({ message: userMessage });
    return response.text;
  } catch (error: any) {
      console.error("Error sending message in chat:", error);
      if (error.message && (error.message.includes("Chat session not found") || error.message.includes("Invalid argument") || error.message.includes("Request payload Conversation not found"))) {
         activeChatSession = null; 
         throw new Error(`Your chat session seems to have ended or encountered an issue. Please start a new chat. (Original: ${error.message})`);
      }
      throw new Error(`Failed to send message. ${error.message || String(error)}`);
  }
};

export const endChatSession = () => {
  activeChatSession = null;
  console.log("Chat session ended.");
};
