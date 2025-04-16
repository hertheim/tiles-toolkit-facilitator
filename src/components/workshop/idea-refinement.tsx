'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkshop } from '@/lib/workshop-context';
import { Idea, Refinement, ChatMessage, Workshop } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { ThingCard } from "@/data/things";
import { SensorCard } from "@/data/sensors";
import { ActionCard } from "@/data/actions";
import { FeedbackCard } from "@/data/feedback";
import { ServiceCard } from "@/data/services";
import { generateAIFeedback, generateWelcomeMessage } from '@/lib/ollama-service';
import { parseCardSuggestions } from '@/lib/parse-suggestions';

// Generate AI feedback using Ollama with mistral:instruct
const generateAIResponse = async (command: string, idea: Idea, workshop: Workshop | null): Promise<ChatMessage> => {
  // Base message structure
  const message: ChatMessage = {
    id: uuidv4(),
    type: 'ai',
    content: '',
    timestamp: new Date(),
  };
  
  // Process commands
  const lowerCommand = command.toLowerCase();
  
  try {
    const response = await generateAIFeedback(command, idea, workshop || undefined);
    message.content = response;
    
    if (lowerCommand.startsWith('/reflect')) {
      message.action = 'reflect';
    } 
    else if (lowerCommand.startsWith('/creative')) {
      message.action = 'creative';
      // Parse card suggestions from AI response
      message.cardSuggestions = parseCardSuggestions(response);
    } 
    else if (lowerCommand.startsWith('/provoke')) {
      message.action = 'provoke';
    }
    else if (lowerCommand.startsWith('/help')) {
      message.action = 'info';
    }
    else {
      message.action = 'suggestion';
    }
    
    return message;
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Return error message
    return {
      id: uuidv4(),
      type: 'system',
      content: `Error: ${error instanceof Error ? error.message : 'Failed to generate AI response. Please ensure Ollama is running with the mistral:instruct model.'}`,
      timestamp: new Date()
    };
  }
};

export function IdeaRefinement() {
  const { currentIdea, currentWorkshop, updateIdea } = useWorkshop();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingWelcome, setIsGeneratingWelcome] = useState(false);
  const [previousCardCombination, setPreviousCardCombination] = useState<{
    thing?: ThingCard;
    sensor?: SensorCard;
    action?: ActionCard;
    feedback?: FeedbackCard;
    service?: ServiceCard;
  } | null>(null);
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track idea changes to reset previous card combination when switching ideas
  useEffect(() => {
    if (!currentIdea) return;
    
    // If we've switched to a different idea, reset the previous card combination
    if (currentIdeaId !== currentIdea.id) {
      setPreviousCardCombination(null);
      setCurrentIdeaId(currentIdea.id);
    }
  }, [currentIdea, currentIdeaId]);
  
  // Track card changes to detect edits in the ideation phase
  useEffect(() => {
    if (!currentIdea) return;
    
    // Initialize previous card combination on first load or when switching ideas
    if (!previousCardCombination) {
      setPreviousCardCombination(currentIdea.cardCombination);
      return;
    }
    
    // Skip if we're not looking at the same idea as before
    if (currentIdeaId !== currentIdea.id) {
      return;
    }
    
    // Check if the cardsUpdated flag is set, indicating cards were updated from outside
    if (currentIdea.cardsUpdated) {
      // Add a system message about the card change
      const changedCardMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: 'Card combination has been updated. The AI will consider these changes.',
        timestamp: new Date(),
      };
      
      // Send AI a message to acknowledge the changes
      const notifyAI = async () => {
        setIsProcessing(true);
        
        try {
          // Generate AI response acknowledging the changes
          const aiResponse = await generateAIResponse(
            'The idea\'s card combination has been updated. Please provide feedback on the new combination.', 
            currentIdea, 
            currentWorkshop
          );
          
          // Add both messages to the chat
          const updatedMessages = [...messages, changedCardMessage, aiResponse];
          setMessages(updatedMessages);
          
          // Save to idea and clear the cardsUpdated flag
          updateIdea(currentIdea.id, {
            chatHistory: updatedMessages,
            cardsUpdated: false
          });
        } catch (error) {
          console.error('Failed to notify AI about card changes:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      notifyAI();
      
      // Update the previous card combination
      setPreviousCardCombination(currentIdea.cardCombination);
      return;
    }
    
    // Original card combination change detection
    const hasCardCombinationChanged = () => {
      if (!previousCardCombination) return false;
      
      const cardTypes = ['thing', 'sensor', 'action', 'feedback', 'service'] as const;
      
      return cardTypes.some(type => {
        const prevCard = previousCardCombination[type];
        const currentCard = currentIdea.cardCombination[type];
        
        // Check if one exists and the other doesn't
        if ((!prevCard && currentCard) || (prevCard && !currentCard)) return true;
        
        // Check if both exist but have different IDs
        if (prevCard && currentCard && prevCard.id !== currentCard.id) return true;
        
        return false;
      });
    };
    
    if (hasCardCombinationChanged() && currentIdea.chatHistory && currentIdea.chatHistory.length > 0) {
      // Add a system message about the card change
      const changedCardMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: 'Card combination has been updated. The AI will consider these changes.',
        timestamp: new Date(),
      };
      
      // Send AI a message to acknowledge the changes
      const notifyAI = async () => {
        setIsProcessing(true);
        
        // Create difference description
        const getChangeSummary = () => {
          const changes: string[] = [];
          const cardTypes = ['thing', 'sensor', 'action', 'feedback', 'service'] as const;
          
          cardTypes.forEach(type => {
            const prevCard = previousCardCombination[type];
            const currentCard = currentIdea.cardCombination[type];
            
            if (!prevCard && currentCard) {
              changes.push(`Added ${type}: ${currentCard.name}`);
            } else if (prevCard && !currentCard) {
              changes.push(`Removed ${type}: ${prevCard.name}`);
            } else if (prevCard && currentCard && prevCard.id !== currentCard.id) {
              changes.push(`Changed ${type}: from ${prevCard.name} to ${currentCard.name}`);
            }
          });
          
          return changes.join(', ');
        };
        
        try {
          // Generate AI response acknowledging the changes
          const aiResponse = await generateAIResponse(
            `The idea's card combination has been updated: ${getChangeSummary()}`, 
            currentIdea, 
            currentWorkshop
          );
          
          // Add both messages to the chat
          const updatedMessages = [...messages, changedCardMessage, aiResponse];
          setMessages(updatedMessages);
          
          // Save to idea
          updateIdea(currentIdea.id, {
            chatHistory: updatedMessages
          });
        } catch (error) {
          console.error('Failed to notify AI about card changes:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      notifyAI();
      
      // Update the previous card combination
      setPreviousCardCombination(currentIdea.cardCombination);
    } else if (hasCardCombinationChanged()) {
      // Just update the previous card combination without adding messages
      // (this happens for the first load or if there's no chat history yet)
      setPreviousCardCombination(currentIdea.cardCombination);
    }
  }, [currentIdea, currentWorkshop, messages, updateIdea, previousCardCombination, currentIdeaId]);
  
  // Initialize messages from idea's chat history or create welcome message
  useEffect(() => {
    const initializeChat = async () => {
      if (currentIdea) {
        if (currentIdea.chatHistory && currentIdea.chatHistory.length > 0) {
          // Load chat history from the idea
          setMessages(currentIdea.chatHistory);
        } else if (!isGeneratingWelcome) {
          setIsGeneratingWelcome(true);
          
          try {
            // Show a loading message
            const loadingMessage: ChatMessage = {
              id: 'loading',
              type: 'system',
              content: 'Generating AI welcome message...',
              timestamp: new Date(),
            };
            setMessages([loadingMessage]);
            
            // Generate AI welcome message
            let welcomeContent = '';
            
            if (currentWorkshop) {
              welcomeContent = await generateWelcomeMessage(currentIdea, currentWorkshop);
            } else {
              // Fallback if workshop context is not available
              welcomeContent = `Welcome to the Idea Refinement chat! I'll help you refine your idea "${currentIdea.title}" through interactive feedback.

Try these commands:
- Type **/reflect** for reflective questions
- Type **/creative** for alternative approaches
- Type **/provoke** to challenge assumptions
- Type **/help** for more information`;
            }
            
            // Create the welcome message
            const welcomeMessage: ChatMessage = {
              id: uuidv4(),
              type: 'ai',
              content: welcomeContent,
              timestamp: new Date(),
              action: 'info'
            };
            
            // Update messages and save to idea
            setMessages([welcomeMessage]);
            updateIdea(currentIdea.id, { 
              chatHistory: [welcomeMessage]
            });
          } catch (error) {
            console.error('Failed to generate welcome message:', error);
            
            // Fallback message if AI fails
            const fallbackMessage: ChatMessage = {
              id: uuidv4(),
              type: 'system',
              content: `Welcome to the Idea Refinement chat! I'll help you refine your idea "${currentIdea.title}" through interactive feedback.

Try these commands:
- Type **/reflect** for reflective questions
- Type **/creative** for alternative approaches
- Type **/provoke** to challenge assumptions
- Type **/help** for more information`,
              timestamp: new Date(),
              action: 'info'
            };
            
            setMessages([fallbackMessage]);
            updateIdea(currentIdea.id, { 
              chatHistory: [fallbackMessage] 
            });
          } finally {
            setIsGeneratingWelcome(false);
          }
        }
      }
    };
    
    initializeChat();
  }, [currentIdea, currentWorkshop, updateIdea, isGeneratingWelcome]);
  
  // Scroll to bottom of chat on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!currentIdea) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Idea Selected</h3>
        <p className="text-muted-foreground">
          Please select an idea from the dashboard to refine it.
        </p>
      </div>
    );
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Save chat history to the idea
    updateIdea(currentIdea.id, {
      chatHistory: updatedMessages
    });
    
    setInputValue('');
    setIsProcessing(true);
    
    try {
      // Show typing indicator
      const typingMessage: ChatMessage = {
        id: 'typing',
        type: 'system',
        content: 'AI is thinking...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, typingMessage]);
      
      // Get AI response from Ollama
      const aiResponse = await generateAIResponse(inputValue, currentIdea, currentWorkshop);
      
      // Remove typing indicator and add real response
      const messagesWithResponse = [...updatedMessages, aiResponse];
      setMessages(messagesWithResponse);
      
      // Save chat history to the idea
      updateIdea(currentIdea.id, {
        chatHistory: messagesWithResponse
      });
      
      // Save as refinement if it's a meaningful AI guidance
      if (aiResponse.action && ['reflect', 'creative', 'provoke'].includes(aiResponse.action)) {
        const newRefinement: Refinement = {
          id: uuidv4(),
          ideaId: currentIdea.id,
          type: aiResponse.action as 'reflect' | 'creative' | 'provoke',
          question: inputValue,
          response: aiResponse.content,
          createdAt: new Date(),
        };
        
        const updatedRefinements = [...(currentIdea.refinements || []), newRefinement];
        updateIdea(currentIdea.id, { refinements: updatedRefinements });
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: 'Sorry, I had trouble connecting to the AI model. Please ensure Ollama is running with the mistral:instruct model installed.',
        timestamp: new Date()
      };
      
      const messagesWithError = [...updatedMessages, errorMessage];
      setMessages(messagesWithError);
      
      // Save chat history to the idea
      updateIdea(currentIdea.id, {
        chatHistory: messagesWithError
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCardSuggestionClick = (card: ThingCard | SensorCard | ActionCard, category: string) => {
    const categoryMapping: Record<string, 'thing' | 'sensor' | 'action'> = {
      'thing': 'thing',
      'sensor': 'sensor',
      'action': 'action'
    };
    
    const mappedCategory = categoryMapping[category];
    if (!mappedCategory) return;
    
    // Update the idea with the suggested card
    const cardCombination = {
      ...currentIdea.cardCombination,
      [mappedCategory]: card
    };
    
    // Add confirmation message
    const confirmMessage: ChatMessage = {
      id: uuidv4(),
      type: 'system',
      content: `Added ${card.name} as a new ${category} for your idea. The card combination has been updated.`,
      timestamp: new Date(),
      action: 'info'
    };
    
    const updatedMessages = [...messages, confirmMessage];
    setMessages(updatedMessages);
    
    // Update the idea with both the new card and the updated chat history
    updateIdea(currentIdea.id, { 
      cardCombination, 
      chatHistory: updatedMessages 
    });
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-300px)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Refine: {currentIdea.title}</h2>
        <p className="text-muted-foreground">
          Chat with Mistral AI to refine your idea through reflective questions and creative suggestions.
        </p>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground'
                  : message.type === 'system' 
                    ? 'bg-muted text-foreground'
                    : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Render card suggestions if any */}
              {message.cardSuggestions && message.cardSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.cardSuggestions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="font-medium">{category.category.charAt(0).toUpperCase() + category.category.slice(1)} Suggestions:</div>
                      <div className="flex flex-wrap gap-2">
                        {category.cards.map((card) => (
                          <Button 
                            key={card.id} 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCardSuggestionClick(card, category.category)}
                            className="text-xs"
                          >
                            {card.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          placeholder={isProcessing || isGeneratingWelcome ? "AI is thinking..." : "Type a message or command (e.g., /reflect, /creative)"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isProcessing || isGeneratingWelcome}
          className="flex-1"
        />
        <Button type="submit" disabled={isProcessing || isGeneratingWelcome}>
          Send
        </Button>
      </form>
    </div>
  );
} 