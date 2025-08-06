declare var process: {
  env: {
    API_KEY: string;
  };
};

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { StoryParams, Scene, Character } from "../types";

// The API key is provided by the environment variable `process.env.API_KEY`.
// The execution context must have this variable available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storyGenerationModel = "gemini-2.5-flash";
const imageGenerationModel = "imagen-3.0-generate-002";

// A centralized error handler to provide user-friendly messages.
const handleGoogleAIError = (error: any): string => {
  const errorMessage = error.toString();
  console.error("Google AI Error:", errorMessage);

  if (errorMessage.includes("API key not valid")) {
    return "The provided API Key is invalid. Please check your configuration.";
  }
  if (
    errorMessage.includes("429") ||
    errorMessage.toLowerCase().includes("quota")
  ) {
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
export const generateStoryContent = async (
  params: StoryParams
): Promise<{
  title: string;
  scenes: Pick<Scene, "text">[];
  characters: Omit<Character, "imageUrl">[];
}> => {
  const prompt = `
    Generate a short, engaging, and age-appropriate story for a ${params.age}-year-old ${params.gender}.
    The story's theme should be "${params.theme}".
    The story must be in ${params.language}.
    It must be broken down into exactly 5 scenes, each a paragraph long.
    Also, describe the main characters. For each character, provide a name and a detailed visual description suitable for an AI image generator. The description should be rich in visual details about appearance, clothing, and colors (e.g., 'a small, fluffy brown bear with a tiny red scarf and bright blue eyes').
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: storyGenerationModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The story's title." },
            scenes: {
              type: Type.ARRAY,
              description: "The 5 scenes of the story.",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The paragraph of text for the scene.",
                  },
                },
                required: ["text"],
              },
            },
            characters: {
              type: Type.ARRAY,
              description:
                "The main characters in the story, each with a visual description.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "The character's name.",
                  },
                  description: {
                    type: Type.STRING,
                    description:
                      "A detailed visual description of the character for an image generator.",
                  },
                },
                required: ["name", "description"],
              },
            },
          },
          required: ["title", "scenes", "characters"],
        },
      },
    });

    const parsed = JSON.parse(response.text);
    if (
      !parsed.title ||
      !Array.isArray(parsed.scenes) ||
      !Array.isArray(parsed.characters)
    ) {
      throw new Error("Invalid story structure received from API.");
    }
    return parsed;
  } catch (error) {
    console.error(
      "Failed to generate or parse story content:",
      error,
      "Params:",
      params
    );
    throw new Error(handleGoogleAIError(error));
  }
};

// Phase 2: Generate the scene image from text, injecting character details for consistency.
export const generateImage = async (
  sceneText: string,
  allStoryCharacters: Character[]
): Promise<{ prompt: string; imageUrl: string }> => {
  // Find which characters from the story are mentioned in this specific scene.
  const charactersInScene = allStoryCharacters.filter((character) =>
    sceneText.toLowerCase().includes(character.name.toLowerCase())
  );

  // Create a string of character descriptions to guide the AI.
  const characterDescriptions = charactersInScene
    .map((c) => c.description)
    .join(", ");
  const characterPromptPart = characterDescriptions
    ? `, featuring ${characterDescriptions}`
    : "";

  // Construct the final, detailed prompt for the image generation model.
  const finalPrompt = `charming children's book illustration of: ${sceneText}${characterPromptPart}. Style: vibrant and whimsical, family-friendly, G-rated, safe-for-children, colorful, soft lighting, detailed and magical.`;

  try {
    const response = await ai.models.generateImages({
      model: imageGenerationModel,
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "9:16",
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return {
        prompt: finalPrompt,
        imageUrl: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`,
      };
    } else {
      throw new Error("API returned no images for the prompt.");
    }
  } catch (error) {
    console.error(
      `Failed to generate image for prompt "${finalPrompt}"`,
      error
    );
    throw new Error(handleGoogleAIError(error));
  }
};

// Phase 3: Generate character portraits.
export const generateCharacterImage = async (
  description: string
): Promise<string> => {
  const prompt = `Cute character portrait of ${description}, family-friendly, G-rated, safe-for-children, circular frame, whimsical children's book illustration style, charming, vibrant colors, simple background.`;
  try {
    const response = await ai.models.generateImages({
      model: imageGenerationModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "1:1",
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    } else {
      throw new Error("API returned no images for the character description.");
    }
  } catch (error) {
    console.error(
      `Failed to generate character image for description "${description}"`,
      error
    );
    throw new Error(handleGoogleAIError(error));
  }
};
