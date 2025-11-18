import React from 'react';
import { SocialMediaKitAssets } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface SocialMediaKitProps {
  assets: SocialMediaKitAssets | null;
  profilePicture: string | null;
  isLoading: boolean;
}

const ImageDownloader: React.FC<{ src: string | null; alt: string; filename: string; isLoading: boolean; className?: string; children?: React.ReactNode }> = ({ src, alt, filename, isLoading, className, children }) => (
    <div className={`relative group ${className}`}>
        {children}
        {src ? (
            <>
                <img src={src} alt={alt} className="w-full h-full object-cover" />
                <button
                    onClick={() => downloadFile(src, filename)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                    aria-label={`Download ${alt}`}
                    title={`Download ${alt}`}
                >
                    <DownloadIcon />
                </button>
            </>
        ) : (isLoading && <LoadingSpinner />)}
    </div>
);


export const SocialMediaKit: React.FC<SocialMediaKitProps> = ({ assets, profilePicture, isLoading }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-gray-100">Social Media & Website Kit</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-2 text-gray-200">Profile Assets</h4>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-shrink-0">
                <p className="text-sm text-center mb-1 text-gray-400">Profile Picture</p>
                <ImageDownloader 
                    src={profilePicture}
                    alt="Profile Picture"
                    filename="profile-picture.png"
                    isLoading={isLoading && !profilePicture}
                    className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden shadow-lg"
                />
            </div>
            <div className="flex-grow">
                 <p className="text-sm mb-1 text-gray-400">Social Media Banner</p>
                <ImageDownloader 
                    src={assets?.banner ?? null}
                    alt="Social Media Banner"
                    filename="social-media-banner.png"
                    isLoading={isLoading && !assets?.banner}
                    className="w-full aspect-[16/9] bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden shadow-lg"
                />
            </div>
          </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold mb-2 text-gray-200">Website Hero Banner</h4>
            <ImageDownloader
                src={assets?.websiteBanner ?? null}
                alt="Website Hero Banner"
                filename="website-hero-banner.png"
                isLoading={isLoading && !assets?.websiteBanner}
                className="w-full aspect-[16/9] bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden shadow-lg"
            />
        </div>
        <div>
            <h4 className="text-lg font-semibold mb-2 text-gray-200">Post Templates</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(assets?.postTemplates || Array.from({length: 3})).map((template, index) => (
                    <ImageDownloader
                        key={index}
                        src={template}
                        alt={`Post Template ${index + 1}`}
                        filename={`post-template-${index + 1}.png`}
                        isLoading={isLoading && !template}
                        className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden shadow-lg"
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};