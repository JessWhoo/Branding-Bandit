import React, { useState } from 'react';
import { FontPair } from '../types';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface FontPairingsProps {
  fonts: FontPair;
  onUpdate?: (newFonts: FontPair) => void;
}

export const FontPairings: React.FC<FontPairingsProps> = ({ fonts, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFonts, setEditedFonts] = useState<FontPair>(fonts);

  const googleFontsUrl = (fontName: string) => `https://fonts.google.com/specimen/${fontName.replace(/ /g, '+')}`;
  
  const handleDownload = () => {
    const jsonString = JSON.stringify(fonts, null, 2);
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    downloadFile(data, 'font-pairings.json');
  };

  const handleSave = () => {
      if (onUpdate) {
          onUpdate(editedFonts);
      }
      setIsEditing(false);
  };

  const handleCancel = () => {
      setEditedFonts(fonts);
      setIsEditing(false);
  };

  const handleChange = (field: keyof FontPair, value: string) => {
      setEditedFonts({ ...editedFonts, [field]: value });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-gray-100">Typography</h3>
            {onUpdate && !isEditing && (
                <button
                    onClick={() => {
                        setEditedFonts(fonts);
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
            <p className="text-sm text-gray-400 mb-1">Header Font</p>
            {isEditing ? (
                 <input 
                    type="text" 
                    value={editedFonts.header}
                    onChange={(e) => handleChange('header', e.target.value)}
                    className="bg-gray-800 text-white text-xl font-bold p-2 rounded border border-gray-600 w-full"
                    placeholder="Google Font Name"
                 />
            ) : (
                <a href={googleFontsUrl(fonts.header)} target="_blank" rel="noopener noreferrer" className="text-3xl font-bold text-indigo-400 hover:underline">
                    {fonts.header}
                    <span className="sr-only">(opens in a new tab)</span>
                </a>
            )}
            <p className="text-xl text-gray-200 mt-1" style={!isEditing ? { fontFamily: fonts.header } : {}}>Aa Bb Cc Dd Ee Ff Gg</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Body Font</p>
             {isEditing ? (
                 <input 
                    type="text" 
                    value={editedFonts.body}
                    onChange={(e) => handleChange('body', e.target.value)}
                    className="bg-gray-800 text-white text-lg p-2 rounded border border-gray-600 w-full"
                    placeholder="Google Font Name"
                 />
            ) : (
                <a href={googleFontsUrl(fonts.body)} target="_blank" rel="noopener noreferrer" className="text-2xl text-indigo-400 hover:underline">
                    {fonts.body}
                    <span className="sr-only">(opens in a new tab)</span>
                </a>
            )}
            <p className="text-lg text-gray-200 mt-1" style={!isEditing ? { fontFamily: fonts.body } : {}}>Aa Bb Cc Dd Ee Ff Gg</p>
          </div>
        </div>
        <div className="border-l border-gray-600 pl-6 animate-fade-in-up h-full" style={{ animationFillMode: 'backwards', animationDelay: '200ms' }}>
            <h4 className="font-semibold text-white mb-2">Pairing Notes</h4>
             {isEditing ? (
                 <textarea 
                    value={editedFonts.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="bg-gray-800 text-gray-300 text-sm p-2 rounded border border-gray-600 w-full h-32"
                    placeholder="Why does this pairing work?"
                 />
            ) : (
                <p className="text-gray-300">{fonts.notes}</p>
            )}
        </div>
      </div>
    </div>
  );
};