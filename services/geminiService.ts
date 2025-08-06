
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
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

    // Return the original error message instead of a generic one.
    return errorMessage;
};


export const generateStoryContent = async (params: StoryParams): Promise<{title: string; scenes: Omit<Scene, 'id' | 'imageUrl'>[]; characters: Omit<Character, 'imageUrl'>[]}> => {
  const prompt = `
    Generate a short, engaging, and age-appropriate story for a ${params.age}-year-old ${params.gender}. The story's theme should be "${params.theme}".
    The story must have a clear beginning, a rising action, a climax/twist, a falling action, and a simple, positive moral at the end.
    The story should be broken down into 4 to 6 scenes.
    The tone should be magical, heartwarming, and full of wonder.
    The story must be in ${params.language}.
    Structure the output as a single JSON object with the following keys: "title" (a string), "scenes" (an array of objects, where each object has "text" and "imagePrompt" string keys), and "characters" (an array of objects, where each object has "name" and "description" string keys). Do not include any other text or markdown formatting outside of the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: storyGenerationModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const rawText = response.text.trim();
    let jsonString = rawText;

    // Find the start and end of the JSON object, even if it's wrapped in other text or markdown.
    const jsonStartIndex = rawText.indexOf('{');
    const jsonEndIndex = rawText.lastIndexOf('}');

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
    } else {
        // If we can't find a JSON-like structure, we can't proceed.
        throw new Error("The AI's response did not contain a readable story format.");
    }
    
    try {
        const parsed = JSON.parse(jsonString);
        // Validate response structure
        if (!parsed.title || !Array.isArray(parsed.scenes) || !Array.isArray(parsed.characters)) {
            throw new Error("Invalid story structure received from API.");
        }
        return parsed;
    } catch (parseError) {
        console.error("Failed to parse JSON from AI response:", parseError);
        console.error("Original AI response text:", rawText);
        throw new Error("The AI's response was not in a readable story format.");
    }

  } catch (error) {
    // If it's one of our specific errors, pass it through. Otherwise, use the handler.
    if (error.message.startsWith("The AI's response") || error.message.startsWith("Invalid story structure")) {
      throw error;
    }
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