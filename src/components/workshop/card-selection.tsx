'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { thingCards } from "@/data/things";
import { sensorCards } from "@/data/sensors";
import { actionCards } from "@/data/actions";
import { feedbackCards } from "@/data/feedback";
import { serviceCards } from "@/data/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardType } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// List of custom card IDs
const CUSTOM_CARD_IDS = ["t29", "s12", "a9", "f9", "sv15", "c10", "sc18", "m13", "p17"];

type CardCategoryProps = {
  cards: CardType[];
  onSelectCard: (card: CardType) => void;
  selectedCards: CardType[];
};

const CardCategory = ({ cards, onSelectCard, selectedCards }: CardCategoryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const isCustomCard = CUSTOM_CARD_IDS.includes(card.id);
        return (
          <Card 
            key={card.id}
            className={`cursor-pointer transition-all ${
              selectedCards.some(selected => selected.id === card.id) 
                ? 'border-2 border-primary bg-primary/5' 
                : isCustomCard
                  ? 'border-dashed border-2 hover:border-primary hover:bg-primary/5'
                  : 'hover:bg-muted/50'
            }`}
            onClick={() => onSelectCard(card)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription>
                {CUSTOM_CARD_IDS.includes(card.id) && card.customDescription 
                  ? card.customDescription 
                  : card.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

interface CardSelectionProps {
  onCombinationComplete: (combination: {
    thing?: typeof thingCards[0];
    sensor?: typeof sensorCards[0];
    action?: typeof actionCards[0];
    feedback?: typeof feedbackCards[0];
    service?: typeof serviceCards[0];
    thingCards?: typeof thingCards[0][];
    sensorCards?: typeof sensorCards[0][];
    actionCards?: typeof actionCards[0][];
    feedbackCards?: typeof feedbackCards[0][];
    serviceCards?: typeof serviceCards[0][];
    description: string;
  }) => void;
  initialCardCombination?: {
    thing?: typeof thingCards[0];
    sensor?: typeof sensorCards[0];
    action?: typeof actionCards[0];
    feedback?: typeof feedbackCards[0];
    service?: typeof serviceCards[0];
    thingCards?: typeof thingCards[0][];
    sensorCards?: typeof sensorCards[0][];
    actionCards?: typeof actionCards[0][];
    feedbackCards?: typeof feedbackCards[0][];
    serviceCards?: typeof serviceCards[0][];
    description?: string;
  };
  isEditing?: boolean;
}

export function CardSelection({ onCombinationComplete, initialCardCombination, isEditing = false }: CardSelectionProps) {
  const [activeTab, setActiveTab] = useState('things');
  const [selectedCards, setSelectedCards] = useState<{
    thing: typeof thingCards[0][];
    sensor: typeof sensorCards[0][];
    action: typeof actionCards[0][];
    feedback: typeof feedbackCards[0][];
    service: typeof serviceCards[0][];
  }>({
    thing: [],
    sensor: [],
    action: [],
    feedback: [],
    service: []
  });
  
  // Custom card dialog state
  const [customCardDialogOpen, setCustomCardDialogOpen] = useState(false);
  const [customCardCategory, setCustomCardCategory] = useState<string>('');
  const [customCardData, setCustomCardData] = useState<CardType | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [customName, setCustomName] = useState('');

  // Confirmation dialog for clear selection
  const [clearConfirmDialogOpen, setClearConfirmDialogOpen] = useState(false);
  
  // Idea description state
  const [ideaDescription, setIdeaDescription] = useState(initialCardCombination?.description || '');

  // Effect to initialize selected cards when initialCardCombination changes
  useEffect(() => {
    if (initialCardCombination) {
      const newSelectedCards: {
        thing: typeof thingCards[0][];
        sensor: typeof sensorCards[0][];
        action: typeof actionCards[0][];
        feedback: typeof feedbackCards[0][];
        service: typeof serviceCards[0][];
      } = {
        thing: [],
        sensor: [],
        action: [],
        feedback: [],
        service: []
      };
      
      // Add existing individual cards to the arrays (for backward compatibility)
      if (initialCardCombination.thing) {
        newSelectedCards.thing.push(initialCardCombination.thing);
      }
      
      if (initialCardCombination.sensor) {
        newSelectedCards.sensor.push(initialCardCombination.sensor);
      }
      
      if (initialCardCombination.action) {
        newSelectedCards.action.push(initialCardCombination.action);
      }
      
      if (initialCardCombination.feedback) {
        newSelectedCards.feedback.push(initialCardCombination.feedback);
      }
      
      if (initialCardCombination.service) {
        newSelectedCards.service.push(initialCardCombination.service);
      }
      
      // Add cards from the card arrays (this is the new feature)
      if (initialCardCombination.thingCards && initialCardCombination.thingCards.length > 0) {
        // Avoid duplicating the single card that's already in 'thing'
        const firstThingId = initialCardCombination.thing?.id;
        initialCardCombination.thingCards.forEach(card => {
          if (card.id !== firstThingId && !newSelectedCards.thing.some(c => c.id === card.id)) {
            newSelectedCards.thing.push(card);
          }
        });
      }
      
      if (initialCardCombination.sensorCards && initialCardCombination.sensorCards.length > 0) {
        const firstSensorId = initialCardCombination.sensor?.id;
        initialCardCombination.sensorCards.forEach(card => {
          if (card.id !== firstSensorId && !newSelectedCards.sensor.some(c => c.id === card.id)) {
            newSelectedCards.sensor.push(card);
          }
        });
      }
      
      if (initialCardCombination.actionCards && initialCardCombination.actionCards.length > 0) {
        const firstActionId = initialCardCombination.action?.id;
        initialCardCombination.actionCards.forEach(card => {
          if (card.id !== firstActionId && !newSelectedCards.action.some(c => c.id === card.id)) {
            newSelectedCards.action.push(card);
          }
        });
      }
      
      if (initialCardCombination.feedbackCards && initialCardCombination.feedbackCards.length > 0) {
        const firstFeedbackId = initialCardCombination.feedback?.id;
        initialCardCombination.feedbackCards.forEach(card => {
          if (card.id !== firstFeedbackId && !newSelectedCards.feedback.some(c => c.id === card.id)) {
            newSelectedCards.feedback.push(card);
          }
        });
      }
      
      if (initialCardCombination.serviceCards && initialCardCombination.serviceCards.length > 0) {
        const firstServiceId = initialCardCombination.service?.id;
        initialCardCombination.serviceCards.forEach(card => {
          if (card.id !== firstServiceId && !newSelectedCards.service.some(c => c.id === card.id)) {
            newSelectedCards.service.push(card);
          }
        });
      }
      
      setSelectedCards(newSelectedCards);
    }
  }, [initialCardCombination]);

  // Function to check if the selected cards are different from the initial card combination
  const hasCardCombinationChanged = () => {
    if (!isEditing || !initialCardCombination) return true; // If not editing, changes aren't relevant
    
    const categories = ['thing', 'sensor', 'action', 'feedback', 'service'] as const;
    
    // Check if the number of cards in any category has changed
    for (const category of categories) {
      const initialCount = initialCardCombination[`${category}Cards`]?.length || 
                          (initialCardCombination[category] ? 1 : 0);
      const currentCount = selectedCards[category].length;
      
      if (initialCount !== currentCount) return true;
    }
    
    // Check if the cards themselves have changed in any category
    for (const category of categories) {
      const currentCategoryCards = selectedCards[category];
      
      // Get initial cards, either as an array or as a single card
      let initialCategoryCards: typeof thingCards[0][] = [];
      
      if (initialCardCombination[`${category}Cards`]?.length) {
        initialCategoryCards = initialCardCombination[`${category}Cards`] as typeof thingCards[0][];
      } else if (initialCardCombination[category]) {
        initialCategoryCards = [initialCardCombination[category] as typeof thingCards[0]];
      }
      
      // If the arrays have different lengths, they're different
      if (initialCategoryCards.length !== currentCategoryCards.length) return true;
      
      // Compare each card by ID
      for (const currentCard of currentCategoryCards) {
        const matchingCard = initialCategoryCards.find(c => c.id === currentCard.id);
        
        // If this card doesn't exist in the initial set, or its custom data changed
        if (!matchingCard) return true;
        
        // Check for custom card changes
        if (CUSTOM_CARD_IDS.includes(currentCard.id)) {
          if (
            (currentCard as any).customName !== (matchingCard as any).customName ||
            (currentCard as any).customDescription !== (matchingCard as any).customDescription
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  const handleSelectCard = (category: string, card: CardType) => {
    // First check if this card is already selected
    const categoryArray = selectedCards[category as keyof typeof selectedCards];
    const isAlreadySelected = categoryArray.some(c => c.id === card.id);
    
    // If card is already selected, remove it regardless of whether it's custom or not
    if (isAlreadySelected) {
      const newSelectedCards = { ...selectedCards };
      const updatedCategoryArray = newSelectedCards[category as keyof typeof selectedCards];
      const cardIndex = updatedCategoryArray.findIndex(c => c.id === card.id);
      
      if (cardIndex >= 0) {
        updatedCategoryArray.splice(cardIndex, 1);
        setSelectedCards(newSelectedCards);
      }
      return;
    }
    
    // Only show the custom card dialog for non-selected custom cards
    if (CUSTOM_CARD_IDS.includes(card.id)) {
      // For custom cards, open the dialog
      setCustomCardCategory(category);
      setCustomCardData({...card});
      setCustomName(card.customName || card.name);
      setCustomDescription(card.customDescription || '');
      setCustomCardDialogOpen(true);
      return;
    }
    
    // For regular cards that aren't already selected, add them
    const newSelectedCards = { ...selectedCards };
    newSelectedCards[category as keyof typeof selectedCards].push(card as CardType);
    setSelectedCards(newSelectedCards);
  };
  
  const handleCustomCardConfirm = () => {
    if (!customCardData || !customCardCategory) return;
    
    // Create a clone of the card with custom properties
    const customizedCard = {
      ...customCardData,
      customName: customName,
      customDescription: customDescription,
      // Update the display name if provided
      name: customName || customCardData.name
    };
    
    // Add the card to selected cards
    const newSelectedCards = { ...selectedCards };
    const categoryArray = newSelectedCards[customCardCategory as keyof typeof selectedCards];
    
    // Check if the card is already selected
    const cardIndex = categoryArray.findIndex(c => c.id === customizedCard.id);
    if (cardIndex >= 0) {
      // Update the existing card
      categoryArray[cardIndex] = customizedCard as CardType;
    } else {
      // Add the new card
      categoryArray.push(customizedCard as CardType);
    }
    
    setSelectedCards(newSelectedCards);
    setCustomCardDialogOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedCards({
      thing: [],
      sensor: [],
      action: [],
      feedback: [],
      service: []
    });
    setActiveTab('things');
    setClearConfirmDialogOpen(false);
  };

  const isValid = () => {
    // Check if any cards have been selected (at least one in total)
    const hasCards = Object.values(selectedCards).some(categoryCards => categoryCards.length > 0);
    // Check if description is provided
    const hasDescription = ideaDescription.trim().length > 0;
    return hasCards && hasDescription;
  };

  const prepareCardCombination = () => {
    // For backward compatibility, include both single cards and arrays
    const combination: Record<string, CardType | CardType[]> = {};
    
    // Add first card (for backward compatibility)
    if (selectedCards.thing.length > 0) combination.thing = selectedCards.thing[0];
    if (selectedCards.sensor.length > 0) combination.sensor = selectedCards.sensor[0];
    if (selectedCards.action.length > 0) combination.action = selectedCards.action[0];
    if (selectedCards.feedback.length > 0) combination.feedback = selectedCards.feedback[0];
    if (selectedCards.service.length > 0) combination.service = selectedCards.service[0];
    
    // Also add full arrays
    combination.thingCards = selectedCards.thing;
    combination.sensorCards = selectedCards.sensor;
    combination.actionCards = selectedCards.action;
    combination.feedbackCards = selectedCards.feedback;
    combination.serviceCards = selectedCards.service;
    
    return combination;
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">
          {isEditing ? `Edit: ${initialCardCombination?.thing?.name || ''} ${initialCardCombination?.sensor?.name ? `with ${initialCardCombination.sensor.name}` : ''}` : 'Create New Idea'}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? 'Modify your idea by selecting different cards' 
            : 'Create a new idea by combining cards from any category. Click on cards to select/deselect them.'}
        </p>
      </div>
      
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Selected Combination</h3>
        <div className="space-y-4">
          {Object.entries(selectedCards).map(([category, cards]) => (
            cards.length > 0 && (
              <div key={category} className="space-y-2">
                <div className="text-sm font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}:</div>
                <div className="flex flex-wrap gap-2">
                  {cards.map(card => (
                    <div key={card.id} className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
                      {CUSTOM_CARD_IDS.includes(card.id) && (card as any).customName ? (card as any).customName : card.name}
                      <button 
                        onClick={() => handleSelectCard(category, card)}
                        className="text-primary hover:text-primary/70"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {Object.values(selectedCards).every(categoryCards => categoryCards.length === 0) && (
            <div className="text-muted-foreground italic">No cards selected yet</div>
          )}
        </div>
      </div>

      {/* Idea Description Field */}
      <div className="space-y-2">
        <Label htmlFor="idea-description">Describe your idea</Label>
        <Textarea
          id="idea-description"
          placeholder="Explain how these cards work together to create your idea..."
          value={ideaDescription}
          onChange={(e) => setIdeaDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          This description will help the AI understand your idea better and provide more meaningful feedback.
        </p>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            // Only show confirmation if there are cards selected
            const hasSelectedCards = Object.values(selectedCards).some(
              categoryCards => categoryCards.length > 0
            );
            
            if (hasSelectedCards) {
              setClearConfirmDialogOpen(true);
            }
          }}
          disabled={Object.values(selectedCards).every(categoryCards => categoryCards.length === 0)}
        >
          Clear Selection
        </Button>
        
        <Button 
          onClick={() => onCombinationComplete({
            ...prepareCardCombination(),
            description: ideaDescription
          })}
          disabled={!isValid() || (isEditing && !hasCardCombinationChanged())}
        >
          {isEditing ? 'Update Idea' : 'Save Combination'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="things">Things</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="things" className="p-4">
          <CardCategory 
            cards={thingCards} 
            onSelectCard={(card) => handleSelectCard('thing', card)}
            selectedCards={selectedCards.thing}
          />
        </TabsContent>
        
        <TabsContent value="sensors" className="p-4">
          <CardCategory 
            cards={sensorCards}
            onSelectCard={(card) => handleSelectCard('sensor', card)}
            selectedCards={selectedCards.sensor}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="p-4">
          <CardCategory 
            cards={actionCards}
            onSelectCard={(card) => handleSelectCard('action', card)}
            selectedCards={selectedCards.action}
          />
        </TabsContent>
        
        <TabsContent value="feedback" className="p-4">
          <CardCategory 
            cards={feedbackCards}
            onSelectCard={(card) => handleSelectCard('feedback', card)}
            selectedCards={selectedCards.feedback}
          />
        </TabsContent>
        
        <TabsContent value="services" className="p-4">
          <CardCategory 
            cards={serviceCards}
            onSelectCard={(card) => handleSelectCard('service', card)}
            selectedCards={selectedCards.service}
          />
        </TabsContent>
      </Tabs>
      
      {/* Clear Selection Confirmation Dialog */}
      <Dialog open={clearConfirmDialogOpen} onOpenChange={setClearConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear Selection</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all selected cards? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setClearConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearSelection}>
              Clear All Cards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Custom Card Dialog */}
      <Dialog open={customCardDialogOpen} onOpenChange={setCustomCardDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Your Card</DialogTitle>
            <DialogDescription>
              Provide details for your custom {customCardCategory} card.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-name" className="text-right">
                Name
              </Label>
              <Input
                id="custom-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="col-span-3"
                placeholder={customCardData?.name || 'Custom name'}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="custom-description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="col-span-3"
                placeholder="Describe your custom card"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomCardDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomCardConfirm}>
              Save Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 