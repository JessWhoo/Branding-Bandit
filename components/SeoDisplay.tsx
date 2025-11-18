
import React, { useState } from 'react';
import { SeoRecommendations } from '../types';

interface SeoDisplayProps {
    seo: SeoRecommendations | null;
    isLoading: boolean;
}

export const SeoDisplay: React.FC<SeoDisplayProps> = ({ seo, isLoading }) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldId);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    if (isLoading && !seo) {
         return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                <div className="h-24 bg-gray-700 rounded"></div>
                <div className="h-16 bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (!seo) return null;

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-100">Website SEO Recommendations</h3>
            <div className="space-y-6">
                {/* Meta Description */}
                <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-indigo-400">Meta Description</h4>
                         <button
                            onClick={() => copyToClipboard(seo.metaDescription, 'meta')}
                            className="text-xs bg-gray-600 hover:bg-indigo-600 text-white py-1 px-2 rounded transition-colors"
                        >
                            {copiedField === 'meta' ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-gray-300">{seo.metaDescription}</p>
                    <p className="text-xs text-gray-500 mt-2 text-right">{seo.metaDescription.length} chars</p>
                </div>

                {/* Title Tags */}
                <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold text-indigo-400 mb-3">Suggested Title Tags</h4>
                    <ul className="space-y-3">
                        {seo.titleTags.map((tag, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-600">
                                <span className="text-gray-200 text-sm">{tag}</span>
                                <button
                                    onClick={() => copyToClipboard(tag, `title-${idx}`)}
                                    className="ml-2 text-xs bg-gray-600 hover:bg-indigo-600 text-white py-1 px-2 rounded transition-colors shrink-0"
                                >
                                    {copiedField === `title-${idx}` ? 'Copied!' : 'Copy'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Keywords */}
                <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-indigo-400">Keywords</h4>
                        <button
                            onClick={() => copyToClipboard(seo.keywords.join(', '), 'keywords')}
                             className="text-xs bg-gray-600 hover:bg-indigo-600 text-white py-1 px-2 rounded transition-colors"
                        >
                             {copiedField === 'keywords' ? 'Copy All' : 'Copy All'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {seo.keywords.map((keyword, idx) => (
                            <span key={idx} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-sm border border-gray-600">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
