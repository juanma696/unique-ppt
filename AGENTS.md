# AGENTS.md - AI Coding Agent Guidelines

> Essential context for AI coding agents working on this repository.

## Project Overview

**InspoSlides** - AI-powered presentation slides generator with image generation and PPTX export.

- **Tech Stack**: React 18, Vite, Tailwind CSS, IndexedDB
- **Dependencies**: lucide-react (icons), pptxgenjs (export)
- **APIs**: OpenAI, Google Gemini, Imagen

---

## Build / Lint / Test Commands

```bash
npm install           # Install dependencies
npm run dev           # Development server (localhost:5173)
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # ESLint check

# Single test (if configured):
npm test -- --run src/path/to/test.jsx
npx vitest run path/to/test
```

---

## Project Structure

```
src/
├── components/       # React components
│   ├── SlideRenderer.jsx    # Slide layout rendering
│   ├── SettingsModal.jsx    # API settings modal
│   ├── PreviewSection.jsx   # Slide preview & export
│   └── index.js
├── constants/        # App constants
│   ├── config.js     # API keys, DB config
│   ├── theme.js      # Tailwind theme colors
│   ├── layouts.jsx   # Slide layouts, default config
│   └── index.js
├── hooks/            # Custom React hooks
│   ├── useApp.js     # useApiConfig, usePptLib, useCooldown, useLogs
│   └── index.js
├── services/         # API layer
│   ├── api.js        # callTextAI, callImageAI
│   └── index.js
├── utils/            # Utility functions
│   ├── db.js         # IndexedDB operations
│   ├── helpers.js    # sleep, fetchWithRetry, urlToBase64
│   └── index.js
├── styles/
│   └── index.css     # Tailwind imports
├── App.jsx           # Main application
└── main.jsx          # Entry point
```

---

## Code Style Guidelines

### Imports

```javascript
import { useState, useEffect } from "react";
import { Icon } from "lucide-react";
import { THEME, LAYOUTS } from "@/constants";
import { dbUtils } from "@/utils";
import { callTextAI } from "@/services";
import { useApiConfig } from "@/hooks";
import { Component } from "@/components";
```

Use `@/` alias for src imports.

### Formatting

| Rule            | Value         |
| --------------- | ------------- |
| Indentation     | 2 spaces      |
| Quotes          | Single quotes |
| Semicolons      | Required      |
| Trailing commas | Yes           |
| Arrow functions | Preferred     |

### Naming Conventions

| Entity     | Convention      | Example         |
| ---------- | --------------- | --------------- |
| Components | PascalCase      | `SlideRenderer` |
| Functions  | camelCase       | `handleAnalyze` |
| Constants  | SCREAMING_SNAKE | `DB_NAME`       |
| Hooks      | use + camelCase | `useApiConfig`  |

### Error Handling

```javascript
try {
  const result = await callTextAI(prompt, systemPrompt, apiConfig);
} catch (err) {
  console.error(err);
  setErrorMsg("User-friendly message");
}
```

### Tailwind CSS

```javascript
const THEME = {
  bg: "bg-slate-950",
  card: "bg-slate-900",
  accent: "text-amber-400",
  error: "text-rose-400",
};

className = "flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg";
```

---

## Key Data Structures

### Slide Object

```javascript
{
  id: 1,
  layout: 'cover' | 'split_right' | 'split_left' | 'glass' | 'minimal',
  title: 'Slide Title',
  content: ['Point 1', 'Point 2'],
  imagePrompt: 'English description',
  status: 'pending' | 'generating' | 'done' | 'error',
  hasImage: boolean
}
```

### Application Stages

```
'input' → 'analyzing' → 'edit_outline' → 'generating_images' → 'preview' → 'exporting'
```

---

## Important Considerations

1. **Chinese UI**: User-facing strings are in Chinese.
2. **API Keys**: `SYSTEM_API_KEY` in constants/config.js. Never hardcode.
3. **Browser APIs**: Uses IndexedDB, localStorage, fetch.
4. **pptxgenjs**: Check `pptLibReady` before export.
5. **Rate Limiting**: Handle with `useCooldown` hook.

---

## Common Tasks

### Adding a New Component

1. Create file in `src/components/`
2. Export from `src/components/index.js`
3. Import using `@/components`

### Adding API Protocol

1. Add option in `SettingsModal.jsx`
2. Add branch in `services/api.js`

### Database Operations

```javascript
import { dbUtils } from "@/utils";
await dbUtils.save(`slide-${id}`, base64Data);
const img = await dbUtils.get(`slide-${id}`);
await dbUtils.clear();
```

### Adding a New Layout

1. Add to `LAYOUTS` in `constants/layouts.jsx`
2. Add case in `SlideRenderer.jsx`
3. Add export case in `App.jsx` handleExport
