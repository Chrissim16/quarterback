# Quarterback

A Notion-like planning app for quarterly work management, built with React, TypeScript, and Vite.

## Quick Start

### Option 1: Use the Batch File (Recommended)
1. Double-click `start-dev.bat`
2. The app will open at http://localhost:3000

### Option 2: Manual Start
1. Open PowerShell in this directory
2. Set the Node.js path: `$env:PATH = "C:\Users\DennisSimon\nodejs\node-v20.11.0-win-x64;" + $env:PATH`
3. Run: `npm run dev`
4. Open http://localhost:3000 in your browser

## Features

- **Plan Page**: Manage work items with inline editing
- **Team Page**: Manage team members and their allocations
- **Holidays Page**: Manage public holidays by country
- **Settings Page**: Configure certainty multipliers and countries

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- localStorage (persistence)

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── store/         # Zustand store
├── lib/           # Utility functions
└── types/         # TypeScript type definitions
```

## Troubleshooting

### Port Issues
The app is configured to always use port 3000. If you see port changes, restart the server.

### Import Errors
If you see "Failed to resolve import" errors, try:
1. Stop the server (Ctrl+C)
2. Run `npm install`
3. Restart with `start-dev.bat`

### Node.js Not Found
Make sure Node.js is installed and the PATH is set correctly in the batch file.


