import React from 'react';
import { GeneratedLogos, LogoDescriptions } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface LogoDisplayProps {
    logos: GeneratedLogos | null;
    descriptions: LogoDescriptions;
    isLoading: boolean;
}

const LogoCard: React.FC<{ title: string; imageSrc: string | null; description: string; isLoading: boolean; filename: string }> = ({ title, imageSrc, description, isLoading, filename }) => (
    <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center text-center">
        <h4 className="font-bold text-lg mb-2 text-white">{title}</h4>
        <div className="w-full h-40 sm:h-56 bg-gray-600 rounded-md flex items-center justify-center mb-3 relative group">
            {isLoading && !imageSrc ? (
                <LoadingSpinner />
            ) : imageSrc ? (
                <>
                    <img src={imageSrc} alt={title} className="max-w-full max-h-full object-contain" />
                    <button
                        onClick={() => downloadFile(imageSrc, filename)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Download ${title}`}
                    >
                        <DownloadIcon />
                    </button>
                </>
            ) : (
                <div className="text-gray-400">Generating...</div>
            )}
        </div>
        <p className="text-xs text-gray-400">{description}</p>
    </div>
);


export const LogoDisplay: React.FC<LogoDisplayProps> = ({ logos, descriptions, isLoading }) => {
  return (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-gray-100">Logos & Marks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <LogoCard 
                    title="Primary Logo" 
                    imageSrc={logos?.primary ?? null}
                    description={descriptions.primary}
                    isLoading={isLoading || !logos?.primary}
                    filename="primary-logo.png"
                />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <LogoCard 
                    title="Secondary Mark 1" 
                    imageSrc={logos?.secondary[0] ?? null}
                    description={descriptions.secondary[0]}
                    isLoading={isLoading || !logos?.secondary[0]}
                    filename="secondary-mark-1.png"
                />
                 <LogoCard 
                    title="Secondary Mark 2" 
                    imageSrc={logos?.secondary[1] ?? null}
                    description={descriptions.secondary[1]}
                    isLoading={isLoading || !logos?.secondary[1]}
                    filename="secondary-mark-2.png"
                />
            </div>
        </div>
    </div>
  );
};
