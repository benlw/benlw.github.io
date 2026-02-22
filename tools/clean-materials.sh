#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$ROOT_DIR/.notes-materials"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Materials directory not found: $TARGET_DIR" >&2
  exit 1
fi

# Safety guard: this script only operates on the repository-local materials folder.
CANONICAL_TARGET="$(cd "$TARGET_DIR" && pwd)"
EXPECTED_TARGET="$ROOT_DIR/.notes-materials"
if [[ "$CANONICAL_TARGET" != "$EXPECTED_TARGET" ]]; then
  echo "Refusing to clean unexpected directory: $CANONICAL_TARGET" >&2
  exit 1
fi

KEEP_FILES=(
  "_workflow.md"
  "_style-guide.md"
)

cd "$TARGET_DIR"

deleted=0
for entry in .* *; do
  if [[ "$entry" == "." || "$entry" == ".." ]]; then
    continue
  fi

  keep=false
  for keep_file in "${KEEP_FILES[@]}"; do
    if [[ "$entry" == "$keep_file" ]]; then
      keep=true
      break
    fi
  done

  if [[ "$keep" == false ]]; then
    rm -rf -- "$entry"
    deleted=$((deleted + 1))
  fi
done

echo "Cleaned .notes-materials. Removed $deleted entries."
echo "Kept: ${KEEP_FILES[*]}"
