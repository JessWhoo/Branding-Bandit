import React, { useState } from 'react';
import { ColorInfo, ColorHarmony } from '../types';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface ColorPaletteProps {
  palette: ColorInfo[];
  harmonies?: ColorHarmony[];
  onUpdate?: (newPalette: ColorInfo[]) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ palette, harmonies, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPalette, setEditedPalette] = useState<ColorInfo[]>(palette);

  const handleDownload = () => {
    const jsonString = JSON.stringify({ palette, harmonies }, null, 2);
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    downloadFile(data, 'color-palette.json');
  };

  const handleSave = () => {
      if (onUpdate) {
          onUpdate(editedPalette);
      }
      setIsEditing(false);
  };

  const handleCancel = () => {
      setEditedPalette(palette);
      setIsEditing(false);
  };

  const handleChange = (index: number, field: keyof ColorInfo, value: string) => {
      const newPalette = [...editedPalette];
      newPalette[index] = { ...newPalette[index], [field]: value };
      setEditedPalette(newPalette);
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-100">Color Palette</h3>
                {onUpdate && !isEditing && (
                    <button
                        onClick={() => {
                            setEditedPalette(palette);
                            setIsEditing(true);
                        }}
                        className="text-xs bg-gray-700 hover:bg-indigo-600 text-white py-1 px-3 rounded transition-colors"
                    >
                        Edit
                    </button>
                )}
                {isEditing && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="text-xs bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            <button
                onClick={handleDownload}
                title="Download Palette & Harmonies as JSON"
                aria-label="Download color palette and harmonies as a JSON file"
                className="p-2 rounded-full bg-gray-600 hover:bg-indigo-500 transition-colors"
            >
                <DownloadIcon />
            </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(isEditing ? editedPalette : palette).map((color, index) => (
                <div 
                    key={index} 
                    className="bg-gray-700 p-4 rounded-lg shadow-md transition-transform hover:scale-105 animate-fade-in-up"
                    style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                             <div className="w-full h-24 rounded-md mb-1 border-2 border-gray-600 relative overflow-hidden">
                                <input 
                                    type="color" 
                                    value={color.hex}
                                    onChange={(e) => handleChange(index, 'hex', e.target.value)}
                                    className="absolute -top-2 -left-2 w-[120%] h-[120%] p-0 m-0 cursor-pointer"
                                />
                             </div>
                             <input 
                                type="text" 
                                value={color.name}
                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                className="bg-gray-800 text-white text-sm p-1 rounded border border-gray-600 w-full"
                                placeholder="Name"
                             />
                             <input 
                                type="text" 
                                value={color.hex}
                                onChange={(e) => handleChange(index, 'hex', e.target.value)}
                                className="bg-gray-800 text-gray-400 text-xs p-1 rounded border border-gray-600 w-full uppercase"
                                placeholder="#HEX"
                             />
                              <input 
                                type="text" 
                                value={color.usage}
                                onChange={(e) => handleChange(index, 'usage', e.target.value)}
                                className="bg-gray-800 text-gray-300 text-xs p-1 rounded border border-gray-600 w-full"
                                placeholder="Usage"
                             />
                        </div>
                    ) : (
                        <>
                            <div
                                aria-hidden="true"
                                className="w-full h-24 rounded-md mb-3 border-2 border-gray-600"
                                style={{ backgroundColor: color.hex }}
                            ></div>
                            <h4 className="font-semibold text-white">{color.name}</h4>
                            <p className="text-sm text-gray-400 uppercase tracking-wider">{color.hex}</p>
                            <p className="text-xs text-gray-300 mt-2">{color.usage}</p>
                        </>
                    )}
                </div>
            ))}
        </div>

        {harmonies && harmonies.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-700">
                <h4 className="text-xl font-bold text-gray-200 mb-4">Suggested Harmonies</h4>
                <div className="space-y-8">
                    {harmonies.map((harmony, index) => (
                        <div 
                            key={index} 
                            className="bg-gray-700/50 p-6 rounded-lg animate-fade-in-up"
                            style={{ animationFillMode: 'backwards', animationDelay: `${(index + 1) * 200}ms` }}
                        >
                            <h5 className="text-lg font-semibold text-indigo-400 mb-2">{harmony.name}</h5>
                            <p className="text-sm text-gray-400 mb-4 max-w-2xl">{harmony.explanation}</p>
                            <div className="flex flex-wrap gap-4">
                                {harmony.palette.map(color => (
                                    <div key={color.hex} className="flex flex-col items-center">
                                        <div 
                                            className="w-20 h-20 rounded-md border-2 border-gray-600 shadow-md" 
                                            style={{ backgroundColor: color.hex }}
                                            aria-label={`${color.name} color swatch`}
                                        ></div>
                                        <p className="text-sm font-medium mt-2 text-white">{color.name}</p>
                                        <p className="text-xs text-gray-400 uppercase">{color.hex}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};