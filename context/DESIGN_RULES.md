# NEURON DESIGN SYSTEM RULES
VERSION: 2.0
IDENTITY: DETERMINISTIC ORCHESTRATION / CINEMATIC INFRASTRUCTURE
UI REFERENCE: neuron-engine-landing-page.png

---

# CORE DESIGN PHILOSOPHY

The Neuron interface must function as a **High-Fidelity Orchestration Cockpit**. It is designed for engineers who value precision, but presented through a lens of premium, cinematic software.

- **System Intelligence:** The UI should feel "alive" through subtle, deterministic motion (Neural Flows).
- **Obsidian Depth:** Use absolute blacks and deep grays to create a sense of infinite infrastructure.
- **Architectural Clarity:** Prioritize the relationship between nodes and execution paths.
- **Premium Restraint:** No visual noise. Every pixel must serve the narrative of orchestration.

---

# COLOR & TOKEN SYSTEM

## 1. SEMANTIC OKLCH FOUNDATION
You are **strictly prohibited** from using raw hex or standard Tailwind color utilities (e.g., `bg-zinc-900`). You must utilize the semantic tokens defined in the Neuron v4 bridge.

| Token | Value (Dark) | Usage |
| :--- | :--- | :--- |
| `bg-background` | `oklch(0 0 0)` | Primary Obsidian canvas. |
| `bg-card` | `oklch(0.182 0 89.876)` | Bento grid surfaces and node backgrounds. |
| `text-foreground` | `oklch(0.985 0 0)` | Primary technical headings and white-text emphasis. |
| `text-muted-foreground` | `oklch(0.708 0 0)` | Supporting descriptions and system metadata. |
| `border-border` | `oklch(1 0 0 / 10%)` | Subtle 1px structural definition. |

## 2. THE "GLOW" PROTOCOL
Accents are not colorful; they are **luminant**.
- **Interactive Glow:** Use `oklch(1 0 0 / 5%)` or subtle white radial gradients.
- **Pulse:** Semantic signals (Success/Error) use low-chroma greens or reds, but only as soft atmospheric glows, never as solid blocks of color.

---

# SURFACE & GEOMETRY RULES

## 1. ULTRA-SMOOTH RADII
Neuron rejects sharp industrial corners. The geometry must feel "liquid" and approachable.
- **Bento Containers:** Strictly **24px to 32px** (`radius-4xl`).
- **Interactive Components:** **12px to 16px** (`radius-2xl`).
- **Pills/Nodes:** Fully rounded (pill-shaped) for high-frequency interaction points.

## 2. OBSIDIAN LAYERING
Surface distinction is achieved through **luminance steps**, not color shifts.
- **Base:** Background (`oklch(0 0 0)`).
- **Elevated:** Card (`oklch(0.182 0 89.876)`) with a `backdrop-blur-xl`.
- **Overlay:** Translucent white overlays at 5-10% opacity for hover states.

---

# BORDER & DEPTH RULES

- **The Ghost Border:** Borders must be 1px and utilize `border-border`. They should be nearly invisible until they catch a "light" (glow) from an animation or hover.
- **Atmospheric Shadows:** Avoid hard drop shadows. Use large-radius, low-opacity diffused shadows to simulate "depth in a void" (e.g., `shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]`).

---

# TYPOGRAPHY: THE TECHNICAL NARRATIVE

- **Headlines:** Must use **Geist Sans** or **Inter**. Style: `font-bold`, `tracking-tighter`, `uppercase` or `capitalize`.
- **Data/Mono:** Use **Geist Mono** for execution logs and variable values. Style: `text-xs`, `tracking-widest`.
- **Hierarchy:** Use scale and tracking to differentiate, never "loud" font weights. Headlines should feel cinematic; body text should feel like a system manual.

---

# MOTION & INTERACTION

## 1. NEURAL FLOW (The Execution Pulse)
Motion is a core component of the brand, not a decorative layer.
- **Transitions:** Must be `duration-500` or `duration-700` with `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Orbital Animation:** Background elements should move in slow, deterministic orbits.
- **The Pulse:** When a node executes, the connection lines (Edges) should "pulse" with a white stroke-dash animation.

## 2. INTERACTIVE RESTRAINT
- Hovering over a card should trigger a subtle **luminance lift** or a **soft radial glow** following the cursor.
- Avoid aggressive scaling or "bounce" effects. The UI should feel stable and engineered.

---

# COMPONENT SPECIFICS

- **Nodes:** Must feel like physical objects on a glass table. Use `bg-card/70` with `border-border`.
- **Buttons:**
    - **Primary:** Pure white background, black text, zero border.
    - **Secondary:** Transparent background, `border-border`, subtle hover glow.
- **Bento Grids:** Ensure consistent `gap-6` or `gap-8` (24px-32px) to allow the "Obsidian" background to act as the primary visual separator.

---

# FINAL DESIGN GUARDRAIL

**IF IT LOOKS LIKE A TERMINAL, START OVER.**
Neuron is a **premium product experience**. It should feel more like a high-end luxury car dashboard or a modern architectural visualization tool than a hacker's command prompt.

**Key Aesthetic Check:**
1. Is it monochrome/dark?
2. Are the corners ultra-smooth (24px+)?
3. Is the motion "liquid" and slow?
4. Are you using semantic OKLCH tokens?

**If all four are YES, the design is Neuron-compliant.**