#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "2024/index.html"
  "ongoing/index.html"
  "notes/index.html"
  "notes/_template.html"
  "notes/2026-02-19-notes-index-auto-update-guide.html"
)

required_tokens=(
  'src="https://giscus.app/client.js"'
  'data-repo="benlw/benlw.github.io"'
  'data-repo-id="MDEwOlJlcG9zaXRvcnkyNDEwMzQwNjU="'
  'data-category="Website Comments"'
  'data-category-id="DIC_kwDODl3jUc4C25Z4"'
  'data-mapping="pathname"'
  'data-strict="1"'
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "ERROR: missing required file: $file"
    exit 1
  fi

  for token in "${required_tokens[@]}"; do
    if ! grep -Fq -- "$token" "$file"; then
      echo "ERROR: missing token in $file"
      echo "  token: $token"
      exit 1
    fi
  done

  if grep -Fq -- "cusdis" "$file"; then
    echo "ERROR: legacy cusdis reference still present in $file"
    exit 1
  fi
done

echo "OK: giscus embed checks passed."
