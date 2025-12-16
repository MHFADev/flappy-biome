# Design Guidelines: Flappy Biome: Vector Cataclysm

## Design Approach
**Reference-Based Gaming Aesthetic**: Drawing inspiration from modern web games like Wordle's clean interface, Flappy Bird's immediate clarity, and Superhot's minimalist intensity. Combine arcade game nostalgia with contemporary web design polish.

## Core Design Principles
1. **Instant Readability**: Game state must be clear at 60fps across all devices
2. **Biome Identity**: Each environment has distinct visual personality
3. **Progressive Complexity**: UI complexity scales with difficulty tier
4. **Mobile-First Interactions**: Touch-optimized controls, readable at phone scale

## Typography
- **Primary Font**: JetBrains Mono (via Google Fonts) - monospaced for score counters, retro gaming feel
- **Secondary Font**: Inter - UI elements, menus, leaderboard
- **Hierarchy**:
  - Score Display: text-6xl md:text-8xl font-bold
  - Menu Titles: text-4xl md:text-6xl font-black
  - Difficulty Labels: text-xl font-semibold uppercase tracking-wide
  - Leaderboard Entries: text-sm md:text-base

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 16 exclusively (p-2, gap-4, mt-8, py-16)

**Game Container**:
- Desktop: Fixed aspect ratio 16:9, max-w-6xl centered
- Tablet: 4:3 aspect ratio, full-width with padding
- Mobile: Full viewport height, safe area aware

**Menu Layout**:
- Centered single-column max-w-2xl
- Card-based sections with gap-8
- Sticky header with game logo

## Biome Visual Systems

**Forest Biome**:
- Canvas background: Soft gradient (#2d5016 → #4a7c2c)
- Obstacles: Rich green (#3d6b1f) with darker outlines
- Particles: Floating leaf shapes (SVG), gentle drift animation

**Ice Biome**:
- Canvas background: Cool gradient (#1a2942 → #4a6fa5)
- Obstacles: Crystalline blues (#5b8fbf) with sharp geometric shapes
- Ice Spikes: Jagged triangular SVG with frosted edge effect
- Physics indicator: Subtle motion blur on player

**Magma Biome**:
- Canvas background: Intense gradient (#3d1308 → #8b2e0b)
- Obstacles: Molten oranges (#d64810) with inner glow effect
- Fire Pillars: Animated SVG flames, vertical wavy motion
- Screen tint: Warm overlay at 10% opacity

**Void (Cyber) Biome**:
- Canvas background: Deep gradient (#0a0a12 → #1a1a2e)
- Obstacles: Neon purple (#8b5cf6) with scanline texture
- Lasers: Bright cyan (#06b6d4) horizontal beams, pulse animation
- Homing Rockets: Red warning trails, chevron indicators

## Component Library

**Main Menu**:
- Full-screen centered layout with animated gradient background
- Logo: Large SVG text treatment, subtle pulse animation
- Skin Selector Carousel: Horizontal scroll, gap-4, snap-scroll enabled
  - Each skin preview: 120px × 120px rounded-2xl card
  - Active skin: ring-4 ring-white/50, scale-110 transform
  - Preview animation: Gentle rotation on hover
- Difficulty Tabs: Full-width grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6
  - Each tab: px-4 py-3 rounded-lg, font-semibold
  - Active state: Distinct background, no opacity reduction
  - Color coding: Green (Easy) → Yellow → Orange → Red → Purple → Black (Masochist)

**In-Game HUD**:
- Top bar: Sticky, backdrop-blur-md, h-16
  - Score: Left-aligned, large counter with animation on increment
  - Biome indicator: Center badge with icon
  - Active buffs: Right-aligned, horizontal flex gap-2
- Buff indicators: 40px × 40px rounded-full, SVG icon centered
  - Shield: Light border pulse
  - Time Slow: Clock icon with rotation
  - Multiplier: Star with sparkle particles

**Leaderboard**:
- Card-based design: rounded-2xl, p-8, backdrop-blur-lg
- Difficulty filter tabs: Horizontal scroll on mobile, fixed on desktop
- Table layout:
  - Rank column: w-16, gradient background for top 3
  - Username: flex-1, truncate
  - Score: w-24, text-right, font-mono
  - Skin preview: w-12, mini SVG render
  - Date: w-32, text-muted
- Top 3 special treatment: Gold/Silver/Bronze gradient backgrounds, larger text

**Pause/Game Over Modal**:
- Centered overlay: max-w-md, rounded-3xl
- Backdrop: blur-2xl with dark overlay
- Stats grid: grid-cols-2, gap-4
  - Final Score, Best Score, Time Survived, Obstacles Cleared
- Action buttons: Stacked vertically, gap-3, full-width

**Mobile Controls**:
- Touch area: Full screen invisible overlay
- Visual feedback: Ripple effect SVG at touch point
- Haptic feedback integration where supported

## Difficulty Visual Indicators

**Masochist Mode Special Effects**:
- Obstacle fade-in: opacity-0 → opacity-100 transition within 150px range
- Screen shake: CSS keyframe animation on game container (2px random offset)
- Danger overlay: Red vignette pulsing at edges
- UI distortion: Slight chromatic aberration on score text

## Animations
**Strategic Use Only**:
- Player rotation: Smooth transform based on velocity
- Buff collection: Scale bounce + particle burst
- Collision: Brief flash + screen shake (on Masochist+)
- Score increment: Number flip animation
- Menu transitions: Smooth fade + slight slide

## Responsive Breakpoints
- Mobile: < 768px - Vertical layout, simplified HUD, larger touch targets
- Tablet: 768px - 1024px - Balanced layout, optional landscape mode
- Desktop: > 1024px - Full feature set, optimal aspect ratio

## Accessibility
- High contrast mode toggle for visibility
- Screen reader announcements for score milestones
- Keyboard controls (Spacebar/Arrow keys) as alternative to click
- Pause on window blur
- Colorblind-safe difficulty color coding with icons/patterns

## Performance Considerations
- Canvas rendering: Fixed resolution scaled via CSS (prevents blur)
- SVG player: Single component instance, transform-only animations
- Particle system: Max 20 particles, object pool pattern
- Leaderboard: Pagination at 20 entries, lazy load on scroll

This design creates a cohesive arcade gaming experience with modern web polish, ensuring clarity across devices while maintaining visual excitement through biome differentiation and progressive difficulty feedback.