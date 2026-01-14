export const theme = {
  colors: {
    primary: '#FFD700',
    primaryDark: '#FFA500',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceLight: '#2a2a2a',
    card: '#1f1f1f',
    border: '#333333',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    success: '#4CAF50',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Text formatting colors
    formatRed: '#ef4444',
    formatBlue: '#3b82f6',
    formatGreen: '#10b981',
    formatYellow: '#f59e0b',
    formatPurple: '#a855f7',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 8,
    },
  },
} as const;
