import React from 'react';
import { FontPair } from '../types';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface FontPairingsProps {
  fonts: FontPair;
}

export const FontPairings: React.FC<FontPairingsProps> = ({ fonts }) => {
  const googleFontsUrl = (fontName: string) => `https://fonts.google.com/specimen/${fontName.replace(/ /g, '+')}`;
  
  const handleDownload = () => {
    const jsonString = JSON.stringify(fonts, null, 2);
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    downloadFile(data, 'font-pairings.json');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-100">Typography</h3>
        <button
            onClick={handleDownload}
            title="Download Fonts as JSON"
            aria-label="Download font pairings as a JSON file"
            className="p-2 rounded-full bg-gray-600 hover:bg-indigo-500 transition-colors"
        >
            <DownloadIcon />
        </button>
      </div>
      <div className="bg-gray-700 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="animate-fade-in-up" style={{ animationFillMode: 'backwards', animationDelay: '100ms' }}>
          <div className="mb-4">
            <p className="text-sm text-gray-400">Header Font</p>
            <a href={googleFontsUrl(fonts.header)} target="_blank" rel="noopener noreferrer" className="text-3xl font-bold text-indigo-400 hover:underline">
                {fonts.header}
                <span className="sr-only">(opens in a new tab)</span>
            </a>
            <p className="text-xl text-gray-200 mt-1">Aa Bb Cc Dd Ee Ff Gg</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Body Font</p>
            <a href={googleFontsUrl(fonts.body)} target="_blank" rel="noopener noreferrer" className="text-2xl text-indigo-400 hover:underline">
                {fonts.body}
                <span className="sr-only">(opens in a new tab)</span>
            </a>
            <p className="text-lg text-gray-200 mt-1">Aa Bb Cc Dd Ee Ff Gg</p>
          </div>
        </div>
        <div className="border-l border-gray-600 pl-6 animate-fade-in-up" style={{ animationFillMode: 'backwards', animationDelay: '200ms' }}>
            <h4 className="font-semibold text-white">Pairing Notes</h4>
            <p className="text-gray-300">{fonts.notes}</p>
        </div>
      </div>
    </div>
  );
};