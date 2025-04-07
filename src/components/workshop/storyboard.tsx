'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkshop } from '@/lib/workshop-context';
import { StoryboardStep } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateStoryboard } from '@/lib/ollama-service';
import { AlertCircle, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

interface RemovedStep {
  step: StoryboardStep;
  ideaId: string;
}

export function Storyboard() {
  const { currentIdea, updateIdea } = useWorkshop();
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyboardSteps, setStoryboardSteps] = useState<StoryboardStep[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedStep, setDraggedStep] = useState<StoryboardStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removedSteps, setRemovedSteps] = useState<RemovedStep[]>([]);
  const [isFlowVisible, setIsFlowVisible] = useState(false);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);
  const [isLastStepDialogOpen, setIsLastStepDialogOpen] = useState(false);
  const [stepToRemove, setStepToRemove] = useState<number | null>(null);

  // Load existing storyboard when switching ideas
  useEffect(() => {
    if (currentIdea?.storyboard) {
      setStoryboardSteps(currentIdea.storyboard.steps);
    } else {
      setStoryboardSteps([]);
    }
    // Don't clear removed steps when switching ideas anymore
  }, [currentIdea]);

  // Handle saving when steps change
  useEffect(() => {
    if (shouldSave && currentIdea && storyboardSteps) {
      updateIdea(currentIdea.id, {
        storyboard: {
          id: currentIdea.storyboard?.id || uuidv4(),
          ideaId: currentIdea.id,
          steps: storyboardSteps,
          createdAt: currentIdea.storyboard?.createdAt || new Date(),
          updatedAt: new Date(),
        }
      });
      setShouldSave(false);
    }
  }, [shouldSave, currentIdea, storyboardSteps, updateIdea]);

  const triggerSave = () => {
    setShouldSave(true);
  };

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
    setIsRegenerateDialogOpen(false);
    setIsGenerating(true);
    setError(null);
    
    try {
      const stepDescriptions = await generateStoryboard(currentIdea);
      
      const steps: StoryboardStep[] = stepDescriptions.map((description, index) => ({
        id: uuidv4(),
        order: index + 1,
        description,
      }));
      
      setStoryboardSteps(steps);
      triggerSave();
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
    triggerSave();
  };

  const handleAddStep = () => {
    const newStep: StoryboardStep = {
      id: uuidv4(),
      order: storyboardSteps.length + 1,
      description: '',
    };
    setStoryboardSteps([...storyboardSteps, newStep]);
    triggerSave();
  };

  const handleRemoveStep = (index: number) => {
    if (!currentIdea) return;

    // If this is the last step, show confirmation dialog
    if (storyboardSteps.length === 1) {
      setStepToRemove(index);
      setIsLastStepDialogOpen(true);
      return;
    }

    proceedWithRemove(index);
  };

  const proceedWithRemove = (index: number) => {
    if (!currentIdea) return;
    
    const removedStep = storyboardSteps[index];
    const updatedSteps = storyboardSteps.filter((_, i) => i !== index);
    
    // Reorder remaining steps
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setStoryboardSteps(updatedSteps);
    
    // Store the removed step with the current idea ID
    const newRemovedSteps = [{
      step: removedStep,
      ideaId: currentIdea.id
    }, ...removedSteps];
    
    setRemovedSteps(newRemovedSteps);
    triggerSave();
    
    // Show toast notification
    toast("Step removed", {
      description: "Click the Undo button to restore it",
    });
  };

  const handleUndoRemove = () => {
    if (!currentIdea) return;

    // Find the most recent removed step for the current idea
    const removedStepIndex = removedSteps.findIndex(rs => rs.ideaId === currentIdea.id);
    if (removedStepIndex === -1) return;

    // Create new arrays to avoid mutation
    const updatedRemovedSteps = [...removedSteps];
    const [removedStepInfo] = updatedRemovedSteps.splice(removedStepIndex, 1);
    setRemovedSteps(updatedRemovedSteps);

    const updatedSteps = [...storyboardSteps];
    // Insert at the original position if possible, otherwise at the end
    const insertIndex = Math.min(removedStepInfo.step.order - 1, storyboardSteps.length);
    updatedSteps.splice(insertIndex, 0, removedStepInfo.step);
    
    // Reorder all steps
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setStoryboardSteps(updatedSteps);
    triggerSave();
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
      triggerSave();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedStep(null);
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Storyboard: {currentIdea.title}</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Develop an 8-step storyboard to visualize the user journey with your idea.
          </p>
          
          {/* Recommended Flow Section */}
          <div className="border rounded-lg p-4">
            <button
              onClick={() => setIsFlowVisible(!isFlowVisible)}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              Recommended Flow
              {isFlowVisible ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {isFlowVisible && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>The storyboard should follow a logical flow:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Introduction to the user/context</li>
                  <li>Initial interaction with the product/service</li>
                  <li>How the sensor/detection works</li>
                  <li>The action taken by the user or system</li>
                  <li>How the feedback is provided</li>
                  <li>How the service component works</li>
                  <li>Resolution or outcome</li>
                  <li>Benefits realized by the user</li>
                </ol>
              </div>
            )}
          </div>
        </div>
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
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {currentIdea && removedSteps.some(rs => rs.ideaId === currentIdea.id) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndoRemove}
                  className="flex items-center gap-1"
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsRegenerateDialogOpen(true)}
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
            
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Dialog */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Storyboard</DialogTitle>
            <DialogDescription>
              This will overwrite your current storyboard steps. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsRegenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleGenerateStoryboard}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Yes, Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Last Step Removal Confirmation Dialog */}
      <Dialog open={isLastStepDialogOpen} onOpenChange={setIsLastStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Last Step</DialogTitle>
            <DialogDescription>
              This will remove the last step from your storyboard. You cannot undo this action after removal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => {
              setIsLastStepDialogOpen(false);
              setStepToRemove(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (stepToRemove !== null) {
                  proceedWithRemove(stepToRemove);
                }
                setIsLastStepDialogOpen(false);
                setStepToRemove(null);
              }}
            >
              Remove Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 