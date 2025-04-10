import { useState, useEffect } from 'react';
import { Evaluation, EvaluationCriteria } from '@/types';
import { criteriaCards } from '@/data/criteria';

const STORAGE_KEY = 'evaluations';
const SELECTED_CRITERIA_KEY = 'selected_criteria';

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, string[]>>(() => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(SELECTED_CRITERIA_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem(SELECTED_CRITERIA_KEY, JSON.stringify(selectedCriteria));
  }, [selectedCriteria]);

  const saveEvaluation = async (evaluation: Evaluation) => {
    setEvaluations(prev => [...prev.filter(e => e.ideaId !== evaluation.ideaId), evaluation]);
  };

  const updateCriteriaResponses = (ideaId: string, responses: EvaluationCriteria[]) => {
    saveEvaluation({
      id: crypto.randomUUID(),
      ideaId,
      criteria: responses,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const updateSelectedCriteria = (ideaId: string, criteriaIds: string[]) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [ideaId]: criteriaIds
    }));
  };

  return {
    evaluations,
    selectedCriteria,
    updateCriteriaResponses,
    updateSelectedCriteria
  };
} 