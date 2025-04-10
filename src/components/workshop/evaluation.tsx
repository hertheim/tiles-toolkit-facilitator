'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkshop } from '@/lib/workshop-context';
import { Idea, EvaluationCriteria } from '@/types';
import { criteriaCards } from '@/data/criteria';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from "@/components/ui/textarea";

export function Evaluation() {
  const { currentIdea } = useWorkshop();
  const { evaluations, selectedCriteria, updateCriteriaResponses, updateSelectedCriteria } = useEvaluations();
  const [criteriaResponses, setCriteriaResponses] = useState<EvaluationCriteria[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load existing evaluation data if available
  useEffect(() => {
    if (currentIdea) {
      const existingEvaluation = evaluations.find(e => e.ideaId === currentIdea.id);
      if (existingEvaluation) {
        setCriteriaResponses(existingEvaluation.criteria);
      } else {
        setCriteriaResponses(criteriaCards.map(card => ({
          criteriaCard: card,
          response: ''
        })));
      }
    }
  }, [currentIdea, evaluations]);
  
  if (!currentIdea) {
    return (
      <Alert>
        <AlertDescription>Please select an idea to evaluate</AlertDescription>
      </Alert>
    );
  }
  
  const handleCriteriaSelect = (criteriaId: string) => {
    const currentSelected = selectedCriteria[currentIdea.id] || [];
    let newSelected: string[];
    
    if (currentSelected.includes(criteriaId)) {
      newSelected = currentSelected.filter(id => id !== criteriaId);
    } else if (currentSelected.length < 3) {
      newSelected = [...currentSelected, criteriaId];
    } else {
      return;
    }
    
    updateSelectedCriteria(currentIdea.id, newSelected);
  };
  
  const handleResponseChange = (criteriaId: string, response: string) => {
    const newResponses = criteriaResponses.map(criteria => 
      criteria.criteriaCard.id === criteriaId 
        ? { ...criteria, response }
        : criteria
    );
    setCriteriaResponses(newResponses);
    updateCriteriaResponses(currentIdea.id, newResponses);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Evaluation</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteriaCards.map((criteria) => (
          <Card 
            key={criteria.id}
            className={`cursor-pointer transition-all ${
              (selectedCriteria[currentIdea.id] || []).includes(criteria.id) 
                ? 'border-2 border-primary bg-primary/5' 
                : (selectedCriteria[currentIdea.id] || []).length >= 3
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleCriteriaSelect(criteria.id)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">{criteria.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm mb-2">{criteria.description}</p>
              <p className="text-xs text-muted-foreground">{criteria.question}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {(selectedCriteria[currentIdea.id] || []).length > 0 && (
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Respond to Selected Criteria</h3>
            <span className="text-sm text-muted-foreground">
              {(selectedCriteria[currentIdea.id] || []).length}/3 criteria selected
            </span>
          </div>
          
          <div className="space-y-4">
            {(selectedCriteria[currentIdea.id] || []).map((criteriaId) => {
              const criteria = criteriaCards.find(c => c.id === criteriaId);
              if (!criteria) return null;
              
              return (
                <div key={criteriaId} className="space-y-2">
                  <div>
                    <h4 className="font-medium">{criteria.name}</h4>
                    <p className="text-sm text-muted-foreground">{criteria.question}</p>
                  </div>
                  <Textarea
                    value={criteriaResponses.find(c => c.criteriaCard.id === criteriaId)?.response || ''}
                    onChange={(e) => handleResponseChange(criteriaId, e.target.value)}
                    placeholder="Enter your evaluation for this criteria..."
                    rows={3}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 