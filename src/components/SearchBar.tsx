import React, { useState, useCallback } from 'react';
import { translations } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({ onSearch, onLocationSearch }) => {
  const [city, setCity] = useState('');
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  }, [city, onSearch]);

  const handleSearchClick = useCallback(() => {
    if (city.trim()) {
      onSearch(city.trim());
    }
  }, [city, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="search-container"
    >
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={t.app.searchPlaceholder}
        className="search-input"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
      />
      <button 
        onClick={handleSearchClick}
        className="search-button"
      >
        {t.app.search}
      </button>
      <button 
        onClick={onLocationSearch} 
        className="location-button"
        title="Mevcut konumumu kullan"
      >
        📍
      </button>
    </motion.div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
