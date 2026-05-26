---
name: xiaohongshu
description: Use when the user wants help with Xiaohongshu/RED browsing, feed refresh, post reading, profile metrics, note planning, titles, covers, captions, content calendars, account positioning, competitor analysis, or publishing workflows.
---

# Xiaohongshu

Use this skill for Xiaohongshu/RED content work.

## Available local tools

When the Xiaohongshu MCP server is available, prefer these tools for live website work:

- `open_xiaohongshu`: open the website in a persistent browser profile.
- `refresh_feed`: refresh the home feed and summarize visible post cards.
- `read_post`: read a post from a URL or a visible feed index.
- `profile_metrics`: open a profile page and extract visible profile/post statistics text.

The browser profile is stored locally at `~/.codex/xiaohongshu-browser-profile`, so the user can log in manually once and reuse that session.

## Default behavior

- Start with the practical result the user needs: note draft, title options, cover text, content calendar, account positioning, or analysis checklist.
- Keep answers direct and actionable.
- Ask for missing niche/audience/product details only when they materially change the output.
- If the user wants a post, provide:
  - title options
  - cover text options
  - opening hook
  - body structure
  - caption
  - hashtag suggestions

## Safety and account actions

- Do not claim to access Xiaohongshu unless a browser, connector, API, or supplied data is actually available.
- Do not log in, publish, comment, like, follow, scrape, or send messages without explicit user confirmation.
- Do not bypass platform limits, paywalls, anti-bot systems, or private content controls.
- For analysis, prefer user-supplied links, screenshots, exports, or public pages the user asks to inspect.
- Refreshing the feed, reading visible posts, and viewing the user's own visible profile data are allowed after the user asks for those actions.
- Do not publish, comment, like, follow, send private messages, bulk scrape, or collect private data without explicit confirmation for that exact action.
- If login is required, ask the user to complete login in the opened browser rather than requesting their password.

## Tone

- Chinese content should sound natural, specific, and non-generic.
- Avoid fake data. If metrics are needed but unavailable, say what data is missing and provide a fill-in template.
- For marketing copy, keep it concrete: pain point, scene, proof, method, result.
