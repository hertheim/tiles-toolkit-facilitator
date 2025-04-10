'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useWorkshop } from '@/lib/workshop-context';
import { Idea, EvaluationCriteria } from '@/types';
import { criteriaCards } from '@/data/criteria';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Mock AI API for generating elevator pitch
const mockGenerateElevatorPitch = async (idea: Idea) => {
  // In a real implementation, this would call the Ollama/Mistral API
  await new Promise(resolve => setTimeout(resolve, 1200)); // simulate API delay
  
  const thingName = idea.cardCombination.thing?.name || 'solution';
  const sensorName = idea.cardCombination.sensor?.name || 'sensor';
  const title = idea.title || 'Our product';
  
  // Generate a simple elevator pitch
  return `${title} is a ${thingName}-based solution that uses ${sensorName} technology to address user needs efficiently and effectively. It provides a seamless experience while solving a critical problem in a novel way.`;
};

export function Evaluation() {
  const { currentIdea, updateIdea } = useWorkshop();
  const { evaluations, selectedCriteria, updateCriteriaResponses, updateSelectedCriteria } = useEvaluations();
  const [activeTab, setActiveTab] = useState<'criteria' | 'elevator'>('criteria');
  const [criteriaResponses, setCriteriaResponses] = useState<EvaluationCriteria[]>([]);
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
    
    if (currentIdea?.elevatorPitch) {
      setElevatorPitch(currentIdea.elevatorPitch);
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
  
  const generateElevatorPitch = async () => {
    setIsGenerating(true);
    try {
      const pitch = await mockGenerateElevatorPitch(currentIdea);
      setElevatorPitch(pitch);
      updateIdea(currentIdea.id, { elevatorPitch: pitch });
    } catch (error) {
      console.error('Failed to generate elevator pitch:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleElevatorPitchChange = (value: string) => {
    setElevatorPitch(value);
    updateIdea(currentIdea.id, { elevatorPitch: value });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Evaluation</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === 'criteria' || value === 'elevator') {
          setActiveTab(value);
        }
      }}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="criteria">Criteria Evaluation</TabsTrigger>
          <TabsTrigger value="elevator">Elevator Pitch</TabsTrigger>
        </TabsList>
        
        <TabsContent value="criteria" className="space-y-6 p-4">
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
        </TabsContent>
        
        <TabsContent value="elevator" className="space-y-6 p-4">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Create Elevator Pitch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An elevator pitch clearly articulates your idea in a concise, compelling way. It should capture the essence of what your idea solves and why it matters.
              </p>
              
              {!elevatorPitch ? (
                <Button
                  onClick={generateElevatorPitch}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Elevator Pitch'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    value={elevatorPitch}
                    onChange={(e) => handleElevatorPitchChange(e.target.value)}
                    placeholder="Enter your elevator pitch..."
                    rows={6}
                  />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={generateElevatorPitch}>
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 