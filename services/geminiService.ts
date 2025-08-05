
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StoryParams, Scene, Character } from '../types';

// The API key is provided by the environment variable `process.env.API_KEY`.
// The execution context must have this variable available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storyGenerationModel = "gemini-2.5-flash";
const imageGenerationModel = 'imagen-3.0-generate-002';

// A centralized error handler to provide user-friendly messages.
const handleGoogleAIError = (error: any): string => {
    const errorMessage = error.toString();
    console.error("Google AI Error:", errorMessage);

    if (errorMessage.includes("API key not valid")) {
        return "The provided API Key is invalid. Please check your configuration.";
    }
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
        return "You've exceeded your request limit for the day. Please try again tomorrow.";
    }
    if (errorMessage.toLowerCase().includes("safety")) {
        return "The request was blocked due to safety settings. Please try a different theme or prompt.";
    }
    if (errorMessage.includes("400")) {
        return "The request was malformed. This might be a temporary issue, please try again.";
    }

    return "An unexpected error occurred while communicating with the AI. Please try again.";
};


const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, catchy title for the story."
        },
        scenes: {
            type: Type.ARRAY,
            description: "The different scenes that make up the story.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: {
                        type: Type.STRING,
                        description: "The narrative text for this scene."
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A detailed, descriptive prompt for an AI image generator to create a visual for this scene. The prompt should describe characters, setting, and action in a whimsical, vibrant, and friendly art style suitable for a children's book. Do not include any story text in this prompt."
                    }
                },
                required: ["text", "imagePrompt"]
            }
        },
        characters: {
            type: Type.ARRAY,
            description: "A list of the main characters in the story.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The character's name." },
                    description: { type: Type.STRING, description: "A short physical description of the character for an image generator (e.g., 'a small brown mouse with a red scarf')." }
                },
                required: ["name", "description"]
            }
        }
    },
    required: ["title", "scenes", "characters"]
};

export const generateStoryContent = async (params: StoryParams): Promise<{title: string; scenes: Omit<Scene, 'id' | 'imageUrl'>[]; characters: Omit<Character, 'imageUrl'>[]}> => {
  const prompt = `
    Generate a short, engaging, and age-appropriate story for a ${params.age}-year-old ${params.gender}. The story's theme should be "${params.theme}".
    The story must have a clear beginning, a rising action, a climax/twist, a falling action, and a simple, positive moral at the end.
    The story should be broken down into 4 to 6 scenes.
    The tone should be magical, heartwarming, and full of wonder.
    The story must be in ${params.language}.
    Structure the output as a JSON object that strictly follows the provided schema.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: storyGenerationModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    // Validate response structure
    if (!parsed.title || !Array.isArray(parsed.scenes) || !Array.isArray(parsed.characters)) {
        throw new Error("Invalid story structure received from API.");
    }
    
    return parsed;

  } catch (error) {
    throw new Error(handleGoogleAIError(error));
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    // Enhanced prompt for better safety and style consistency.
    const fullPrompt = `charming storybook style, ${prompt}, in the style of a vibrant and whimsical children's book illustration, family-friendly, G-rated, safe-for-children, colorful, friendly characters, soft lighting, detailed and magical.`;
    try {
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("API returned no images for the prompt.");
        }
    } catch (error) {
        console.error(`Failed to generate image for prompt "${prompt}"`, error);
        // Re-throw a new error with a user-friendly message.
        throw new Error(handleGoogleAIError(error));
    }
};

export const generateCharacterImage = async (description: string): Promise<string> => {
    // Enhanced prompt for safety and consistency.
    const prompt = `Cute character portrait of ${description}, family-friendly, G-rated, safe-for-children, circular frame, whimsical children's book illustration style, charming, vibrant colors, simple background.`;
     try {
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("API returned no images for the character description.");
        }
    } catch (error) {
        console.error(`Failed to generate character image for description "${description}"`, error);
        // Re-throw a new error with a user-friendly message.
        throw new Error(handleGoogleAIError(error));
    }
}
