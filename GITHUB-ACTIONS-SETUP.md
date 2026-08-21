# GitHub Actions workflow

The actual GitHub Actions workflow is here:

```text
.github/workflows/daily-git-commits.yml
```

The `.github` folder is a hidden folder on macOS/Linux because its name begins with a dot.

## Show it on macOS

In Finder press:

```text
Command + Shift + .
```

That toggles hidden files and folders on/off.

## What the workflow does

- Runs 4 times every day at 03:17, 09:17, 15:17, and 21:17 Europe/Helsinki time.
- Runs `scripts/update_site_pulse.py`.
- Updates `data/site-pulse.json` with a new timestamp and current GitHub portfolio data.
- Commits that changed file to the `master` branch.
- Pushes the commit to GitHub.
- Renders the Quarto website.
- Publishes the rendered website to `gh-pages`.

## First test on GitHub

After pushing this project to GitHub:

1. Open the repository.
2. Click **Actions**.
3. Select **Daily Git commits and portfolio deploy**.
4. Click **Run workflow**.
5. Choose the `master` branch and run it.
6. Open the repository commit history and verify that a new `chore(portfolio): automated refresh ...` commit appears.

## Important

The workflow must remain under `.github/workflows/`. A YAML file elsewhere in the repository is not recognized as a GitHub Actions workflow.
