#!/usr/bin/env python3
"""Download and play tutusagi/ai-fishing-game with a real upstream engine."""
from __future__ import annotations

import importlib.util
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
ENGINE_PATH = ROOT / "engine.py"
UPSTREAM_ENGINE = "https://raw.githubusercontent.com/tutusagi/ai-fishing-game/main/engine.py"


def ensure_engine() -> None:
    if ENGINE_PATH.exists():
        return
    print("Downloading upstream engine…")
    try:
        with urllib.request.urlopen(UPSTREAM_ENGINE, timeout=30) as response:
            ENGINE_PATH.write_bytes(response.read())
    except Exception as exc:
        raise SystemExit(f"Could not download the upstream engine: {exc}") from exc


def load_engine():
    spec = importlib.util.spec_from_file_location("ai_fishing_engine", ENGINE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load engine.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def act(engine, command: str) -> None:
    print(f"\n{'=' * 20}  {command}  {'=' * 20}")
    print(engine.cmd(command))


def main() -> None:
    ensure_engine()
    engine = load_engine()
    engine.new_game(20260626)
    print("# 寒枝的真实钓鱼战报 🎣")
    print("引擎：tutusagi/ai-fishing-game | 种子：20260626")
    # A short blind-play outing: explore first, then buy bait and keep fishing.
    act(engine, "status")
    act(engine, "cast 5 stop=new,rare,event")
    act(engine, "inventory")
    act(engine, "sell all")
    act(engine, "buy basic_worm 10; cast 10 stop=new,rare,event")
    act(engine, "status")
    act(engine, "encyclopedia")


if __name__ == "__main__":
    main()
