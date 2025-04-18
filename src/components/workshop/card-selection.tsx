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

type CardCategoryProps = {
  cards: CardType[];
  onSelectCard: (card: CardType) => void;
  selectedCards: CardType[];
};

const CardCategory = ({ cards, onSelectCard, selectedCards }: CardCategoryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.id}
          className={`cursor-pointer transition-all ${selectedCards.some(selected => selected.id === card.id) ? 'border-2 border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
          onClick={() => onSelectCard(card)}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <CardDescription>{card.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
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
    // New fields for multiple cards
    thingCards?: typeof thingCards[0][];
    sensorCards?: typeof sensorCards[0][];
    actionCards?: typeof actionCards[0][];
    feedbackCards?: typeof feedbackCards[0][];
    serviceCards?: typeof serviceCards[0][];
  }) => void;
  initialCardCombination?: {
    thing?: typeof thingCards[0];
    sensor?: typeof sensorCards[0];
    action?: typeof actionCards[0];
    feedback?: typeof feedbackCards[0];
    service?: typeof serviceCards[0];
    // New fields for multiple cards
    thingCards?: typeof thingCards[0][];
    sensorCards?: typeof sensorCards[0][];
    actionCards?: typeof actionCards[0][];
    feedbackCards?: typeof feedbackCards[0][];
    serviceCards?: typeof serviceCards[0][];
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

  const handleSelectCard = (category: string, card: CardType) => {
    // Toggle selection (add if not selected, remove if already selected)
    const newSelectedCards = { ...selectedCards };
    const categoryArray = newSelectedCards[category as keyof typeof selectedCards];
    
    const cardIndex = categoryArray.findIndex(c => c.id === card.id);
    if (cardIndex >= 0) {
      // Card is already selected, remove it
      categoryArray.splice(cardIndex, 1);
    } else {
      // Card is not selected, add it
      categoryArray.push(card as CardType);
    }
    
    setSelectedCards(newSelectedCards);
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
  };

  const isValid = () => {
    // Check if any cards have been selected (at least one in total)
    return Object.values(selectedCards).some(categoryCards => categoryCards.length > 0);
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
                      {card.name}
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
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleClearSelection}>
          Clear Selection
        </Button>
        
        <Button 
          onClick={() => onCombinationComplete(prepareCardCombination())}
          disabled={!isValid()}
        >
          {isEditing ? 'Update Idea' : 'Save Combination'}
        </Button>
      </div>
    </div>
  );
} 