import React from 'react';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface SocialMediaPostsProps {
  ideas: string[] | null;
  isLoading: boolean;
}

export const SocialMediaPosts: React.FC<SocialMediaPostsProps> = ({ ideas, isLoading }) => {
  if (!ideas && !isLoading) {
    return null;
  }
  
  const handleDownload = () => {
    if (!ideas) return;
    const content = ideas.map((idea, index) => `Post Idea ${index + 1}:\n${idea}`).join('\n\n---\n\n');
    const data = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    downloadFile(data, 'social-media-posts.txt');
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-100">Social Media Post Ideas</h3>
        {ideas && (
          <button
              onClick={handleDownload}
              title="Download Post Ideas as TXT"
              aria-label="Download social media post ideas as a text file"
              className="p-2 rounded-full bg-gray-600 hover:bg-indigo-500 transition-colors"
          >
              <DownloadIcon />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {isLoading && !ideas ? (
            Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-600 rounded w-3/4 mt-2"></div>
                </div>
            ))
        ) : (
          ideas?.map((idea, index) => (
            <div 
                key={index}
                className="bg-gray-700 p-4 rounded-lg shadow-md animate-fade-in-up flex items-start gap-3"
                style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}
            >
                <span className="text-indigo-400 font-bold text-lg">{index + 1}.</span>
                <p className="text-gray-300">{idea}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
