# Riccardo Viola — Portfolio

Personal portfolio built with Angular 21. It presents an overview of my work experience and provides a detail page for each company, including client engagements, sectors, roles, work periods, and technologies.

## Features

- Responsive home page with an introduction and work-experience timeline.
- Company detail pages with client engagement information, sector icons, and technology icons.
- Work periods displayed with approximate durations.
- Skills dashboard with technology usage grouped by category and charted against total work experience, from the first project through today.

## Requirements

- Node.js and npm.

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open `http://localhost:4200/`. The server reloads when source files change.

On Windows PowerShell, if script execution is restricted, run the commands through `npm.cmd` (for example, `npm.cmd install` and `npm.cmd start`) instead of invoking `ng.ps1` directly.

## Available commands

| Command                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `npm start`            | Start the local development server.                            |
| `npm run build`        | Create a production build in `dist/`.                          |
| `npm test`             | Run unit tests with the configured test runner.                |
| `npm run watch`        | Rebuild on source changes using the development configuration. |
| `npm run format`       | Format source files with Prettier.                             |
| `npm run format:check` | Check source formatting with Prettier.                         |

## Project data

Portfolio content is stored in JSON files under `src/app/assets/data/`:

- `companies.json` contains company and client-engagement information; each client references its sector by ID from `sectors.json`.
- `technologies.json` contains the technology catalogue and icon paths.
- `sectors.json` contains the sector catalogue and icon paths.
- Skills estimates use the dates of client engagements that list each technology; overlapping engagements for the same technology are counted once, and different technologies may overlap.

Images are stored in `src/app/assets/images/`, grouped into `companies/`, `sectors/`, and `technologies/`.

## Changelog

See [changelog.md](./changelog.md) for a summary of the committed project history.
