# Akewak Jeba — Portfolio

A Quarto-based personal research portfolio with a live GitHub activity layer and automated GitHub Pages deployment.

## What changed

- Redesigned responsive homepage with modern cards, metrics, project highlights, and dark mode.
- Live GitHub repository/profile data loaded from `data/site-pulse.json`.
- Automated refresh **4 times per day** using GitHub Actions.
- Every scheduled refresh updates real website data and creates a commit on `master`.
- The same workflow renders the Quarto site and publishes it to `gh-pages`.
- Improved Projects, Publications, Writing, CV, and Contact pages.
- Removed the duplicated Tailwind CDN dependency and replaced it with a self-contained custom design system.

## Automated schedule

The workflow runs at **03:17, 09:17, 15:17, and 21:17 Europe/Helsinki time**. GitHub handles daylight-saving changes through the workflow timezone setting.

GitHub Actions cron is defined in `.github/workflows/daily-git-commits.yml`.

## Contribution attribution

Scheduled commits are authored with:

- name: repository owner (`ake123`)
- email: `akeketema@yahoo.com` (the same author email already used by your existing manual commits)

For GitHub to attribute these commits to your contribution graph, the commit email must be associated with your GitHub account and the commits must land on the repository's default branch. Because this email is already used in the repository’s existing manual commits, it is a better attribution choice than a generic bot address. If you later change your verified GitHub email, update this workflow value too.

## Local preview

Install Quarto, then run:

```bash
quarto preview
```

To test the live-data update locally:

```bash
python3 scripts/update_site_pulse.py
```

## Deployment

The workflow publishes to the `gh-pages` branch. In GitHub repository settings, GitHub Pages should use the `gh-pages` branch as its source.
