# Copilot Instructions for Newsor Frontend

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React frontend application for the Newsor news management system with the following specifications:

## Project Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Joy UI (Material Design components)
- **State Management**: Apollo Client for GraphQL state management
- **Routing**: React Router for navigation
- **Backend API**: GraphQL endpoint at `http://localhost:8000/graphql/`

## Key Technologies
- **Frontend**: React + TypeScript + Vite
- **UI Components**: Joy UI (@mui/joy)
- **GraphQL Client**: Apollo Client for API communication
- **Styling**: Emotion (CSS-in-JS) with Joy UI theming
- **Routing**: React Router DOM

## Development Guidelines
- Use TypeScript for all components and utilities
- Follow React best practices with functional components and hooks
- Use Joy UI components for consistent design
- Implement GraphQL queries and mutations using Apollo Client
- Create reusable components for common UI patterns
- Use proper error handling and loading states
- Implement responsive design for mobile and desktop

## Project Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Main page components
- `src/graphql/` - GraphQL queries, mutations, and types
- `src/utils/` - Utility functions and helpers
- `src/hooks/` - Custom React hooks
- `src/context/` - React context providers
- `src/types/` - TypeScript type definitions

## API Integration
- Connect to Django GraphQL backend at `http://localhost:8000/graphql/`
- Use Apollo Client for GraphQL operations
- Implement authentication with JWT tokens
- Handle role-based access control (Reader, Writer, Manager, Admin)

## User Roles & Features
- **Readers**: Browse news, like articles, leave comments
- **Writers**: Create and manage their own articles
- **Managers**: Review and approve/reject articles
- **Admins**: Full system management

## Code Style
- Use TypeScript strict mode
- Follow React and TypeScript best practices
- Use descriptive component and variable names
- Implement proper prop types and interfaces
- Add JSDoc comments for complex functions
- Use consistent file naming conventions
