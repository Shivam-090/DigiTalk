import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("digiTalk-theme") || 'coffee',
  setTheme: (theme) => { 
    localStorage.setItem("digiTalk-theme", theme);
    set({ theme })
   },
}));