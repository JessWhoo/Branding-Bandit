
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { BrandBible, SocialMediaKitAssets, SeoRecommendations } from '../types';

// Per guidelines, initialize GoogleGenAI with an object containing the apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a comprehensive brand bible based on a company mission.
 */
export async function generateBrandBible(mission: string): Promise<BrandBible> {
    // FIX: Using gemini-2.5-pro for complex JSON generation as it is a complex text task.
    const model = 'gemini-2.5-pro';
    const prompt = `
        Based on the following company mission, generate a comprehensive brand bible. The output must be a valid JSON object that strictly follows the provided schema.

        **Mission:** "${mission}"

        The brand bible should include:
        1.  **brandName**: A catchy and relevant brand name.
        2.  **palette**: An array of 5 color objects, each with 'hex' (e.g., "#FFFFFF"), 'name' (e.g., "Snow White"), and 'usage' (e.g., "Primary Background").
        3.  **fonts**: An object with 'header' and 'body' font pairings from Google Fonts, and 'notes' explaining the choice.
        4.  **logoDescriptions**: An object with 'primary' (a detailed description for the main logo), 'secondary' (an array of exactly two descriptions for secondary marks/icons), and 'favicon' (a description for a simplified, iconic version of the primary logo, suitable for small sizes like 16x16. It must avoid text and fine details). The descriptions should be detailed enough for an image generation model to create a visual from it. For example, "A minimalist line art logo of a phoenix rising, geometric style, using the primary brand color". The descriptions MUST NOT contain any text.
        5.  **harmonies**: An array of 2 suggested color harmony objects (e.g., Analogous, Complementary) that complement the primary palette. Each object must include: 'name' (the harmony type), 'palette' (an array of 3-4 new color objects with 'hex' and 'name'), and 'explanation' (a brief sentence on why this harmony works for the brand).
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    brandName: { type: Type.STRING, description: "A catchy and relevant brand name for the company." },
                    palette: {
                        type: Type.ARRAY,
                        description: "An array of 5 color objects that form the brand's color palette.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                hex: { type: Type.STRING, description: "The hexadecimal code for the color." },
                                name: { type: Type.STRING, description: "A descriptive name for the color." },
                                usage: { type: Type.STRING, description: "The intended use for the color (e.g., Primary, Accent)." },
                            },
                            required: ['hex', 'name', 'usage'],
                        },
                    },
                    fonts: {
                        type: Type.OBJECT,
                        description: "An object describing the font pairing for the brand.",
                        properties: {
                            header: { type: Type.STRING, description: "The name of the Google Font for headers." },
                            body: { type: Type.STRING, description: "The name of the Google Font for body text." },
                            notes: { type: Type.STRING, description: "A brief note on why this font pairing works for the brand." },
                        },
                        required: ['header', 'body', 'notes'],
                    },
                    logoDescriptions: {
                        type: Type.OBJECT,
                        description: "Detailed descriptions for generating the brand's logos.",
                        properties: {
                            primary: { type: Type.STRING, description: "A detailed visual description for the primary logo. No text." },
                            secondary: {
                                type: Type.ARRAY,
                                description: "An array of exactly two detailed visual descriptions for secondary logos or marks. No text.",
                                items: { type: Type.STRING },
                            },
                            favicon: {
                                type: Type.STRING,
                                description: "A simplified, iconic version of the primary logo description for use as a favicon. No text, no fine details."
                            },
                        },
                        required: ['primary', 'secondary', 'favicon'],
                    },
                    harmonies: {
                        type: Type.ARRAY,
                        description: "An array of 2 suggested color harmonies based on the primary palette.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the color harmony (e.g., 'Analogous Harmony')." },
                                palette: {
                                    type: Type.ARRAY,
                                    description: "An array of 3-4 color objects for this harmony.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            hex: { type: Type.STRING, description: "The hexadecimal code for the color." },
                                            name: { type: Type.STRING, description: "A descriptive name for the color." },
                                        },
                                        required: ['hex', 'name']
                                    }
                                },
                                explanation: { type: Type.STRING, description: "A brief explanation of why this harmony works for the brand." }
                            },
                            required: ['name', 'palette', 'explanation']
                        }
                    }
                },
                required: ['brandName', 'palette', 'fonts', 'logoDescriptions', 'harmonies'],
            },
        },
    });

    const jsonText = response.text.trim();
    // A simple validation to ensure we have a parseable object.
    try {
        const parsed = JSON.parse(jsonText);
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error("Generated response is not a valid JSON object.");
        }
        return parsed as BrandBible;
    } catch (e) {
        console.error("Failed to parse Brand Bible JSON:", e);
        console.error("Received text:", jsonText);
        throw new Error("The AI returned an invalid data structure for the Brand Bible. Please try again.");
    }
}

/**
 * Generates a single image using Imagen.
 */
export async function generateImage(prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9", isLogo: boolean = false): Promise<string> {
    // FIX: Using imagen-4.0-generate-001 for high-quality image generation.
    const model = 'imagen-4.0-generate-001';
    const fullPrompt = isLogo 
        ? `A modern, minimalist vector logo. Description: ${prompt}. The logo should be on a solid white background, simple, iconic, and easily recognizable. No text.`
        : prompt;

    const response = await ai.models.generateImages({
        model,
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

/**
 * Generates the brand voice and tone guidelines.
 */
export async function generateBrandVoice(mission: string, bible: BrandBible): Promise<string> {
    // FIX: Using gemini-2.5-flash for a basic text generation task.
    const model = 'gemini-2.5-flash';
    const prompt = `
        Based on the company mission and brand bible, define the brand's voice and tone.
        The output must be in Markdown format.

        **Company Mission:** "${mission}"
        
        **Brand Name:** ${bible.brandName}
        **Color Palette:** ${bible.palette.map(c => `${c.name} (${c.hex})`).join(', ')}
        **Typography:** Header: ${bible.fonts.header}, Body: ${bible.fonts.body}

        Please provide:
        ## Brand Voice Summary
        A short paragraph summarizing the core voice.

        ## Voice Characteristics
        - **We are:** (list 3-4 positive adjectives)
        - **We are not:** (list 3-4 contrasting adjectives)

        ## Example Applications
        Provide a few short examples of this voice in action (e.g., a social media post, an email subject line).
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text;
}

/**
 * Generates SEO recommendations for the brand.
 */
export async function generateSeoRecommendations(mission: string, bible: BrandBible): Promise<SeoRecommendations> {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Based on the company mission and brand bible, generate SEO metadata recommendations.
        The output must be a valid JSON object that strictly follows the provided schema.

        **Company Mission:** "${mission}"
        **Brand Name:** ${bible.brandName}
        
        Please provide:
        1. **titleTags**: 3 distinct, compelling HTML title tags (approx 50-60 characters).
        2. **metaDescription**: A concise, SEO-friendly meta description (150-160 characters) summarizing the brand.
        3. **keywords**: A list of 10-15 relevant SEO keywords or keyphrases for the website.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titleTags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 suggested title tags."
                    },
                    metaDescription: {
                        type: Type.STRING,
                        description: "Meta description for the homepage."
                    },
                    keywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of SEO keywords."
                    }
                },
                required: ['titleTags', 'metaDescription', 'keywords']
            }
        }
    });
    
    const jsonText = response.text.trim();
     try {
        const parsed = JSON.parse(jsonText);
        return parsed as SeoRecommendations;
    } catch (e) {
        console.error("Failed to parse SEO JSON:", e);
         throw new Error("The AI returned an invalid data structure for SEO. Please try again.");
    }
}

/**
 * Generates social media post ideas.
 */
export async function generateSocialMediaPosts(mission: string, bible: BrandBible): Promise<string[]> {
    const model = 'gemini-2.5-pro';
    const prompt = `
        Based on the company mission and brand bible, generate 5 creative and engaging social media post ideas. The output must be a valid JSON object that strictly follows the provided schema.

        **Company Mission:** "${mission}"
        
        **Brand Name:** ${bible.brandName}
        **Color Palette:** ${bible.palette.map(c => c.name).join(', ')}
        **Typography:** Header: ${bible.fonts.header}, Body: ${bible.fonts.body}
        **Voice Notes:** The voice should align with these font choices: ${bible.fonts.notes}

        Please provide 5 distinct post ideas. Aim for a mix of types:
        - An engaging question for the audience.
        - A behind-the-scenes look at the company/product.
        - A post celebrating a customer story or user-generated content.
        - An educational tip or piece of advice related to the brand's industry.
        - A creative promotional post for a product or service.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    posts: {
                        type: Type.ARRAY,
                        description: "An array of 5 social media post ideas, each as a string.",
                        items: { type: Type.STRING },
                    },
                },
                required: ['posts'],
            },
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed.posts)) {
            return parsed.posts as string[];
        }
        throw new Error("Generated response 'posts' is not a valid array.");
    } catch (e) {
        console.error("Failed to parse Social Media Posts JSON:", e);
        console.error("Received text:", jsonText);
        throw new Error("The AI returned an invalid data structure for Social Media Posts. Please try again.");
    }
}


/**
 * Generates visual assets like mood boards and social media kits.
 */
export async function generateVisualAssets(bible: BrandBible): Promise<{ moodBoard: string[], socialKit: SocialMediaKitAssets }> {
    const colorTheme = bible.palette.map(c => c.name).join(', ');

    // Prompts for mood board (abstract, thematic images)
    const moodBoardPrompts = [
        `An abstract, visually striking image representing the core concept of '${bible.brandName}'. The image should evoke a sense of innovation and empowerment, using a color palette inspired by ${colorTheme}. High-resolution, cinematic lighting.`,
        `A high-quality photograph that captures the mood and essence of the brand. Clean, modern, and professional. It should feel aspirational and align with the brand's mission.`,
        `A textured background that incorporates the brand's primary colors (${colorTheme}) in a subtle, elegant way. Could be a digital graphic or a photograph of a real-world texture.`,
        `A lifestyle image that represents the target audience of '${bible.brandName}'. The scene should be positive and engaging, reflecting the brand's values. Natural lighting.`
    ];

    // Prompts for social media & website kit
    const websiteBannerPrompt = `A high-resolution website hero banner for '${bible.brandName}'. It should be visually captivating and incorporate the brand's color palette (${colorTheme}). Design should be professional and modern, with plenty of negative space on one side for headlines and call-to-action buttons. It must not contain any text. Abstract and sophisticated.`;
    const socialBannerPrompt = `A professional social media banner for '${bible.brandName}'. It should be visually appealing and incorporate the brand's color palette (${colorTheme}). Leave ample empty space for text overlays. The style should be modern and clean. It must not contain any text.`;
    const postTemplatePrompts = [
        `A square social media post template for '${bible.brandName}'. It should use the brand colors (${colorTheme}) and have a clean, modern design with a designated area for a photo and text. It must not contain any text.`,
        `A square social media template for a quote or a customer testimonial. It should have a visually interesting background using the brand's colors and style. It must not contain any text.`,
        `A square social media template for a product announcement or feature highlight. It should be bold and eye-catching, using the brand's visual identity. It must not contain any text.`
    ];

    // Generate all images in parallel for efficiency
    const moodBoardPromises = moodBoardPrompts.map(p => generateImage(p, '1:1'));
    const socialKitPromises = [
        generateImage(websiteBannerPrompt, '16:9'),
        generateImage(socialBannerPrompt, '16:9'),
        ...postTemplatePrompts.map(p => generateImage(p, '1:1'))
    ];
    
    // Using Promise.allSettled to handle potential individual failures
    const [moodBoardResults, socialKitImageResults] = await Promise.all([
        Promise.allSettled(moodBoardPromises),
        Promise.allSettled(socialKitPromises)
    ]);

    const moodBoard = moodBoardResults
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);
    
    const successfulSocialImages = socialKitImageResults
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);

    const websiteBanner = successfulSocialImages.length > 0 ? successfulSocialImages[0] : '';
    const banner = successfulSocialImages.length > 1 ? successfulSocialImages[1] : '';
    const postTemplates = successfulSocialImages.length > 2 ? successfulSocialImages.slice(2) : [];
    
    return {
        moodBoard,
        socialKit: {
            websiteBanner,
            banner,
            postTemplates,
        }
    };
}

/**
 * Engages in a chat conversation about branding.
 */
export const startBrandingChat = (): Chat => {
    // FIX: Using ai.chats.create to start a chat session, with gemini-2.5-pro for better conversational abilities.
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: `
                You are "Branding Bot", an expert AI assistant specializing in branding, marketing, and design. 
                Your goal is to help users refine their brand identity based on the brand bible they've generated.
                You are friendly, insightful, and provide actionable advice.
                When asked for visual ideas, describe them vividly but do not generate images.
                Keep your responses concise and focused on the user's questions.
            `
        },
    });
    return chat;
};
