'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useWorkshop } from '@/lib/workshop-context';
import { Idea, EvaluationCriteria } from '@/types';
import { criteriaCards } from '@/data/criteria';
import { v4 as uuidv4 } from 'uuid';

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
  const [activeTab, setActiveTab] = useState<'criteria' | 'elevator'>('criteria');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [criteriaResponses, setCriteriaResponses] = useState<{[key: string]: string}>({});
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Load existing evaluation data if available
  useEffect(() => {
    if (currentIdea?.evaluation) {
      const selectedIds = currentIdea.evaluation.criteria.map(c => c.criteriaCard.id);
      setSelectedCriteria(selectedIds);
      
      const responses: {[key: string]: string} = {};
      currentIdea.evaluation.criteria.forEach(c => {
        responses[c.criteriaCard.id] = c.response;
      });
      setCriteriaResponses(responses);
    }
    
    if (currentIdea?.elevatorPitch) {
      setElevatorPitch(currentIdea.elevatorPitch);
    }
  }, [currentIdea]);
  
  if (!currentIdea) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Idea Selected</h3>
        <p className="text-muted-foreground">
          Please select an idea from the dashboard to evaluate it.
        </p>
      </div>
    );
  }
  
  const handleCriteriaSelect = (criteriaId: string) => {
    if (selectedCriteria.includes(criteriaId)) {
      setSelectedCriteria(selectedCriteria.filter(id => id !== criteriaId));
    } else {
      setSelectedCriteria([...selectedCriteria, criteriaId]);
    }
  };
  
  const handleCriteriaResponse = (criteriaId: string, response: string) => {
    setCriteriaResponses({
      ...criteriaResponses,
      [criteriaId]: response,
    });
  };
  
  const generateElevatorPitch = async () => {
    setIsGenerating(true);
    try {
      const pitch = await mockGenerateElevatorPitch(currentIdea);
      setElevatorPitch(pitch);
    } catch (error) {
      console.error('Failed to generate elevator pitch:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveCriteriaEvaluation = () => {
    if (selectedCriteria.length === 0) return;
    
    const evaluationCriteria: EvaluationCriteria[] = selectedCriteria
      .filter(id => criteriaResponses[id]?.trim())
      .map(id => {
        const criteriaCard = criteriaCards.find(c => c.id === id);
        if (!criteriaCard) throw new Error(`Criteria with id ${id} not found`);
        
        return {
          criteriaCard,
          response: criteriaResponses[id].trim(),
        };
      });
    
    if (evaluationCriteria.length === 0) return;
    
    updateIdea(currentIdea.id, {
      evaluation: {
        id: currentIdea.evaluation?.id || uuidv4(),
        ideaId: currentIdea.id,
        criteria: evaluationCriteria,
        createdAt: currentIdea.evaluation?.createdAt || new Date(),
        updatedAt: new Date(),
      }
    });
  };
  
  const saveElevatorPitch = () => {
    if (!elevatorPitch.trim()) return;
    
    updateIdea(currentIdea.id, {
      elevatorPitch: elevatorPitch.trim(),
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Evaluate: {currentIdea.title}</h2>
        <p className="text-muted-foreground">
          Assess your idea against key criteria and create a compelling elevator pitch.
        </p>
      </div>
      
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
                  selectedCriteria.includes(criteria.id) 
                    ? 'border-2 border-primary bg-primary/5' 
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
          
          {selectedCriteria.length > 0 && (
            <div className="border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-medium">Respond to Selected Criteria</h3>
              
              <div className="space-y-4">
                {selectedCriteria.map((criteriaId) => {
                  const criteria = criteriaCards.find(c => c.id === criteriaId);
                  if (!criteria) return null;
                  
                  return (
                    <div key={criteriaId} className="space-y-2">
                      <div>
                        <h4 className="font-medium">{criteria.name}</h4>
                        <p className="text-sm text-muted-foreground">{criteria.question}</p>
                      </div>
                      <Textarea
                        value={criteriaResponses[criteriaId] || ''}
                        onChange={(e) => handleCriteriaResponse(criteriaId, e.target.value)}
                        placeholder="Enter your evaluation for this criteria..."
                        rows={3}
                      />
                    </div>
                  );
                })}
              </div>
              
              <Button onClick={saveCriteriaEvaluation}>
                Save Criteria Evaluation
              </Button>
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
                    onChange={(e) => setElevatorPitch(e.target.value)}
                    placeholder="Enter your elevator pitch..."
                    rows={6}
                  />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={generateElevatorPitch}>
                      Regenerate
                    </Button>
                    
                    <Button onClick={saveElevatorPitch}>
                      Save Elevator Pitch
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