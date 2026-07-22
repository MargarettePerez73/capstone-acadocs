export interface ColorPalette {
  maroon: {
    primary: string;
    dark: string;
    light: string;
    surface: string;
    muted: string;
  };
  white: string;
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  status: {
    submitted: string;
    pending: string;
    missing: string;
    flagged: string;
  };
  chart: {
    bar1: string;
    bar2: string;
    bar3: string;
    bar4: string;
  };
}

export const LightColors: ColorPalette = {
  maroon: {
    primary: '#800020',
    dark: '#5C0016',
    light: '#A0002A',
    surface: '#FFF5F7',
    muted: '#F2E6E9',
  },
  white: '#FFFFFF',
  background: '#F4F4F4',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    muted: '#999999',
    inverse: '#FFFFFF',
  },
  status: {
    submitted: '#2E7D32',
    pending: '#F57F17',
    missing: '#C62828',
    flagged: '#6A1B9A',
  },
  chart: {
    bar1: '#800020',
    bar2: '#A0002A',
    bar3: '#C0003A',
    bar4: '#D4405A',
  },
};

export const DarkColors: ColorPalette = {
  maroon: {
    primary: '#C2385A',
    dark: '#8A1D38',
    light: '#D66A85',
    surface: '#2A161B',
    muted: '#3A2229',
  },
  white: '#FFFFFF',
  background: '#121212',
  surface: '#1E1E1E',
  border: '#333333',
  text: {
    primary: '#F2F2F2',
    secondary: '#B5B5B5',
    muted: '#828282',
    inverse: '#1A1A1A',
  },
  status: {
    submitted: '#66BB6A',
    pending: '#FFB74D',
    missing: '#EF5350',
    flagged: '#BA68C8',
  },
  chart: {
    bar1: '#C2385A',
    bar2: '#D66A85',
    bar3: '#E28CA0',
    bar4: '#EDB0BE',
  },
};

// Static default export kept for any lingering static imports — resolves to
// the light palette. Prefer `useThemeColors()` from ThemeContext everywhere
// a component needs to react to theme changes.
export const Colors = LightColors;
