'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkshop } from '@/lib/workshop-context';
import { useEvaluations } from '@/hooks/useEvaluations';
import { CardSelection } from '@/components/workshop/card-selection';
import { IdeaRefinement } from '@/components/workshop/idea-refinement';
import { Storyboard } from '@/components/workshop/storyboard';
import { Evaluation } from '@/components/workshop/evaluation';
import { ElevatorPitch } from '@/components/workshop/elevator-pitch';
import { WorkshopPhase, Idea, CardType } from '@/types';
import { toast } from 'sonner';
import NextLink from 'next/link';

// A component to display the workshop context (mission, persona, scenario)
const WorkshopContext = ({ workshop }: { workshop: ReturnType<typeof useWorkshop>['currentWorkshop'] }) => {
  if (!workshop) return null;
  
  return (
    <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
      <div className="font-medium">Workshop Context</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workshop.mission && (
          <div>
            <div className="font-medium">Mission</div>
            <div>{workshop.mission.name}</div>
            <div className="text-xs text-muted-foreground">{workshop.mission.goal}</div>
          </div>
        )}
        
        {workshop.persona && (
          <div>
            <div className="font-medium">Persona</div>
            <div>{workshop.persona.name}</div>
            <div className="text-xs text-muted-foreground">{workshop.persona.description}</div>
          </div>
        )}
        
        {workshop.scenario && (
          <div>
            <div className="font-medium">Scenario</div>
            <div>{workshop.scenario.name}</div>
            <div className="text-xs text-muted-foreground">{workshop.scenario.description}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ideas list sidebar component
const IdeasList = ({ 
  ideas, 
  currentIdea, 
  setCurrentIdea,
  onCreateNewIdea,
}: { 
  ideas: Idea[]; 
  currentIdea: Idea | null;
  setCurrentIdea: (idea: Idea) => void;
  onCreateNewIdea: () => void;
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4 h-full">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Ideas</h3>
        <Button size="sm" onClick={onCreateNewIdea}>New Idea</Button>
      </div>
      
      <div className="space-y-2">
        {ideas.length === 0 ? (
          <div className="text-muted-foreground text-sm italic text-center">
            No ideas yet. Create one to get started!
          </div>
        ) : (
          ideas.map((idea) => (
            <div
              key={idea.id}
              className={`p-3 border rounded-md cursor-pointer ${
                currentIdea?.id === idea.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setCurrentIdea(idea)}
            >
              <div className="font-medium">{idea.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {idea.description || 'No description'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function WorkshopPage() {
  const workshop = useWorkshop();
  const { selectedCriteria } = useEvaluations();
  const { 
    currentWorkshop, 
    setCurrentWorkshop, 
    ideas,
    createIdea,
    currentIdea,
    setCurrentIdea,
    currentPhase,
    setCurrentPhase,
    workshops
  } = workshop;
  
  const params = useParams();
  const router = useRouter();
  
  // Add isEditingIdea state to track when we're editing vs creating
  const [isEditingIdea, setIsEditingIdea] = useState(false);

  // Load the workshop
  useEffect(() => {
    // Extract the workshop ID from the URL
    const id = params.id as string;
    
    if (!currentWorkshop || currentWorkshop.id !== id) {
      // Try to find the workshop in the context
      const foundWorkshop = workshops.find(w => w.id === id);
      
      if (foundWorkshop) {
        setCurrentWorkshop(foundWorkshop);
      } else {
        // If workshop not found, redirect to home
        toast.error('Workshop not found');
        router.push('/');
      }
    }
  }, [params.id, currentWorkshop, setCurrentWorkshop, router, workshops]);
  
  // Filter ideas for the current workshop
  const workshopIdeas = ideas.filter(idea => idea.workshopId === currentWorkshop?.id);
  
  // Handle creating a new idea
  const handleCreateIdea = (cardCombination: Record<string, CardType | CardType[]>) => {
    if (!currentWorkshop) return;
    
    // Only update if we're explicitly in edit mode
    if (isEditingIdea && currentIdea) {
      // Generate updated title and description based on new card combination
      const primaryThingName = cardCombination.thing && (cardCombination.thing as CardType).name;
      const primarySensorName = cardCombination.sensor && (cardCombination.sensor as CardType).name;
      
      // Generate title based on card combination
      let title = currentIdea.title;
      if (primaryThingName && primarySensorName) {
        title = `${primaryThingName} with ${primarySensorName}`;
      } else if (primaryThingName) {
        title = `${primaryThingName}`;
      } else if (primarySensorName) {
        title = `${primarySensorName}`;
      }
      
      // Get all selected cards for description
      const allCards: CardType[] = [];
      
      // Add individual cards
      if (cardCombination.thing) allCards.push(cardCombination.thing as CardType);
      if (cardCombination.sensor) allCards.push(cardCombination.sensor as CardType);
      if (cardCombination.action) allCards.push(cardCombination.action as CardType);
      if (cardCombination.feedback) allCards.push(cardCombination.feedback as CardType);
      if (cardCombination.service) allCards.push(cardCombination.service as CardType);
      
      // Generate description based on all cards
      const description = allCards.length > 0
        ? `An idea using ${allCards.map(card => card.name).join(', ')}`
        : currentIdea.description;
      
      // Update the existing idea with the new card combination and metadata
      workshop.updateIdea(currentIdea.id, {
        cardCombination: cardCombination as {
          thing?: CardType;
          sensor?: CardType;
          action?: CardType;
          feedback?: CardType;
          service?: CardType;
          thingCards?: CardType[];
          sensorCards?: CardType[];
          actionCards?: CardType[];
          feedbackCards?: CardType[];
          serviceCards?: CardType[];
        },
        title,
        description,
        cardsUpdated: true,
      });
      
      toast.success('Idea updated');
      
      // Move to the next phase if we're in ideation
      if (currentPhase === 'ideation') {
        setCurrentPhase('refinement');
      }
      return;
    }
    
    // Create a new idea
    const primaryThingName = cardCombination.thing && (cardCombination.thing as CardType).name;
    const primarySensorName = cardCombination.sensor && (cardCombination.sensor as CardType).name;
    
    // Generate title based on card combination or use generic title
    let title = `New Idea ${workshopIdeas.length + 1}`;
    if (primaryThingName && primarySensorName) {
      title = `${primaryThingName} with ${primarySensorName}`;
    } else if (primaryThingName) {
      title = `${primaryThingName}`;
    } else if (primarySensorName) {
      title = `${primarySensorName}`;
    }
    
    // Get all selected cards for description
    const allCards: CardType[] = [];
    
    // Add individual cards
    if (cardCombination.thing) allCards.push(cardCombination.thing as CardType);
    if (cardCombination.sensor) allCards.push(cardCombination.sensor as CardType);
    if (cardCombination.action) allCards.push(cardCombination.action as CardType);
    if (cardCombination.feedback) allCards.push(cardCombination.feedback as CardType);
    if (cardCombination.service) allCards.push(cardCombination.service as CardType);
    
    // Generate description based on all cards
    const description = allCards.length > 0
      ? `An idea using ${allCards.map(card => card.name).join(', ')}`
      : '';
    
    const newIdea = createIdea({
      title,
      description,
      cardCombination: cardCombination as {
        thing?: CardType;
        sensor?: CardType;
        action?: CardType;
        feedback?: CardType;
        service?: CardType;
        thingCards?: CardType[];
        sensorCards?: CardType[];
        actionCards?: CardType[];
        feedbackCards?: CardType[];
        serviceCards?: CardType[];
      },
      refinements: [],
    });
    
    setCurrentIdea(newIdea);
    toast.success('New idea created');
    
    // Move to the next phase if we're in ideation
    if (currentPhase === 'ideation') {
      setCurrentPhase('refinement');
    }
  };
  
  if (!currentWorkshop) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p>Loading workshop...</p>
      </div>
    );
  }
  
  const handlePhaseChange = (phase: string) => {
    setCurrentPhase(phase as WorkshopPhase);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{currentWorkshop.name}</h1>
          <div className="flex space-x-2">
            <NextLink href={`/workshop/${currentWorkshop.id}/summary`} passHref>
              <Button variant="outline">View Summary</Button>
            </NextLink>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to frontpage
            </Button>
          </div>
        </div>
        <WorkshopContext workshop={currentWorkshop} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Ideas sidebar */}
        <div className="lg:col-span-1">
          <IdeasList 
            ideas={workshopIdeas} 
            currentIdea={currentIdea}
            setCurrentIdea={(idea) => {
              setCurrentIdea(idea);
              setIsEditingIdea(true);
            }}
            onCreateNewIdea={() => {
              setCurrentPhase('ideation');
              setCurrentIdea(null);
              setIsEditingIdea(false);
            }}
          />
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          <Tabs value={currentPhase} onValueChange={handlePhaseChange}>
            <TabsList className="grid grid-cols-5 w-full mb-8">
              <TabsTrigger value="ideation">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Ideation
                </div>
              </TabsTrigger>
              <TabsTrigger value="refinement" disabled={!currentIdea}>
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Refinement
                </div>
              </TabsTrigger>
              <TabsTrigger value="storyboard" disabled={!currentIdea}>
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Storyboard
                </div>
              </TabsTrigger>
              <TabsTrigger value="evaluation" disabled={!currentIdea}>
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Evaluation
                </div>
              </TabsTrigger>
              <TabsTrigger value="elevator" disabled={!currentIdea}>
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                  Elevator Pitch
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ideation">
              <CardSelection 
                onCombinationComplete={handleCreateIdea} 
                initialCardCombination={isEditingIdea ? currentIdea?.cardCombination : undefined}
                isEditing={isEditingIdea}
              />
            </TabsContent>
            
            <TabsContent value="refinement">
              <IdeaRefinement />
            </TabsContent>
            
            <TabsContent value="storyboard">
              <Storyboard />
            </TabsContent>
            
            <TabsContent value="evaluation">
              <Evaluation />
            </TabsContent>

            <TabsContent value="elevator">
              <ElevatorPitch />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 