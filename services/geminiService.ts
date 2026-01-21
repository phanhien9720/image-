
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizedPrompt } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const optimizePromptFromImages = async (modelImage: string, productImage: string): Promise<OptimizedPrompt[]> => {
  const prompt = `
    I am providing two images:
    1. A portrait of a model (first image).
    2. A product or a product scene (second image).

    Your task is to generate 4 diverse and professionally optimized photography prompts that place the model from the first image into a setting or context that fits the product from the second image.

    Each prompt must strictly adhere to these requirements:
    1. It MUST start with the EXACT phrase: "Create a portrait for me using the same face as in the attached file, 100% unchanged, 8K quality" (referring to the first image's face).
    2. Analyze the product in the second image and create a background, props, or environment that perfectly complements or showcases that product.
    3. Suggest a specific high-end camera (e.g., Sony A7R IV, Canon EOS R5, Leica M11).
    4. Define a precise focal length (e.g., 35mm f/1.4, 85mm f/1.2, 50mm f/1.8).
    5. Define a specific camera angle (e.g., low-angle hero shot, eye-level cinematic, product-focused composition).
    6. Describe professional lighting that makes both the model and the product look premium (e.g., high-end commercial lighting, soft box diffusion, atmospheric gels).
    
    Return the response as a JSON array of 4 objects.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: modelImage.split(',')[1] } },
        { inlineData: { mimeType: 'image/jpeg', data: productImage.split(',')[1] } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            camera: { type: Type.STRING },
            lighting: { type: Type.STRING },
            environment: { type: Type.STRING },
            focalLength: { type: Type.STRING }
          },
          required: ["title", "prompt", "camera", "lighting", "environment", "focalLength"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateImageWithPrompt = async (modelImageBase64: string, promptText: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: modelImageBase64.split(',')[1] } },
        { text: promptText }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};
