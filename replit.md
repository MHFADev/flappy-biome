# Flappy Biome: Vector Cataclysm

## Overview

A responsive side-scrolling survival game built with React and Express. Players navigate through different biomes (Forest, Ice, Magma, Void) while avoiding obstacles and collecting power-ups. Features multiple difficulty tiers from Easy to Masochist, customizable SVG player skins, and a segmented leaderboard system stored in PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state, React useState/useRef for game state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Game Rendering**: Hybrid approach using HTML5 Canvas for world/obstacles and React SVG components for player skins

### Backend Architecture
- **Framework**: Express.js running on Node.js with TypeScript
- **API Design**: RESTful endpoints under `/api/` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Build System**: esbuild for server bundling, Vite for client

### Game Engine Design
- Custom game loop with requestAnimationFrame for 60fps rendering
- Physics system handling gravity, velocity, collision detection
- Biome-specific modifiers (gravity changes, friction, unique hazards)
- Difficulty tier system affecting obstacle spacing, speed, and special effects
- **Audio System**: AudioManager class for sound effects and background music
  - Point sound (passing obstacle)
  - Death sound (game over)
  - Jump sound (player jump)
  - Buff sound (collecting power-ups)
  - Background music (looping)
  - Mute toggle button during gameplay

### Database Auto-Initialization
- Server automatically creates required tables, enums, and indexes on startup
- Uses raw SQL with IF NOT EXISTS guards for idempotent initialization
- Tables: users, scores
- Enums: difficulty (easy, normal, hard, insane, expert, masochist)
- Indexes on difficulty, score, and username for query optimization

### Data Model
- **Scores table**: Stores leaderboard entries with username, score, difficulty, skin used, and timestamp
- **Users table**: Basic user storage with id, username, password
- **Enums**: Difficulty levels (easy through masochist), skin types, biome types, buff types

### Key Design Patterns
- Separation of game logic (`gameEngine.ts`) from rendering (`GameCanvas.tsx`)
- Configuration-driven biome and difficulty settings (`gameConfig.ts`)
- Component-based skin system with SVG React components accepting style props for rotation physics

## External Dependencies

### Database
- **PostgreSQL**: Primary data store accessed via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries with schema defined in `shared/schema.ts`

### UI Components
- **Radix UI**: Headless primitives for accessible components (dialog, tabs, select, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend dev server and bundler with HMR
- **esbuild**: Server-side bundling for production
- **TypeScript**: Full type coverage across client, server, and shared code

### Fonts
- **JetBrains Mono**: Primary monospaced font for score displays and gaming aesthetic
- **Inter**: Secondary font for UI elements
- **Fira Code**: Additional monospace option

## Deployment Options

### Replit Deployment (Recommended)
Use Replit's built-in publishing feature for seamless deployment of both frontend and backend.

### Vercel Deployment
A `vercel.json` configuration is provided for deploying the frontend as a static site:
- The frontend is built using `npm run build` and outputs to `dist/public`
- For API functionality, you'll need to either:
  1. Host the Express backend separately (Railway, Render, etc.)
  2. Use Replit's deployment for the full-stack experience

Note: Vercel's serverless functions have limitations with Express apps. For a production fullstack deployment, Replit's native deployment or platforms like Railway/Render are recommended.

## Recent Changes

### December 2024
- **Masochist Mode Pipe Glow Effect**: Pipes now cycle between 3 seconds of visible glow (purple #7c3aed) and 7 seconds of complete invisibility
- **Vault / Collection System**: Added a new Vault/Collection section showing owned gacha skins alongside the base character selection
- **Enhanced Gameplay Skin Effects**: Equipped gacha skins now display unique visual effects during gameplay (particles, glow aura, trails) based on skin rarity and animation type
- **Vercel Configuration**: Added basic vercel.json for static frontend deployment