
import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, Sparkles, Copy, ChevronRight, Image as ImageIcon, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { OptimizedPrompt, GenerationResult } from './types';
import { optimizePromptFromImages, generateImageWithPrompt } from './services/geminiService';

export default function App() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const modelInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setModelImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptimize = async () => {
    if (!modelImage || !productImage) {
      setError("Please upload both a model portrait and a product image.");
      return;
    }
    setIsOptimizing(true);
    setError(null);
    try {
      const prompts = await optimizePromptFromImages(modelImage, productImage);
      setResult({
        id: Date.now().toString(),
        originalImage: modelImage,
        optimizedPrompts: prompts
      });
    } catch (err) {
      setError("Failed to optimize prompt. Please try again.");
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGeneratePreview = async (promptObj: OptimizedPrompt) => {
    if (!modelImage) return;
    setIsGeneratingImage(promptObj.title);
    setError(null);
    try {
      const generatedUrl = await generateImageWithPrompt(modelImage, promptObj.prompt);
      setResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          generatedImage: generatedUrl
        };
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Image generation failed. Try a different prompt.");
      console.error(err);
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <header className="py-12 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-600/20 rounded-2xl">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Prompt Architect Pro
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Engineer high-end commercial photography prompts by merging your model's identity with your product's aesthetic.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              1. Model Portrait
            </h2>
            <div 
              onClick={() => modelInputRef.current?.click()}
              className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center ${
                modelImage ? 'border-blue-500/50' : 'border-gray-700 hover:border-gray-500 bg-white/5'
              }`}
            >
              {modelImage ? (
                <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Upload model face</p>
                </div>
              )}
              <input ref={modelInputRef} type="file" className="hidden" accept="image/*" onChange={handleModelUpload} />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              2. Product Image
            </h2>
            <div 
              onClick={() => productInputRef.current?.click()}
              className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center ${
                productImage ? 'border-purple-500/50' : 'border-gray-700 hover:border-gray-500 bg-white/5'
              }`}
            >
              {productImage ? (
                <img src={productImage} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Upload product photo</p>
                </div>
              )}
              <input ref={productInputRef} type="file" className="hidden" accept="image/*" onChange={handleProductUpload} />
            </div>
          </div>

          {(modelImage && productImage) && (
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              {isOptimizing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  Analyzing Both Images...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Merge & Optimize
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result?.generatedImage && (
            <div className="glass-panel p-6 rounded-3xl border-blue-500/20">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-400" />
                Live Visualization
              </h2>
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/5">
                <img src={result.generatedImage} alt="Generated" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCcw className={`w-6 h-6 text-green-400 ${isOptimizing ? 'animate-spin' : ''}`} />
              Commercial Concepts
            </h2>
            {result && (
              <span className="text-gray-500 text-sm">{result.optimizedPrompts.length} concepts ready</span>
            )}
          </div>

          {result ? (
            <div className="grid gap-6">
              {result.optimizedPrompts.map((p, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl hover:bg-white/[0.05] transition-colors group border-l-4 border-l-blue-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{p.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge icon={<Camera className="w-3 h-3" />} text={p.camera} />
                        <Badge icon={<RefreshCcw className="w-3 h-3" />} text={p.focalLength} />
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(p.prompt, p.title)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {copyFeedback === p.title ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                      {p.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Lighting Design</span>
                      <p className="text-gray-400 line-clamp-2">{p.lighting}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">Environment</span>
                      <p className="text-gray-400 line-clamp-2">{p.environment}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleGeneratePreview(p)}
                    disabled={isGeneratingImage !== null}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 group/btn"
                  >
                    {isGeneratingImage === p.title ? (
                      <RefreshCcw className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-purple-400 group-hover/btn:scale-125 transition-all" />
                    )}
                    See AI Concept
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[500px] rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-center p-8 bg-black/20">
              <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Package className="w-12 h-12 text-gray-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-400">Waiting for Ingredients</h3>
              <p className="text-gray-600 text-sm mt-2 max-w-sm">
                Upload both your <b>Model</b> and <b>Product</b> images to start generating professional commercial photography prompts.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full text-[10px] font-semibold text-gray-400 uppercase tracking-wide border border-white/5">
      {icon}
      {text}
    </span>
  );
}
