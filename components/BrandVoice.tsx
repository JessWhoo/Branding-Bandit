import React from 'react';
import { downloadFile } from '../utils/download';
import { DownloadIcon } from './Icons';

interface BrandVoiceProps {
  content: string;
}

// Simple markdown to HTML converter
const formatContent = (text: string) => {
    // Process lists first to correctly handle multiline blocks.
    let processedText = text.replace(/(- .+(?:\n- .+)*)/g, (match) => {
        const listItems = match.split('\n').map(item => 
            // remove '- ' and wrap
            `<li class="ml-4 list-disc">${item.substring(2)}</li>` 
        ).join('');
        return `<ul>${listItems}</ul>`;
    });

    // Now process headings on the modified text.
    processedText = processedText.replace(/^## (.*$)/gim, '<h4 class="text-xl font-bold mt-4 mb-2 text-gray-100">$1</h4>');

    // Now process bold, which can be anywhere.
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Finally, handle newlines for paragraph breaks.
    processedText = processedText.replace(/\n/g, '<br />');
    
    // And cleanup extraneous breaks.
    processedText = processedText.replace(/<br \s*\/?>\s*(<(ul|h4))/gi, '<$1'); // Before block
    processedText = processedText.replace(/(<\/(ul|h4|li)>)\s*<br \s*\/?>/gi, '$1'); // After block or list item
    
    return processedText;
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