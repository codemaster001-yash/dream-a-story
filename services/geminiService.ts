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
    Craft a heartwarming and thought-provoking short story for a ${params.age}-year-old ${params.gender}, written in the simple yet profound style of storytellers like Sudha Murty.
    The story should be in ${params.language} and subtly weave in the central theme of '${params.theme}'.

    The narrative must follow this 5 scene structure, with each part being a single, descriptive paragraph using age-appropriate language:
    1. Begin with introducing the main character in the middle of a moment with a simple yet unusual observation that makes the reader curious. It should be something that feels both real and slightly out of place, sparking a question in the protagonist's mind. (e.g., "The shadow of the old banyan tree didn't dance like the others; it stood perfectly still.")
    2. Introduce a clear, relatable challenge that the protagonist feels compelled to understand or solve. The challenge should require careful observation, planning, empathy or recognizing a pattern—not just physical strength.
    3. Show the protagonist making two or three sincere attempts to solve the puzzle that don't work. Emphasize the thought process over the failure itself. Show them thinking, "That didn't work. What can I learn from that? Let me try another way." normalizing the act of trying, failing and learning.
    4. The 'Aha!' Moment should arrive through the protagonist's own curiosity and effort. They might notice a tiny detail they missed before, try a completely new approach, or understand something by simply watching, listening, or asking someone a humble question. The breakthrough is earned, not given.
    5. End the story not with a moral, but with a quiet, sensory moment of wonder. Close with a gentle, open-ended question that allows the reader's imagination to continue the story and reflect on the experience. (e.g., "As the sweet smell of the wet earth filled the air, he wondered how many other simple secrets the world was waiting to share.")

    Show, Don't Tell, Engage the Senses: Bring the world to life by describing the feel of things (e.g., the rough texture of a hand-spun rope, the warmth of a freshly made chapati, the cool surface of a brass lamp). Use simple words to describe space and direction (under the cot, behind the water pump, through the winding lane).
    Child-like Agency: The protagonist is the hero of the story, the solution must come from their own ingenuity and observation. Adults can be present, but they should not solve the problem. Avoid any magical or unbelievable fixes.
    Pacing and Tone: Keep the language simple, clear, and rhythmic. The tone should be one of warmth, curiosity, and exploration.
      
    Also, describe the main characters. For each character, provide a name and a detailed visual description suitable for an AI image generator. The description should be rich in visual details about appearance, clothing, and colors (e.g., 'a small, fluffy brown bear with a tiny red scarf and bright blue eyes'). `;

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
