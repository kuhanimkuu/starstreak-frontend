// Starstreak Design System - matches the Flutter app (flare palette)

export const theme = {
  colors: {
    // Primary - flare orange
    primary: '#E8590C',
    primaryLight: '#FF6D1F',
    primaryDark: '#C2410C',

    // Accent Colors
    purple: '#FFAB3D',
    indigo: '#1A1B35',
    accentLight: '#FFD166',

    // Light Theme
    light: {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceVariant: '#F5F5F5',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      divider: '#E5E7EB',
    },

    // Dark Theme
    dark: {
      background: '#0A0B1E',
      surface: '#181930',
      surfaceVariant: '#232545',
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0B0',
      divider: '#1E1E1E',
      border: '#2A2A2A',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  typography: {
    fontFamily: {
      primary: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
};
