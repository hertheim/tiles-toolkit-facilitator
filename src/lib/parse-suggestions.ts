import { thingCards } from "@/data/things";
import { sensorCards } from "@/data/sensors";
import { actionCards } from "@/data/actions";
import { ThingCard } from "@/data/things";
import { SensorCard } from "@/data/sensors";
import { ActionCard } from "@/data/actions";

export interface CardSuggestion {
  category: string;
  cards: (ThingCard | SensorCard | ActionCard)[];
}

/**
 * Parse the AI response from the /creative command to extract card suggestions
 */
export function parseCardSuggestions(response: string): CardSuggestion[] {
  const suggestions: CardSuggestion[] = [];
  
  // Look for thing suggestions
  const thingSuggestions: ThingCard[] = [];
  for (const card of thingCards) {
    // If the card name is mentioned in the response, add it to suggestions
    if (response.toLowerCase().includes(card.name.toLowerCase())) {
      thingSuggestions.push(card);
      // Limit to 2 suggestions per category
      if (thingSuggestions.length >= 2) break;
    }
  }
  
  if (thingSuggestions.length > 0) {
    suggestions.push({
      category: 'thing',
      cards: thingSuggestions
    });
  }
  
  // Look for sensor suggestions
  const sensorSuggestions: SensorCard[] = [];
  for (const card of sensorCards) {
    if (response.toLowerCase().includes(card.name.toLowerCase())) {
      sensorSuggestions.push(card);
      if (sensorSuggestions.length >= 2) break;
    }
  }
  
  if (sensorSuggestions.length > 0) {
    suggestions.push({
      category: 'sensor',
      cards: sensorSuggestions
    });
  }
  
  // Look for action suggestions
  const actionSuggestions: ActionCard[] = [];
  for (const card of actionCards) {
    if (response.toLowerCase().includes(card.name.toLowerCase())) {
      actionSuggestions.push(card);
      if (actionSuggestions.length >= 2) break;
    }
  }
  
  if (actionSuggestions.length > 0) {
    suggestions.push({
      category: 'action',
      cards: actionSuggestions
    });
  }
  
  // If we couldn't find proper matches, use a fallback approach
  // and select random cards as suggestions
  if (suggestions.length === 0) {
    // Get random things
    const randomThings = [...thingCards]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
      
    suggestions.push({
      category: 'thing',
      cards: randomThings
    });
    
    // Get random sensors
    const randomSensors = [...sensorCards]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
      
    suggestions.push({
      category: 'sensor',
      cards: randomSensors
    });
  }
  
  return suggestions;
} 