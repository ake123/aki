#!/usr/bin/env python3
"""Refresh public GitHub data used by the portfolio.

The file changes on every scheduled run, so each cron execution creates a
meaningful commit while also keeping the live portfolio status current.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "site-pulse.json"
OWNER = os.getenv("GITHUB_REPOSITORY_OWNER", "ake123")
TOKEN = os.getenv("GITHUB_TOKEN", "")
RUN_NUMBER = int(os.getenv("GITHUB_RUN_NUMBER", "0"))


def github_json(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "akewak-portfolio-refresh",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    request = Request(url, headers=headers)
    with urlopen(request, timeout=20) as response:
        return json.load(response)


def read_previous() -> dict:
    try:
        return json.loads(OUT.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def main() -> None:
    now_utc = datetime.now(timezone.utc)
    now_helsinki = now_utc.astimezone(ZoneInfo("Europe/Helsinki"))
    previous = read_previous()

    profile = None
    repos = None
    api_status = "ok"
    try:
        profile = github_json(f"https://api.github.com/users/{OWNER}")
        repos = github_json(
            f"https://api.github.com/users/{OWNER}/repos?per_page=100&sort=updated"
        )
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        api_status = f"fallback:{type(exc).__name__}"

    previous_github = previous.get("github", {})
    github = {
        "login": OWNER,
        "name": (profile or {}).get("name") or previous_github.get("name") or "Akewak Jeba",
        "followers": (profile or {}).get("followers", previous_github.get("followers")),
        "public_repos": (profile or {}).get("public_repos", previous_github.get("public_repos")),
        "profile_url": (profile or {}).get("html_url") or f"https://github.com/{OWNER}",
        "profile_updated_at": (profile or {}).get("updated_at", previous_github.get("profile_updated_at")),
    }

    if isinstance(repos, list):
        candidates = [
            repo for repo in repos
            if not repo.get("fork") and not repo.get("archived")
        ]
        # Balance active work and community signal. Pinned repos are not exposed by
        # the REST API, so rank by stars first and recent activity second.
        candidates.sort(
            key=lambda repo: (
                repo.get("stargazers_count", 0),
                repo.get("pushed_at") or "",
            ),
            reverse=True,
        )
        selected = candidates[:6]
        repo_data = [
            {
                "name": repo.get("name"),
                "description": repo.get("description") or "Open-source project",
                "url": repo.get("html_url"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "pushed_at": repo.get("pushed_at"),
            }
            for repo in selected
        ]
    else:
        repo_data = previous.get("repositories", [])

    refresh_number = RUN_NUMBER or int(previous.get("refresh_number", 0)) + 1
    payload = {
        "last_updated_utc": now_utc.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "last_updated_helsinki": now_helsinki.isoformat(timespec="seconds"),
        "refresh_number": refresh_number,
        "refresh_slot_utc": now_utc.strftime("%H:%M"),
        "api_status": api_status,
        "github": github,
        "repositories": repo_data,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated {OUT.relative_to(ROOT)} at {payload['last_updated_helsinki']}")


if __name__ == "__main__":
    main()
