#!/bin/bash

# Ensure `git-cliff` is installed
if ! command -v git-cliff &> /dev/null; then
    echo "❌ git-cliff is not installed. Please install it manually: cargo install git-cliff"
    exit 1
fi

# Define output path (relative to script location)
OUTPUT_PATH="$(dirname "$0")/../extension/src/changelog.json"

# Run git-cliff and process with jq
git-cliff --context | jq '
  map(select(.version != null)) |  # Ignore unreleased versions
  map({
    version: .version,
    timestamp: .timestamp,
    changes: [
      .commits[] | select(
        .group == "<!-- 0 -->🚀 Features" or
        .group == "<!-- 1 -->🐛 Bug Fixes" or
        .group == "<!-- 3 -->📚 Documentation" or
        .group == "<!-- 8 -->🛡️ Security"
      ) |
      {
        category: (
          if .group == "<!-- 0 -->🚀 Features" then "Feature"
          elif .group == "<!-- 1 -->🐛 Bug Fixes" then "Fix"
          elif .group == "<!-- 3 -->📚 Documentation" then "Documentation"
          elif .group == "<!-- 8 -->🛡️ Security" then "Security"
          else null end
        ),
        message: .message
      }
    ] | map("\(.category) — \(.message)")
  })
' > "$OUTPUT_PATH"

echo "✅ Changelog saved to $OUTPUT_PATH"
