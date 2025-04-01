# Tiles Ideation Application - Project Summary

## Project Overview

The Tiles Ideation Application is a digital tool designed to facilitate creative workshops and ideation sessions using the Tiles Toolkit methodology. The application guides users through a structured four-phase process for generating, refining, visualizing, and evaluating ideas in a collaborative environment.

## Core Features

### 1. Workshop Management
- Create, view, and manage workshops with customizable parameters
- Associate missions, personas, and scenarios with each workshop
- Track workshop progress and ideas across multiple sessions

### 2. Four-Phase Ideation Process

#### Phase 1: Idea Generation
- Card selection interface with five categories: Things, Sensors, Human Actions, Feedback, Services
- Intuitive drag-and-drop interface for combining cards
- Dashboard view of all generated ideas

#### Phase 2: Idea Refinement via AI Chat
- Interactive chat interface for refining ideas
- Command-based AI interaction:
  - `/reflect` for reflective questions about the idea
  - `/creative` for suggestions to enhance the idea, including alternative card combinations
  - `/provoke` for challenging assumptions and pushing boundaries
- Automatic saving of all refinements and suggestions

#### Phase 3: Storyboard Development
- 8-step storyboard creation to visualize the user journey
- AI-generated storyboard suggestions based on the idea
- Drag-and-drop reordering of steps
- Customizable descriptions for each step

#### Phase 4: Criteria-based Evaluation & Elevator Pitch
- Evaluation against predefined criteria (sustainability, feasibility, etc.)
- Structured format for evaluation responses
- AI-generated elevator pitch summarizing the key aspects of the idea

## Technical Implementation

### Technology Stack
- **Frontend Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS + Shadcn UI components
- **Type Safety**: TypeScript
- **State Management**: React Context API
- **Data Persistence**: Local storage (browser-based)
- **AI Integration**: Mock AI implementation (with placeholders for real API integration)

### Key Components
- **Workshop Context**: Central state management for workshops, ideas, and application phase
- **Card Selection Component**: Visual interface for selecting and combining cards
- **Idea Refinement Chat**: Interactive chat interface with AI for idea refinement
- **Storyboard Component**: Visual editor for creating and arranging storyboard steps
- **Evaluation Component**: Form-based interface for evaluating ideas against criteria

### Data Model
- **Workshop**: Contains metadata, mission, persona, scenario
- **Idea**: Contains card combinations, refinements, storyboard, evaluation, and elevator pitch
- **Cards**: Categorized into Things, Sensors, Actions, Feedback, and Services

## User Experience

The application offers a clean, intuitive interface that guides users through each phase of the ideation process:

1. Users begin by creating a workshop with a specific mission, persona, and scenario
2. They generate ideas by selecting cards from different categories
3. Ideas are refined through an AI-guided chat interface
4. Users visualize their ideas through customizable storyboards
5. Finally, ideas are evaluated against criteria and summarized in an elevator pitch

## Future Enhancements

1. **Real AI Integration**: Replace mock AI with actual API calls to models like Ollama or Mistral
2. **User Authentication**: Add user accounts and role-based permissions
3. **Cloud Storage**: Migrate from local storage to cloud database
4. **Collaborative Features**: Real-time collaboration for workshops
5. **Export Functionality**: Export ideas, storyboards, and evaluations as PDFs or presentations
6. **Mobile Optimization**: Enhanced support for tablet use during workshops
7. **Analytics Dashboard**: Track workshop metrics and idea development

## Deployment

The application is built as a Next.js application, making it easy to deploy on platforms like Vercel or as a static site. For initial use, the application can be run locally using `npm run dev`. 