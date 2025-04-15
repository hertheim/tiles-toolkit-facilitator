import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkshop } from '@/lib/workshop-context';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Loader2, PencilLine } from 'lucide-react';
import { generateElevatorPitch } from '@/lib/ollama-service';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ElevatorPitch() {
  const { currentIdea, updateIdea, currentWorkshop } = useWorkshop();
  const { selectedCriteria, evaluations } = useEvaluations();
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  // Update elevator pitch when current idea changes
  useEffect(() => {
    if (currentIdea) {
      setElevatorPitch(currentIdea.elevatorPitch || '');
      // Check if we've already started editing this idea
      const hasEditingStarted = !!currentIdea.elevatorPitch || isEditorVisible;
      setIsEditorVisible(hasEditingStarted);
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

  // Get storyboard steps from the currentIdea if available
  const storyboardSteps = currentIdea.storyboard?.steps || [];
  
  // Get evaluation criteria responses from the evaluations
  const currentEvaluation = evaluations.find(e => e.ideaId === currentIdea.id);
  const criteriaResponses = currentEvaluation?.criteria || [];

  const handleGenerateElevatorPitch = async () => {
    setIsRegenerateDialogOpen(false);
    setIsGenerating(true);
    setIsEditorVisible(true); // Ensure editor stays visible
    
    try {
      const pitch = await generateElevatorPitch(
        currentIdea, 
        currentWorkshop, 
        storyboardSteps,
        criteriaResponses
      );
      setElevatorPitch(pitch);
      updateIdea(currentIdea.id, { elevatorPitch: pitch });
    } catch (error) {
      console.error('Failed to generate elevator pitch:', error);
      toast.error('Failed to generate elevator pitch. Please ensure Ollama is running and the mistral:instruct model is installed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManually = () => {
    setElevatorPitch(''); // Clear existing content
    setIsEditorVisible(true); // Ensure editor stays visible
    
    // Save the empty state to ensure consistency
    updateIdea(currentIdea.id, { elevatorPitch: '' });
    
    // Focus the textarea after it renders
    setTimeout(() => {
      const textarea = document.getElementById('elevator-pitch-textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  };

  const handleElevatorPitchChange = (value: string) => {
    setElevatorPitch(value);
    updateIdea(currentIdea.id, { elevatorPitch: value });
  };

  const handleBackToOptions = () => {
    // Allow going back to the options screen if desired
    setIsEditorVisible(false);
    // Optionally clear the pitch if it's empty
    if (!elevatorPitch.trim()) {
      updateIdea(currentIdea.id, { elevatorPitch: '' });
    }
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
          
          {!isEditorVisible ? (
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleGenerateElevatorPitch}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate with AI</span>
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCreateManually}>
                Create from Scratch
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                id="elevator-pitch-textarea"
                value={elevatorPitch}
                onChange={(e) => handleElevatorPitchChange(e.target.value)}
                placeholder="Enter your elevator pitch..."
                rows={10}
                className="min-h-[200px]"
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRegenerateDialogOpen(true)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate with AI'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Regenerate Confirmation Dialog */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Elevator Pitch</DialogTitle>
            <DialogDescription>
              This will overwrite your current elevator pitch. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsRegenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleGenerateElevatorPitch}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Yes, Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 