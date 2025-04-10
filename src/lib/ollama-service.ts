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

Please generate a welcoming first message that:
1. Acknowledges their idea and its components
2. References the workshop context (mission, persona, scenario) 
3. Briefly explains how you can help them refine this idea
4. Mentions the available commands (/reflect, /creative, /provoke, /help)
5. If they have only selected a few cards, encourage them to consider adding more cards as they refine the idea

Keep your response conversational, encouraging, and under 200 words.`;

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
    return `Welcome to the Idea Refinement chat! I'll help you refine your idea "${idea.title}" through interactive feedback.

Try these commands:
- Type **/reflect** for reflective questions
- Type **/creative** for alternative approaches
- Type **/provoke** to challenge assumptions
- Type **/help** for more information`;
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
    
    The idea's card combination has just been updated. The message tells you: "${command}"
    
    Please acknowledge these changes with enthusiasm and specifically mention how these modifications could impact the idea. Be specific about how the new card combination might create new opportunities or address challenges differently. Suggest 1-2 quick thoughts about the implications of these changes, and remind the user they can use commands like /reflect or /creative to explore the updated idea further.
    
    Keep your response encouraging and under 150 words.`;
  }
  else if (lowerCommand.startsWith('/reflect')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Please provide 5-6 reflective questions that will help them think more deeply about their idea. Focus on feasibility, user benefits, implementation challenges, and potential improvements. Make your questions specific to their idea components and relevant to the workshop context.
    
    If they have only selected a few cards (or none), also provide 1-2 questions encouraging them to consider adding additional components to their idea.`;
  } 
  else if (lowerCommand.startsWith('/creative')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Please suggest alternative approaches to their idea that align with the workshop context. If they've already selected cards for specific categories, suggest alternatives for those categories. For any categories they haven't selected yet, recommend some initial options.
    
    Specifically:
    1. Suggest 2 alternative or additional "things" they could use
    2. Suggest 2 alternative or additional "sensors" they could incorporate
    3. Suggest 1-2 ways to combine these alternatives to expand or enhance their original idea
    
    Be specific and creative in your suggestions, explaining how they could enhance the core concept while staying true to the workshop mission and persona needs.`;
  } 
  else if (lowerCommand.startsWith('/provoke')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Please challenge their thinking by raising 5-6 provocative questions about:
    - Potential privacy or ethical concerns
    - Technical limitations or failures
    - Unintended consequences
    - User confusion or misuse
    - Edge cases or accessibility issues
    - Alignment with the workshop mission and persona needs
    
    Make your questions specific to their idea components and help them identify blind spots.
    
    If they are missing components in their idea, also include 1-2 provocative questions about why those components might be essential.`;
  }
  else if (lowerCommand.startsWith('/help')) {
    // For help command, we don't need to call the API
    return `**Available Commands:**

- **/reflect** - Get reflective questions to improve feasibility and value
- **/creative** - Receive suggestions for alternative cards and approach variations
- **/provoke** - Identify potential weaknesses and edge cases
- **/help** - Display this help message

You can also just chat normally without using commands.

**Card Selection Tips:**
- You can select any number of cards from each category
- Ideas can be started with just a few cards and expanded later
- Try different combinations to explore various possibilities`;
  }
  else {
    // General response to user message
    prompt = `You are an AI assistant helping with a design thinking workshop. ${workshopContext}The participants have created an idea with these elements:
    - ${selectedCards}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    The user has sent this message: "${command}"
    
    Please respond to their message, keeping your response focused on their idea and the context of their workshop. Be helpful, encouraging, and constructive. If appropriate, remind them they can use commands like /reflect, /creative, or /provoke for specific types of feedback.
    
    If they have only selected a few cards (or none), consider suggesting that they might want to explore adding more components to their idea to make it more comprehensive.`;
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
    return data.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error('Failed to generate AI response. Please ensure Ollama is running and the mistral:instruct model is installed.');
  }
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
  
  Please create a coherent 8-step storyboard that outlines the user journey for this idea. Each step should be a concise single sentence describing what happens at that point in the user experience.
  
  The storyboard should follow this logical flow (but do NOT include these numbers in your response):
  1. Introduction to the user/context
  2. Initial interaction with the product/service
  3. How the sensor/detection works (if applicable)
  4. The action taken by the user or system (if applicable)
  5. How the feedback is provided (if applicable)
  6. How the service component works (if applicable)
  7. Resolution or outcome
  8. Benefits realized by the user
  
  Make sure the storyboard aligns with:
  - The workshop mission and goals
  - The persona's needs and characteristics
  - The specific scenario context
  
  Adapt this flow based on the actual components selected for the idea. Focus on creating a coherent narrative using the available components.
  
  Format your response as 8 separate steps, one per line, with no numbering or bullet points.`;
  
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
      steps.push(`Step ${steps.length + 1}: Continue the user journey.`);
    }
    
    return steps;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error('Failed to generate storyboard. Please ensure Ollama is running and the mistral:instruct model is installed.');
  }
};

/**
 * Generate an elevator pitch using Ollama with the mistral:instruct model
 */
export const generateElevatorPitch = async (
  idea: Idea, 
  workshop: Workshop | null | undefined,
  storyboardSteps: any[],
  evaluationCriteria: any[]
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

Based on all the information above, create a compelling elevator pitch for this idea. The elevator pitch should:

1. Clearly articulate the idea in a concise, compelling way
2. Capture the essence of what the idea solves and why it matters
3. Reference the specific cards, workshop context, and any available storyboard or evaluation insights
4. Be structured in 3-5 short paragraphs with clear value proposition
5. Be approximately 150-200 words in length
6. Use professional but engaging language

The pitch should read as a polished, cohesive summary that could be presented to stakeholders or potential investors in about 30-60 seconds.`;
  
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
    return `${idea.title} is an innovative solution designed to address the needs of ${workshop?.persona?.name || 'users'} in ${workshop?.scenario?.name || 'various'} scenarios.

By leveraging ${idea.cardCombination.thing?.name || 'technological'} components with ${idea.cardCombination.sensor?.name || 'sensing'} capabilities, our solution offers a unique approach to ${workshop?.mission?.goal || 'solving problems'}.

This solution provides significant benefits through intuitive interactions and meaningful feedback, ultimately delivering tangible value to users and stakeholders alike.`;
  }
}; 