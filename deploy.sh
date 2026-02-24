#!/bin/bash
# VPS Delta Deployment Script
# Fetches a GitHub Release (Source + Delta), merges them securely, and builds via Yarn.

set -e

# --- Configuration & Defaults ---
REPO="RokctAI/paas_webapp"
CLIENT=""
TOKEN="${GITHUB_TOKEN:-}" # Optional PAT for private repositories
EXTRACT_DIR="release_build"

# --- Argument Parsing ---
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --client) CLIENT="$2"; shift ;;
        --token) TOKEN="$2"; shift ;;
        -h|--help) 
            echo "Usage: ./deploy.sh [--client <name>] [--token <github_pat>]"
            echo "Example: ./deploy.sh --client wrapzo"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo "🚀 Starting VPS Deployment for: $REPO"

# --- 1. Identify Target Release ---
API_URL="https://api.github.com/repos/$REPO/releases/latest"
AUTH_HEADER=""

if [ ! -z "$TOKEN" ]; then
    AUTH_HEADER="-H \"Authorization: token $TOKEN\""
fi

echo "🔍 Locating latest release..."
# Fetch release data
RELEASE_DATA=$(curl -s $AUTH_HEADER "$API_URL")

# Check if curl failed or returned Not Found
if echo "$RELEASE_DATA" | grep -q "Not Found"; then
    echo "❌ Error: Repository not found or token lacks permissions."
    exit 1
fi

# We look for the tag name.
TARGET_TAG=$(echo "$RELEASE_DATA" | grep -o '"tag_name": "[^"]*' | cut -d'"' -f4)

if [ -z "$TARGET_TAG" ] || [ "$TARGET_TAG" == "null" ]; then
    echo "❌ Error: Could not determine latest release tag."
    exit 1
fi

echo "✅ Found Latest Release: $TARGET_TAG"

# --- 2. Client Filtering (If specified) ---
if [ ! -z "$CLIENT" ]; then
    # We need to find the specific tag that ends with the client name.
    # The universal release script generates tags like: v1.0.0-wrapzo
    echo "🔍 Looking for latest client release: $CLIENT..."
    
    # Fetch ALL releases and find the first one matching our client suffix
    ALL_RELEASES_DATA=$(curl -s $AUTH_HEADER "https://api.github.com/repos/$REPO/releases")
    CLIENT_TAG=$(echo "$ALL_RELEASES_DATA" | grep -o '"tag_name": "[^"]*' | cut -d'"' -f4 | grep -- "-$CLIENT" | head -n 1)
    
    if [ -z "$CLIENT_TAG" ]; then
        echo "❌ Error: Could not find any release matching client suffix '-$CLIENT'."
        exit 1
    fi
    TARGET_TAG="$CLIENT_TAG"
    echo "✅ Selected Client Release: $TARGET_TAG"
    
    # We must re-fetch the specific release data to get the right assets
    API_URL="https://api.github.com/repos/$REPO/releases/tags/$TARGET_TAG"
    RELEASE_DATA=$(curl -s $AUTH_HEADER "$API_URL")
fi


# --- 3. Asset Download ---
echo "📦 Downloading assets for $TARGET_TAG..."

# Prepare Workspace
rm -rf "$EXTRACT_DIR"
mkdir -p "$EXTRACT_DIR"
cd "$EXTRACT_DIR"

# Download Source Code Zip (Native GitHub archive)
SOURCE_ZIP_URL="https://github.com/$REPO/archive/refs/tags/$TARGET_TAG.zip"
if [ ! -z "$TOKEN" ]; then
    echo "Downloading secured Source Code Zip..."
    # Private repos require downloading through the API
    curl -sL -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3.raw" "$SOURCE_ZIP_URL" -o source.zip
else
    echo "Downloading Source Code Zip..."
    curl -sL "$SOURCE_ZIP_URL" -o source.zip
fi

# Download Delta Zip (update_package.zip) which contains the .env
echo "Downloading Delta update_package.zip..."
ASSET_ID=$(echo "$RELEASE_DATA" | grep -A 3 '"name": "update_package.zip"' | grep -o '"url": "[^"]*' | head -n 1 | cut -d'"' -f4)

if [ ! -z "$ASSET_ID" ]; then
    # Download Asset using API
    curl -sL -H "Authorization: token $TOKEN" -H "Accept: application/octet-stream" "$ASSET_ID" -o update_package.zip
    HAS_DELTA=true
    echo "✅ Delta package downloaded."
else
    echo "⚠️ No update_package.zip found in this release. Assuming full source."
    HAS_DELTA=false
fi

# --- 4. Merge Validation ---
echo "🔨 Merging packages..."

# Extract Source
unzip -q source.zip
# GitHub archives extract into a folder named Repo-Tag (e.g. paas_webapp-1.0.0-wrapzo)
SOURCE_DIR=$(ls -d */ | head -n 1)
mv "$SOURCE_DIR"* .
rm -rf "$SOURCE_DIR"

# Extract Delta directly over Source (Atomic Overwrite)
if [ "$HAS_DELTA" = true ]; then
    echo "Injecting Delta changes (and safe .env)..."
    unzip -qo update_package.zip -d .
fi

# Cleanup Zips
rm source.zip
if [ -f update_package.zip ]; then rm update_package.zip; fi

echo "✅ Codebase merged successfully."

# --- 5. Yarn Build Ecosystem ---
echo "⚙️ Executing Yarn configuration..."

# Verify package.json exists to prevent dangerous executions
if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found in the repository root. Aborting."
    exit 1
fi

echo "Running yarn install..."
yarn install --frozen-lockfile

if grep -q '"build"' package.json; then
    echo "Running yarn build..."
    yarn build
else
    echo "ℹ️ No 'build' script found in package.json. Skipping build phase."
fi

echo ""
echo "🎉 Deployment artifacts successfully assembled in ./$EXTRACT_DIR"
echo "You can now start and daemonize your application using PM2 or your preferred manager."
echo "Example: cd $EXTRACT_DIR && yarn start"
