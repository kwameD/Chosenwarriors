# Chosen Warriors

Chosen Warriors is a Vite and React ministry website for prayer, events, community connection, and the Chosen to Rescue foundation.

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

Contact messages and prayer requests post to the backend and send email to `chosenwarriorsofficial@gmail.com`. Local development can use SMTP by copying `.env.example` to `.env` and adding ministry email credentials:

```bash
cp .env.example .env
```

Without SMTP variables, the local backend runs in dry-run mode for testing.

In production, Terraform deploys an AWS Lambda API and configures Amplify to proxy `/api/contact`, `/api/prayer`, `/api/subscribe`, `/api/content`, and `/api/admin/login` to it. Production email is sent through AWS SES, not Gmail SMTP. After `terraform apply`, verify the SES sender identity email sent to `chosenwarriorsofficial@gmail.com`. If the AWS account is still in the SES sandbox, request production access before sending to unverified recipients.

## Database

The backend uses SQLite through Node's built-in `node:sqlite` module. By default, records are stored at `data/chosen-warriors.sqlite`, which is ignored by Git. The database stores contact messages, prayer requests, and admin-edited site content.

## Admin Editing

Visit `#admin` to upload pictures from desktop or mobile, update the home page event highlight, event dates, event times, event details, and ministry links. Set the Terraform `admin_password` variable before using the admin editor in production:

```bash
cd infra/terraform
terraform apply -var 'admin_password=YOUR_ADMIN_PASSWORD'
```

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
- End-to-end tests run in Chromium through Playwright and cover website flow, responsive navigation, forms, layout overflow, and removed-route guards.

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
