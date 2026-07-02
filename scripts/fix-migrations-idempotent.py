#!/usr/bin/env python3
"""Make Supabase migration SQL files idempotent for fresh-database db push."""
from __future__ import annotations

import re
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "supabase" / "migrations"


def fix_invalid_policy_syntax(content: str) -> str:
    """PostgreSQL does not support CREATE POLICY IF NOT EXISTS."""
    return re.sub(
        r"CREATE POLICY IF NOT EXISTS\s+",
        "CREATE POLICY ",
        content,
        flags=re.I,
    )


def fix_policies_and_triggers(content: str) -> str:
    lines = content.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # CREATE POLICY — name on this line, table may be on next lines
        pm = re.match(r'^CREATE POLICY\s+"([^"]+)"', line, re.I)
        if pm:
            pname = pm.group(1)
            table = None
            for j in range(i, min(i + 8, len(lines))):
                om = re.search(r"\bON\s+((?:public\.)?\w+)", lines[j], re.I)
                if om:
                    table = om.group(1)
                    break
            if table:
                drop = f'DROP POLICY IF EXISTS "{pname}" ON {table};'
                if not any(drop in x for x in out[-8:]):
                    out.append(drop)

        tm = re.match(r"^CREATE TRIGGER\s+(\w+)", line, re.I)
        if tm:
            tname = tm.group(1)
            table = None
            for j in range(i, min(i + 8, len(lines))):
                om = re.search(r"\bON\s+((?:public\.)?\w+)", lines[j], re.I)
                if om:
                    table = om.group(1)
                    break
            if table:
                drop = f"DROP TRIGGER IF EXISTS {tname} ON {table};"
                if not any(drop in x for x in out[-8:]):
                    out.append(drop)

        out.append(line)
        i += 1
    return "\n".join(out)


def fix_indexes_and_tables(content: str) -> str:
    content = re.sub(
        r"\bCREATE UNIQUE INDEX(?!\s+IF\s+NOT\s+EXISTS)\b",
        "CREATE UNIQUE INDEX IF NOT EXISTS",
        content,
        flags=re.I,
    )
    content = re.sub(
        r"\bCREATE INDEX(?!\s+IF\s+NOT\s+EXISTS)\b",
        "CREATE INDEX IF NOT EXISTS",
        content,
        flags=re.I,
    )
    content = re.sub(
        r"CREATE TABLE\s+(?!IF\s+NOT\s+EXISTS)(public\.\w+)",
        r"CREATE TABLE IF NOT EXISTS \1",
        content,
        flags=re.I,
    )
    content = re.sub(
        r"CREATE TABLE\s+(?!IF\s+NOT\s+EXISTS)(?!public\.)(\w+)\s*\(",
        r"CREATE TABLE IF NOT EXISTS \1 (",
        content,
        flags=re.I,
    )
    return content


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = fix_invalid_policy_syntax(original)
    updated = fix_policies_and_triggers(updated)
    updated = fix_indexes_and_tables(updated)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        if process_file(path):
            changed.append(path.name)
    print(f"Updated {len(changed)} migration files")


if __name__ == "__main__":
    main()
