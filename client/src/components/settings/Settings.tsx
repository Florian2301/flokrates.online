import './Settings.css';

import { LanguageCode, languageMap } from '../../constants/language';
import { selectLanguage, setLanguage } from '../../store/languageSlice';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../../store/store';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lang = useSelector(selectLanguage);
  const nav = useNavigate();

  return (
    <div className="settings-wrapper">
      <label className="settings-item">
        Language:&nbsp;
        <select
          id="settings-select"
          value={lang}
          onChange={(e) => {
            dispatch(setLanguage(e.target.value as LanguageCode));
            nav('/chatlist');
          }}
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
