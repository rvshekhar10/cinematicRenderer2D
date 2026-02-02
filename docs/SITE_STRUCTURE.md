# Site Structure and Navigation Flow

## Visual Site Map

```
┌─────────────────────────────────────────────────────────────┐
│                    cinematicRenderer2D                       │
│                     Main Repository                          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     📁 docs/              │   │   🎮 playground/          │
│   Documentation Hub       │◄──┤   Interactive Demo        │
└───────────────────────────┘   └───────────────────────────┘
                │                           │
                │                           │
    ┌───────────┼───────────┐              │
    │           │           │              │
    ▼           ▼           ▼              │
┌────────┐ ┌────────┐ ┌────────┐          │
│Getting │ │  API   │ │Examples│          │
│Started │ │  Docs  │ │ Guide  │          │
└────────┘ └────────┘ └────────┘          │
                │                          │
    ┌───────────┼───────────┐             │
    │           │           │             │
    ▼           ▼           ▼             │
┌────────┐ ┌────────┐ ┌────────┐         │
│ React  │ │Angular │ │ Perf   │         │
│ Guide  │ │ Guide  │ │ Guide  │         │
└────────┘ └────────┘ └────────┘         │
                                          │
                                          │
        "Use This in Your Project" ───────┘
                 Button
```

## Navigation Flows

### Flow 1: New User Discovery
```
GitHub/NPM → README.md → Playground → "Use This in Your Project" 
→ docs/index.html → GETTING_STARTED.md → Implementation
```

### Flow 2: Framework Developer
```
Search Engine → docs/index.html → React/Angular Guide 
→ API Reference → Playground Testing → Implementation
```

### Flow 3: Advanced User
```
Direct Link → API.md → PERFORMANCE.md → EXAMPLES.md 
→ Playground Experimentation → Custom Implementation
```

## Page Relationships

### Documentation Hub (docs/index.html)
**Links To:**
- GETTING_STARTED.md (primary CTA)
- playground/index.html (secondary CTA)
- API.md
- REACT_INTEGRATION.md
- ANGULAR_INTEGRATION.md
- PERFORMANCE.md
- EXAMPLES.md
- GitHub repository

**Linked From:**
- playground/index.html ("Use This in Your Project" button)
- README.md (main documentation link)
- All other documentation pages (navigation)

### Playground (playground/index.html)
**Links To:**
- docs/index.html ("Use This in Your Project" button)

**Linked From:**
- docs/index.html (multiple CTAs)
- GETTING_STARTED.md
- EXAMPLES.md
- README.md

### Getting Started (GETTING_STARTED.md)
**Links To:**
- API.md
- REACT_INTEGRATION.md
- ANGULAR_INTEGRATION.md
- PERFORMANCE.md
- EXAMPLES.md
- playground/index.html

**Linked From:**
- docs/index.html (primary CTA)
- README.md
- All documentation pages

## File Hierarchy

```
cinematicRenderer2D/
│
├── 📄 README.md                          # Entry point
│   ├── Links to: docs/index.html
│   ├── Links to: All doc pages
│   └── Links to: playground/
│
├── 📁 docs/                              # Documentation root
│   │
│   ├── 🏠 index.html                     # Landing page
│   │   ├── Links to: All doc pages
│   │   ├── Links to: playground/
│   │   └── Links to: GitHub
│   │
│   ├── 📖 README.md                      # Doc index
│   │   └── Links to: All doc pages
│   │
│   ├── 🚀 GETTING_STARTED.md             # Quick start
│   │   ├── Links to: API.md
│   │   ├── Links to: Framework guides
│   │   └── Links to: playground/
│   │
│   ├── 📚 API.md                         # API reference
│   │   └── Links to: Examples
│   │
│   ├── 💡 EXAMPLES.md                    # Examples guide
│   │   ├── Links to: API.md
│   │   ├── Links to: playground/
│   │   └── Links to: Example files
│   │
│   ├── ⚛️ REACT_INTEGRATION.md           # React guide
│   │   ├── Links to: API.md
│   │   └── Links to: GETTING_STARTED.md
│   │
│   ├── 🅰️ ANGULAR_INTEGRATION.md         # Angular guide
│   │   ├── Links to: API.md
│   │   └── Links to: GETTING_STARTED.md
│   │
│   ├── ⚡ PERFORMANCE.md                 # Performance guide
│   │   └── Links to: API.md
│   │
│   ├── 🗺️ NAVIGATION.md                  # Navigation helper
│   │   └── Links to: All doc pages
│   │
│   └── 📋 SITE_STRUCTURE.md              # This file
│
├── 🎮 playground/                        # Interactive demo
│   ├── index.html
│   │   └── Links to: docs/index.html
│   ├── main.ts
│   └── examples/
│       ├── simple-demo-spec.json
│       ├── story-narration-spec.json
│       └── day-night-story-spec.json
│
└── 📦 examples/                          # Code examples
    └── (Same as playground/examples/)
```

## Key Integration Points

### 1. Playground → Documentation
**Location**: Bottom of control panel in playground/index.html
**Element**: Full-width primary button
**Text**: "Use This in Your Project"
**Target**: ../docs/index.html
**Purpose**: Convert playground users to library users

### 2. Documentation → Playground
**Locations**: 
- docs/index.html (hero section, try it live section)
- GETTING_STARTED.md (next steps)
- EXAMPLES.md (running examples)
- README.md (quick links)

**Purpose**: Allow documentation readers to experiment

### 3. Main README → Documentation
**Location**: Top of README.md
**Section**: Documentation
**Links**: All documentation pages
**Purpose**: Primary entry point for GitHub visitors

## User Journey Optimization

### Journey 1: Curious Developer
```
1. Finds library on GitHub
2. Reads README.md
3. Clicks "Try Playground" link
4. Experiments with examples
5. Clicks "Use This in Your Project"
6. Lands on docs/index.html
7. Clicks "Get Started"
8. Follows installation guide
9. Implements in project
```

### Journey 2: Framework Developer
```
1. Searches "React cinematic library"
2. Finds docs/index.html
3. Clicks React Integration link
4. Reads React guide
5. Checks API reference
6. Tests in playground
7. Implements in React app
```

### Journey 3: Advanced User
```
1. Already knows the library
2. Goes directly to API.md
3. References specific methods
4. Checks performance guide
5. Experiments in playground
6. Implements advanced features
```

## Mobile Navigation

On mobile devices, the structure adapts:
- Hamburger menu for documentation navigation
- Collapsible sections
- Touch-friendly buttons
- Responsive layouts
- Optimized for small screens

## Search Engine Optimization

Key pages optimized for discovery:
1. **docs/index.html** - Main landing page
2. **GETTING_STARTED.md** - Installation queries
3. **API.md** - API reference queries
4. **REACT_INTEGRATION.md** - React-specific queries
5. **ANGULAR_INTEGRATION.md** - Angular-specific queries

## Maintenance Notes

When adding new documentation:
1. Add link to docs/index.html
2. Add link to docs/README.md
3. Add link to docs/NAVIGATION.md
4. Update this SITE_STRUCTURE.md
5. Consider adding to main README.md

When updating navigation:
1. Verify all relative paths
2. Test on multiple devices
3. Check mobile responsiveness
4. Validate HTML/Markdown
5. Update site map diagrams

---

**Last Updated**: February 2026
**Maintained By**: cinematicRenderer2D Team
