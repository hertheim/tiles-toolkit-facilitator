import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkshop } from '@/lib/workshop-context';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Idea } from '@/types';

// Mock AI API for generating elevator pitch
const mockGenerateElevatorPitch = async (idea: Idea) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const thingName = idea.cardCombination.thing?.name || 'solution';
  const sensorName = idea.cardCombination.sensor?.name || 'sensor';
  const title = idea.title || 'Our product';
  return `${title} is a ${thingName}-based solution that uses ${sensorName} technology to address user needs efficiently and effectively. It provides a seamless experience while solving a critical problem in a novel way.`;
};

export function ElevatorPitch() {
  const { currentIdea, updateIdea } = useWorkshop();
  const { selectedCriteria } = useEvaluations();
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update elevator pitch when current idea changes
  useEffect(() => {
    if (currentIdea) {
      setElevatorPitch(currentIdea.elevatorPitch || '');
    }
  }, [currentIdea]);

  if (!currentIdea) {
    return (
      <Alert>
        <AlertDescription>Please select an idea first</AlertDescription>
      </Alert>
    );
  }

  const hasSelectedCriteria = (selectedCriteria[currentIdea.id] || []).length > 0;

  if (!hasSelectedCriteria) {
    return (
      <Alert>
        <AlertDescription>Please select at least one evaluation criteria before creating an elevator pitch</AlertDescription>
      </Alert>
    );
  }

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
      <h2 className="text-2xl font-bold">Elevator Pitch</h2>
      
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
    </div>
  );
} 