import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import { Upload, Download, Loader2, Image as ImageIcon, Sparkles, X, ArrowRightLeft, Layers, Zap, Eraser, Move } from 'lucide-react';
import { AdMobService } from './services/AdMobService';
import { NotificationService } from './services/NotificationService';
import { BackgroundSelector } from './components/BackgroundSelector';
import { MaskEditor } from './components/MaskEditor';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [background, setBackground] = useState({ type: 'color', value: 'transparent' });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');
  const [error, setError] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isEditingMask, setIsEditingMask] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize Services
    AdMobService.initialize();
    AdMobService.showBanner();
    NotificationService.register();

    return () => {
      AdMobService.hideBanner();
    };
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setOriginalImage(file);
      setProcessedImage(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!originalImage) return;

    try {
      // 1. Show Rewarded Ad
      setLoadingText('Watching Ad...');
      setIsLoading(true);
      setError(null);
      
      try {
          // Attempt to show ad, but don't hard block if it fails (e.g. adblocker or no internet)
          // In strict production, you might want to enforce this.
          await AdMobService.prepareRewardedAd(); 
          await AdMobService.showRewardedAd();
      } catch (adError) {
          console.warn("Ad skipped/failed", adError);
      }

      // 2. Call Backend
      setLoadingText('Removing Background...');
      
      const formData = new FormData();
      formData.append('file', originalImage);

      // Dynamic URL based on Platform
      // Web: localhost (for dev)
      // Android: Production Render URL (so it works on real phones)
      let BACKEND_URL = 'http://localhost:8000';
      
      if (Capacitor.getPlatform() === 'android') {
          // LIVE Render Backend
          BACKEND_URL = 'https://ai-background-remover-cuk3.onrender.com';
      }
      
      console.log('Using Backend URL:', BACKEND_URL); 

      const response = await axios.post(`${BACKEND_URL}/remove-bg`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = URL.createObjectURL(response.data);
      setProcessedImage(imageUrl);

    } catch (err) {
      console.error(err);
      setError('Connection failed. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw Background
          if (background.type === 'color' && background.value !== 'transparent') {
              ctx.fillStyle = background.value;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (background.type === 'image') {
              // Note: This needs complex scaling logic to match CSS 'cover'.
              // For MVP, we stick to simple drawing or color.
              // To properly support image bg, we'd need to load that image too.
              // Letting user know basic implementation for now:
              console.warn("Background image compositing in download simplified for MVP");
          }

          // Draw Foreground
          ctx.drawImage(img, 0, 0);

          // Trigger Download
          const link = document.createElement('a');
          const format = background.value === 'transparent' ? 'image/png' : 'image/jpeg';
          link.href = canvas.toDataURL(format);
          link.download = `removed_bg_${Date.now()}.${format === 'image/png' ? 'png' : 'jpg'}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      };
      
      img.crossOrigin = "anonymous";
      img.src = processedImage;
    }
  };

  const resetEditor = () => {
      setOriginalImage(null);
      setProcessedImage(null);
      setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Header / Navbar */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1a1a1a] z-10 shadow-md">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 via-white to-green-500 rounded-lg flex items-center justify-center shadow-lg">
                <Layers className="text-black w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none">AI Background Remover</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider">BY AGRASEN APPS</span>
            </div>
        </div>
        <div>
            {/* Optional Menu / Settings Icon could go here */}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-8">
        
        <AnimatePresence mode="wait">
            {!originalImage ? (
                /* Empty State / Upload */
                <motion.div 
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center max-w-md w-full text-center"
                >
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group w-full aspect-[4/3] bg-[#1E1E1E] rounded-3xl border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-[#252525] transition-all cursor-pointer flex flex-col items-center justify-center gap-6 shadow-2xl"
                    >
                        <div className="w-20 h-20 rounded-full bg-[#121212] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-800">
                            <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-200">Upload Photo</h3>
                            <p className="text-gray-500 text-sm">Tap to browse gallery</p>
                        </div>
                    </div>
                    
                    {/* Feature Pills */}
                    <div className="flex gap-4 mt-8">
                         <div className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] rounded-full border border-gray-800 text-xs text-gray-400">
                            <Zap className="w-3 h-3 text-yellow-500" /> Instant
                         </div>
                         <div className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] rounded-full border border-gray-800 text-xs text-gray-400">
                            <Sparkles className="w-3 h-3 text-purple-500" /> AI Powered
                         </div>
                    </div>
                </motion.div>
            ) : (
                /* Editor State */
                <motion.div 
                    key="editor"
                    className="relative w-full max-w-lg flex-1 flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* View Area */}
                    {/* View Area */}
                    <div className="relative w-full aspect-[3/4] sm:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group bg-[#1a1a1a]">
                        
                        {/* Transparency Grid Pattern (Always there as base) */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" 
                             style={{ 
                                 backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
                                 backgroundSize: '20px 20px',
                                 backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                             }} 
                        />

                        {/* Selected Background Layer */}
                        {processedImage && !isComparing && (
                            <div className="absolute inset-0 z-0 transition-colors duration-300"
                                style={{
                                    backgroundColor: background.type === 'color' ? background.value : 'transparent',
                                    backgroundImage: background.type === 'image' ? `url(${background.value})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        )}

                        {/* Image Content */}
                        <div className="absolute inset-0 p-4 flex items-center justify-center z-10">
                             {/* Show processed image if available and not comparing. Otherwise show original. */}
                             <img 
                                src={processedImage && !isComparing ? processedImage : URL.createObjectURL(originalImage)}
                                alt="Workspace"
                                className="max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-300"
                             />
                        </div>

                        {/* Top Controls */}
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                             <button 
                                onClick={resetEditor}
                                className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
                             >
                                <X className="w-5 h-5" />
                             </button>
                        </div>
                        
                        {/* Compare Button Indicator */}
                        {processedImage && (
                            <div className="absolute top-4 left-4 z-20">
                                <button
                                    onMouseDown={() => setIsComparing(true)}
                                    onMouseUp={() => setIsComparing(false)}
                                    onTouchStart={() => setIsComparing(true)}
                                    onTouchEnd={() => setIsComparing(false)}
                                    className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-all ${isComparing ? 'bg-blue-600 text-white' : 'bg-black/40 text-gray-200 border border-white/10'}`}
                                >
                                    <ArrowRightLeft className="w-3 h-3" />
                                    {isComparing ? 'Showing Original' : 'Hold to Compare'}
                                </button>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                <p className="text-white font-medium tracking-wide animate-pulse">{loadingText}</p>
                            </div>
                        )}
                        
                        {/* Error Toast */}
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg text-sm flex items-center justify-center backdrop-blur-md z-50">
                                {error}
                            </div>
                        )}
                    </div>
                     
                     {/* Background Selector */}
                    {processedImage && (
                        <div className="w-full mt-4 flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-sm font-medium text-gray-300">Tools</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setIsEditingMask(true)}
                                    className="flex items-center justify-center gap-2 py-3 bg-[#252525] hover:bg-[#303030] rounded-xl text-sm font-medium border border-gray-800 transition-all"
                                >
                                    <Eraser className="w-4 h-4 text-blue-400" />
                                    Manual Refine
                                </button>
                                {/* Placeholder for more tools */}
                            </div>

                            <BackgroundSelector currentBg={background} onBgChange={setBackground} />
                        </div>
                    )}

                    {/* Bottom Toolbar */}
                    <div className="w-full mt-6 px-4">
                         {!processedImage ? (
                             <button
                                onClick={processImage}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                             >
                                <Sparkles className="w-5 h-5" />
                                Remove Background
                             </button>
                         ) : (
                             <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={resetEditor} // Changed to full reset for "Try Again"
                                    className="bg-[#252525] hover:bg-[#303030] text-gray-300 py-4 rounded-xl font-medium transition-colors"
                                >
                                    Start New
                                </button>
                                <button
                                    onClick={downloadImage}
                                    className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-semibold shadow-lg shadow-green-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <Download className="w-5 h-5" />
                                    Save
                                </button>
                             </div>
                         )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Mask Editor Modal */}
        <AnimatePresence>
            {isEditingMask && processedImage && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    className="fixed inset-0 z-50 pointer-events-auto"
                >
                    <MaskEditor 
                        originalImage={originalImage}
                        processedImage={processedImage}
                        onSave={(newImage) => {
                            setProcessedImage(newImage);
                            setIsEditingMask(false);
                        }}
                        onCancel={() => setIsEditingMask(false)}
                    />
                </motion.div>
            )}
        </AnimatePresence>

        <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
            ref={fileInputRef}
        />
      </main>
      
      {/* Banner Ad Area Filter */}
      <div className="h-[60px] w-full bg-[#0a0a0a] flex items-center justify-center border-t border-gray-800 text-[10px] text-gray-600 uppercase tracking-widest">
         Ad Space
      </div>

    </div>
  );
}

export default App;
