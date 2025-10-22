export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPair {
  header: string;
  body: string;
  notes: string;
}

export interface LogoDescriptions {
  primary: string;
  secondary: string[];
}

export interface BrandBible {
  brandName: string;
  palette: ColorInfo[];
  fonts: FontPair;
  logoDescriptions: LogoDescriptions;
}

export interface GeneratedLogos {
    primary: string;
    secondary: string[];
}

export interface SocialMediaKitAssets {
    banner: string;
    postTemplates: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}
