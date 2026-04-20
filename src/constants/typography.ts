export const typography = {
  fontFamily: {
    ja: 'NotoSansJP',            // System fallback: Hiragino Sans
    en: 'SF Pro Text',           // System font
    mono: 'SF Mono',             // Numbers in timer/sets
  },
  
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    hero: 56,                    // Streak number, Timer
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
