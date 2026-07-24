# FrontEnd Coding Standard & Guidelines v1.0.0

---

## 1. React 19 & TypeScript Guidelines

1. **Strict Type Definitions**: No `any` types. Define explicit `interface` or `type` contracts for components, props, and API response payload interfaces.
2. **Functional Component Structure**: Use React 19 functional components (`React.FC<Props>`) with explicit destructured props.
3. **Naming Conventions**:
   - PascalCase for Component files and React components (`FullLayout.tsx`, `Dashboard.tsx`).
   - camelCase for hooks (`useAuth`), utility functions, state variables, and handlers (`handleClick`).
4. **State & Effects Scoping**: Keep state localized inside components or dedicated Context providers. Custom hooks should encapsulate API calls and state logic.

---

## 2. UI & Styling Rules

1. **MUI System Theme Token Usage**: Utilize `@mui/material` sx prop and `theme.ts` design tokens for consistent colors, spacing, and typography.
2. **Icon & Visual Elements**: Use `@tabler/icons-react` icons for navigation and status indicators.
3. **Linting & Code Formatting**: Ensure strict compliance with ESLint 10 (`eslint.config.js`) and TypeScript 6 compiler checks (`tsc -b`).