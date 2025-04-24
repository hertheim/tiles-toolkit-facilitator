import { Idea, Workshop } from '@/types';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'mistral:instruct';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaError {
  error: string;
}

// Helper function to create a list of selected cards for the prompt
const getSelectedCardsList = (idea: Idea): string => {
  const cardComponents = [];
  
  // Check single card fields (for backward compatibility)
  if (idea.cardCombination.thing) 
    cardComponents.push(`Thing: ${idea.cardCombination.thing.name}`);
  if (idea.cardCombination.sensor)
    cardComponents.push(`Sensor: ${idea.cardCombination.sensor.name}`);
  if (idea.cardCombination.action)
    cardComponents.push(`Action: ${idea.cardCombination.action.name}`);
  if (idea.cardCombination.feedback)
    cardComponents.push(`Feedback: ${idea.cardCombination.feedback.name}`);
  if (idea.cardCombination.service)
    cardComponents.push(`Service: ${idea.cardCombination.service.name}`);
  
  // Check multi-card fields (new feature)
  if (idea.cardCombination.thingCards && idea.cardCombination.thingCards.length > 0) {
    // Avoid duplicating the first one that's already in 'thing'
    const firstThingId = idea.cardCombination.thing?.id;
    const additionalThings = idea.cardCombination.thingCards
      .filter(card => card.id !== firstThingId)
      .map(card => `Thing: ${card.name}`);
    
    cardComponents.push(...additionalThings);
  }
  
  if (idea.cardCombination.sensorCards && idea.cardCombination.sensorCards.length > 0) {
    const firstSensorId = idea.cardCombination.sensor?.id;
    const additionalSensors = idea.cardCombination.sensorCards
      .filter(card => card.id !== firstSensorId)
      .map(card => `Sensor: ${card.name}`);
    
    cardComponents.push(...additionalSensors);
  }
  
  if (idea.cardCombination.actionCards && idea.cardCombination.actionCards.length > 0) {
    const firstActionId = idea.cardCombination.action?.id;
    const additionalActions = idea.cardCombination.actionCards
      .filter(card => card.id !== firstActionId)
      .map(card => `Action: ${card.name}`);
    
    cardComponents.push(...additionalActions);
  }
  
  if (idea.cardCombination.feedbackCards && idea.cardCombination.feedbackCards.length > 0) {
    const firstFeedbackId = idea.cardCombination.feedback?.id;
    const additionalFeedback = idea.cardCombination.feedbackCards
      .filter(card => card.id !== firstFeedbackId)
      .map(card => `Feedback: ${card.name}`);
    
    cardComponents.push(...additionalFeedback);
  }
  
  if (idea.cardCombination.serviceCards && idea.cardCombination.serviceCards.length > 0) {
    const firstServiceId = idea.cardCombination.service?.id;
    const additionalServices = idea.cardCombination.serviceCards
      .filter(card => card.id !== firstServiceId)
      .map(card => `Service: ${card.name}`);
    
    cardComponents.push(...additionalServices);
  }
    
  if (cardComponents.length === 0) {
    return "No specific cards have been selected for this idea yet.";
  }
  
  return cardComponents.join('\n    - ');
};

// Create a separate helper to handle card combination directly
const getSelectedCardsListFromCombination = (cardCombination: Idea['cardCombination']): string => {
  // Create a temporary idea object with just the necessary fields
  const tempIdea: Idea = {
    id: '',
    workshopId: '',
    title: '',
    description: '',
    cardCombination,
    refinements: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return getSelectedCardsList(tempIdea);
};

/**
 * Generate a welcome message for a new idea using the workshop context
 */
export const generateWelcomeMessage = async (
  idea: Idea,
  workshop: Workshop
): Promise<string> => {
  const selectedCards = getSelectedCardsList(idea);
  
  const prompt = `You are an AI assistant helping with a design thinking workshop. The workshop details are:

Workshop Name: "${workshop.name}"
Workshop Description: "${workshop.description}"
Mission: "${workshop.mission?.name} - ${workshop.mission?.goal}"
Persona: "${workshop.persona?.name} - ${workshop.persona?.description}"
Scenario: "${workshop.scenario?.name} - ${workshop.scenario?.description}"

The participants have created a new idea with the following components:
    - ${selectedCards}

Idea Title: "${idea.title}"
Idea Description: "${idea.description}"

Generate a concise welcome message (under 75 words) using proper markdown formatting:
1. Start with a clear greeting using **bold** markdown syntax for emphasis
2. Add a brief sentence about their idea's core components 
3. Mention the workshop mission
4. List the buttons they can use (Reflect, Card Suggestions, Provoke, Help) as a markdown bulleted list using "- " for bullets
5. Use blank lines between paragraphs for proper spacing

Be direct, friendly, and ensure the markdown is correctly formatted.`;

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as OllamaError;
      throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json() as OllamaResponse;
    return data.response;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    // Fallback message if AI fails
    return `**Welcome to refinement for "${idea.title}"!**

Use the buttons below:

- **Reflect** - for reflection on your idea
- **Card Suggestions** - for alternative ideas
- **Provoke** - for challenges
- **Help** - for more info`;
  }
};

/**
 * Generate AI feedback using Ollama with the mistral:instruct model
 */
export const generateAIFeedback = async (
  command: string, 
  idea: Idea,
  workshop?: Workshop
): Promise<string> => {
  // Get selected cards list
  const selectedCards = getSelectedCardsList(idea);
  
  // Add workshop context if available
  const workshopContext = workshop ? `
Workshop Name: "${workshop.name}"
Workshop Description: "${workshop.description}"
Mission: "${workshop.mission?.name} - ${workshop.mission?.goal}"
Persona: "${workshop.persona?.name} - ${workshop.persona?.description}"
Scenario: "${workshop.scenario?.name} - ${workshop.scenario?.description}"
` : '';
  
  // Craft an appropriate prompt based on the command
  let prompt = '';
  const lowerCommand = command.toLowerCase();
  
  // Check if this is a card update notification
  if (lowerCommand.includes('card combination has been updated')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants are working on an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    The idea's card combination has just been updated: "${command}"
    
    Acknowledge these changes in 1-2 sentences (maximum 50 words). Be specific about one key implication of these changes.
    
    Format your response with proper markdown: use blank lines between paragraphs and **bold** for emphasis.`;
  }
  else if (lowerCommand.startsWith('/reflect')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Provide 2 brief reflective statements to help them think more deeply about their idea. Focus on feasibility and user benefits.
    
    Format your response using markdown:
    1. Add a header "#### Reflective Statements"
    2. One statement per bullet point, stating with bold text
    3. Use markdown bullet points (using "- " syntax)
    4. Keep each statement under 15 words
    5. Bold any key words using **word** syntax
    6. Include a blank line before the bullet list`;
  } 
  else if (lowerCommand.startsWith('/creative')) {
    prompt = `Based on the idea "${idea.title}" with description "${idea.description}", 
    suggest specific alternative cards that would enhance or create interesting variations of this idea.
    
    Current cards:
    ${getSelectedCardsListFromCombination(idea.cardCombination)}
    
    Mission: "${workshop?.mission?.goal || ''}"
    Persona: "${workshop?.persona?.name || ''}"
    
    I need you to recommend EXACTLY 2 different card combinations for alternative ideas. For each combination:
    1. Give it a brief, descriptive name
    2. Suggest specific card names from the TILES deck that would work well together
    3. Only mark cards as (CUSTOM) if they don't exist in the TILES deck
    
    YOU MUST FOLLOW THIS EXACT FORMAT - DO NOT DEVIATE:
    
    ### Alternative 1: [Brief Name]
    
    **Thing**: Card Name
    **Sensor**: Card Name
    **Action**: Card Name
    **Feedback**: Card Name
    **Service**: Card Name
    
    ### Alternative 2: [Brief Name]
    
    **Thing**: Card Name
    **Sensor**: Card Name
    **Action**: Card Name
    **Feedback**: Card Name
    **Service**: Card Name
    
    Important: Please suggest specific, actual card names from the TILES deck (like "Clothing", "Motion", "Vibration", "Text", "Data Collection"). Only mark a card as (CUSTOM) if you're suggesting something not in the standard deck. Don't explain how the cards work together - just list them by name.
    
    Some examples of cards in each category:
    - Things: Clothing, Luggage, Watch, Bike, Coffee Cup, Eyewear, Plant, Umbrella, Furniture
    - Sensors: Location, Temperature, Motion, Distance, Sound, Weight, Air Pollution
    - Actions: Vibration, Light, Sound, Notification, Movement
    - Feedback: Text, Voice, Light, Color, Sound, Haptic
    - Services: Data Collection, Sharing, Personalization, Community`;
  } 
  else if (lowerCommand.startsWith('/provoke')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    State 2 provocative challenges about their idea:
    1. Add a header "#### Provocative Challenges"
    2. Focus on a technical limitation and an unintended consequence
    3. Format as a numbered markdown list with a blank line before the list
    4. Use bold (**word**) for emphasis on key words
    5. Keep each statement under 15 words
    
    Be direct and challenging. Ensure your markdown formatting is correct.`;
  }
  else {
    // General response to user message
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    The user has sent this message: "${command}"
    
    Respond concisely in 1-3 sentences (maximum 50 words). Format your response with proper markdown:
    1. Use blank lines between paragraphs
    2. Bold emphasis (**word**) for important points
    3. Use markdown bullet points (- ) if making a list
    4. Provide direct and specific advice related to their idea`;
  }
  
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as OllamaError;
      throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json() as OllamaResponse;
    
    // Process the card suggestions to ensure consistent formatting if this is a creative response
    if (lowerCommand.startsWith('/creative')) {
      return formatCardSuggestionResponse(data.response);
    }
    
    return data.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error('Failed to generate AI response. Please ensure Ollama is running with mistral:instruct.');
  }
};

/**
 * Format card suggestion responses to ensure consistent formatting
 */
const formatCardSuggestionResponse = (response: string): string => {
  // First check if the response already follows the correct format
  const alternativePattern = /###\s+Alternative\s+\d+/gi;
  
  if (!alternativePattern.test(response)) {
    // If response doesn't follow the format, try to extract and reformat it
    const alternatives: {name: string, cards: {[key: string]: string}}[] = [];
    
    // Look for patterns like "Alternative X: Name" or similar
    const altNamePattern = /(?:alternative|alt)(?:\s+)?(\d+)(?:[:\s-]+)([^\n]+)/gi;
    let altMatches;
    
    // Extract alternatives and their names
    while ((altMatches = altNamePattern.exec(response)) !== null) {
      // We don't need the alt number since we're ordering them sequentially
      const altName = altMatches[2].trim();
      
      // Create a new alternative
      alternatives.push({
        name: altName,
        cards: {}
      });
    }
    
    // If we couldn't find alternatives, try to create them manually
    if (alternatives.length === 0) {
      // Default to creating two alternatives with generic names
      alternatives.push({name: "Variation 1", cards: {}});
      alternatives.push({name: "Variation 2", cards: {}});
    }
    
    // Now extract card types and their values
    const cardTypes = ["thing", "sensor", "action", "feedback", "service"];
    
    // For each card type, look for matches in the response
    cardTypes.forEach(type => {
      const typePattern = new RegExp(`(?:${type}|\\*\\*${type}\\*\\*)[:\\s]+([^\\n]+)`, "gi");
      const matches = [...response.matchAll(typePattern)];
      
      // Assign each match to an alternative
      matches.forEach((match, index) => {
        if (index < alternatives.length) {
          alternatives[index].cards[type.toLowerCase()] = match[1].trim();
        }
      });
    });
    
    // Rebuild the response in the correct format
    let formattedResponse = "## Card Suggestions\n\n";
    
    alternatives.forEach((alt, index) => {
      formattedResponse += `### Alternative ${index + 1}: ${alt.name}\n\n`;
      
      // Add all card types
      cardTypes.forEach(type => {
        formattedResponse += `**${type.charAt(0).toUpperCase() + type.slice(1)}**: ${alt.cards[type.toLowerCase()] || "Not specified"}\n`;
      });
      
      // Add a blank line between alternatives
      if (index < alternatives.length - 1) {
        formattedResponse += "\n";
      }
    });
    
    return formattedResponse;
  }
  
  // If it already has the correct format, return as is
  return response;
};

/**
 * Generate storyboard steps using Ollama with the mistral:instruct model
 */
export const generateStoryboard = async (idea: Idea, workshop: Workshop | null | undefined): Promise<string[]> => {
  const selectedCards = getSelectedCardsList(idea);
  
  // Add workshop context if available
  const workshopContext = workshop ? `
Workshop Name: "${workshop.name}"
Workshop Description: "${workshop.description}"
Mission: "${workshop.mission?.name} - ${workshop.mission?.goal}"
Persona: "${workshop.persona?.name} - ${workshop.persona?.description}"
Scenario: "${workshop.scenario?.name} - ${workshop.scenario?.description}"
` : '';
  
  const prompt = `You are an AI assistant helping with a design thinking workshop.${workshopContext}

The participants have created an idea with these elements:
  - ${selectedCards}
  
  The idea title is: "${idea.title}"
  Description: "${idea.description}"
  
  Create a simple 8-step storyboard. Each step must be a single sentence only (under 15 words).
  
  Steps should cover:
  1. Initial context/need
  2. First interaction
  3. Sensing functionality
  4. User/system action
  5. Feedback mechanism
  6. Service component
  7. Resolution
  8. Benefit
  
  Output 8 steps, one per line, no numbering. Be extremely direct and concise.`;
  
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as OllamaError;
      throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json() as OllamaResponse;
    
    // Process the response into an array of steps
    const steps = data.response
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.trim().replace(/^\d+\.\s*/, '')) // Remove any numbering
      .slice(0, 8); // Ensure we only have 8 steps
    
    // If we got fewer than 8 steps, add generic placeholders
    while (steps.length < 8) {
      steps.push(`Step ${steps.length + 1}: Continue the journey.`);
    }
    
    return steps;
  } catch (error) {
    console.error('Error generating storyboard:', error);
    
    // Return default steps if AI fails
    return [
      `${workshop?.persona?.name || 'User'} encounters a problem.`,
      `They discover ${idea.title}.`,
      `${idea.cardCombination.thing?.name || 'Device'} activates.`,
      `${idea.cardCombination.sensor?.name || 'Sensors'} detect information.`,
      `User performs ${idea.cardCombination.action?.name || 'action'}.`,
      `${idea.cardCombination.feedback?.name || 'Feedback'} is provided.`,
      `${idea.cardCombination.service?.name || 'System'} processes information.`,
      `Problem is solved successfully.`
    ];
  }
};

/**
 * Generate an elevator pitch using Ollama with the mistral:instruct model
 */
export const generateElevatorPitch = async (
  idea: Idea, 
  workshop: Workshop | null | undefined,
  storyboardSteps: { description: string }[],
  evaluationCriteria: { criteriaCard: { name: string }, response: string }[]
): Promise<string> => {
  const selectedCards = getSelectedCardsList(idea);
  
  // Add workshop context if available
  const workshopContext = workshop ? `
Workshop Name: ${workshop.name},
Workshop Description: ${workshop.description},
Mission: ${workshop.mission?.name} - ${workshop.mission?.goal},
Persona: ${workshop.persona?.name} - ${workshop.persona?.description},
Scenario: ${workshop.scenario?.name} - ${workshop.scenario?.description},
` : '';

  // Format storyboard steps if available
  const storyboardNarrative = storyboardSteps.length > 0 
    ? `\nStoryboard steps:\n${storyboardSteps.map((step, index) => 
        `${index + 1}. ${step.description}`).join('\n')}`
    : '';

  // Format evaluation criteria if available
  const criteriaResponses = evaluationCriteria.length > 0
    ? `\nEvaluation criteria responses:\n${evaluationCriteria
        .filter(c => c.response.trim() !== '')
        .map(c => `- ${c.criteriaCard.name}: ${c.response}`).join('\n')}`
    : '';
  
  const prompt = `You are an AI assistant helping with a design thinking workshop.${workshopContext}

The participants have created an idea with these elements:
- ${selectedCards}

The idea title is: "${idea.title}"
Description: "${idea.description}"
${idea.refinements && idea.refinements.length > 0 ? `Refinements: ${idea.refinements.join(', ')}` : ''}${storyboardNarrative}${criteriaResponses}

Create a concise elevator pitch (75-100 words maximum) that:

1. States the problem and solution in 1 sentence
2. Mentions the core technology components
3. States the primary benefit for users
4. Is structured as 2 short paragraphs maximum

Be extremely concise, direct, and impactful. Avoid filler words completely.`;
  
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as OllamaError;
      throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json() as OllamaResponse;
    return data.response;
  } catch (error) {
    console.error('Error generating elevator pitch:', error);
    
    // Fallback elevator pitch if AI fails
    return `${idea.title} gives ${workshop?.persona?.name || 'users'} a solution using ${idea.cardCombination.thing?.name || 'technology'} and ${idea.cardCombination.sensor?.name || 'sensors'}.

It solves ${workshop?.mission?.goal || 'key problems'} quickly and effectively.`;
  }
}; 