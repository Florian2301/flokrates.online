import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { LanguageCode } from '../constants/language';
import type { RootState } from './store';

type LanguageState = { current: LanguageCode };

const stored = localStorage.getItem('ui_language');
const fallback: LanguageCode = 'DE';

const initial: LanguageState = {
  current: stored === 'DE' || stored === 'EN' ? stored : fallback,
};

const languageSlice = createSlice({
  name: 'language',
  initialState: initial,
  reducers: {
    setLanguage(state, action: PayloadAction<LanguageCode>) {
      state.current = action.payload;
      localStorage.setItem('ui_language', state.current);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export const selectLanguage = (s: RootState) => s.language.current;
export default languageSlice.reducer;
