import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Brush, Undo, Save, X, RotateCcw } from 'lucide-react';

export function MaskEditor({ originalImage, processedImage, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mode, setMode] = useState('erase'); // 'erase' | 'restore'
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // We need to keep track of the edited state. 
  // Ideally we'd have undo history, but for MVP we'll just stick to current canvas.

  useEffect(() => {
    // Initial Setup: Draw the processed image onto canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Load images
    const imgProcessed = new Image();
    const imgOriginal = new Image();
    
    let loadedCount = 0;
    const checkLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) {
            initCanvas(canvas, imgProcessed, imgOriginal);
        }
    };

    imgProcessed.onload = checkLoaded;
    imgOriginal.onload = checkLoaded;
    
    imgProcessed.src = processedImage;
    // Handle Blob or File object for original
    imgOriginal.src = originalImage instanceof File ? URL.createObjectURL(originalImage) : originalImage;

    return () => {
        // Cleanup if needed
    };
  }, []);

  const [imgObj, setImgObj] = useState({ original: null, processed: null });

  const initCanvas = (canvas, processed, original) => {
    // Fit canvas to container while maintaining aspect ratio
    const container = containerRef.current;
    if (!container) return;

    // Set internal resolution to match image
    canvas.width = processed.width;
    canvas.height = processed.height;

    const ctx = canvas.getContext('2d');
    // Draw initial state
    ctx.drawImage(processed, 0, 0);
    
    setImgObj({ original, processed });
  };

  // Coordinate mapping needed because canvas display size != clean internal resolution
  const getCoordinates = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX, clientY;
      if (e.touches) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = e.clientX;
          clientY = e.clientY;
      }

      return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
      };
  };

  const draw = (e) => {
      if (!isDrawing || !imgObj.original) return;
      // Prevent scrolling on touch
      if (e.type.includes('touch')) e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const { x, y } = getCoordinates(e);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();

      if (mode === 'erase') {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // This clears the 'clip' area
      } else {
          // Restore: Draw the original image snippet in this region
          // We must ensure we are drawing 'source-over'
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(imgObj.original, 0, 0); 
      }

      ctx.restore();
  };

  const handleSave = () => {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4 bg-[#1a1a1a]">
         <div className="flex items-center gap-4">
             <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white"><X /></button>
             <span className="font-medium text-white">Refine Edges</span>
         </div>
         <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-500"
         >
            Done
         </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-[#0a0a0a]" ref={containerRef}>
          {/* Transparency Grid Backing */}
          <div className="absolute inset-4 opacity-20 pointer-events-none" 
                 style={{ 
                     backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
                     backgroundSize: '20px 20px'
                 }} 
          />
          <canvas 
              ref={canvasRef}
              className="max-w-full max-h-full object-contain shadow-2xl border border-gray-800 touch-none"
              onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
              onMouseMove={draw}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={(e) => { setIsDrawing(true); draw(e); }}
              onTouchMove={draw}
              onTouchEnd={() => setIsDrawing(false)}
          />
      </div>

      {/* Toolbar */}
      <div className="h-32 bg-[#1a1a1a] border-t border-gray-800 p-4 flex flex-col gap-4">
          {/* Brush Size Slider */}
          <div className="flex items-center gap-4 px-2">
              <span className="text-xs text-gray-400 font-medium w-12">Size</span>
              <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs text-gray-400 w-8">{brushSize}px</span>
          </div>

          <div className="flex items-center justify-center gap-8">
              <button 
                 onClick={() => setMode('erase')}
                 className={`flex flex-col items-center gap-1 min-w-[60px] ${mode === 'erase' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${mode === 'erase' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
                      <Eraser className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Erase</span>
              </button>

              <button 
                 onClick={() => setMode('restore')}
                 className={`flex flex-col items-center gap-1 min-w-[60px] ${mode === 'restore' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${mode === 'restore' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
                      <Brush className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Restore</span>
              </button>
          </div>
      </div>
    </div>
  );
}
