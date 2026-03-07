import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const BANNED_KEYWORDS = [
    'weed', 'ganja', 'cocaine', 'heroin', 'pills', 'drugs', 'narcotics',
    'gun', 'pistol', 'rifle', 'weapon', 'explosive', 'bomb',
    'stolen', 'fake', 'counterfeit', 'illegal',
    'porn', 'nude', 'adult', 'escort',
    'guaranteed profit', 'mlm', 'pyramid', 'investment scheme',
];

export interface ModerationResult {
    flagged: boolean;
    reason?: string;
    mismatch?: boolean;
    shouldAutoApprove?: boolean;
}

export async function moderateListing({
    title,
    description,
    imageUrl,
}: {
    title: string;
    description?: string;
    imageUrl?: string;
}): Promise<ModerationResult> {

    // Layer 1 — keyword check first (fast, no API call)
    const text = `${title} ${description ?? ''}`.toLowerCase();
    for (const keyword of BANNED_KEYWORDS) {
        if (text.includes(keyword)) {
            return { flagged: true, reason: `Contains banned keyword: "${keyword}"`, shouldAutoApprove: false };
        }
    }

    // Layer 2 — Gemini vision check
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const parts: any[] = [];

        if (imageUrl) {
            try {
                const imgRes = await fetch(imageUrl);
                const buffer = await imgRes.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg';
                parts.push({ inlineData: { data: base64, mimeType } });
            } catch {
                // image fetch failed — proceed without it
            }
        }

        parts.push({
            text: `
You are a content moderator for UniDeal — a university campus marketplace in India where students buy and sell second-hand items.

Listing details:
Title: "${title}"
Description: "${description ?? 'No description provided'}"
${imageUrl ? 'An image is provided above.' : 'No image provided.'}

Respond ONLY with this exact JSON format, no other text:
{
  "flagged": boolean,
  "reason": "string or null",
  "mismatch": boolean
}

Set flagged to true if: illegal items, drugs, weapons, stolen goods, adult content, scam or spam.
Set mismatch to true only if an image was provided AND the image clearly does not match the title (e.g. title says "laptop" but image shows food or is an unrelated stock photo).
Set reason to a short explanation if flagged or mismatched, otherwise null.
      `.trim(),
        });

        const result = await model.generateContent(parts);
        const clean = result.response.text().trim().replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        return {
            flagged: Boolean(parsed.flagged),
            reason: parsed.reason ?? undefined,
            mismatch: Boolean(parsed.mismatch),
            shouldAutoApprove: !parsed.flagged && !parsed.mismatch,
        };

    } catch (err) {
        console.error('Gemini moderation failed:', err);
        return { flagged: false, shouldAutoApprove: true }; // fail open
    }
}
