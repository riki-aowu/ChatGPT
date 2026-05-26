# Xiaohongshu Codex Plugin

Local Codex plugin for Xiaohongshu/RED workflows.

## What It Can Do

- Open Xiaohongshu in a persistent local browser profile.
- Refresh the home feed and summarize visible note cards.
- Read a visible post by URL or feed-card index.
- Open a profile page and extract visible profile/post metrics text.
- Help plan, draft, and analyze Xiaohongshu notes.

## Install In Codex

This repository contains the plugin under `plugins/xiaohongshu`.

For local use, copy or keep the plugin at:

```text
C:\Users\5\plugins\xiaohongshu
```

Then make sure your personal marketplace contains:

```json
{
  "name": "xiaohongshu",
  "source": {
    "source": "local",
    "path": "./plugins/xiaohongshu"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

The local marketplace file is usually:

```text
C:\Users\5\.agents\plugins\marketplace.json
```

## Browser Runtime

The MCP server uses Playwright and falls back to Microsoft Edge when the Playwright Chromium runtime is unavailable.

Install dependencies:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\5\plugins\xiaohongshu\scripts\install_browser_runtime.ps1
```

If Chromium download is slow or unavailable, Edge fallback can still work on Windows.

## Tools

- `open_xiaohongshu`
- `refresh_feed`
- `read_post`
- `profile_metrics`

The first time you use the browser tools, log in manually in the opened browser window. The session is stored at:

```text
~\.codex\xiaohongshu-browser-profile
```

## Boundaries

This plugin only reads visible pages and navigates the public website you open. It should not publish, comment, like, follow, send messages, bulk scrape, bypass platform limits, or collect private data without explicit confirmation.
