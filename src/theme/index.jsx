import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import { CssBaseline } from '@mui/joy';

// White/Gray/Black theme for Newsor
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#f1f3f4',
          300: '#e8eaed',
          400: '#dadce0',
          500: '#9aa0a6',
          600: '#5f6368',
          700: '#3c4043',
          800: '#202124',
          900: '#000000',
        },
        neutral: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        background: {
          body: '#ffffff',
          surface: '#fafafa',
          popup: '#ffffff',
          level1: '#f8f9fa',
          level2: '#f1f3f4',
          level3: '#e8eaed',
        },
        text: {
          primary: '#202124',
          secondary: '#5f6368',
          tertiary: '#9aa0a6',
        },
        divider: '#e8eaed',
        common: {
          white: '#ffffff',
          black: '#000000',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#000000',
          100: '#212121',
          200: '#424242',
          300: '#616161',
          400: '#757575',
          500: '#9e9e9e',
          600: '#bdbdbd',
          700: '#e0e0e0',
          800: '#f5f5f5',
          900: '#ffffff',
        },
        neutral: {
          50: '#000000',
          100: '#121212',
          200: '#1e1e1e',
          300: '#2d2d2d',
          400: '#404040',
          500: '#5f5f5f',
          600: '#7f7f7f',
          700: '#9f9f9f',
          800: '#cfcfcf',
          900: '#ffffff',
        },
        background: {
          body: '#121212',
          surface: '#1e1e1e',
          popup: '#2d2d2d',
          level1: '#212121',
          level2: '#2d2d2d',
          level3: '#404040',
        },
        text: {
          primary: '#ffffff',
          secondary: '#cfcfcf',
          tertiary: '#9f9f9f',
        },
        divider: '#404040',
        common: {
          white: '#ffffff',
          black: '#000000',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'var(--joy-palette-divider)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '--Input-focusedThickness': '2px',
        },
      },
    },
    JoyTextarea: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '--Textarea-focusedThickness': '2px',
        },
      },
    },
    JoySheet: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export function ThemeProvider({ children }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}

export default theme;
