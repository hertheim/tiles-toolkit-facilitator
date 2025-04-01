'use client';

import { useState } from 'react';
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
  selectedCard?: CardType;
};

const CardCategory = ({ cards, onSelectCard, selectedCard }: CardCategoryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.id}
          className={`cursor-pointer transition-all ${selectedCard?.id === card.id ? 'border-2 border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
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
  }) => void;
}

export function CardSelection({ onCombinationComplete }: CardSelectionProps) {
  const [activeTab, setActiveTab] = useState('things');
  const [selectedCards, setSelectedCards] = useState<{
    thing?: typeof thingCards[0];
    sensor?: typeof sensorCards[0];
    action?: typeof actionCards[0];
    feedback?: typeof feedbackCards[0];
    service?: typeof serviceCards[0];
  }>({});

  const handleSelectCard = (category: string, card: CardType) => {
    const newSelectedCards = {
      ...selectedCards,
      [category]: card,
    };
    setSelectedCards(newSelectedCards);
    
    // Auto switch to next category
    if (category === 'thing' && !selectedCards.sensor) {
      setActiveTab('sensors');
    } else if (category === 'sensor' && !selectedCards.action) {
      setActiveTab('actions');
    } else if (category === 'action' && !selectedCards.feedback) {
      setActiveTab('feedback');
    } else if (category === 'feedback' && !selectedCards.service) {
      setActiveTab('services');
    }
  };

  const handleClearSelection = () => {
    setSelectedCards({});
    setActiveTab('things');
  };

  const isComplete = () => {
    return (
      selectedCards.thing &&
      selectedCards.sensor &&
      selectedCards.action &&
      selectedCards.feedback &&
      selectedCards.service
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Selected Combination</h3>
        <div className="flex flex-wrap gap-2">
          {selectedCards.thing ? (
            <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
              Thing: {selectedCards.thing.name}
              <button 
                onClick={() => setSelectedCards({ ...selectedCards, thing: undefined })}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ) : null}
          
          {selectedCards.sensor ? (
            <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
              Sensor: {selectedCards.sensor.name}
              <button 
                onClick={() => setSelectedCards({ ...selectedCards, sensor: undefined })}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ) : null}
          
          {selectedCards.action ? (
            <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
              Action: {selectedCards.action.name}
              <button 
                onClick={() => setSelectedCards({ ...selectedCards, action: undefined })}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ) : null}
          
          {selectedCards.feedback ? (
            <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
              Feedback: {selectedCards.feedback.name}
              <button 
                onClick={() => setSelectedCards({ ...selectedCards, feedback: undefined })}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ) : null}
          
          {selectedCards.service ? (
            <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
              Service: {selectedCards.service.name}
              <button 
                onClick={() => setSelectedCards({ ...selectedCards, service: undefined })}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ) : null}
          
          {Object.keys(selectedCards).length === 0 && (
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
            selectedCard={selectedCards.thing}
          />
        </TabsContent>
        
        <TabsContent value="sensors" className="p-4">
          <CardCategory 
            cards={sensorCards}
            onSelectCard={(card) => handleSelectCard('sensor', card)}
            selectedCard={selectedCards.sensor}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="p-4">
          <CardCategory 
            cards={actionCards}
            onSelectCard={(card) => handleSelectCard('action', card)}
            selectedCard={selectedCards.action}
          />
        </TabsContent>
        
        <TabsContent value="feedback" className="p-4">
          <CardCategory 
            cards={feedbackCards}
            onSelectCard={(card) => handleSelectCard('feedback', card)}
            selectedCard={selectedCards.feedback}
          />
        </TabsContent>
        
        <TabsContent value="services" className="p-4">
          <CardCategory 
            cards={serviceCards}
            onSelectCard={(card) => handleSelectCard('service', card)}
            selectedCard={selectedCards.service}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleClearSelection}>
          Clear Selection
        </Button>
        
        <Button 
          onClick={() => onCombinationComplete(selectedCards)}
          disabled={!isComplete()}
        >
          Save Combination
        </Button>
      </div>
    </div>
  );
} 