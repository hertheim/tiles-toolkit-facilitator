'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkshop } from '@/lib/workshop-context';
import { StoryboardStep } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateStoryboard } from '@/lib/ollama-service';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Storyboard() {
  const { currentIdea, updateIdea } = useWorkshop();
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyboardSteps, setStoryboardSteps] = useState<StoryboardStep[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedStep, setDraggedStep] = useState<StoryboardStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing storyboard if it exists
  useEffect(() => {
    if (currentIdea?.storyboard) {
      setStoryboardSteps(currentIdea.storyboard.steps);
    } else {
      setStoryboardSteps([]);
    }
  }, [currentIdea]);

  if (!currentIdea) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Idea Selected</h3>
        <p className="text-muted-foreground">
          Please select an idea from the dashboard to develop a storyboard.
        </p>
      </div>
    );
  }

  const handleGenerateStoryboard = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the Ollama API to generate a storyboard
      const stepDescriptions = await generateStoryboard(currentIdea);
      
      const steps: StoryboardStep[] = stepDescriptions.map((description, index) => ({
        id: uuidv4(),
        order: index + 1,
        description,
      }));
      
      setStoryboardSteps(steps);
      
      // Auto-save the generated storyboard
      saveStoryboard(steps);
    } catch (error) {
      console.error('Failed to generate storyboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate storyboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStepChange = (index: number, description: string) => {
    const updatedSteps = [...storyboardSteps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      description,
    };
    setStoryboardSteps(updatedSteps);
  };

  const handleAddStep = () => {
    const newStep: StoryboardStep = {
      id: uuidv4(),
      order: storyboardSteps.length + 1,
      description: '',
    };
    setStoryboardSteps([...storyboardSteps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = storyboardSteps.filter((_, i) => i !== index);
    
    // Reorder remaining steps
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setStoryboardSteps(updatedSteps);
  };

  const handleDragStart = (step: StoryboardStep) => {
    setIsDragging(true);
    setDraggedStep(step);
  };

  const handleDragOver = (e: React.DragEvent, targetStep: StoryboardStep) => {
    e.preventDefault();
    if (!draggedStep || draggedStep.id === targetStep.id) return;
    
    const draggedIndex = storyboardSteps.findIndex(step => step.id === draggedStep.id);
    const targetIndex = storyboardSteps.findIndex(step => step.id === targetStep.id);
    
    if (draggedIndex !== targetIndex) {
      const updatedSteps = [...storyboardSteps];
      const [removed] = updatedSteps.splice(draggedIndex, 1);
      updatedSteps.splice(targetIndex, 0, removed);
      
      // Update order values
      updatedSteps.forEach((step, i) => {
        step.order = i + 1;
      });
      
      setStoryboardSteps(updatedSteps);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedStep(null);
  };

  const saveStoryboard = (steps = storyboardSteps) => {
    if (steps.length === 0 || !currentIdea) return;
    
    updateIdea(currentIdea.id, {
      storyboard: {
        id: currentIdea.storyboard?.id || uuidv4(),
        ideaId: currentIdea.id,
        steps: steps,
        createdAt: currentIdea.storyboard?.createdAt || new Date(),
        updatedAt: new Date(),
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Storyboard: {currentIdea.title}</h2>
        <p className="text-muted-foreground">
          Develop an 8-step storyboard to visualize the user journey with your idea.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}. Please ensure Ollama is running and the mistral:instruct model is installed.
          </AlertDescription>
        </Alert>
      )}
      
      {storyboardSteps.length === 0 ? (
        <Card className="p-6 text-center">
          <CardContent>
            <p className="mb-4">Generate an AI-suggested storyboard or create your own from scratch.</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleGenerateStoryboard}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate AI Storyboard'}
              </Button>
              <Button variant="outline" onClick={handleAddStep}>
                Create From Scratch
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              onClick={handleGenerateStoryboard}
              disabled={isGenerating}
              className="text-sm"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate with AI'}
            </Button>
          </div>
          
          <div className="grid gap-4">
            {storyboardSteps.map((step, index) => (
              <Card 
                key={step.id}
                draggable
                onDragStart={() => handleDragStart(step)}
                onDragOver={(e) => handleDragOver(e, step)}
                onDragEnd={handleDragEnd}
                className={`cursor-move ${isDragging && draggedStep?.id === step.id ? 'opacity-50' : ''}`}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {step.order}
                    </span>
                    Step {step.order}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveStep(index)}
                    className="h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Textarea
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder="Describe what happens in this step..."
                    rows={2}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleAddStep}>
              Add Step
            </Button>
            
            <Button onClick={() => saveStoryboard()}>
              Save Storyboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 