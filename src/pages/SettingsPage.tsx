import React from 'react';
import { Link } from 'react-router-dom';
import Settings from '../components/Settings';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <header className="app-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ayarlar
        </motion.h1>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Ana Sayfa
          </Link>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="main-content">
        <Settings />
      </main>
    </div>
  );
};

export default SettingsPage;
