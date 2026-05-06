# Chosen Warriors

Chosen Warriors is a Vite and React ministry website for prayer, media, events, giving, community connection, and the Chosen to Rescue foundation.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Lucide React
- Vitest
- React Testing Library

## Project Structure

```text
src/
  components/
    layout/       Shared page layout components
    ui/           Reusable UI primitives
  config/         Site-wide settings, navigation, and links
  content/        Ministry content displayed by sections
  sections/       Page sections composed by App.jsx
  test/           Test setup files
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run test:unit
npm run test:integration
npm run test:regression
```

## Testing

The test suite is organized by purpose:

- Unit tests cover reusable UI components.
- Integration tests cover interactive component behavior.
- Regression tests cover the main page structure and key calls to action.

Run everything with:

```bash
npm test
```

## Deployment

The repository includes an AWS Amplify build specification in `amplify.yml`. The production build outputs to `dist/`.

