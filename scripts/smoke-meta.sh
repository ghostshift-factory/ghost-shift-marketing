#!/usr/bin/env bash
# Smoke-checks that a deployed page's og:image and twitter:image meta tags are
# routable production URLs — i.e. not localhost, and rooted at the URL under test.
set -euo pipefail

BASE_URL="${1:?Usage: smoke-meta.sh <BASE_URL>}"

html=$(curl -fsSL "$BASE_URL")

og_image=$(grep -oE '<meta property="og:image" content="[^"]*"' <<<"$html" | sed -E 's/.*content="([^"]*)"/\1/' | head -1)
twitter_image=$(grep -oE '<meta name="twitter:image" content="[^"]*"' <<<"$html" | sed -E 's/.*content="([^"]*)"/\1/' | head -1)

status=0

check() {
  local label="$1" value="$2"

  if [[ -z "$value" ]]; then
    echo "FAIL: $label meta tag not found" >&2
    status=1
  elif [[ "$value" == *localhost* ]]; then
    echo "FAIL: $label contains localhost: $value" >&2
    status=1
  elif [[ "$value" != "$BASE_URL"* ]]; then
    echo "FAIL: $label does not start with $BASE_URL: $value" >&2
    status=1
  else
    echo "OK: $label = $value"
  fi
}

check "og:image" "$og_image"
check "twitter:image" "$twitter_image"

exit "$status"
