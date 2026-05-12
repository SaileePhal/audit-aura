// Centralized Theme Configuration
// Change THEME_MODE to 'light' or 'dark' to control the entire app theme

export const THEME_MODE: 'light' | 'dark' = 'dark';

export const theme = {
  // Background colors
  bg: {
    primary: THEME_MODE === 'dark' ? 'bg-dark-50' : 'bg-white',
    secondary: THEME_MODE === 'dark' ? 'bg-dark-100' : 'bg-gray-50',
    tertiary: THEME_MODE === 'dark' ? 'bg-dark-200' : 'bg-gray-100',
    card: THEME_MODE === 'dark' ? 'glass-card' : 'bg-white',
    hover: THEME_MODE === 'dark' ? 'hover:bg-dark-200/50' : 'hover:bg-gray-50',
  },
  
  // Text colors
  text: {
    primary: THEME_MODE === 'dark' ? 'text-dark-900' : 'text-gray-900',
    secondary: THEME_MODE === 'dark' ? 'text-dark-600' : 'text-gray-600',
    tertiary: THEME_MODE === 'dark' ? 'text-dark-500' : 'text-gray-500',
    muted: THEME_MODE === 'dark' ? 'text-dark-400' : 'text-gray-400',
  },
  
  // Border colors
  border: {
    primary: THEME_MODE === 'dark' ? 'border-dark-200' : 'border-gray-200',
    secondary: THEME_MODE === 'dark' ? 'border-dark-300' : 'border-gray-300',
    hover: THEME_MODE === 'dark' ? 'hover:border-dark-400' : 'hover:border-gray-400',
  },
  
  // Input/Form colors
  input: {
    bg: THEME_MODE === 'dark' ? 'bg-dark-100' : 'bg-white',
    border: THEME_MODE === 'dark' ? 'border-dark-300' : 'border-gray-300',
    text: THEME_MODE === 'dark' ? 'text-dark-900' : 'text-gray-900',
    placeholder: THEME_MODE === 'dark' ? 'placeholder-dark-500' : 'placeholder-gray-400',
    focus: THEME_MODE === 'dark' ? 'focus:border-cyan-500 focus:ring-cyan-500/20' : 'focus:border-blue-500 focus:ring-blue-500/20',
  },
  
  // Button colors
  button: {
    primary: THEME_MODE === 'dark' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: THEME_MODE === 'dark' ? 'bg-dark-200 hover:bg-dark-300 text-dark-900 border border-dark-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    ghost: THEME_MODE === 'dark' ? 'hover:bg-dark-200/50 text-dark-600' : 'hover:bg-gray-100 text-gray-600',
  },
  
  // Status colors (severity-based)
  status: {
    critical: {
      bg: THEME_MODE === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
      border: THEME_MODE === 'dark' ? 'border-red-500/50' : 'border-red-200',
      text: THEME_MODE === 'dark' ? 'text-red-400' : 'text-red-700',
    },
    high: {
      bg: THEME_MODE === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
      border: THEME_MODE === 'dark' ? 'border-orange-500/50' : 'border-orange-200',
      text: THEME_MODE === 'dark' ? 'text-orange-400' : 'text-orange-700',
    },
    medium: {
      bg: THEME_MODE === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
      border: THEME_MODE === 'dark' ? 'border-yellow-500/50' : 'border-yellow-200',
      text: THEME_MODE === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
    },
    low: {
      bg: THEME_MODE === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
      border: THEME_MODE === 'dark' ? 'border-blue-500/50' : 'border-blue-200',
      text: THEME_MODE === 'dark' ? 'text-blue-400' : 'text-blue-700',
    },
    success: {
      bg: THEME_MODE === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
      border: THEME_MODE === 'dark' ? 'border-green-500/50' : 'border-green-200',
      text: THEME_MODE === 'dark' ? 'text-green-400' : 'text-green-700',
    },
    info: {
      bg: THEME_MODE === 'dark' ? 'bg-cyan-900/20' : 'bg-cyan-50',
      border: THEME_MODE === 'dark' ? 'border-cyan-500/50' : 'border-cyan-200',
      text: THEME_MODE === 'dark' ? 'text-cyan-400' : 'text-cyan-700',
    },
  },
  
  // Table colors
  table: {
    header: THEME_MODE === 'dark' ? 'bg-dark-100 text-dark-700' : 'bg-gray-50 text-gray-700',
    row: THEME_MODE === 'dark' ? 'bg-dark-50' : 'bg-white',
    rowHover: THEME_MODE === 'dark' ? 'hover:bg-dark-100/50' : 'hover:bg-gray-50',
    border: THEME_MODE === 'dark' ? 'border-dark-200' : 'border-gray-200',
  },
  
  // Chart/Graph colors
  chart: {
    grid: THEME_MODE === 'dark' ? '#27272a' : '#e5e7eb',
    text: THEME_MODE === 'dark' ? '#a1a1aa' : '#6b7280',
    tooltip: {
      bg: THEME_MODE === 'dark' ? 'bg-dark-100' : 'bg-white',
      border: THEME_MODE === 'dark' ? 'border-dark-300' : 'border-gray-200',
      text: THEME_MODE === 'dark' ? 'text-dark-900' : 'text-gray-900',
    },
  },
};

// Helper function to get theme classes as a string
export const getThemeClasses = (category: keyof typeof theme, subcategory?: string) => {
  if (subcategory) {
    return theme[category][subcategory as keyof typeof theme[typeof category]];
  }
  return theme[category];
};

// Export individual theme values for direct use
export const isDarkMode = THEME_MODE === 'dark';