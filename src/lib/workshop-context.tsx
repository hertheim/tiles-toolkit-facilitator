'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workshop, Idea, WorkshopPhase } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Define context value type
interface WorkshopContextValue {
  workshops: Workshop[];
  currentWorkshop: Workshop | null;
  currentIdea: Idea | null;
  currentPhase: WorkshopPhase;
  ideas: Idea[];
  
  // Workshop CRUD actions
  createWorkshop: (workshopData: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'>) => Workshop;
  updateWorkshop: (id: string, workshopData: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;
  setCurrentWorkshop: (workshop: Workshop | null) => void;
  
  // Idea management
  createIdea: (ideaData: Partial<Idea>) => Idea;
  updateIdea: (id: string, ideaData: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  setCurrentIdea: (idea: Idea | null) => void;
  
  // Phase management
  setCurrentPhase: (phase: WorkshopPhase) => void;
}

const WorkshopContext = createContext<WorkshopContextValue | undefined>(undefined);

export function useWorkshop() {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
}

interface WorkshopProviderProps {
  children: ReactNode;
}

export function WorkshopProvider({ children }: WorkshopProviderProps) {
  // Initialize state
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [currentWorkshop, setCurrentWorkshop] = useState<Workshop | null>(null);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentPhase, setCurrentPhase] = useState<WorkshopPhase>('ideation');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedWorkshops = localStorage.getItem('workshops');
      const savedIdeas = localStorage.getItem('ideas');
      
      if (savedWorkshops) {
        setWorkshops(JSON.parse(savedWorkshops));
      }
      
      if (savedIdeas) {
        setIdeas(JSON.parse(savedIdeas));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('workshops', JSON.stringify(workshops));
    } catch (error) {
      console.error('Failed to save workshops to localStorage:', error);
    }
  }, [workshops]);

  useEffect(() => {
    try {
      localStorage.setItem('ideas', JSON.stringify(ideas));
    } catch (error) {
      console.error('Failed to save ideas to localStorage:', error);
    }
  }, [ideas]);

  // Workshop CRUD operations
  const createWorkshop = (workshopData: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newWorkshop: Workshop = {
      ...workshopData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    setWorkshops((prev) => [...prev, newWorkshop]);
    return newWorkshop;
  };

  const updateWorkshop = (id: string, workshopData: Partial<Workshop>) => {
    setWorkshops((prev) => 
      prev.map((workshop) => 
        workshop.id === id 
          ? { ...workshop, ...workshopData, updatedAt: new Date() } 
          : workshop
      )
    );
    
    // Update currentWorkshop if it's the one being updated
    if (currentWorkshop?.id === id) {
      setCurrentWorkshop((prev) => 
        prev ? { ...prev, ...workshopData, updatedAt: new Date() } : null
      );
    }
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops((prev) => prev.filter((workshop) => workshop.id !== id));
    
    // Clear currentWorkshop if it's the one being deleted
    if (currentWorkshop?.id === id) {
      setCurrentWorkshop(null);
    }
    
    // Delete associated ideas
    setIdeas((prev) => prev.filter((idea) => idea.workshopId !== id));
  };

  // Idea CRUD operations
  const createIdea = (ideaData: Partial<Idea>) => {
    if (!currentWorkshop) {
      throw new Error('Cannot create idea without a current workshop');
    }
    
    const now = new Date();
    const newIdea: Idea = {
      id: uuidv4(),
      workshopId: currentWorkshop.id,
      title: ideaData.title || 'New Idea',
      description: ideaData.description || '',
      cardCombination: ideaData.cardCombination || {},
      refinements: ideaData.refinements || [],
      storyboard: ideaData.storyboard,
      evaluation: ideaData.evaluation,
      elevatorPitch: ideaData.elevatorPitch,
      createdAt: now,
      updatedAt: now,
    };
    
    setIdeas((prev) => [...prev, newIdea]);
    return newIdea;
  };

  const updateIdea = (id: string, ideaData: Partial<Idea>) => {
    setIdeas((prev) => 
      prev.map((idea) => 
        idea.id === id 
          ? { ...idea, ...ideaData, updatedAt: new Date() } 
          : idea
      )
    );
    
    // Update currentIdea if it's the one being updated
    if (currentIdea?.id === id) {
      setCurrentIdea((prev) => 
        prev ? { ...prev, ...ideaData, updatedAt: new Date() } : null
      );
    }
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    
    // Clear currentIdea if it's the one being deleted
    if (currentIdea?.id === id) {
      setCurrentIdea(null);
    }
  };

  // Context value
  const value: WorkshopContextValue = {
    workshops,
    currentWorkshop,
    currentIdea,
    currentPhase,
    ideas,
    
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    setCurrentWorkshop,
    
    createIdea,
    updateIdea,
    deleteIdea,
    setCurrentIdea,
    
    setCurrentPhase,
  };

  return (
    <WorkshopContext.Provider value={value}>
      {children}
    </WorkshopContext.Provider>
  );
} 