import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface ModerationResult {
    flagged: boolean;
    reason?: string;
    category?: "scam" | "prohibited" | "spam" | "harassment";
    shouldAutoApprove: boolean;
}

const PROMPT = `You are a content moderator for "UniDeal", a university-only peer-to-peer marketplace. 
Analyze the following item listing (Title and Description) for prohibited content.
Prohibited content includes: 
1. Illegal drugs or substances.
2. Weapons or dangerous items.
3. Explicit adult content or services.
4. Clear scams or phishing attempts.
5. Harassment or hate speech towards university members.
6. Non-university-related spam.

Output only a JSON object in this exact format:
{
  "flagged": boolean,
  "reason": "short string explaining why if flagged, else null",
  "category": "scam" | "prohibited" | "spam" | "harassment" | null,
  "shouldAutoApprove": boolean (true if safe, false if flagged or suspicious)
}

Listing to analyze:
Title: {TITLE}
Description: {DESCRIPTION}`;

export async function moderateListing(title: string, description: string): Promise<ModerationResult> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY missing, skipping AI moderation (auto-approving)");
        return { flagged: false, shouldAutoApprove: true };
    }

    try {
        const prompt = PROMPT.replace("{TITLE}", title).replace("{DESCRIPTION}", description);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Attempt to extract JSON if Gemini adds markdown wrappers
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

        const parsed = JSON.parse(jsonString);
        return {
            flagged: parsed.flagged || false,
            reason: parsed.reason || undefined,
            category: parsed.category || undefined,
            shouldAutoApprove: parsed.shouldAutoApprove ?? true
        };
    } catch (error) {
        console.error("AI Moderation Error:", error);
        // Fail safe: if AI fails, mark as pending (shouldAutoApprove: false) but not flagged
        return { flagged: false, shouldAutoApprove: false, reason: "Moderation system timeout" };
    }
}
