#!/usr/bin/env python3
"""Refresh the theme-matched stats badge of the profile README."""

from __future__ import annotations

import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

USERNAME = os.environ.get("GH_USERNAME", "nkoumougrinnel")
TOKEN = os.environ.get("GITHUB_TOKEN")
ASSETS = Path(__file__).resolve().parents[2] / "assets"

FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
PILL_WIDTH = 210
PILL_GAP = 8
STATS = ASSETS / "stats.svg"


def fetch(url: str, *, headers: dict | None = None) -> bytes:
    request_headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": f"{USERNAME}-profile-readme",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if headers:
        request_headers.update(headers)
    if TOKEN and "Authorization" not in request_headers:
        request_headers["Authorization"] = f"Bearer {TOKEN}"

    request = urllib.request.Request(url, headers=request_headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def github_api(url: str) -> dict | list:
    try:
        return json.loads(fetch(url))
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        print(f"GitHub API error {error.code}: {message}", file=sys.stderr)
        raise
    except urllib.error.URLError as error:
        print(f"Network error: {error.reason}", file=sys.stderr)
        raise


def escape(value: object) -> str:
    return html.escape(str(value), quote=True)


def icon(kind: str) -> str:
    if kind == "followers":
        return """
    <g fill="none" stroke="#7CA5D8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22" cy="17" r="4"/>
      <path d="M15 30c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/>
      <path d="M29 14.5a3 3 0 0 1 0 5.7M31 23.8c2.1.7 3.5 2.4 3.5 4.7"/>
    </g>"""
    if kind == "stars":
        return """
    <path d="M22 12l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3 1.2-6.8-5-4.9 6.9-1L22 12z" fill="none" stroke="#7CA5D8" stroke-width="1.7" stroke-linejoin="round"/>"""
    return """
    <g fill="none" stroke="#7CA5D8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 22s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"/>
      <circle cx="22" cy="22" r="3"/>
    </g>"""


def build_stats_badge(followers: object, stars: object, views: object) -> str:
    pills = [
        ("followers", "FOLLOWERS", followers),
        ("stars", "STARS", stars),
        ("views", "PROFILE VIEWS", views),
    ]
    groups = []
    for index, (kind, label, value) in enumerate(pills):
        offset = index * (PILL_WIDTH + PILL_GAP)
        groups.append(
            f"""  <g transform="translate({offset} 0)">
    <rect x="1" y="1" width="{PILL_WIDTH - 2}" height="42" rx="12" fill="url(#bg)" stroke="#3E6A9E" stroke-opacity="0.7"/>
    {icon(kind)}
    <text x="44" y="27" font-family="{FONT}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="#A9BCD4">{escape(label)}</text>
    <text x="192" y="28" text-anchor="end" font-family="{FONT}" font-size="18" font-weight="700" fill="#FFFFFF">{escape(value)}</text>
  </g>"""
        )

    width = len(pills) * PILL_WIDTH + (len(pills) - 1) * PILL_GAP
    return f"""<svg width="{width}" height="44" viewBox="0 0 {width} 44" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Followers {escape(followers)}, stars {escape(stars)}, profile views {escape(views)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#161B22"/>
      <stop offset="1" stop-color="#263B5B"/>
    </linearGradient>
  </defs>
{chr(10).join(groups)}
</svg>
"""


def profile_views() -> str | None:
    url = (
        f"https://komarev.com/ghpvc/?username={USERNAME}"
        "&style=flat-square&color=263B5B&label=PROFILE+VIEWS"
    )
    try:
        svg = fetch(url).decode("utf-8", errors="replace")
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        print(f"Could not read profile views: {error}", file=sys.stderr)
        return None

    texts = re.findall(r"<text[^>]*>([^<]*)</text>", svg)
    values = [
        text.strip()
        for text in texts
        if re.fullmatch(r"[\d,.]+[kKmM]?", text.strip())
    ]
    return values[-1] if values else None


def main() -> int:
    user = github_api(f"https://api.github.com/users/{USERNAME}")
    repos = github_api(
        f"https://api.github.com/users/{USERNAME}/repos"
        "?per_page=100&sort=updated&type=owner"
    )

    stars = sum(int(repo.get("stargazers_count") or 0) for repo in repos)
    views = profile_views()
    ASSETS.mkdir(exist_ok=True)
    if views is None and STATS.exists():
        print("Keeping existing stats badge (profile views unavailable)")
    else:
        STATS.write_text(
            build_stats_badge(
                user.get("followers", 0),
                stars,
                views if views is not None else "—",
            ),
            encoding="utf-8",
        )

    print("Updated stats badge")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
