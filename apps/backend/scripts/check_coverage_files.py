#!/usr/bin/env python3
"""Fail if any non-empty app module has 0% coverage."""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from coverage import Coverage
except ImportError:
    print("coverage package required")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1] / "app"
SKIP_NAMES = {"__init__.py"}


def main() -> int:
    cov = Coverage()
    cov.load()
    data = cov.get_data()
    measured = list(data.measured_files())
    missing = []
    for path in sorted(ROOT.rglob("*.py")):
        if path.name in SKIP_NAMES:
            continue
        if path.stat().st_size == 0:
            continue
        rel = path.relative_to(ROOT.parent)
        file_cov = None
        for m in measured:
            norm = m.replace("\\", "/")
            if norm.endswith("/" + str(rel).replace("\\", "/")) or norm.endswith(str(path)):
                file_cov = m
                break
        if file_cov is None:
            missing.append(str(rel))
            continue
        filename, statements, excluded, missing_lines, _ = cov.analysis2(file_cov)
        if statements and len(missing_lines) >= len(statements):
            missing.append(str(rel))
    if missing:
        print("Modules with 0% coverage:")
        for m in missing:
            print(f"  - {m}")
        return 1
    print("All non-empty app modules have some coverage.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
