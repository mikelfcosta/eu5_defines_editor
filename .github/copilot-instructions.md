# Project Guidelines — EUV Defines Editor

## Overview
A web-based editor for EUV defines. Built entirely with AI-assisted development using GitHub Copilot agents and subagents.

## Code Style
- Use modern JavaScript/TypeScript conventions
- Prefer `const` over `let`; avoid `var`
- Use meaningful, descriptive variable and function names
- Keep functions small and focused on a single responsibility

## Architecture
- This is a web application project
- Keep source code in `src/`
- Keep static/public assets in `public/`
- Keep build output in `dist/` (gitignored)

## Build and Test
- Package manager: npm
- Run `npm install` to install dependencies
- Run `npm run build` to build the project
- Run `npm test` to run tests
- Run `npm start` to start the dev server

## Conventions
- Use semantic HTML elements where possible
- Prefer CSS custom properties for theming
- Write accessible markup (ARIA attributes, alt text, keyboard navigation)
- Handle errors at system boundaries; don't over-defensively code internal logic
- Keep dependencies minimal — only add packages when clearly justified
