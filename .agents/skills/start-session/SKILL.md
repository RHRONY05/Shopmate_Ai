---
name: start-session
description: Initializes a work session for ShopMate AI, inspects .agents/project_tracker.md and git state, recaps completed work, and provides a structured orientation briefing (Current Milestone, Completed Work, Immediate Next Task, Learning Boundaries, and Pedagogical Alignment).
---

# Start Session — ShopMate AI Work Session Initializer

When the user triggers this skill (e.g., by typing `/start-session` or saying "start session", "let's start", "what's next"), execute this procedure immediately.

---

## Step 1: Inspect Project State & Progress

1. Read `.agents/project_tracker.md`:
   - Identify the **Current Phase** and **Next Immediate Action** from the header banner.
   - Find the exact checklist item currently in progress (`[/]`) or the next pending item (`- [ ]`).
2. Read `.agents/AGENTS.md`:
   - Refresh the active pair-programming and teaching rules:
     - **Pacing:** Tackle strictly ONE checklist item at a time.
     - **Confirmation Gate:** Pause after explaining each step and wait for user confirmation.
     - **Hands-on Terminal:** Never silently run Docker, migrations, or npm commands. Provide the command and ask the user to run it.
     - **The 80/20 Boundary Model:** Explicitly state what to know vs what rabbit holes to skip.
     - **Note-Taking:** Notes are created ONLY on-demand when requested by the user, saved directly to `E:\Learning\My_tech_knowledgebase`.

---

## Step 2: Formulate the Session Orientation Briefing

Present a clean, high-yield briefing to the user in this exact markdown structure:

```markdown
### 🚀 ShopMate AI — Session Kickoff

#### 📍 Current Milestone
- **Phase:** [Phase Number & Name, e.g., Phase 0: TypeScript Foundations & Mental Model]
- **Current Task:** [Item Number & Name, e.g., Item 0.1: JS vs TS Under the Hood]

#### ✅ What We Have Accomplished
- [Brief bullet point of last completed milestone or planning step]
- [Brief bullet point of current repository state]

#### 🎯 Today's Mission & Learning Focus
- **Task to Complete:** [Name of the single checklist item we are executing]
- **Core Concept:** [e.g., TypeScript compilation, Type Erasure, tsconfig.json]
- **The 80/20 Boundary:**
  - **Zone 1 (Must Master):** [The essential 20% we will practice today]
  - **Zone 3 (Skip for now):** [Advanced rabbit holes we are deliberately ignoring]


---

### 👉 First Concrete Step
[State the exact first question, concept explanation, or code exercise to kick off the task.]
```

---

## Step 3: Wait for User Confirmation

Do NOT rush ahead into coding multiple steps. After delivering the briefing and introducing the first concept/exercise, STOP and wait for the user's response.
