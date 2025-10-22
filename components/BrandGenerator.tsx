import React, { useState, useCallback, useEffect } from 'react';
import { generateBrandBible, generateImage, generateBrandVoice, generateVisualAssets } from '../services/geminiService';
import { BrandBible, GeneratedLogos, SocialMediaKitAssets } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ColorPalette } from './ColorPalette';
import { FontPairings } from './FontPairings';
import { LogoDisplay } from './LogoDisplay';
import { BrandVoice } from './BrandVoice';
import { MoodBoard } from './MoodBoard';
import { SocialMediaKit } from './SocialMediaKit';
import { ShareIcon } from './Icons';

export const BrandGenerator: React.FC = () => {
    const [mission, setMission] = useState('');
    const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
    const [logos, setLogos] = useState<GeneratedLogos | null>(null);
    const [brandVoice, setBrandVoice] = useState<string | null>(null);
    const [moodBoard, setMoodBoard] = useState<string[] | null>(null);
    const [socialKit, setSocialKit] = useState<SocialMediaKitAssets | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const startGeneration = useCallback(async (missionToGenerate: string) => {
        if (!missionToGenerate.trim()) {
            setError("Please enter your company mission.");
            return;
        }

        setIsLoading(true);
        setLoadingStep(null);
        setError(null);
        setBrandBible(null);
        setLogos(null);
        setBrandVoice(null);
        setMoodBoard(null);
        setSocialKit(null);
        
        const errorMessages: string[] = [];

        try {
            // Step 1: CRITICAL - Generate the brand bible. If this fails, we can't continue.
            setLoadingStep("Generating brand identity text...");
            const bible = await generateBrandBible(missionToGenerate);
            setBrandBible(bible);

            // The following steps are non-critical. If they fail, we'll collect errors
            // but continue to display what was successfully generated.

            // Step 2: Generate logos and brand voice in parallel
            setLoadingStep("Generating logos & brand voice...");
            try {
                const logoPromises = [
                    generateImage(bible.logoDescriptions.primary, '1:1', true),
                    ...bible.logoDescriptions.secondary.map(desc => generateImage(desc, '1:1', true))
                ];
                const brandVoicePromise = generateBrandVoice(missionToGenerate, bible);
                
                const [logoResults, voiceResult] = await Promise.all([
                    Promise.all(logoPromises),
                    brandVoicePromise
                ]);

                const [primaryImage, ...secondaryImages] = logoResults;
                setLogos({ primary: primaryImage, secondary: secondaryImages });
                setBrandVoice(voiceResult);
            } catch (step2Error) {
                console.error("Logo/Voice Generation Error:", step2Error);
                errorMessages.push("Failed to generate logos and brand voice. This can be a temporary issue with the image generation service.");
            }
            
            // Step 3: Generate mood board and social media kit in parallel
            setLoadingStep("Creating mood board & social media kit...");
            try {
                const { moodBoard: mb, socialKit: sk } = await generateVisualAssets(bible);
                setMoodBoard(mb);
                setSocialKit(sk);
            } catch (step3Error) {
                console.error("Visual Asset Generation Error:", step3Error);
                errorMessages.push("Failed to create the mood board and social media kit.");
            }

        } catch (criticalError) {
            const e = criticalError as Error;
            console.error(e);
            setError(`Failed to generate the core brand identity. The AI may have had an issue understanding the request. Please try refining your mission statement and resubmitting.`);
        } finally {
            if (errorMessages.length > 0) {
                setError(prev => {
                    const existingError = prev ? prev + '\n' : '';
                    return existingError + "Some assets could not be generated: \n- " + errorMessages.join('\n- ');
                });
            }
            setIsLoading(false);
            setLoadingStep(null);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startGeneration(mission);
    };
    
    // Handle incoming share links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const missionFromUrl = params.get('mission');
        if (missionFromUrl) {
            const decodedMission = decodeURIComponent(missionFromUrl);
            setMission(decodedMission);
            startGeneration(decodedMission);
        }
    }, [startGeneration]);

    const handleShare = () => {
        if (!mission) return;
        const shareUrl = `${window.location.origin}${window.location.pathname}?mission=${encodeURIComponent(mission)}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), 2500);
        });
    };

    const loadingMessage = (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
            <div className="flex justify-center items-center">
                <LoadingSpinner />
            </div>
            <p className="mt-2 text-gray-300">{loadingStep || 'Generating...'}</p>
            <p className="mt-1 text-xs text-gray-500">This process involves multiple AI steps and can take a few minutes. Thanks for your patience!</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label htmlFor="mission" className="block text-lg font-semibold text-gray-200">
                        Describe Your Company Mission & Vision
                    </label>
                    <textarea
                        id="mission"
                        value={mission}
                        onChange={(e) => setMission(e.target.value)}
                        placeholder="e.g., 'To empower small businesses with accessible, AI-driven marketing tools that drive growth and foster community.'"
                        className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isLoading ? <><LoadingSpinner /> {loadingStep ? loadingStep : 'Generating...'}</> : "Generate Brand Bible"}
                    </button>
                </form>
                 {error && <p className="mt-4 text-center text-red-400 whitespace-pre-wrap">{error}</p>}
            </div>

            {isLoading && loadingMessage}

            {brandBible && (
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-center items-center text-center sm:justify-between mb-8">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 order-2 sm:order-1 mt-2 sm:mt-0">{brandBible.brandName} - Brand Bible</h2>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 order-1 sm:order-2"
                        >
                            <ShareIcon />
                            {isLinkCopied ? 'Link Copied!' : 'Share'}
                        </button>
                    </div>
                    <div className="space-y-12">
                       <LogoDisplay logos={logos} descriptions={brandBible.logoDescriptions} isLoading={isLoading && !logos}/>
                       <ColorPalette palette={brandBible.palette} />
                       <FontPairings fonts={brandBible.fonts} />
                       {brandVoice ? <BrandVoice content={brandVoice} /> : (isLoading && !error && <div className="animate-pulse bg-gray-700 h-24 rounded-lg"></div>)}
                       <MoodBoard images={moodBoard} isLoading={isLoading && !moodBoard} />
                       <SocialMediaKit assets={socialKit} profilePicture={logos?.primary ?? null} isLoading={isLoading && !socialKit} />
                    </div>
                </div>
            )}
        </div>
    );
};