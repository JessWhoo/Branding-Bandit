import React from 'react';
import { ColorInfo } from '../types';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface ColorPaletteProps {
  palette: ColorInfo[];
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ palette }) => {
  const handleDownload = () => {
    const jsonString = JSON.stringify(palette, null, 2);
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    downloadFile(data, 'color-palette.json');
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-100">Color Palette</h3>
            <button
                onClick={handleDownload}
                title="Download Palette as JSON"
                className="p-2 rounded-full bg-gray-600 hover:bg-indigo-500 transition-colors"
            >
                <DownloadIcon />
            </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {palette.map((color) => (
                <div key={color.hex} className="bg-gray-700 p-4 rounded-lg shadow-md transition-transform hover:scale-105">
                    <div
                        className="w-full h-24 rounded-md mb-3 border-2 border-gray-600"
                        style={{ backgroundColor: color.hex }}
                    ></div>
                    <h4 className="font-semibold text-white">{color.name}</h4>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">{color.hex}</p>
                    <p className="text-xs text-gray-300 mt-2">{color.usage}</p>
                </div>
            ))}
        </div>
    </div>
  );
};
