---
name: Liquid Glass
colors:
  surface: '#11131c'
  surface-dim: '#11131c'
  surface-bright: '#373943'
  surface-container-lowest: '#0c0e17'
  surface-container-low: '#191b24'
  surface-container: '#1d1f29'
  surface-container-high: '#282933'
  surface-container-highest: '#32343e'
  on-surface: '#e1e1ef'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e1e1ef'
  inverse-on-surface: '#2e303a'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#ecb2ff'
  on-secondary: '#520071'
  secondary-container: '#cf5cff'
  on-secondary-container: '#480063'
  tertiary: '#daffe4'
  on-tertiary: '#003920'
  tertiary-container: '#00f89e'
  on-tertiary-container: '#006d43'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#f8d8ff'
  secondary-fixed-dim: '#ecb2ff'
  on-secondary-fixed: '#320047'
  on-secondary-fixed-variant: '#74009f'
  tertiary-fixed: '#52ffac'
  tertiary-fixed-dim: '#00e290'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005231'
  background: '#11131c'
  on-background: '#e1e1ef'
  surface-variant: '#32343e'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 20px
    letterSpacing: 0em
  label-xs:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  safe-area: env(safe-area-inset-bottom)
---

## Brand & Style

This design system embodies a "Liquid Glass" aesthetic tailored for high-performance mobile development. The brand personality is sophisticated, technical, and forward-leaning, aiming to evoke a sense of deep focus and premium craftsmanship. 

The visual language centers on **Glassmorphism**, utilizing heavy backdrop blurs and multi-layered translucency to create an interface that feels like polished obsidian and etched glass. The user should feel as if they are interacting with a futuristic console where code floats over a deep, shifting digital ether. This is achieved through high-contrast syntax against dark, blurred backgrounds and ultra-refined micro-interactions that prioritize speed and clarity.

## Colors

The palette is rooted in a deep "Obsidian" neutral to ground the translucent layers. The background is not a flat color but a dynamic environment composed of vibrant mesh gradients using deep purples, teals, and electric blues. 

**Core Palette:**
- **Primary:** An electric cyan (#00F0FF) used for active states and highlights.
- **Secondary:** A vivid violet (#BD00FF) for secondary accents and depth-giving glows.
- **Tertiary:** A mint-teal (#00FFA3) for success states and specific syntax categories.
- **Surface:** Semi-transparent variations of the neutral base, ranging from 40% to 80% opacity with heavy blurs.

**Syntax Highlighting:**
Syntax colors are optimized for high contrast against blurred glass. Use a "Vibrant Professional" scheme where logic-heavy keywords are distinct from data structures, ensuring legibility during prolonged coding sessions.

## Typography

This design system utilizes **Geist** for its systematic, developer-centric feel in the UI, and **JetBrains Mono** for the code editor itself to ensure maximum readability of characters and ligatures.

Typography is treated with extreme precision. While UI labels are sans-serif and neutral, the code editor levels prioritize vertical rhythm and character distinction. Use subtle text-shadows on display headings to maintain legibility against complex mesh backgrounds. All labels should be crisp, avoiding thin weights that might get lost in backdrop blurs; "Regular" (400) and "Medium" (500) are the preferred weights for the body and UI labels.

## Layout & Spacing

The layout is driven by a **Fluid-Safe Grid**. Since this is a mobile code editor, horizontal real estate is at a premium. The system uses a 4px base unit for all padding and margins.

- **Editor Canvas:** The main coding area uses an edge-to-edge layout with a 16px gutter on the left for line numbers and fold indicators.
- **Translucent Overlays:** Modals and sidebars use a "floating" layout, inset by 12px from the screen edge to reveal the blurred background environment beneath, reinforcing the glass metaphor.
- **Mobile Adaptations:** Touch targets are strictly 44px or larger, but their visual representation may be smaller and more refined to maintain the high-density professional aesthetic.

## Elevation & Depth

Depth is not created through traditional shadows, but through **Backdrop Blur** and **Inner Glows**.

1.  **The Environment:** A base layer of deep mesh gradients.
2.  **Surface Level (Low):** 40% opacity obsidian with 20px backdrop blur. Refined 1px border (White @ 10% opacity).
3.  **Active Level (High):** 60% opacity obsidian with 40px backdrop blur. 1px border (Primary @ 30% opacity).
4.  **Inner Glow:** All elevated elements feature a subtle 1px top-inner-stroke (White @ 15%) to simulate light hitting the top edge of the "glass" panel.
5.  **Shadows:** Use large, highly diffused shadows (40px-60px blur) with a tint of the Primary or Secondary color at 5-10% opacity to create a "neon underglow" effect rather than a dark shadow.

## Shapes

The shape language uses **Rounded** (Level 2) geometry. This balance ensures the UI feels modern and tactile without becoming too "organic" or "bubbly," which would detract from the professional, technical tone.

- **Panels/Cards:** 1rem (16px) corner radius.
- **Buttons/Inputs:** 0.5rem (8px) corner radius.
- **Code Highlights:** 4px radius for selections or search results within the editor to maintain the block-like structure of code.

## Components

- **Glass Buttons:** Primary buttons are semi-transparent with a 1px solid border and a faint inner glow. On press, the background opacity increases. Secondary buttons have no fill, only a 1px border.
- **Code Editor:** Features a non-traditional line-highlight—a full-width subtle gradient strip with a 2px "active" marker on the far left.
- **Tabs:** Use a "pill" style for the active file, while inactive files remain text-only with a subtle divider, preventing visual clutter in the navigation bar.
- **Floating Action Buttons (FAB):** Small, circular, and highly vibrant. These should use the Primary color with a 20px blur "glow" behind them to appear as if they are floating high above the code.
- **Inputs:** Fields are defined by a bottom border only in their default state, becoming a full glass panel with a primary-colored glow when focused.
- **Terminal:** A bottom-sheet component with higher opacity (80%) to distinguish command-line output from the source code.