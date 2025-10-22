import { GoogleGenAI, Type, Chat } from "@google/genai";
import { BrandBible, SocialMediaKitAssets } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const brandBibleSchema = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING, description: "A creative and fitting name for the brand." },
    palette: {
      type: Type.ARRAY,
      description: "A 5-color palette. The first should be primary, second accent, and the rest supporting.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "e.g., 'Midnight Blue', 'Sunset Orange'" },
          hex: { type: Type.STRING, description: "The hex code, e.g., '#FFFFFF'" },
          usage: { type: Type.STRING, description: "How to use this color (e.g., 'Primary buttons and CTAs', 'Backgrounds', 'Text')" },
        },
        required: ["name", "hex", "usage"],
      },
    },
    fonts: {
      type: Type.OBJECT,
      description: "A pair of Google Fonts that work well together.",
      properties: {
        header: { type: Type.STRING, description: "Name of the Google Font for headers (e.g., 'Montserrat')" },
        body: { type: Type.STRING, description: "Name of the Google Font for body text (e.g., 'Lato')" },
        notes: { type: Type.STRING, description: "A brief note on why this pairing works." },
      },
      required: ["header", "body", "notes"],
    },
    logoDescriptions: {
      type: Type.OBJECT,
      description: "Detailed, visually rich descriptions for generating logos.",
      properties: {
        primary: { type: Type.STRING, description: "A detailed prompt for the main logo. Describe style (e.g., minimalist, geometric, illustrative), subject, and mood. For example: 'A minimalist, geometric logo of a soaring eagle, representing freedom and vision. Use clean lines and a modern aesthetic.'" },
        secondary: {
          type: Type.ARRAY,
          description: "Two detailed prompts for secondary brand marks or icons, variations of the primary logo.",
          items: { type: Type.STRING },
        },
      },
      required: ["primary", "secondary"],
    },
  },
  required: ["brandName", "palette", "fonts", "logoDescriptions"],
};

export const generateBrandBible = async (mission: string): Promise<BrandBible> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a complete brand identity bible based on this company mission: "${mission}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: brandBibleSchema,
        systemInstruction: "You are an expert brand identity designer. Your task is to generate a complete brand identity based on a user's company mission. The output must be a valid JSON object adhering to the provided schema. Be creative and professional. Ensure you provide exactly 5 colors and 2 secondary logo descriptions."
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    // Basic validation
    if (!data.palette || data.palette.length !== 5) throw new Error("API returned incorrect number of colors.");
    if (!data.logoDescriptions.secondary || data.logoDescriptions.secondary.length !== 2) throw new Error("API returned incorrect number of secondary logos.");

    return data as BrandBible;
  } catch (error) {
    console.error("Error generating brand bible:", error);
    throw new Error("Failed to generate brand identity. The model may have returned an unexpected format.");
  }
};

type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export const generateImage = async (prompt: string, aspectRatio: AspectRatio = '1:1', isLogo: boolean = false): Promise<string> => {
  try {
    const finalPrompt = isLogo ? `${prompt}, simple, vector logo, on a plain white background` : prompt;
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image.`);
  }
};


export const generateBrandVoice = async (mission: string, bible: BrandBible): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following company mission and visual identity, create a set of brand voice guidelines.
            
            Mission: "${mission}"
            
            Visual Identity: ${JSON.stringify({ brandName: bible.brandName, palette: bible.palette, fonts: bible.fonts, logoStyle: bible.logoDescriptions.primary })}
            
            The guidelines should include:
            - Tone of Voice: 3-5 descriptive keywords.
            - Communication Style: e.g., professional, witty, empathetic.
            - Examples: 2-3 examples of the voice in action (e.g., a website headline, a social media post).
            
            Format the output using simple markdown: use '##' for headings, '**' for bold text, and '-' for bullet points.`,
            config: {
                 systemInstruction: "You are an expert brand strategist. Your task is to create clear and concise brand voice guidelines based on the provided information. Follow the requested markdown format precisely."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating brand voice:", error);
        throw new Error("Failed to generate brand voice guidelines.");
    }
};

const generatePromptsForVisuals = async (bible: BrandBible): Promise<{ moodBoardPrompts: string[], bannerPrompt: string, postPrompts: string[] }> => {
    const promptSchema = {
        type: Type.OBJECT,
        properties: {
            moodBoardPrompts: {
                type: Type.ARRAY,
                description: "4 distinct, detailed, visually rich prompts for an image generation AI to create a mood board. Describe abstract textures, lifestyle imagery, and concepts that evoke the brand's feel. Do not describe logos.",
                items: { type: Type.STRING }
            },
            bannerPrompt: {
                type: Type.STRING,
                description: "1 detailed prompt for an abstract social media banner. It should incorporate the brand colors and feel, but not contain any text or logos."
            },
            postPrompts: {
                type: Type.ARRAY,
                description: "3 detailed prompts for square social media post templates (e.g., an announcement, a quote, a product feature). They should be visually representative of the brand, abstract, and good as backgrounds.",
                items: { type: Type.STRING }
            }
        },
        required: ["moodBoardPrompts", "bannerPrompt", "postPrompts"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a creative director. Based on this brand identity: ${JSON.stringify(bible)}, generate a set of prompts for an image generation AI. Ensure you provide exactly 4 mood board prompts, 1 banner prompt, and 3 post prompts.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: promptSchema
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        
        if (!data.moodBoardPrompts || data.moodBoardPrompts.length !== 4) throw new Error("Incorrect number of mood board prompts");
        if (!data.bannerPrompt) throw new Error("Missing banner prompt");
        if (!data.postPrompts || data.postPrompts.length !== 3) throw new Error("Incorrect number of post prompts");

        return data;
    } catch (error) {
        console.error("Error generating visual prompts:", error);
        throw new Error("Failed to generate prompts for visual assets.");
    }
}

export const generateVisualAssets = async (bible: BrandBible): Promise<{ moodBoard: string[], socialKit: SocialMediaKitAssets }> => {
    const { moodBoardPrompts, bannerPrompt, postPrompts } = await generatePromptsForVisuals(bible);
    
    const moodBoardImagePromises = moodBoardPrompts.map(prompt => generateImage(prompt, '1:1', false));
    const bannerImagePromise = generateImage(bannerPrompt, '16:9', false);
    const postImagePromises = postPrompts.map(prompt => generateImage(prompt, '1:1', false));

    const [moodBoard, banner, postTemplates] = await Promise.all([
        Promise.all(moodBoardImagePromises),
        bannerImagePromise,
        Promise.all(postImagePromises),
    ]);
    
    return {
        moodBoard,
        socialKit: {
            banner,
            postTemplates
        }
    };
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: 'You are a friendly and knowledgeable branding expert. Answer questions about branding, marketing, and design concisely.'
    }
  });
};
