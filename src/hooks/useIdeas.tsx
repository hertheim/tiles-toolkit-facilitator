import React, { useState, createContext, useContext, ReactNode } from 'react';
import type { Idea } from '../types';

interface IdeasContextType {
  currentIdea: Idea | null;
  setCurrentIdea: (idea: Idea | null) => void;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

interface IdeasProviderProps {
  children: ReactNode;
}

export function IdeasProvider({ children }: IdeasProviderProps) {
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);

  const value: IdeasContextType = {
    currentIdea,
    setCurrentIdea,
  };

  return (
    <IdeasContext.Provider value={value}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas(): IdeasContextType {
  const context = useContext(IdeasContext);
  if (context === undefined) {
    throw new Error('useIdeas must be used within an IdeasProvider');
  }
  return context;
} 