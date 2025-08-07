import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="settings-container"
    >
      <h3>{t.settings.title}</h3>
      
      <div className="settings-section">
        <h4>{t.settings.theme}</h4>
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={toggleTheme}
            />
            {t.settings.light}
          </label>
          <label className="setting-label">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            {t.settings.dark}
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h4>{t.settings.language}</h4>
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="radio"
              name="language"
              value="tr"
              checked={language === 'tr'}
              onChange={() => setLanguage('tr')}
            />
            {t.settings.turkish}
          </label>
          <label className="setting-label">
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === 'en'}
              onChange={() => setLanguage('en')}
            />
            {t.settings.english}
          </label>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
