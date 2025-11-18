import React from 'react';
import { ColorInfo, ColorHarmony } from '../types';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface ColorPaletteProps {
  palette: ColorInfo[];
  harmonies?: ColorHarmony[];
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ palette, harmonies }) => {
  const handleDownload = () => {
    const jsonString = JSON.stringify({ palette, harmonies }, null, 2);
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    downloadFile(data, 'color-palette.json');
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-100">Color Palette</h3>
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
            {palette.map((color, index) => (
                <div 
                    key={color.hex} 
                    className="bg-gray-700 p-4 rounded-lg shadow-md transition-transform hover:scale-105 animate-fade-in-up"
                    style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}
                >
                    <div
                        aria-hidden="true"
                        className="w-full h-24 rounded-md mb-3 border-2 border-gray-600"
                        style={{ backgroundColor: color.hex }}
                    ></div>
                    <h4 className="font-semibold text-white">{color.name}</h4>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">{color.hex}</p>
                    <p className="text-xs text-gray-300 mt-2">{color.usage}</p>
                </div>
            ))}
        </div>

        {harmonies && harmonies.length > 0 && (
            <div className="mt-12">
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
