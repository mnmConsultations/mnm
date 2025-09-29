# Project Context for My Web App

This project is a React web application using functional components and hooks. We use Redux for state management, and all API calls are handled by a separate service file.

## Architectural Notes
- The folder structure is based on features (e.g., `src/components/user`, `src/features/dashboard`).
- State is managed globally with Redux and locally with React's `useState`.
- All API requests should be made using the `apiService.js` utility.

## Style Guide
- Use ES6 syntax and arrow functions.
- Use `camelCase` for all JavaScript variables and functions.
- Use `PascalCase` for React components.
- All components should be located in the `src/components` directory unless they are part of a specific feature folder.