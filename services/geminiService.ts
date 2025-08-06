
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
    if (errorMessage.toLowerCase().includes("user location is not supported")) {
        return "This service is not available in your location.";
    }
    if (errorMessage.includes("400")) {
        return "The request was malformed. This might be a temporary issue, please try again.";
    }
    return `An unexpected error occurred: ${errorMessage}`;
};


// Phase 1: Generate only the text content of the story.
export const generateStoryContent = async (params: StoryParams): Promise<{title: string; scenes: Pick<Scene, 'text'>[]; characters: Omit<Character, 'imageUrl'>[]}> => {
  const prompt = `
    Generate a short, engaging, and age-appropriate story for a ${params.age}-year-old ${params.gender}. The story's theme should be "${params.theme}".
    The story must be broken down into exactly 5 scenes, each with a paragraph of text.
    The story must be in ${params.language}.
    Structure the output as a single JSON object with three keys: 
    1. "title": a string for the story's title.
    2. "scenes": an array of 5 objects, where each object has only one key "text" (a string for the scene's paragraph).
    3. "characters": an array of main character objects, where each object has "name" and "description" string keys.
    Do not include any other text or markdown formatting outside of this single JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: storyGenerationModel,
      contents: prompt,
    });

    const rawText = response.text.trim();
    const jsonStartIndex = rawText.indexOf('{');
    const jsonEndIndex = rawText.lastIndexOf('}');

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.title || !Array.isArray(parsed.scenes) || !Array.isArray(parsed.characters)) {
                throw new Error("Invalid story structure received from API.");
            }
            return parsed;
        } catch (parseError) {
            console.error("Failed to parse JSON from AI response:", parseError, "Raw Text:", rawText);
            throw new Error("The AI's response was not in a readable story format.");
        }
    } else {
      throw new Error("The AI's response did not contain a readable story format.");
    }
  } catch (error) {
    throw new Error(handleGoogleAIError(error));
  }
};

// Phase 2a: Generate an image prompt from the scene text.
export const generateImagePrompt = async (sceneText: string): Promise<string> => {
    const prompt = `Based on the following story scene, create a short, descriptive prompt for an image generation AI. The prompt should capture the main action, characters, and setting in a simple phrase. Do not include any extra explanatory text.
    
    Scene: "${sceneText}"
    
    Prompt:`;
    try {
        const response = await ai.models.generateContent({
            model: storyGenerationModel,
            contents: prompt,
        });
        return response.text.trim();
    } catch(error) {
        console.error("Failed to generate image prompt", error);
        throw new Error(handleGoogleAIError(error));
    }
};


// Phase 2b: Generate the actual image from a prompt.
export const generateImage = async (prompt: string): Promise<string> => {
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
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        } else {
            throw new Error("API returned no images for the prompt.");
        }
    } catch (error) {
        console.error(`Failed to generate image for prompt "${prompt}"`, error);
        throw new Error(handleGoogleAIError(error));
    }
};

// Phase 3: Generate character portraits.
export const generateCharacterImage = async (description: string): Promise<string> => {
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
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        } else {
            throw new Error("API returned no images for the character description.");
        }
    } catch (error) {
        console.error(`Failed to generate character image for description "${description}"`, error);
        throw new Error(handleGoogleAIError(error));
    }
}
