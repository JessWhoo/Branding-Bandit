import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface MoodBoardProps {
  images: string[] | null;
  isLoading: boolean;
}

export const MoodBoard: React.FC<MoodBoardProps> = ({ images, isLoading }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-gray-100">Mood Board</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(images || Array.from({ length: 4 })).map((src, index) => (
          <div key={index} className="bg-gray-700 rounded-lg shadow-md overflow-hidden aspect-square flex items-center justify-center relative group">
            {src ? (
              <>
                <img src={src} alt={`Mood board image ${index + 1}`} className="w-full h-full object-cover transition-transform hover:scale-105" />
                <button
                    onClick={() => downloadFile(src, `moodboard-image-${index + 1}.png`)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                    aria-label={`Download mood board image ${index + 1}`}
                    title={`Download Image ${index + 1}`}
                >
                    <DownloadIcon />
                </button>
              </>
            ) : (
                isLoading && <LoadingSpinner />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
