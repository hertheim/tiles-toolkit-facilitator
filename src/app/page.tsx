'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkshop } from '@/lib/workshop-context';
import { personaCards, PersonaCard } from '@/data/personas';
import { missionCards, MissionCard } from '@/data/missions';
import { scenarioCards, ScenarioCard } from '@/data/scenarios';
import { format } from 'date-fns';
import { Lightbulb, MessageSquare, PenTool, LineChart } from 'lucide-react';
import NextLink from 'next/link';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { workshops, createWorkshop, deleteWorkshop, setCurrentWorkshop } = useWorkshop();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    name: '',
    date: format(new Date(), 'dd-MM-yyyy'),
    facilitatorName: '',
    description: '',
    missionId: '',
    personaId: '',
    scenarioId: '',
  });
  
  // State for custom cards
  const [customMissionDialogOpen, setCustomMissionDialogOpen] = useState(false);
  const [customMissionName, setCustomMissionName] = useState('');
  const [customMissionGoal, setCustomMissionGoal] = useState('');
  const [customMissionExample, setCustomMissionExample] = useState('');
  
  const [customPersonaDialogOpen, setCustomPersonaDialogOpen] = useState(false);
  const [customPersonaName, setCustomPersonaName] = useState('');
  const [customPersonaDescription, setCustomPersonaDescription] = useState('');
  
  const [customScenarioDialogOpen, setCustomScenarioDialogOpen] = useState(false);
  const [customScenarioName, setCustomScenarioName] = useState('');
  const [customScenarioDescription, setCustomScenarioDescription] = useState('');
  
  // Custom card data
  const [customMission, setCustomMission] = useState<MissionCard | null>(null);
  const [customPersona, setCustomPersona] = useState<PersonaCard | null>(null);
  const [customScenario, setCustomScenario] = useState<ScenarioCard | null>(null);
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Check if this is a custom card selection
    if (name === 'missionId' && value === 'm14') { // Custom Mission
      // Reset previous custom mission data
      setCustomMissionName('');
      setCustomMissionGoal('');
      setCustomMissionExample('');
      setCustomMissionDialogOpen(true);
      return;
    } else if (name === 'personaId' && value === 'p9') { // Custom Persona
      // Reset previous custom persona data
      setCustomPersonaName('');
      setCustomPersonaDescription('');
      setCustomPersonaDialogOpen(true);
      return;
    } else if (name === 'scenarioId' && value === 'sc18') { // Custom Scenario
      // Reset previous custom scenario data
      setCustomScenarioName('');
      setCustomScenarioDescription('');
      setCustomScenarioDialogOpen(true);
      return;
    }
    
    setNewWorkshop({
      ...newWorkshop,
      [name]: value,
    });
  };
  
  const handleCustomMissionConfirm = () => {
    if (!customMissionName.trim()) return;
    
    const newCustomMission: MissionCard = {
      id: `custom-mission-${Date.now()}`,
      type: "Mission",
      name: customMissionName,
      goal: customMissionGoal || "Custom mission goal",
      example: customMissionExample || "Custom mission example"
    };
    
    setCustomMission(newCustomMission);
    setNewWorkshop({
      ...newWorkshop,
      missionId: newCustomMission.id
    });
    setCustomMissionDialogOpen(false);
  };
  
  const handleCustomPersonaConfirm = () => {
    if (!customPersonaName.trim()) return;
    
    const newCustomPersona: PersonaCard = {
      id: `custom-persona-${Date.now()}`,
      type: "Persona",
      name: customPersonaName,
      description: customPersonaDescription || "Custom persona description"
    };
    
    setCustomPersona(newCustomPersona);
    setNewWorkshop({
      ...newWorkshop,
      personaId: newCustomPersona.id
    });
    setCustomPersonaDialogOpen(false);
  };
  
  const handleCustomScenarioConfirm = () => {
    if (!customScenarioName.trim()) return;
    
    const newCustomScenario: ScenarioCard = {
      id: `custom-scenario-${Date.now()}`,
      type: "Scenario",
      name: customScenarioName,
      description: customScenarioDescription || "Custom scenario description"
    };
    
    setCustomScenario(newCustomScenario);
    setNewWorkshop({
      ...newWorkshop,
      scenarioId: newCustomScenario.id
    });
    setCustomScenarioDialogOpen(false);
  };

  const handleCreateWorkshop = () => {
    // Determine which mission to use (standard or custom)
    let mission: MissionCard | undefined;
    if (customMission && newWorkshop.missionId === customMission.id) {
      mission = customMission;
    } else {
      mission = missionCards.find(m => m.id === newWorkshop.missionId);
    }
    
    // Determine which persona to use (standard or custom)
    let persona: PersonaCard | undefined;
    if (customPersona && newWorkshop.personaId === customPersona.id) {
      persona = customPersona;
    } else {
      persona = personaCards.find(p => p.id === newWorkshop.personaId);
    }
    
    // Determine which scenario to use (standard or custom)
    let scenario: ScenarioCard | undefined;
    if (customScenario && newWorkshop.scenarioId === customScenario.id) {
      scenario = customScenario;
    } else {
      scenario = scenarioCards.find(s => s.id === newWorkshop.scenarioId);
    }
    
    const workshop = createWorkshop({
      name: newWorkshop.name,
      date: newWorkshop.date,
      facilitatorName: newWorkshop.facilitatorName,
      description: newWorkshop.description,
      mission,
      persona,
      scenario,
    });
    
    // Reset all form data including custom cards
    setIsDialogOpen(false);
    setNewWorkshop({
      name: '',
      date: format(new Date(), 'dd-MM-yyyy'),
      facilitatorName: '',
      description: '',
      missionId: '',
      personaId: '',
      scenarioId: '',
    });
    
    // Reset custom card data
    setCustomMission(null);
    setCustomPersona(null);
    setCustomScenario(null);
    setCustomMissionName('');
    setCustomMissionGoal('');
    setCustomMissionExample('');
    setCustomPersonaName('');
    setCustomPersonaDescription('');
    setCustomScenarioName('');
    setCustomScenarioDescription('');
    
    // Navigate to the workshop session
    setCurrentWorkshop(workshop);
    router.push(`/workshop/${workshop.id}`);
  };

  // When the create workshop dialog is closed, reset all custom card data
  const handleDialogOpenChange = (isOpen: boolean) => {
    setIsDialogOpen(isOpen);
    
    if (!isOpen) {
      // Reset all custom card data when dialog is closed
      setCustomMission(null);
      setCustomPersona(null);
      setCustomScenario(null);
      setCustomMissionName('');
      setCustomMissionGoal('');
      setCustomMissionExample('');
      setCustomPersonaName('');
      setCustomPersonaDescription('');
      setCustomScenarioName('');
      setCustomScenarioDescription('');
      
      // Also reset form data
      setNewWorkshop({
        name: '',
        date: format(new Date(), 'dd-MM-yyyy'),
        facilitatorName: '',
        description: '',
        missionId: '',
        personaId: '',
        scenarioId: '',
      });
    }
  };

  const handleStartWorkshop = (workshop: typeof workshops[0]) => {
    setCurrentWorkshop(workshop);
    router.push(`/workshop/${workshop.id}`);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Tiles <span className="text-primary">Ideation</span> App
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                AI-facilitated ideation toolkit for creativity, idea refinement, and structured evaluation in collaborative workshops.
              </p>
              <div className="flex flex-wrap gap-4">
                <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="shadow-lg">Create New Workshop</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Workshop</DialogTitle>
                      <DialogDescription>
                        Set up a new ideation workshop by providing the workshop details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">Workshop Name</label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={newWorkshop.name} 
                          onChange={handleInputChange} 
                          placeholder="Enter workshop name" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="date" className="text-sm font-medium">Date</label>
                        <Input 
                          id="date" 
                          name="date" 
                          type="date" 
                          value={newWorkshop.date} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="facilitatorName" className="text-sm font-medium">Facilitator Name</label>
                        <Input 
                          id="facilitatorName" 
                          name="facilitatorName" 
                          value={newWorkshop.facilitatorName} 
                          onChange={handleInputChange} 
                          placeholder="Enter facilitator name" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={newWorkshop.description} 
                          onChange={handleInputChange} 
                          placeholder="Enter workshop description" 
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="missionId" className="text-sm font-medium">Mission</label>
                        <select 
                          id="missionId" 
                          name="missionId" 
                          value={newWorkshop.missionId} 
                          onChange={handleInputChange}
                          className="p-2 border rounded-md"
                        >
                          <option value="">Select a mission</option>
                          {missionCards.map(mission => (
                            <option key={mission.id} value={mission.id}>
                              {mission.name}
                            </option>
                          ))}
                          {customMission && (
                            <option value={customMission.id}>
                              {customMission.name} (Custom)
                            </option>
                          )}
                        </select>
                        {newWorkshop.missionId && !customMission?.id?.includes('custom-mission') && newWorkshop.missionId !== 'm14' && (
                          <div className="p-2 bg-muted rounded-md text-xs mt-1">
                            <p><strong>Goal:</strong> {missionCards.find(m => m.id === newWorkshop.missionId)?.goal}</p>
                          </div>
                        )}
                        {customMission && newWorkshop.missionId === customMission.id && (
                          <div className="p-2 bg-muted rounded-md text-xs mt-1">
                            <p><strong>Goal:</strong> {customMission.goal}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="personaId" className="text-sm font-medium">Persona</label>
                        <select 
                          id="personaId" 
                          name="personaId" 
                          value={newWorkshop.personaId} 
                          onChange={handleInputChange}
                          className="p-2 border rounded-md"
                        >
                          <option value="">Select a persona</option>
                          {personaCards.map(persona => (
                            <option key={persona.id} value={persona.id}>
                              {persona.name}
                            </option>
                          ))}
                          {customPersona && (
                            <option value={customPersona.id}>
                              {customPersona.name} (Custom)
                            </option>
                          )}
                        </select>
                        {newWorkshop.personaId && !customPersona?.id?.includes('custom-persona') && newWorkshop.personaId !== 'p9' && (
                          <div className="p-2 bg-muted rounded-md text-xs mt-1">
                            <p><strong>Description:</strong> {personaCards.find(p => p.id === newWorkshop.personaId)?.description}</p>
                          </div>
                        )}
                        {customPersona && newWorkshop.personaId === customPersona.id && (
                          <div className="p-2 bg-muted rounded-md text-xs mt-1">
                            <p><strong>Description:</strong> {customPersona.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="scenarioId" className="text-sm font-medium">Scenario</label>
                        <select 
                          id="scenarioId" 
                          name="scenarioId" 
                          value={newWorkshop.scenarioId} 
                          onChange={handleInputChange}
                          className="p-2 border rounded-md"
                        >
                          <option value="">Select a scenario</option>
                          {scenarioCards.map(scenario => (
                            <option key={scenario.id} value={scenario.id}>
                              {scenario.name}
                            </option>
                          ))}
                          {customScenario && (
                            <option value={customScenario.id}>
                              {customScenario.name} (Custom)
                            </option>
                          )}
                        </select>
                        {newWorkshop.scenarioId && !customScenario?.id?.includes('custom-scenario') && newWorkshop.scenarioId !== 'sc18' && (
                          <div className="p-2 bg-muted rounded-md text-xs mt-1">
                            <p><strong>Description:</strong> {scenarioCards.find(s => s.id === newWorkshop.scenarioId)?.description}</p>
                          </div>
                        )}
                        {customScenario && newWorkshop.scenarioId === customScenario.id && (
                          <div className="p-2 bg-muted rounded-md text-xs mt-1">
                            <p><strong>Description:</strong> {customScenario.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateWorkshop} disabled={!newWorkshop.name || !newWorkshop.facilitatorName}>
                        Create Workshop
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Custom Mission Dialog */}
                <Dialog open={customMissionDialogOpen} onOpenChange={setCustomMissionDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Custom Mission</DialogTitle>
                      <DialogDescription>
                        Define your own mission for the workshop.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mission-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="mission-name"
                          value={customMissionName}
                          onChange={(e) => setCustomMissionName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., Sustainable Innovation"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mission-goal" className="text-right">
                          Goal
                        </Label>
                        <Textarea
                          id="mission-goal"
                          value={customMissionGoal}
                          onChange={(e) => setCustomMissionGoal(e.target.value)}
                          className="col-span-3"
                          placeholder="Describe the goal of this mission"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mission-example" className="text-right">
                          Example
                        </Label>
                        <Textarea
                          id="mission-example"
                          value={customMissionExample}
                          onChange={(e) => setCustomMissionExample(e.target.value)}
                          className="col-span-3"
                          placeholder="Provide an example for this mission"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCustomMissionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCustomMissionConfirm} disabled={!customMissionName.trim()}>
                        Save Mission
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Custom Persona Dialog */}
                <Dialog open={customPersonaDialogOpen} onOpenChange={setCustomPersonaDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Custom Persona</DialogTitle>
                      <DialogDescription>
                        Define your own persona for the workshop.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="persona-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="persona-name"
                          value={customPersonaName}
                          onChange={(e) => setCustomPersonaName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., Remote Worker"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="persona-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="persona-description"
                          value={customPersonaDescription}
                          onChange={(e) => setCustomPersonaDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Describe this persona and their characteristics"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCustomPersonaDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCustomPersonaConfirm} disabled={!customPersonaName.trim()}>
                        Save Persona
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Custom Scenario Dialog */}
                <Dialog open={customScenarioDialogOpen} onOpenChange={setCustomScenarioDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Custom Scenario</DialogTitle>
                      <DialogDescription>
                        Define your own scenario for the workshop.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scenario-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="scenario-name"
                          value={customScenarioName}
                          onChange={(e) => setCustomScenarioName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., Remote Collaboration"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scenario-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="scenario-description"
                          value={customScenarioDescription}
                          onChange={(e) => setCustomScenarioDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Describe this scenario and its challenges"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCustomScenarioDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCustomScenarioConfirm} disabled={!customScenarioName.trim()}>
                        Save Scenario
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <a href="https://www.tilestoolkit.io/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    Tiles homepage
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 rounded-full bg-primary/20 animate-pulse" />
              </div>
              <div className="relative z-10 p-6 bg-card rounded-xl shadow-xl border">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { color: "bg-blue-100", text: "Things" },
                    { color: "bg-green-100", text: "Actions" },
                    { color: "bg-yellow-100", text: "Sensors" },
                    { color: "bg-purple-100", text: "Services" }
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className={`${item.color} p-4 rounded-lg shadow-sm flex items-center justify-center h-24`}
                    >
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-center">AI-Powered Ideation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <div className="container mx-auto py-16 px-4 max-w-7xl">
        <div className="space-y-16">
          {workshops.length > 0 && (
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Your Workshops</h2>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                  New Workshop
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workshops.map((workshop) => (
                  <Card key={workshop.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{workshop.name}</CardTitle>
                      <CardDescription>{format(new Date(workshop.date), 'MMMM dd, yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{workshop.description}</p>
                      <div className="text-sm space-y-1">
                        <p><strong>Facilitator:</strong> {workshop.facilitatorName}</p>
                        {workshop.mission && <p><strong>Mission:</strong> {workshop.mission.name}</p>}
                        {workshop.persona && <p><strong>Persona:</strong> {workshop.persona.name}</p>}
                        {workshop.scenario && <p><strong>Scenario:</strong> {workshop.scenario.name}</p>}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => deleteWorkshop(workshop.id)}>
                        Delete
                      </Button>
                      <NextLink href={`/workshop/${workshop.id}/summary`}>
                        <Button variant="outline">View Summary</Button>
                      </NextLink>
                      <Button onClick={() => handleStartWorkshop(workshop)}>
                        Start
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* How It Works Section */}
          <section className="space-y-10">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground">
                Our structured approach guides you through four key phases of the ideation process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Lightbulb className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Idea Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate ideas by selecting card combinations from Things, Sensors, Human Actions, Feedback, and Services.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Select cards from multiple categories
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Combine into unique ideas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Dashboard view of all ideas
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Idea Refinement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Chat with our AI to refine and expand your ideas through guided questions and suggestions.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Interactive AI chat interface
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Use commands for different feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Get alternative card suggestions
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <PenTool className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Storyboard Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize your idea through an 8-step storyboard that outlines the user journey.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      AI-generated storyboard suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Drag-and-drop reordering
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Customize step descriptions
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-purple-500 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <LineChart className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                    Evaluation & Pitch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Evaluate your idea against key criteria and create a compelling elevator pitch.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Select evaluation criteria
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Structured evaluation responses
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      AI-generated elevator pitch
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Tiles Ideation App. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
