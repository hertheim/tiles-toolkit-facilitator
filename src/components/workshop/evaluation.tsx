'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkshop } from '@/lib/workshop-context';
import { Idea, EvaluationCriteria } from '@/types';
import { criteriaCards, CriteriaCard } from '@/data/criteria';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';

export function Evaluation() {
  const { currentIdea } = useWorkshop();
  const { evaluations, selectedCriteria, updateCriteriaResponses, updateSelectedCriteria } = useEvaluations();
  const [criteriaResponses, setCriteriaResponses] = useState<EvaluationCriteria[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Custom criteria dialog state
  const [customCriteriaDialogOpen, setCustomCriteriaDialogOpen] = useState(false);
  const [customCriteriaName, setCustomCriteriaName] = useState('');
  const [customCriteriaDescription, setCustomCriteriaDescription] = useState('');
  const [customCriteriaQuestion, setCustomCriteriaQuestion] = useState('');
  
  // Load existing evaluation data if available
  useEffect(() => {
    if (currentIdea) {
      const existingEvaluation = evaluations.find(e => e.ideaId === currentIdea.id);
      if (existingEvaluation) {
        setCriteriaResponses(existingEvaluation.criteria);
      } else {
        // Only initialize with standard criteria cards
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
  
  const handleAddCustomCriteria = () => {
    setCustomCriteriaDialogOpen(true);
  };
  
  const handleCustomCriteriaConfirm = () => {
    if (!customCriteriaName.trim()) {
      setError("Please provide a name for your custom criteria");
      return;
    }
    
    // Create custom criteria card with idea-specific ID
    const customCriteriaId = `custom-${currentIdea.id}-${Date.now()}`;
    const customCriteria: CriteriaCard = {
      id: customCriteriaId,
      type: "Criteria",
      name: customCriteriaName,
      description: customCriteriaDescription || "Custom evaluation criteria",
      question: customCriteriaQuestion || "How well does the idea meet this criteria?"
    };
    
    // Add the custom criteria to responses
    const newResponses = [...criteriaResponses];
    newResponses.push({
      criteriaCard: customCriteria,
      response: ''
    });
    setCriteriaResponses(newResponses);
    
    // Add to selected criteria (if there's room)
    const currentSelected = selectedCriteria[currentIdea.id] || [];
    if (currentSelected.length < 3) {
      updateSelectedCriteria(currentIdea.id, [...currentSelected, customCriteriaId]);
    }
    
    // Update the responses in the evaluations context
    updateCriteriaResponses(currentIdea.id, newResponses);
    
    // Reset and close dialog
    setCustomCriteriaName('');
    setCustomCriteriaDescription('');
    setCustomCriteriaQuestion('');
    setCustomCriteriaDialogOpen(false);
    setError(null);
  };
  
  // Get custom criteria specific to this idea
  const ideaCustomCriteria = criteriaResponses
    .filter(cr => cr.criteriaCard.id.startsWith(`custom-${currentIdea.id}`));
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Evaluation</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Standard Criteria</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddCustomCriteria}
          disabled={(selectedCriteria[currentIdea.id] || []).length >= 3}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Criteria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteriaCards
          .filter(criteria => criteria.id !== "c10") // Remove the custom card placeholder
          .map((criteria) => (
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
      
      {ideaCustomCriteria.length > 0 && (
        <>
          <h3 className="text-lg font-medium mt-8">Custom Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideaCustomCriteria.map(customCriteria => (
              <Card 
                key={customCriteria.criteriaCard.id}
                className={`cursor-pointer transition-all ${
                  (selectedCriteria[currentIdea.id] || []).includes(customCriteria.criteriaCard.id) 
                    ? 'border-2 border-primary bg-primary/5' 
                    : (selectedCriteria[currentIdea.id] || []).length >= 3
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleCriteriaSelect(customCriteria.criteriaCard.id)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">{customCriteria.criteriaCard.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm mb-2">{customCriteria.criteriaCard.description}</p>
                  <p className="text-xs text-muted-foreground">{customCriteria.criteriaCard.question}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Custom Criteria Dialog */}
      <Dialog open={customCriteriaDialogOpen} onOpenChange={setCustomCriteriaDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Criteria</DialogTitle>
            <DialogDescription>
              Define your own evaluation criteria specific to this idea.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-name" className="text-right">
                Name
              </Label>
              <Input
                id="custom-name"
                value={customCriteriaName}
                onChange={(e) => setCustomCriteriaName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Sustainability"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="custom-description"
                value={customCriteriaDescription}
                onChange={(e) => setCustomCriteriaDescription(e.target.value)}
                className="col-span-3"
                placeholder="Describe what this criteria evaluates"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-question" className="text-right">
                Question
              </Label>
              <Textarea
                id="custom-question"
                value={customCriteriaQuestion}
                onChange={(e) => setCustomCriteriaQuestion(e.target.value)}
                className="col-span-3"
                placeholder="What question should be answered for this criteria?"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomCriteriaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomCriteriaConfirm}>
              Add Criteria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
              // Find first in standard criteria cards
              let criteria = criteriaCards.find(c => c.id === criteriaId);
              
              // If not found, check in custom criteria from responses
              if (!criteria) {
                const customCriteriaResponse = criteriaResponses.find(c => c.criteriaCard.id === criteriaId);
                if (customCriteriaResponse) {
                  criteria = customCriteriaResponse.criteriaCard;
                }
              }
              
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