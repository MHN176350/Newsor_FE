import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import { CssBaseline } from '@mui/joy';
import type { ReactNode } from 'react';

// Extend the Joy UI theme with white/gray color scheme
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        background: {
          body: '#ffffff',
          surface: '#f8fafc',
          popup: '#ffffff',
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          tertiary: '#94a3b8',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
          500: '#94a3b8',
          600: '#cbd5e1',
          700: '#e2e8f0',
          800: '#f1f5f9',
          900: '#f8fafc',
        },
        neutral: {
          50: '#171717',
          100: '#262626',
          200: '#404040',
          300: '#525252',
          400: '#737373',
          500: '#a3a3a3',
          600: '#d4d4d4',
          700: '#e5e5e5',
          800: '#f5f5f5',
          900: '#fafafa',
        },
        background: {
          body: '#1e293b',
          surface: '#334155',
          popup: '#475569',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#e2e8f0',
          tertiary: '#cbd5e1',
        },
      },
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #e5e5e5',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}

export default theme;
