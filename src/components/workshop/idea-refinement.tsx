'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useWorkshop } from '@/lib/workshop-context';
import { Idea, Refinement, ChatMessage, Workshop } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { ThingCard } from "@/data/things";
import { SensorCard } from "@/data/sensors";
import { ActionCard } from "@/data/actions";
import { FeedbackCard } from "@/data/feedback";
import { ServiceCard } from "@/data/services";
import { generateAIFeedback, generateWelcomeMessage } from '@/lib/ollama-service';
import ReactMarkdown from 'react-markdown';

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
    // Prefix internal commands with / for the backend processing
    let backendCommand = command;
    if (lowerCommand === 'reflect') {
      backendCommand = '/reflect';
      message.action = 'reflect';
    } 
    else if (lowerCommand === 'creative' || lowerCommand === 'card suggestions') {
      backendCommand = '/creative';
      message.action = 'creative';
    }
    else if (lowerCommand === 'provoke') {
      backendCommand = '/provoke';
      message.action = 'provoke';
    }
    else if (lowerCommand === 'help') {
      backendCommand = '/help';
      message.action = 'info';
    }
    else {
      message.action = 'suggestion';
    }
    
    const response = await generateAIFeedback(backendCommand, idea, workshop || undefined);
    message.content = response;
    
    // We're no longer parsing card suggestions for interactive display
    
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
  
  // Helper function for command buttons
  const handleAICommand = (command: string) => {
    if (isProcessing || isGeneratingWelcome || !currentIdea) return;
    
    // Directly create and send the message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: command, // No need to prefix with /
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Save chat history to the idea
    updateIdea(currentIdea.id, {
      chatHistory: updatedMessages
    });
    
    setIsProcessing(true);
    
    // Show typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'system',
      content: 'AI is thinking...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);
    
    // Get AI response from Ollama
    generateAIResponse(command, currentIdea, currentWorkshop)
      .then(aiResponse => {
        // Remove typing indicator and add real response
        const messagesWithResponse = [...updatedMessages, aiResponse];
        setMessages(messagesWithResponse);
        
        // Save chat history to the idea
        updateIdea(currentIdea.id, {
          chatHistory: messagesWithResponse
        });
        
        // Save as refinement
        if (aiResponse.action && ['reflect', 'creative', 'provoke'].includes(aiResponse.action)) {
          const newRefinement: Refinement = {
            id: uuidv4(),
            ideaId: currentIdea.id,
            type: aiResponse.action as 'reflect' | 'creative' | 'provoke',
            question: command,
            response: aiResponse.content,
            createdAt: new Date(),
          };
          
          const updatedRefinements = [...(currentIdea.refinements || []), newRefinement];
          updateIdea(currentIdea.id, { refinements: updatedRefinements });
        }
      })
      .catch(error => {
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
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };
  
  // Helper function for showing help without triggering AI
  const handleHelpCommand = () => {
    if (isProcessing || isGeneratingWelcome || !currentIdea) return;
    
    // Create user help message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: 'Help',
      timestamp: new Date()
    };
    
    // Create help response message
    const helpMessage: ChatMessage = {
      id: uuidv4(),
      type: 'ai',
      content: `**Available Buttons:**

- **Reflect** - Get questions to improve your idea
- **Provoke** - Identify potential weaknesses
- **Card Suggestions** - See alternative card combinations to consider
- **Help** - Show this message`,
      timestamp: new Date(),
      action: 'info'
    };
    
    // Add messages to chat
    const updatedMessages = [...messages, userMessage, helpMessage];
    setMessages(updatedMessages);
    
    // Save chat history to the idea
    updateIdea(currentIdea.id, {
      chatHistory: updatedMessages
    });
  };
  
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
              welcomeContent = `**Welcome to the Idea Refinement for "${currentIdea.title}"!**

I'll help you refine your idea through interactive feedback.

Use the buttons below:

- **Reflect** - Get questions about feasibility and value
- **Provoke** - Challenge assumptions and identify weaknesses
- **Card Suggestions** - See alternative card combinations to consider
- **Help** - View information about available options`;
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
              content: `**Welcome to the Idea Refinement for "${currentIdea.title}"!**

I'll help you refine your idea through interactive feedback.

Use the buttons below:

- **Reflect** - Get questions about feasibility and value
- **Provoke** - Challenge assumptions and identify weaknesses
- **Card Suggestions** - See alternative card combinations to consider
- **Help** - View information about available options`,
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
  
  return (
    <div className="flex flex-col h-[calc(100vh-300px)]">
      <style jsx global>{`
        .markdown-content {
          width: 100%;
        }
        .markdown-content p {
          margin-bottom: 0.75rem;
        }
        .markdown-content ul, .markdown-content ol {
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content strong {
          font-weight: 600;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3,
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          line-height: 1.25;
        }
        .markdown-content h1 {
          font-size: 1.5rem;
        }
        .markdown-content h2 {
          font-size: 1.3rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding-bottom: 0.3rem;
        }
        .markdown-content h3 {
          font-size: 1.15rem;
          color: inherit;
          margin-top: 1.2rem;
          background: rgba(0, 0, 0, 0.03);
          padding: 0.5rem;
          border-radius: 0.25rem;
        }
        .markdown-content h3 + p,
        .markdown-content h3 + strong {
          margin-top: 0.5rem;
        }
        .markdown-content h4 {
          font-size: 1rem;
        }
        .markdown-content h5, .markdown-content h6 {
          font-size: 0.9rem;
        }
        .markdown-content p:last-child, 
        .markdown-content ul:last-child, 
        .markdown-content ol:last-child,
        .markdown-content li:last-child,
        .markdown-content h1:last-child,
        .markdown-content h2:last-child,
        .markdown-content h3:last-child,
        .markdown-content h4:last-child,
        .markdown-content h5:last-child,
        .markdown-content h6:last-child {
          margin-bottom: 0;
        }
        /* Style for card suggestions specifically */
        .markdown-content h2:first-child + h3,
        .markdown-content h2 + h3 {
          margin-top: 0.8rem;
        }
        .markdown-content strong + br + strong,
        .markdown-content strong + strong {
          margin-top: 0.25rem;
          display: block;
        }
      `}</style>
      
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Refine: {currentIdea.title}</h2>
        <p className="text-muted-foreground">
          Use the buttons below to get AI feedback on your idea through reflective questions, provocative challenges, and alternative card combinations.
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
              <div className="markdown-content">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
              
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* AI Command Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={isProcessing || isGeneratingWelcome}
          onClick={() => {
            if (isProcessing || isGeneratingWelcome) return;
            handleAICommand('reflect');
          }}
        >
          Reflect
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isProcessing || isGeneratingWelcome}
          onClick={() => {
            if (isProcessing || isGeneratingWelcome) return;
            handleAICommand('provoke');
          }}
        >
          Provoke
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isProcessing || isGeneratingWelcome}
          onClick={() => {
            if (isProcessing || isGeneratingWelcome) return;
            handleAICommand('card suggestions');
          }}
        >
          Card Suggestions
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isProcessing || isGeneratingWelcome}
          onClick={handleHelpCommand}
        >
          Help
        </Button>
      </div>
    </div>
  );
} 