import React, { useState } from 'react';
import { translations } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocationSearch }) => {
  const [city, setCity] = useState('');
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="search-container"
    >
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t.app.searchPlaceholder}
          className="search-input"
        />
        <button type="submit" className="search-button">
          {t.app.search}
        </button>
      </form>
      <button 
        onClick={onLocationSearch} 
        className="location-button"
        title="Mevcut konumumu kullan"
      >
        📍
      </button>
    </motion.div>
  );
};

export default SearchBar;
