#!/usr/bin/env python3
"""Local MCP server for assisted Xiaohongshu browser workflows.

This server intentionally works through the visible website. The user logs in
manually, and tools only read visible page content or navigate pages.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any


SERVER_NAME = "xiaohongshu"
SERVER_VERSION = "0.1.0"
PROFILE_DIR = Path(os.environ.get("XIAOHONGSHU_PROFILE_DIR", Path.home() / ".codex" / "xiaohongshu-browser-profile"))
HOME_URL = "https://www.xiaohongshu.com/explore"
PROFILE_URL = "https://www.xiaohongshu.com/user/profile"

_playwright = None
_context = None
_page = None


TOOLS: list[dict[str, Any]] = [
    {
        "name": "open_xiaohongshu",
        "description": "Open Xiaohongshu in a persistent browser profile. The user may need to log in manually the first time.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "Optional page to open. Defaults to the Xiaohongshu home feed.",
                }
            },
        },
    },
    {
        "name": "refresh_feed",
        "description": "Refresh the Xiaohongshu home feed and return visible note-card summaries.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 30,
                    "default": 10,
                }
            },
        },
    },
    {
        "name": "read_post",
        "description": "Read a visible Xiaohongshu post by URL, or open a visible feed card by index and extract visible text.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "url": {"type": "string"},
                "index": {
                    "type": "integer",
                    "minimum": 1,
                    "description": "1-based visible card index from the feed.",
                },
            },
        },
    },
    {
        "name": "profile_metrics",
        "description": "Open a Xiaohongshu profile page and extract visible profile/post statistics text.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "Optional profile URL. Defaults to the logged-in user's profile page when Xiaohongshu supports it.",
                }
            },
        },
    },
]


def respond(payload: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def text_result(text: str) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": text}]}


async def ensure_page(url: str | None = None):
    global _playwright, _context, _page
    try:
        from playwright.async_api import async_playwright
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Playwright is not installed. Run: "
            "powershell -ExecutionPolicy Bypass -File "
            f"\"{Path(__file__).with_name('install_browser_runtime.ps1')}\""
        ) from exc

    if _playwright is None:
        _playwright = await async_playwright().start()
    if _context is None:
        PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        try:
            _context = await _playwright.chromium.launch_persistent_context(
                str(PROFILE_DIR),
                headless=False,
                viewport={"width": 1440, "height": 1000},
            )
        except Exception as chromium_error:
            try:
                _context = await _playwright.chromium.launch_persistent_context(
                    str(PROFILE_DIR),
                    channel="msedge",
                    headless=False,
                    viewport={"width": 1440, "height": 1000},
                )
            except Exception as edge_error:
                raise RuntimeError(
                    "No usable browser was found. Install the Playwright browser runtime with: "
                    "python -m playwright install chromium. "
                    f"Chromium error: {chromium_error}. Edge error: {edge_error}"
                ) from edge_error
    if _page is None:
        _page = _context.pages[0] if _context.pages else await _context.new_page()
    if url:
        await _page.goto(url, wait_until="domcontentloaded", timeout=60000)
    return _page


async def visible_lines(page, max_lines: int = 80) -> list[str]:
    text = await page.locator("body").inner_text(timeout=10000)
    lines = []
    for raw in text.splitlines():
        line = " ".join(raw.split())
        if line and line not in lines:
            lines.append(line)
        if len(lines) >= max_lines:
            break
    return lines


async def extract_feed_cards(page, limit: int) -> list[dict[str, Any]]:
    cards = await page.evaluate(
        """(limit) => {
          const selectors = [
            'section.note-item',
            '.note-item',
            '[class*="note-item"]',
            'a[href*="/explore/"]',
            'a[href*="/discovery/item/"]'
          ];
          const seen = new Set();
          const out = [];
          for (const selector of selectors) {
            for (const el of document.querySelectorAll(selector)) {
              const box = el.getBoundingClientRect();
              if (box.width < 80 || box.height < 40) continue;
              const link = el.matches('a') ? el : el.querySelector('a[href]');
              const href = link ? link.href : '';
              const text = (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
              const key = href || text.slice(0, 80);
              if (!key || seen.has(key)) continue;
              seen.add(key);
              out.push({ index: out.length + 1, url: href, text: text.slice(0, 500) });
              if (out.length >= limit) return out;
            }
          }
          return out;
        }""",
        limit,
    )
    return cards


async def tool_open_xiaohongshu(args: dict[str, Any]) -> dict[str, Any]:
    url = args.get("url") or HOME_URL
    page = await ensure_page(url)
    title = await page.title()
    return text_result(
        f"Opened: {page.url}\n"
        f"Title: {title}\n"
        "If you are not logged in, complete login manually in the opened browser window."
    )


async def tool_refresh_feed(args: dict[str, Any]) -> dict[str, Any]:
    limit = int(args.get("limit") or 10)
    page = await ensure_page(HOME_URL)
    await page.reload(wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(2500)
    cards = await extract_feed_cards(page, limit)
    if not cards:
        lines = await visible_lines(page, 40)
        return text_result("No post cards were recognized. Current visible page text:\n" + "\n".join(lines))
    return text_result(json.dumps({"url": page.url, "cards": cards}, ensure_ascii=False, indent=2))


async def tool_read_post(args: dict[str, Any]) -> dict[str, Any]:
    page = await ensure_page()
    url = args.get("url")
    index = args.get("index")
    if url:
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    elif index is not None:
        cards = await extract_feed_cards(page, max(int(index), 10))
        target = next((card for card in cards if card["index"] == int(index)), None)
        if not target or not target.get("url"):
            return text_result(f"Could not find an openable post at index {index}. Call refresh_feed first to inspect current cards.")
        await page.goto(target["url"], wait_until="domcontentloaded", timeout=60000)
    else:
        return text_result("Pass a url, or pass index to read a visible card from the current feed.")
    await page.wait_for_timeout(2000)
    lines = await visible_lines(page, 120)
    return text_result(json.dumps({"url": page.url, "visible_text": lines}, ensure_ascii=False, indent=2))


async def tool_profile_metrics(args: dict[str, Any]) -> dict[str, Any]:
    url = args.get("url") or PROFILE_URL
    page = await ensure_page(url)
    await page.wait_for_timeout(2500)
    lines = await visible_lines(page, 120)
    metric_like = [
        line for line in lines
        if any(token in line for token in ["\u83b7\u8d5e", "\u6536\u85cf", "\u7c89\u4e1d", "\u5173\u6ce8", "\u8d5e\u8fc7", "\u7b14\u8bb0", "\u6d4f\u89c8", "\u70b9\u8d5e", "\u8bc4\u8bba"])
    ]
    return text_result(json.dumps({"url": page.url, "metrics_or_relevant_text": metric_like, "visible_text": lines}, ensure_ascii=False, indent=2))


async def call_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    if name == "open_xiaohongshu":
        return await tool_open_xiaohongshu(args)
    if name == "refresh_feed":
        return await tool_refresh_feed(args)
    if name == "read_post":
        return await tool_read_post(args)
    if name == "profile_metrics":
        return await tool_profile_metrics(args)
    raise RuntimeError(f"Unknown tool: {name}")


async def handle(request: dict[str, Any]) -> None:
    method = request.get("method")
    request_id = request.get("id")
    try:
        if method == "initialize":
            result = {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
            }
        elif method == "notifications/initialized":
            return
        elif method == "tools/list":
            result = {"tools": TOOLS}
        elif method == "tools/call":
            params = request.get("params") or {}
            result = await call_tool(params.get("name"), params.get("arguments") or {})
        else:
            raise RuntimeError(f"Unsupported method: {method}")
        if request_id is not None:
            respond({"jsonrpc": "2.0", "id": request_id, "result": result})
    except Exception as exc:
        if request_id is not None:
            respond({"jsonrpc": "2.0", "id": request_id, "error": {"code": -32000, "message": str(exc)}})


async def main() -> None:
    global _playwright, _context
    try:
        while True:
            line = await asyncio.to_thread(sys.stdin.readline)
            if not line:
                break
            try:
                await handle(json.loads(line))
            except json.JSONDecodeError:
                continue
    finally:
        if _context is not None:
            await _context.close()
            _context = None
        if _playwright is not None:
            await _playwright.stop()
            _playwright = None


if __name__ == "__main__":
    asyncio.run(main())
