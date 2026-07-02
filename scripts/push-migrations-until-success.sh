#!/usr/bin/env bash
# Run supabase db push until success or no progress after fix pass.
set -euo pipefail
cd "$(dirname "$0")/.."

MAX_ATTEMPTS=25
for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  echo "=== DB PUSH ATTEMPT $attempt / $MAX_ATTEMPTS ==="
  set +e
  output=$(yes | npx supabase db push --include-all 2>&1)
  status=$?
  set -e
  echo "$output" | tail -30

  if echo "$output" | grep -qE "Finished supabase db push|Remote database is up to date"; then
    echo "SUCCESS: All migrations applied."
    exit 0
  fi

  if [ "$status" -eq 0 ]; then
    echo "SUCCESS: db push exited 0."
    exit 0
  fi

  err_line=$(echo "$output" | grep "^ERROR:" | tail -1 || true)
  mig_line=$(echo "$output" | grep "Applying migration" | tail -1 || true)
  echo "FAILED: $err_line"
  echo "AT: $mig_line"

  python3 scripts/fix-migrations-idempotent.py >/dev/null || true
done

echo "Stopped after $MAX_ATTEMPTS attempts."
exit 1
