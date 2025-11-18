import React, { useState, useEffect, useRef } from 'react';
import { startBrandingChat } from '../services/geminiService';
// FIX: Importing Chat type from @google/genai to correctly type the chat session state.
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { BotIcon, UserIcon } from './Icons';

// FIX: Added a simple markdown to HTML converter, adapted from BrandVoice component for consistency.
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


export const ChatBot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatInstance = startBrandingChat();
        setChat(chatInstance);
        setHistory([
            { role: 'model', content: "Hello! I'm Branding Bot. How can I help you refine your new brand today? Feel free to ask about marketing slogans, target audience, or anything else!" }
        ]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setHistory(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            // FIX: Using sendMessageStream for a real-time, responsive user experience.
            const stream = await chat.sendMessageStream({ message: currentInput });
            
            let modelResponse = '';
            // Add a placeholder for the model's response
            setHistory(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                // Update the last message in history with the streaming content
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', content: modelResponse };
                    return newHistory;
                });
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an issue connecting to the AI. Please check your connection and try again." };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 flex flex-col h-[70vh] animate-fade-in">
            <div role="log" aria-live="polite" className="flex-1 overflow-y-auto pr-4 space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`p-2 rounded-full ${msg.role === 'model' ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                            {msg.role === 'model' ? <BotIcon /> : <UserIcon />}
                        </div>
                        <div className={`p-3 rounded-lg max-w-lg prose prose-invert prose-sm max-w-none ${msg.role === 'model' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-600 text-white'}`}>
                           <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                           {isLoading && msg.role === 'model' && index === history.length - 1 && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <label htmlFor="chat-input" className="sr-only">Your message</label>
                    <input
                        type="text"
                        id="chat-input"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask a branding question..."
                        className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-md transition-all duration-200 shadow-lg flex items-center justify-center w-24"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};
