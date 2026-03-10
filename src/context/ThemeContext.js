import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const lightTheme = {
    mode: 'light',
    background: '#F3F6FB',
    card: '#FFFFFF',
    text: '#2D3436',
    subtext: '#636E72', // Darker gray for better visibility
    muted: '#B2BEC3',
    headerBg: '#3498DB',
    inputBg: '#F8FAFC',
    borderColor: '#E2E8F0',
    danger: '#D63031',
    success: '#2ECC71',
    tint: 'rgba(0,0,0,0.05)', // For slight tinting
};

export const darkTheme = {
    mode: 'dark',
    background: '#0F172A', // Slate 900 - Rich dark blue/black
    card: '#1E293B',       // Slate 800
    text: '#F1F5F9',       // Slate 100
    subtext: '#94A3B8',    // Slate 400
    muted: '#64748B',      // Slate 500
    headerBg: '#020617',   // Slate 950
    inputBg: '#334155',    // Slate 700
    borderColor: '#334155', // Slate 700
    danger: '#EF4444',     // Red 500
    success: '#10B981',    // Emerald 500
    tint: 'rgba(255,255,255,0.08)',
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
