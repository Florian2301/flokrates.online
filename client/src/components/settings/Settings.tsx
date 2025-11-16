import './Settings.css';

import type { AppDispatch, RootState } from '../../store/store';
import { LanguageCode, languageMap } from '../../constants/language';
import { selectLanguage, setLanguage } from '../../store/languageSlice';
import { useDispatch, useSelector } from 'react-redux';

import React from 'react';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lang = useSelector(selectLanguage);

  return (
    <div className="settings-wrapper">
      <label className="settings-item">
        Sprache:&nbsp;
        <select
          value={lang}
          onChange={(e) =>
            dispatch(setLanguage(e.target.value as LanguageCode))
          }
        >
          {Object.entries(languageMap).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Settings;
