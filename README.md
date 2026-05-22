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

## API Security

Set `ADMIN_API_KEY` in production before enabling admin API writes from trusted server-side tools. Public visitors can read published media through `/api/platform/public`; private contact and prayer records remain behind `/api/platform` and require the `x-admin-api-key` header. Do not expose that key in browser code.

The backend also adds baseline security headers, removes the Express signature header, limits JSON payload size, and applies a simple API rate limit. Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` for your host.

When the frontend is deployed separately from the Express API, set `VITE_API_BASE_URL` to the API origin before running `npm run build`. Static hosting alone will not serve `/api/*`; deploy the backend on a Node host or replace those routes with serverless functions.

## Database

The backend uses SQLite through Node's built-in `node:sqlite` module for local development when `DATABASE_URL` is empty. By default, local records are stored at `data/chosen-warriors.sqlite`, which is ignored by Git.

For production, set `DATABASE_URL` to a PostgreSQL connection string. The server creates the relational tables it needs at startup and stores contact messages, prayer requests, members, donation intents, event registrations, subscribers, admin-uploaded gallery images, and admin-loaded YouTube videos. The SQL reference lives in `server/schema.postgres.sql`.

Terraform in `infra/terraform` defines an encrypted PostgreSQL RDS instance with managed master credentials. After applying it, get the endpoint outputs and the generated password from the Secrets Manager secret ARN, then set `DATABASE_URL` on the deployed API host:

```bash
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform plan
```

Do not point browser code directly at RDS. Keep the database private and let the Express API read/write records.

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

The repository includes an AWS Amplify build specification in `amplify.yml` for the static frontend. The production build outputs to `dist/`. The Express API must be deployed separately unless the Amplify project is extended with serverless functions for `/api/*`.
