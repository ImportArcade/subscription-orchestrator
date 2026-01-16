#!/usr/bin/env bash
# create_gh_issues.sh
# Usage:
#   ./create_gh_issues.sh [owner/repo]
# If owner/repo is not provided the script will use $GITHUB_REPOSITORY if set,
# otherwise it will rely on gh's current repository context.

set -o pipefail

REPO_ARG="$1"
if [ -n "$REPO_ARG" ]; then
  REPO="--repo $REPO_ARG"
elif [ -n "$GITHUB_REPOSITORY" ]; then
  REPO="--repo $GITHUB_REPOSITORY"
else
  REPO=""
fi

GH_CMD=$(command -v gh || true)
if [ -z "$GH_CMD" ]; then
  echo "Error: gh CLI not found. Install and authenticate (gh auth login) before running." >&2
  exit 1
fi

ISSUE_DIR="docs/gh-issues"

if [ ! -d "$ISSUE_DIR" ]; then
  echo "Issue directory '$ISSUE_DIR' not found. Nothing to do."
  exit 0
fi

# find files safely even with spaces/newlines in names
find "$ISSUE_DIR" -maxdepth 1 -type f -name '*.md' -print0 |
while IFS= read -r -d '' f; do
  echo "----------------------------------------"
  echo "Processing file: $f"

  # Extract title from first Markdown header line "# Title"
  title=$(sed -n '1s/^#\s*//p' "$f" | tr -d '\r')
  if [ -z "$title" ]; then
    title=$(basename "$f" .md)
  fi

  # Determine label: epic vs story
  if sed -n '1,6p' "$f" | grep -qi '^#\s*Epic' || echo "$(basename "$f")" | grep -qi 'epic_'; then
    label="epic"
  else
    label="story"
  fi

  # Ensure label exists (attempt to create; ignore errors if it already exists or creation fails)
  # Note: label color chosen arbitrarily; change if desired.
  if ! gh label list $REPO --limit 1000 | awk '{print tolower($1)}' | grep -qx "$label"; then
    echo "Creating label '$label' in repo (if permitted)..."
    gh label create "$label" --color "0e8a16" --description "Auto-created by create_gh_issues script" $REPO 2>/dev/null || true
  fi

  echo "Creating issue: $title"
  # Create the issue using the file content as the body
  if gh issue create $REPO --title "$title" --body-file "$f" --label "$label"; then
    echo "Issue created successfully for '$f'. Deleting file..."
    rm -f "$f"
    echo "Deleted: $f"
  else
    echo "Failed to create issue for '$f'. File left in place for retry." >&2
  fi
done

echo "Done."