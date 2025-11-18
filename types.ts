
export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface HarmonyColor {
    hex: string;
    name: string;
}

export interface ColorHarmony {
    name: string;
    palette: HarmonyColor[];
    explanation: string;
}

export interface FontPair {
  header: string;
  body: string;
  notes: string;
}

export interface LogoDescriptions {
  primary: string;
  secondary: string[];
  favicon: string;
}

export interface BrandBible {
  brandName: string;
  palette: ColorInfo[];
  fonts: FontPair;
  logoDescriptions: LogoDescriptions;
  harmonies?: ColorHarmony[];
}

export interface GeneratedLogos {
    primary: string;
    secondary: string[];
    favicon: string;
}

export interface SocialMediaKitAssets {
    banner: string;
    websiteBanner: string;
    postTemplates: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface SeoRecommendations {
    titleTags: string[];
    metaDescription: string;
    keywords: string[];
}
