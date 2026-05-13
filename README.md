# Chosen Warriors

Chosen Warriors is a Vite and React ministry website for prayer, media, events, giving, community connection, and the Chosen to Rescue foundation.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Express
- Nodemailer
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
server/           Express backend for email delivery and production hosting
```

## Email Setup

Contact messages and prayer requests post to the backend and send email to `chosenwarriorsofficial@gmail.com` through SMTP. Copy `.env.example` to `.env` and add the ministry email credentials:

```bash
cp .env.example .env
```

For Gmail, use an app password for `SMTP_PASS`. Without SMTP variables, the backend runs in dry-run mode for local testing.

## Database

The backend uses SQLite through Node's built-in `node:sqlite` module. By default, records are stored at `data/chosen-warriors.sqlite`, which is ignored by Git. The database stores contact messages, prayer requests, admin-uploaded gallery images, and admin-loaded YouTube videos.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run test:all
npm run test:unit
npm run test:integration
npm run test:regression
npm run test:e2e
npm run test:e2e:headed
```

## Testing

The test suite is organized by purpose:

- Unit tests cover reusable UI components.
- Integration tests cover interactive component behavior.
- Regression tests cover the main page structure and key calls to action.
- End-to-end tests run in Chromium through Playwright and cover website flow, responsive navigation, forms, layout overflow, and lazy media loading.

Run everything with:

```bash
npm run test:all
```

Before the first local E2E run, install Chromium:

```bash
npx playwright install chromium
```

## Deployment

The repository includes an AWS Amplify build specification in `amplify.yml`. The production build outputs to `dist/`.
