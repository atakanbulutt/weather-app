import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

type Unit = 'metric' | 'imperial';

interface UnitContextType {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  toggleUnit: () => void;
  getUnitSymbol: () => string;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};

interface UnitProviderProps {
  children: ReactNode;
}

export const UnitProvider: React.FC<UnitProviderProps> = ({ children }) => {
  const [unit, setUnitState] = useState<Unit>(() => {
    const savedUnit = localStorage.getItem('unit');
    return (savedUnit as Unit) || 'metric';
  });

  useEffect(() => {
    localStorage.setItem('unit', unit);
  }, [unit]);

  const setUnit = useCallback((newUnit: Unit) => {
    setUnitState(newUnit);
  }, []);

  const toggleUnit = useCallback(() => {
    setUnitState(prev => prev === 'metric' ? 'imperial' : 'metric');
  }, []);

  const getUnitSymbol = useCallback(() => {
    return unit === 'metric' ? '°C' : '°F';
  }, [unit]);

  const value = useMemo(() => ({
    unit,
    setUnit,
    toggleUnit,
    getUnitSymbol,
  }), [unit, setUnit, toggleUnit, getUnitSymbol]);

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  );
};
