import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkshop } from '@/lib/workshop-context';
import { Workshop, Idea } from '@/types';
import { useEvaluations } from '@/hooks/useEvaluations';
import { format } from 'date-fns';

export function WorkshopSummary({ workshopId }: { workshopId: string }) {
  const { workshops, ideas } = useWorkshop();
  const { evaluations, selectedCriteria } = useEvaluations();
  
  // Find the workshop by ID
  const workshop = workshops.find(w => w.id === workshopId);
  if (!workshop) {
    return <div className="p-4">Workshop not found</div>;
  }
  
  // Get ideas for this workshop
  const workshopIdeas = ideas.filter(idea => idea.workshopId === workshopId);
  
  if (workshopIdeas.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Workshop Summary: {workshop.name}</h2>
        <Card>
          <CardContent className="p-6">
            <p>No ideas were created in this workshop session.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workshop Summary: {workshop.name}</h2>
        <div className="px-3 py-1 border rounded-md text-sm">
          {format(new Date(workshop.date).toLocaleDateString(), 'dd-MM-yyyy')}
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Workshop Context</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workshop.mission && (
            <div>
              <h3 className="font-medium">Mission</h3>
              <p className="text-sm">{workshop.mission.name}</p>
              <p className="text-xs text-muted-foreground">{workshop.mission.goal}</p>
            </div>
          )}
          
          {workshop.persona && (
            <div>
              <h3 className="font-medium">Persona</h3>
              <p className="text-sm">{workshop.persona.name}</p>
              <p className="text-xs text-muted-foreground">{workshop.persona.description}</p>
            </div>
          )}
          
          {workshop.scenario && (
            <div>
              <h3 className="font-medium">Scenario</h3>
              <p className="text-sm">{workshop.scenario.name}</p>
              <p className="text-xs text-muted-foreground">{workshop.scenario.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-xl font-medium mb-4">Ideas ({workshopIdeas.length})</h3>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Summary</TabsTrigger>
            <TabsTrigger value="cards">Card Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workshopIdeas.map(idea => (
                <Card key={idea.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{idea.title || "Untitled Idea"}</CardTitle>
                    <CardDescription>{getCardCombinationSummary(idea)}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-sm">
                    <p className="mb-2">{idea.description || "No description provided."}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div>
                        <p className="font-medium">Storyboard</p>
                        <p className="text-muted-foreground">
                          {idea.storyboard?.steps?.length 
                            ? `${idea.storyboard.steps.length} steps`
                            : "Not created"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Evaluation</p>
                        <p className="text-muted-foreground">
                          {(selectedCriteria[idea.id] || []).length
                            ? `${(selectedCriteria[idea.id] || []).length} criteria`
                            : "Not evaluated"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Elevator Pitch</p>
                        <p className="text-muted-foreground">
                          {idea.elevatorPitch ? "Created" : "Not created"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Refinements</p>
                        <p className="text-muted-foreground">
                          {idea.refinements?.length 
                            ? `${idea.refinements.length} refinements`
                            : "None recorded"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="detailed">
            <div className="space-y-6">
              {workshopIdeas.map(idea => (
                <Card key={idea.id}>
                  <CardHeader>
                    <CardTitle>{idea.title || "Untitled Idea"}</CardTitle>
                    <CardDescription>{getCardCombinationSummary(idea)}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm">{idea.description || "No description provided."}</p>
                    </div>
                    
                    {idea.refinements && idea.refinements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1">Refinements</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {idea.refinements.map((refinement, index) => (
                            <li key={index}>{String(refinement)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {idea.storyboard && idea.storyboard.steps && idea.storyboard.steps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1">Storyboard</h4>
                        <ol className="list-decimal pl-5 text-sm">
                          {idea.storyboard.steps.map(step => (
                            <li key={step.id}>{step.description}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    {evaluations.find(e => e.ideaId === idea.id) && (
                      <div>
                        <h4 className="font-medium mb-1">Evaluation Criteria</h4>
                        <div className="text-sm space-y-2">
                          {evaluations.find(e => e.ideaId === idea.id)?.criteria
                            .filter(c => c.response.trim() !== '')
                            .map(c => (
                              <div key={c.criteriaCard.id}>
                                <p className="font-medium">{c.criteriaCard.name}</p>
                                <p className="text-muted-foreground">{c.response}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {idea.elevatorPitch && (
                      <div>
                        <h4 className="font-medium mb-1">Elevator Pitch</h4>
                        <p className="text-sm italic">{idea.elevatorPitch}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle>Card Usage Analysis</CardTitle>
                <CardDescription>
                  Summary of cards used across all ideas in this workshop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <CardCategoryUsage 
                    title="Things" 
                    ideas={workshopIdeas} 
                    cardType="thing" 
                  />
                  <CardCategoryUsage 
                    title="Sensors" 
                    ideas={workshopIdeas} 
                    cardType="sensor" 
                  />
                  <CardCategoryUsage 
                    title="Actions" 
                    ideas={workshopIdeas} 
                    cardType="action" 
                  />
                  <CardCategoryUsage 
                    title="Feedback" 
                    ideas={workshopIdeas} 
                    cardType="feedback" 
                  />
                  <CardCategoryUsage 
                    title="Services" 
                    ideas={workshopIdeas} 
                    cardType="service" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CardCategoryUsage({ 
  title, 
  ideas, 
  cardType 
}: { 
  title: string; 
  ideas: Idea[]; 
  cardType: 'thing' | 'sensor' | 'action' | 'feedback' | 'service' 
}) {
  // Count card usage
  const cardUsage: Record<string, number> = {};
  
  ideas.forEach(idea => {
    const card = idea.cardCombination[cardType];
    if (card) {
      const cardName = card.name;
      cardUsage[cardName] = (cardUsage[cardName] || 0) + 1;
    }
    
    // Check multi-card fields if they exist
    const multiCardField = `${cardType}Cards` as keyof typeof idea.cardCombination;
    const multiCards = idea.cardCombination[multiCardField] as any[] | undefined;
    
    if (multiCards && Array.isArray(multiCards)) {
      multiCards.forEach(card => {
        if (card.name && card.id !== idea.cardCombination[cardType]?.id) {
          cardUsage[card.name] = (cardUsage[card.name] || 0) + 1;
        }
      });
    }
  });
  
  const sortedCards = Object.entries(cardUsage)
    .sort((a, b) => b[1] - a[1]);
  
  return (
    <div>
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      {sortedCards.length > 0 ? (
        <ul className="text-xs space-y-1">
          {sortedCards.map(([name, count]) => (
            <li key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No {title.toLowerCase()} used</p>
      )}
    </div>
  );
}

function getCardCombinationSummary(idea: Idea): string {
  const cardTypes = [
    idea.cardCombination.thing?.name,
    idea.cardCombination.sensor?.name,
    idea.cardCombination.action?.name,
    idea.cardCombination.feedback?.name,
    idea.cardCombination.service?.name
  ].filter(Boolean);
  
  return cardTypes.join(' + ');
} 