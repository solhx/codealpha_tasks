//frontend/src/hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const useThemeHook = () => useContext(ThemeContext);

export default useThemeHook;