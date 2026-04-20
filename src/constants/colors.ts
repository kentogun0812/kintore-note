export const colors = {
  // Dark theme (default)
  dark: {
    bg: {
      primary: '#0A0A0A',         // App background
      secondary: '#141414',       // Card background
      tertiary: '#1E1E1E',        // Input background
      elevated: '#242424',        // Modal/sheet background
    },
    text: {
      primary: '#F5F5F5',         // Main text
      secondary: '#A0A0A0',       // Subtle text
      tertiary: '#666666',        // Disabled text
      inverse: '#0A0A0A',         // Text on light bg
    },
    accent: {
      primary: '#E54D42',         // Hanko red (朱色)
      secondary: '#FF6B5B',       // Lighter accent
      success: '#34C759',         // Complete/PR
      warning: '#FF9500',         // Attention
      info: '#5AC8FA',            // Info
    },
    border: {
      default: '#2A2A2A',         // Card borders
      subtle: '#1A1A1A',          // Dividers
      focus: '#E54D42',           // Focus rings
    },
    hanko: {
      ink: '#C41E1E',             // Hanko stamp ink
      inkLight: '#E54D42',        // Hanko highlight
      paper: '#FFF8F0',           // Stamp paper texture
    },
  },
  
  // Reaction colors
  reactions: {
    muscle: '#FF6B35',            // 💪
    fire: '#FF4444',              // 🔥
    flower: '#FF69B4',            // 💮
  },
} as const;
