import React, { useRef } from 'react';
import { Image as ImageIcon, Plus, Ban } from 'lucide-react';

const PRESET_COLORS = [
  'transparent', '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#00ffff', '#ff00ff', '#f3f4f6', '#d1d5db', '#9ca3af',
  '#4b5563', '#1f2937', '#fcd34d', '#f87171', '#60a5fa', '#34d399'
];

export function BackgroundSelector({ currentBg, onBgChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onBgChange({ type: 'image', value: url });
    }
  };

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Background</h3>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Transparent Option */}
        <button
          onClick={() => onBgChange({ type: 'color', value: 'transparent' })}
          className={`flex-shrink-0 w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center overflow-hidden relative ${currentBg.value === 'transparent' ? 'ring-2 ring-blue-500' : ''}`}
          title="Transparent"
        >
          <div className="absolute inset-0 opacity-20" 
             style={{ 
                 backgroundImage: `linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)`,
                 backgroundSize: '10px 10px'
             }} 
          />
          <Ban className="w-4 h-4 text-gray-400 relative z-10" />
        </button>

        {/* Custom Image Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex-shrink-0 w-10 h-10 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors ${currentBg.type === 'image' ? 'ring-2 ring-blue-500' : ''}`}
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4 text-gray-300" />
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
        />

        {/* Preset Colors */}
        {PRESET_COLORS.filter(c => c !== 'transparent').map((color) => (
          <button
            key={color}
            onClick={() => onBgChange({ type: 'color', value: color })}
            className={`flex-shrink-0 w-10 h-10 rounded-full border border-gray-700 transition-all ${currentBg.value === color ? 'ring-2 ring-blue-500 scale-110' : ''}`}
            style={{ backgroundColor: color }}
          />
        ))}

        {/* Color Picker Input */}
        <div className="relative flex-shrink-0 w-10 h-10 rounded-full border border-gray-700 overflow-hidden">
            <input 
                type="color"
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                onChange={(e) => onBgChange({ type: 'color', value: e.target.value })}
                value={currentBg.type === 'color' && currentBg.value !== 'transparent' ? currentBg.value : '#000000'}
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <Plus className="w-4 h-4 text-white mix-blend-difference" />
            </div>
        </div>
      </div>
    </div>
  );
}
