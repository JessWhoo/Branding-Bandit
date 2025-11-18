import React, { useState, useCallback, useEffect } from 'react';
import { generateBrandBible, generateImage, generateBrandVoice, generateVisualAssets, generateSocialMediaPosts } from '../services/geminiService';
import { BrandBible, GeneratedLogos, SocialMediaKitAssets } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ColorPalette } from './ColorPalette';
import { FontPairings } from './FontPairings';
import { LogoDisplay } from './LogoDisplay';
import { BrandVoice } from './BrandVoice';
import { MoodBoard } from './MoodBoard';
import { SocialMediaKit } from './SocialMediaKit';
import { SocialMediaPosts } from './SocialMediaPosts';
import { ShareIcon, ResetIcon } from './Icons';

export const BrandGenerator: React.FC = () => {
    const [mission, setMission] = useState('');
    const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
    const [logos, setLogos] = useState<GeneratedLogos | null>(null);
    const [brandVoice, setBrandVoice] = useState<string | null>(null);
    const [socialMediaPosts, setSocialMediaPosts] = useState<string[] | null>(null);
    const [moodBoard, setMoodBoard] = useState<string[] | null>(null);
    const [socialKit, setSocialKit] = useState<SocialMediaKitAssets | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const exampleMissions = [
        "To create sustainable and stylish everyday products that are kind to the planet.",
        "To build a global community for freelance artists to connect, collaborate, and find new opportunities.",
        "To provide affordable and personalized online education for K-12 students, focusing on STEM subjects.",
        "To craft high-quality, organic pet food that promotes health and longevity for our furry friends.",
    ];

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
        setSocialMediaPosts(null);
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

            // Step 2: Generate logos, brand voice, and social posts in parallel
            setLoadingStep("Generating logos, voice, & post ideas...");
            try {
                const logoPromises = [
                    generateImage(bible.logoDescriptions.primary, '1:1', true),
                    ...bible.logoDescriptions.secondary.map(desc => generateImage(desc, '1:1', true)),
                    generateImage(bible.logoDescriptions.favicon, '1:1', true)
                ];
                const brandVoicePromise = generateBrandVoice(missionToGenerate, bible);
                const socialPostsPromise = generateSocialMediaPosts(missionToGenerate, bible);
                
                const [logoResults, voiceResult, socialPostsResult] = await Promise.all([
                    Promise.all(logoPromises),
                    brandVoicePromise,
                    socialPostsPromise
                ]);

                const primaryImage = logoResults[0];
                const secondaryImages = logoResults.slice(1, 3);
                const faviconImage = logoResults[3];

                setLogos({ 
                    primary: primaryImage, 
                    secondary: secondaryImages,
                    favicon: faviconImage
                });
                setBrandVoice(voiceResult);
                setSocialMediaPosts(socialPostsResult);
            } catch (step2Error) {
                console.error("Logo/Voice/Posts Generation Error:", step2Error);
                errorMessages.push("Failed to generate logos, brand voice, or social media ideas. This can be a temporary issue with the AI services.");
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

    const handleReset = () => {
        setMission('');
        setBrandBible(null);
        setLogos(null);
        setBrandVoice(null);
        setSocialMediaPosts(null);
        setMoodBoard(null);
        setSocialKit(null);
        setError(null);
        // Clean up the URL
        window.history.pushState({}, document.title, window.location.pathname);
    };

    const loadingMessage = (
        <div role="status" aria-live="polite" className="text-center p-6 bg-gray-800 rounded-lg">
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
                <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
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
                        aria-label="Your company mission and vision"
                    />
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Need inspiration? Try an example:</p>
                        <div className="flex flex-wrap gap-2">
                            {exampleMissions.map((example, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setMission(example)}
                                    disabled={isLoading}
                                    className="text-xs bg-gray-700 hover:bg-indigo-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-200 py-1.5 px-3 rounded-full transition-colors duration-200"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isLoading ? <><LoadingSpinner /> {loadingStep ? loadingStep : 'Generating...'}</> : "Generate Brand Bible"}
                    </button>
                </form>
                 {error && <div role="alert" aria-live="assertive"><p className="mt-4 text-center text-red-400 whitespace-pre-wrap">{error}</p></div>}
            </div>

            {isLoading && loadingMessage}

            {brandBible && (
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 animate-fade-in" aria-labelledby="brand-bible-heading">
                    <div className="flex flex-col sm:flex-row justify-center items-center text-center sm:justify-between mb-8">
                        <h2 id="brand-bible-heading" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 order-2 sm:order-1 mt-2 sm:mt-0">{brandBible.brandName} - Brand Bible</h2>
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <button
                                onClick={handleShare}
                                aria-label="Share a link to this brand identity"
                                className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                <ShareIcon />
                                {isLinkCopied ? 'Link Copied!' : 'Share'}
                            </button>
                            <button
                                onClick={handleReset}
                                aria-label="Reset and clear all generated assets"
                                className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                title="Start a new brand generation"
                            >
                                <ResetIcon />
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="space-y-12">
                       <LogoDisplay logos={logos} descriptions={brandBible.logoDescriptions} isLoading={isLoading && !logos}/>
                       <ColorPalette palette={brandBible.palette} harmonies={brandBible.harmonies} />
                       <FontPairings fonts={brandBible.fonts} />
                       {brandVoice ? <BrandVoice content={brandVoice} /> : (isLoading && !error && <div className="animate-pulse bg-gray-700 h-24 rounded-lg"></div>)}
                       <SocialMediaPosts ideas={socialMediaPosts} isLoading={isLoading && !socialMediaPosts} />
                       <MoodBoard images={moodBoard} isLoading={isLoading && !moodBoard} />
                       <SocialMediaKit assets={socialKit} profilePicture={logos?.primary ?? null} isLoading={isLoading && !socialKit} />
                    </div>
                </div>
            )}
        </div>
    );
};