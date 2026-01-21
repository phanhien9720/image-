
export interface OptimizedPrompt {
  title: string;
  prompt: string;
  camera: string;
  lighting: string;
  environment: string;
  focalLength: string;
}

export interface GenerationResult {
  id: string;
  originalImage: string;
  generatedImage?: string;
  optimizedPrompts: OptimizedPrompt[];
  isGenerating?: boolean;
}
