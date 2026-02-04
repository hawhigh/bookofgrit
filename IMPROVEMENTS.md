# Shop & Subscription UI Improvements

## Overview
The "Book of Grit" shop and subscription sections have been overhauled to align with a premium, high-tech, and "gritty" aesthetic. The goal was to transform simple listings into immersive "archive" experiences.

## Key Changes

### 1. Field Manuals (Shop) Section
- **Card Design**: Shifted from a basic grid to a detailed "Archive File" layout.
- **Visuals**:
  - Added "glitch" borders and scanline overlays on hover.
  - Implemented a "classified" status badge system (OWNED vs PRICE).
  - Enhanced images with grayscale-to-color transitions.
- **Typography**: Applied `Rubik Mono One` (bombed) for titles and `Courier Prime` (technical) for metadata to create a strong hierarchy.
- **Interactivity**: Clearer "ACCESS_DATA" vs "ACQUIRE_TARGET" call-to-actions.

### 2. The Movement (Subscription) Section
- **Layout**: Moved to a split-screen design (Pitch vs Benefits) for better readability and impact.
- **Aesthetic**:
  - "VIP Terminal" look with a dark glassmorphism background.
  - Animated scanning line effect to simulate active monitoring.
  - Neon magenta accents to differentiate from the cyan-primary shop items.
- **Content**: Highlighted key benefits (Direct Signal, War Room, etc.) in a grid format.

### 3. CSS Animations
- Added a `.animate-scan` class for the cyberpunk scanning effect.
- Refined hover transitions for smoother interactions.

## Files Modified
- `src/pages/HomePage.jsx`: Core layout and component logic.
- `src/index.css`: Added keyframes for scanning animation.
