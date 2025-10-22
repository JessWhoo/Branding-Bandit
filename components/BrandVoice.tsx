import React from 'react';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface BrandVoiceProps {
  content: string;
}

// Simple markdown to HTML converter
const formatContent = (text: string) => {
    // Process lists first to wrap them in <ul>
    let listFormattedText = text.replace(/(- .+(\n- .+)*)/g, '<ul>$1</ul>');
    
    return listFormattedText
        .replace(/^## (.*$)/gim, '<h4 class="text-xl font-bold mt-4 mb-2 text-gray-100">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\n/g, '<br />')
        .replace(/<br \/>(<h4|<ul)/g, '$1') // remove extra breaks before headings/lists
        .replace(/(<\/li>|<h4.*>)<br \/>/g, '$1') // remove extra breaks after list items and headings
        .replace(/<\/ul><br \/>/g, '</ul>'); // remove extra breaks after lists
};

export const BrandVoice: React.FC<BrandVoiceProps> = ({ content }) => {
  const handleDownload = () => {
    const data = `data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`;
    downloadFile(data, 'brand-voice.md');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-100">Brand Voice & Tone</h3>
        <button
            onClick={handleDownload}
            title="Download Brand Voice as Markdown"
            className="p-2 rounded-full bg-gray-600 hover:bg-indigo-500 transition-colors"
        >
            <DownloadIcon />
        </button>
      </div>
      <div 
        className="bg-gray-700 p-6 rounded-lg space-y-2 text-gray-300 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
};
