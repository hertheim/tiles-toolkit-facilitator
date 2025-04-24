import { thingCards } from "@/data/things";
import { sensorCards } from "@/data/sensors";
import { actionCards } from "@/data/actions";
import { feedbackCards } from "@/data/feedback";
import { serviceCards } from "@/data/services";
import { ThingCard } from "@/data/things";
import { SensorCard } from "@/data/sensors";
import { ActionCard } from "@/data/actions";
import { FeedbackCard } from "@/data/feedback";
import { ServiceCard } from "@/data/services";

export interface CardSuggestion {
  category: string;
  cards: (ThingCard | SensorCard | ActionCard | FeedbackCard | ServiceCard)[];
}

/**
 * Parse the AI response from the /creative command to extract card suggestions
 */
export function parseCardSuggestions(response: string): CardSuggestion[] {
  const suggestions: CardSuggestion[] = [];
  
  // All available cards across categories for matching
  const allCards = {
    thing: thingCards,
    sensor: sensorCards,
    action: actionCards,
    feedback: feedbackCards,
    service: serviceCards
  };
  
  // Look for card suggestions in each category
  for (const [category, cards] of Object.entries(allCards)) {
    const categoryMatches: (ThingCard | SensorCard | ActionCard | FeedbackCard | ServiceCard)[] = [];
    
    for (const card of cards) {
      // Look for exact card names or contained within a list
      if (response.toLowerCase().includes(card.name.toLowerCase())) {
        categoryMatches.push(card);
        // Limit to 3 suggestions per category
        if (categoryMatches.length >= 3) break;
      }
    }
    
    if (categoryMatches.length > 0) {
      suggestions.push({
        category,
        cards: categoryMatches
      });
    }
  }
  
  // If we couldn't find proper matches, use a fallback approach
  // and select random cards as suggestions
  if (suggestions.length === 0) {
    // Get random cards from each category
    const categoriesForFallback = ['thing', 'sensor', 'action'];
    
    for (const category of categoriesForFallback) {
      const randomCards = [...allCards[category as keyof typeof allCards]]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
        
      suggestions.push({
        category,
        cards: randomCards
      });
    }
  }
  
  return suggestions;
} 