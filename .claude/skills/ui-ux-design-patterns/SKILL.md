---
name: ui-ux-design-patterns
description: >
  UI/UX design patterns for web and mobile applications. Covers atomic design
  methodology, component hierarchy, design token systems, responsive strategy,
  accessibility requirements, interaction patterns, and state management for UI.
  Produces concrete component inventories that frontend-builder can implement.
when_to_use: >
  Use when design-agent produces a design spec. Ensures designs are systematic
  (not ad-hoc), accessible (WCAG AA), responsive (mobile-first), and translate
  cleanly into implementable React/Next.js component trees.
---

# UI/UX Design Patterns

## Atomic Design Hierarchy

Every screen is built from components at 5 levels:

```
Atoms       — smallest units: Button, Input, Label, Icon, Badge, Avatar
Molecules   — atoms combined: SearchField (Input + Button), FormField (Label + Input + Error)
Organisms   — meaningful sections: NavBar, AuthForm, ProductCard, DataTable
Templates   — page layout with slots: AuthLayout, DashboardLayout, SettingsLayout
Pages       — templates with real content: LoginPage, DashboardPage, ProfilePage
```

**Rule: Design top-down (page → template → organism), build bottom-up (atom → page).**

### Component inventory format

```
Page: DashboardPage
└── Template: DashboardLayout
    ├── Organism: TopNavBar
    │   ├── Molecule: Logo (Image + Text)
    │   ├── Organism: NavLinks (list of Molecule:NavLink)
    │   └── Molecule: UserMenu (Avatar + Dropdown)
    ├── Organism: SidebarNav
    │   └── [Molecule:SidebarItem] × n
    └── Slot: <main-content>
        ├── Organism: StatsRow
        │   └── [Molecule:StatCard (Icon + Number + Label)] × 4
        └── Organism: RecentActivityTable
            ├── Atom: SectionHeading
            └── Organism: DataTable
                ├── Molecule: TableHeader (sortable columns)
                └── [Molecule:TableRow] × n
```

---

## Design Token System

Every visual property comes from a token — never a magic number.

```typescript
// tokens/design-tokens.ts
export const tokens = {
  color: {
    // Brand
    primary:   { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 900: '#1e3a8a' },
    // Semantic
    success:   { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    warning:   { bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
    error:     { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
    info:      { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
    // Surface
    surface:   { primary: '#ffffff', secondary: '#f8fafc', tertiary: '#f1f5f9' },
    border:    { default: '#e2e8f0', strong: '#cbd5e1', focus: '#3b82f6' },
    text:      { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
  },
  spacing: {
    // 4px base unit
    1: '4px', 2: '8px', 3: '12px', 4: '16px',
    5: '20px', 6: '24px', 8: '32px', 10: '40px',
    12: '48px', 16: '64px', 20: '80px', 24: '96px',
  },
  radius: {
    sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
  },
  typography: {
    size:   { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px', '2xl': '24px', '3xl': '30px' },
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    leading:{ tight: 1.25, normal: 1.5, relaxed: 1.75 },
  },
}
```

---

## Component States — Always Design All of These

Every interactive component needs ALL these states defined:

| State | When | Visual treatment |
|---|---|---|
| **Default** | Normal, nothing happening | Base style |
| **Hover** | Mouse over | Subtle background shift, cursor pointer |
| **Focus** | Keyboard focused | 2px blue outline (never remove — accessibility) |
| **Active** | Being clicked/pressed | Slightly depressed, darker |
| **Loading** | Async action in progress | Spinner or skeleton, disabled interactions |
| **Disabled** | Not available | Reduced opacity (0.5), cursor not-allowed |
| **Error** | Validation failed | Red border, error message below |
| **Success** | Action completed | Green indicator (brief, then dismiss) |
| **Empty** | No data to show | Illustration + helpful text + CTA |

**Design rule: If you only design Default + Error, you haven't finished.**

---

## Responsive Strategy (Mobile-First)

```
Breakpoints (Tailwind defaults):
  xs:  0px     — mobile portrait (design here first)
  sm:  640px   — mobile landscape / small tablet
  md:  768px   — tablet portrait
  lg:  1024px  — tablet landscape / small desktop
  xl:  1280px  — desktop
  2xl: 1536px  — large desktop

Mobile-first rules:
  1. Design the 375px layout first — not the desktop layout
  2. Expand from mobile — don't shrink from desktop
  3. Navigation: hamburger menu on mobile → horizontal nav on lg+
  4. Tables: horizontal scroll on mobile → full table on md+
  5. Sidebars: hidden on mobile (sheet/drawer) → persistent on lg+
  6. Touch targets: minimum 44×44px — no exceptions
  7. Font size: minimum 16px on mobile (prevents iOS zoom on focus)
```

### Layout patterns by screen size
```
Mobile (< 640px):
  - Single column
  - Full-width cards
  - Bottom navigation or hamburger
  - Stacked form fields

Tablet (640px–1024px):
  - 2-column grid for cards
  - Collapsible sidebar
  - Horizontal form fields for short labels

Desktop (> 1024px):
  - 3-4 column grid for cards
  - Persistent sidebar (240px)
  - Complex data tables
  - Hover states active
```

---

## Accessibility Checklist (WCAG 2.1 AA)

Required for every component:

```
Color & Contrast:
  □ Normal text: contrast ratio ≥ 4.5:1
  □ Large text (18px+ or 14px+ bold): contrast ratio ≥ 3:1
  □ UI components (borders, icons): contrast ratio ≥ 3:1
  □ Never use color as the ONLY way to convey information (add icon or text)

Keyboard Navigation:
  □ All interactive elements reachable by Tab key
  □ Focus visible (never outline:none without replacement)
  □ Logical tab order (matches visual order)
  □ Modals/dialogs trap focus while open, restore on close
  □ Escape key closes modals, dropdowns, tooltips

Screen Reader:
  □ Images have meaningful alt text (or alt="" if decorative)
  □ Form inputs have associated <label> or aria-label
  □ Buttons have descriptive text (not "Click here")
  □ Error messages linked to inputs via aria-describedby
  □ Loading states announced: aria-live="polite"
  □ Dynamic content changes announced: aria-live region

Motion:
  □ Animations respect prefers-reduced-motion media query
  □ No content flashes more than 3 times per second
```

---

## Common Interaction Patterns

### Form submission flow
```
1. User fills form
2. Client-side validation on blur (not on every keystroke)
3. User submits
4. Button: disabled + loading spinner
5a. Success → redirect or success message → reset form
5b. Error → re-enable button + show error above form (not below)
   → Focus moves to first error field (accessibility)
```

### Optimistic UI (for fast-feeling updates)
```
1. User performs action (e.g., like a post)
2. UI updates immediately (don't wait for API)
3. API call made in background
4a. API succeeds → leave UI as-is
4b. API fails → revert UI change + show error toast
```

### Toast notification rules
```
- Success: 3 seconds, auto-dismiss, no action required
- Info: 5 seconds, auto-dismiss
- Warning: stays until dismissed, has action button
- Error: stays until dismissed, has "retry" action
- Max 3 toasts at once (queue the rest)
- Position: top-right on desktop, top-center on mobile
```

### Empty states — always include
```
Every list/table needs an empty state with:
  - Illustration (simple SVG or icon — not stock photo)
  - Heading: what's missing ("No orders yet")
  - Body: why and what to do ("When you place your first order, it'll appear here")
  - CTA button: the primary action to resolve the empty state
```

---

## Design Spec Completeness Checklist

Before handing off to frontend-builder:
- [ ] Component inventory written for every screen
- [ ] All states defined for every interactive component
- [ ] Design tokens specified (colors, spacing, typography, radius)
- [ ] Mobile layout described for every screen
- [ ] Accessibility requirements listed per component
- [ ] Empty states designed for all lists/tables
- [ ] Loading states specified (skeleton or spinner? which?)
- [ ] Error states specified (inline or toast? both?)
- [ ] Navigation pattern defined (tabs / sidebar / breadcrumb?)
