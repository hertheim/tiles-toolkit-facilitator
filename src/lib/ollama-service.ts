import { Idea } from '@/types';

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

/**
 * Generate AI feedback using Ollama with the mistral:instruct model
 */
export const generateAIFeedback = async (
  command: string, 
  idea: Idea
): Promise<string> => {
  // Construct idea description from card combination
  const thingName = idea.cardCombination.thing?.name || 'product';
  const sensorName = idea.cardCombination.sensor?.name || 'sensor';
  const actionName = idea.cardCombination.action?.name || 'action';
  const feedbackName = idea.cardCombination.feedback?.name || 'feedback';
  const serviceName = idea.cardCombination.service?.name || 'service';
  
  // Craft an appropriate prompt based on the command
  let prompt = '';
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.startsWith('/reflect')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. The participants have created an idea combining these elements:
    - Thing: ${thingName} 
    - Sensor: ${sensorName}
    - Action: ${actionName}
    - Feedback: ${feedbackName}
    - Service: ${serviceName}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Please provide 5-6 reflective questions that will help them think more deeply about their idea. Focus on feasibility, user benefits, implementation challenges, and potential improvements. Make your questions specific to their idea components.`;
  } 
  else if (lowerCommand.startsWith('/creative')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. The participants have created an idea combining these elements:
    - Thing: ${thingName} 
    - Sensor: ${sensorName}
    - Action: ${actionName}
    - Feedback: ${feedbackName}
    - Service: ${serviceName}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Please suggest alternative approaches to their idea. Specifically:
    1. Suggest 2 alternative "things" they could use
    2. Suggest 2 alternative "sensors" they could incorporate
    3. Suggest 1-2 ways to combine these alternatives to expand or enhance their original idea
    
    Be specific and creative in your suggestions, explaining how they could enhance the core concept.`;
  } 
  else if (lowerCommand.startsWith('/provoke')) {
    prompt = `You are an AI assistant helping with a design thinking workshop. The participants have created an idea combining these elements:
    - Thing: ${thingName} 
    - Sensor: ${sensorName}
    - Action: ${actionName}
    - Feedback: ${feedbackName}
    - Service: ${serviceName}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    Please challenge their thinking by raising 5-6 provocative questions about:
    - Potential privacy or ethical concerns
    - Technical limitations or failures
    - Unintended consequences
    - User confusion or misuse
    - Edge cases or accessibility issues
    
    Make your questions specific to their idea components and help them identify blind spots.`;
  }
  else if (lowerCommand.startsWith('/help')) {
    // For help command, we don't need to call the API
    return `**Available Commands:**

- **/reflect** - Get reflective questions to improve feasibility and value
- **/creative** - Receive suggestions for alternative cards and approach variations
- **/provoke** - Identify potential weaknesses and edge cases
- **/help** - Display this help message

You can also just chat normally without using commands.`;
  }
  else {
    // General response to user message
    prompt = `You are an AI assistant helping with a design thinking workshop. The participants have created an idea combining these elements:
    - Thing: ${thingName} 
    - Sensor: ${sensorName}
    - Action: ${actionName}
    - Feedback: ${feedbackName}
    - Service: ${serviceName}
    
    The idea title is: "${idea.title}"
    Description: "${idea.description}"
    
    The user has sent this message: "${command}"
    
    Please respond to their message, keeping your response focused on their idea. Be helpful, encouraging, and constructive. If appropriate, remind them they can use commands like /reflect, /creative, or /provoke for specific types of feedback.`;
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
export const generateStoryboard = async (idea: Idea): Promise<string[]> => {
  const thingName = idea.cardCombination.thing?.name || 'product';
  const sensorName = idea.cardCombination.sensor?.name || 'sensor';
  const actionName = idea.cardCombination.action?.name || 'action';
  const feedbackName = idea.cardCombination.feedback?.name || 'feedback';
  const serviceName = idea.cardCombination.service?.name || 'service';
  
  const prompt = `You are an AI assistant helping with a design thinking workshop. The participants have created an idea combining these elements:
  - Thing: ${thingName} 
  - Sensor: ${sensorName}
  - Action: ${actionName}
  - Feedback: ${feedbackName}
  - Service: ${serviceName}
  
  The idea title is: "${idea.title}"
  Description: "${idea.description}"
  
  Please create a coherent 8-step storyboard that outlines the user journey for this idea. Each step should be a concise single sentence describing what happens at that point in the user experience.
  
  The storyboard should follow a logical flow:
  1. Introduction to the user/context
  2. Initial interaction with the product/service
  3. How the sensor/detection works
  4. The action taken by the user or system
  5. How the feedback is provided
  6. How the service component works 
  7. Resolution or outcome
  8. Benefits realized by the user
  
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
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove any numbering
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