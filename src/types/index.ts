import { ThingCard } from "@/data/things";
import { SensorCard } from "@/data/sensors";
import { PersonaCard } from "@/data/personas";
import { ScenarioCard } from "@/data/scenarios";
import { MissionCard } from "@/data/missions";
import { CriteriaCard } from "@/data/criteria";
import { FeedbackCard } from "@/data/feedback";
import { ActionCard } from "@/data/actions";
import { ServiceCard } from "@/data/services";

export type CardType = 
  | ThingCard 
  | SensorCard 
  | ActionCard 
  | FeedbackCard 
  | ServiceCard;

export interface Workshop {
  id: string;
  name: string;
  date: string;
  facilitatorName: string;
  description: string;
  mission?: MissionCard;
  persona?: PersonaCard;
  scenario?: ScenarioCard;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'user' | 'ai' | 'system';
export type MessageAction = 'reflect' | 'creative' | 'provoke' | 'info' | 'suggestion';

export interface CardSuggestion {
  category: string;
  cards: (ThingCard | SensorCard | ActionCard)[];
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  action?: MessageAction;
  suggestions?: string[];
  cardSuggestions?: CardSuggestion[];
}

export interface Idea {
  id: string;
  workshopId: string;
  title: string;
  description: string;
  cardCombination: {
    thing?: ThingCard;
    sensor?: SensorCard;
    action?: ActionCard;
    feedback?: FeedbackCard;
    service?: ServiceCard;
    thingCards?: ThingCard[];
    sensorCards?: SensorCard[];
    actionCards?: ActionCard[];
    feedbackCards?: FeedbackCard[];
    serviceCards?: ServiceCard[];
  };
  refinements: Refinement[];
  chatHistory?: ChatMessage[];
  storyboard?: Storyboard;
  evaluation?: Evaluation;
  elevatorPitch?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refinement {
  id: string;
  ideaId: string;
  type: 'provoke' | 'reflect' | 'creative';
  question: string;
  response: string;
  createdAt: Date;
}

export interface StoryboardStep {
  id: string;
  order: number;
  description: string;
}

export interface Storyboard {
  id: string;
  ideaId: string;
  steps: StoryboardStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationCriteria {
  criteriaCard: CriteriaCard;
  response: string;
}

export interface Evaluation {
  id: string;
  ideaId: string;
  criteria: EvaluationCriteria[];
  createdAt: Date;
  updatedAt: Date;
}

export type WorkshopPhase = 
  | 'ideation'   // Phase 1: Idea Generation & Overview
  | 'refinement' // Phase 2: Idea Refinement & Reflection
  | 'storyboard' // Phase 3: Storyboard Development
  | 'evaluation' // Phase 4: Evaluation & Criteria
  | 'elevator';  // Phase 5: Elevator Pitch

export interface ThingCardRef {
  id: string;
  name: string;
  description: string;
}

export interface SensorCardRef {
  id: string;
  name: string;
  description: string;
}

export interface ActionCardRef {
  id: string;
  name: string;
  description: string;
}

export interface FeedbackCardRef {
  id: string;
  name: string;
  description: string;
}

export interface ServiceCardRef {
  id: string;
  name: string;
  description: string;
}

export interface CardCombination {
  thing?: ThingCardRef;
  sensor?: SensorCardRef;
  action?: ActionCardRef;
  feedback?: FeedbackCardRef;
  service?: ServiceCardRef;
}

export type RefinementType = 'reflect' | 'creative' | 'provoke';

export interface Refinement {
  id: string;
  ideaId: string;
  type: RefinementType;
  question: string;
  response: string;
  createdAt: Date;
}

export interface StepData {
  id: string;
  position: number;
  content: string;
} 