# Tiles Ideation Application

AI-Facilitated Tiles Ideation Application for creative workshops, ideation sessions, and collaborative design thinking.

## Overview

This digital ideation tool is integrated with the physical Tiles Toolkit, designed to facilitate creativity, idea refinement, and structured evaluation through AI-supported facilitation. The primary goal is to streamline group ideation sessions, enhance participant engagement, and generate impactful ideas.

## Features

### Workshop Management

- Create and manage creative workshops with customizable missions, personas, and scenarios
- Organize and track ideas across multiple workshop sessions
- Intuitive interface for facilitators and participants

### Four-Phase Ideation Process

#### 1. Idea Generation & Overview

- Visually select cards from predefined categories: Things, Sensors, Human Actions, Feedback, Services
- Create and manage multiple ideas based on card combinations
- Quick overview dashboard of all generated ideas

#### 2. Idea Refinement & Chat

- Interactive AI chat interface for idea refinement using Mistral AI
- Use commands like `/reflect`, `/card suggestions`, and `/provoke` to get different types of AI feedback
- AI suggests alternative cards and approaches to expand thinking
- All interactions automatically saved as refinements
- Persistent chat history tied to each idea

#### 3. Storyboard Development

- Visualize ideas through an 8-step storyboard
- AI-generated storyboards based on chosen cards
- Drag-and-drop reordering of storyboard steps
- Customizable description for each step

#### 4. Criteria-based Evaluation & Elevator Pitch

- Evaluate ideas against key criteria like Sustainability, Feasibility, etc.
- AI-generated elevator pitch to clearly articulate ideas
- Structured format helps ensure thorough evaluation

## Technology Stack

- **Frontend**: Next.js, TypeScript, React, Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context API
- **Data Storage**: Local browser storage (for MVP)
- **AI Integration**: [Ollama](https://ollama.ai/) with the Mistral:Instruct model

## Prerequisites

- Node.js 18+
- npm or yarn
- [Ollama](https://ollama.ai/) installed locally
- Mistral:Instruct model pulled in Ollama (`ollama pull mistral:instruct`)

## Getting Started

1. Clone the repository
   ```
   git clone https://github.com/hertheim/tiles-toolkit-facilitator.git
   cd tiles-toolkit-facilitator
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Make sure Ollama is running with the Mistral:Instruct model
   ```
   # In a separate terminal
   ollama serve
   
   # If you haven't already, pull the model
   ollama pull mistral:instruct
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Usage

1. Create a new workshop from the homepage
2. Select a mission, persona, and scenario to frame your ideation
3. Generate ideas using the card selection interface
4. Refine ideas through AI-guided chat
   - Use `/reflect` to get reflective questions
   - Use `/card suggestion` to get alternative card suggestions
   - Use `/provoke` to challenge your assumptions
5. Create a storyboard to visualize the user journey
6. Evaluate ideas against criteria and generate an elevator pitch

## Deployment

The application can be deployed on platforms like Vercel, Netlify, or as a static site. For AI integration, you'll need to:

1. Set up an AI API endpoint (such as Ollama Cloud or running Ollama on a server)
2. Update the API URLs in the application

## Future Improvements

- Integration with cloud-based AI models for wider accessibility
- User authentication and cloud storage
- Collaborative features for real-time group ideation
- Export functionality for ideas and storyboards
- Mobile optimization for tablet use during workshops

## License

[MIT](LICENSE)

## Acknowledgements

- [Tiles Toolkit](https://www.tilestoolkit.io/) for providing the original physical card system
- [Shadcn UI](https://ui.shadcn.com/) for UI components
- [Ollama](https://ollama.ai/) for local AI model hosting
