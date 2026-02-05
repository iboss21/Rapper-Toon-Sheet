#!/bin/bash
# Deployment Readiness Verification Script
# This script verifies that the application is ready to deploy to Coolify

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}║   Rapper Toon Sheet - Deployment Verification     ║${RESET}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════╝${RESET}"
echo ""

# Counter for checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

check() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  echo -n "  ⟳ $1..."
}

pass() {
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
  echo -e " ${GREEN}✓${RESET}"
}

fail() {
  echo -e " ${RED}✗${RESET}"
  if [ -n "$1" ]; then
    echo -e "    ${YELLOW}→ $1${RESET}"
  fi
}

warn() {
  echo -e "    ${YELLOW}⚠ $1${RESET}"
}

section() {
  echo ""
  echo -e "${BOLD}$1${RESET}"
  echo "─────────────────────────────────────────────"
}

# Change to repository root
cd "$(dirname "$0")/.."

section "1. Prerequisites Check"

check "Node.js version (>= 18)"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  pass
else
  fail "Node.js $NODE_VERSION found, need >= 18"
fi

check "pnpm installed"
if command -v pnpm &> /dev/null; then
  pass
else
  fail "Install pnpm: npm install -g pnpm"
fi

check "Git repository"
if [ -d .git ]; then
  pass
else
  fail "Not a git repository"
fi

section "2. Configuration Files"

check "nixpacks.toml exists"
if [ -f nixpacks.toml ]; then
  pass
else
  fail "Create nixpacks.toml in repository root"
fi

check "nixpacks.toml has Node.js 22"
if grep -q "nodejs_22" nixpacks.toml 2>/dev/null; then
  pass
else
  fail "Update nixpacks.toml to use nodejs_22"
fi

check "nixpacks.toml has pnpm"
if grep -q "pnpm" nixpacks.toml 2>/dev/null; then
  pass
else
  fail "Update nixpacks.toml to use pnpm"
fi

check "nixpacks.toml has correct start command"
if grep -q "node apps/api/dist/index.js" nixpacks.toml 2>/dev/null; then
  pass
else
  fail "Start command should be: node apps/api/dist/index.js"
fi

check ".env.example exists"
if [ -f .env.example ]; then
  pass
else
  fail "Create .env.example file"
fi

check ".gitignore exists"
if [ -f .gitignore ]; then
  pass
else
  fail "Create .gitignore file"
fi

check ".gitignore excludes sensitive files"
if grep -q "\.env$" .gitignore 2>/dev/null && grep -q "node_modules" .gitignore 2>/dev/null; then
  pass
else
  fail "Update .gitignore to exclude .env and node_modules"
fi

section "3. Dependencies"

check "Installing dependencies"
if pnpm install --frozen-lockfile --prod=false &> /tmp/pnpm-install.log; then
  pass
else
  fail "Run: pnpm install"
  cat /tmp/pnpm-install.log
fi

section "4. Build Process"

check "Building shared package"
if pnpm --filter @rapper-toon-sheet/shared build &> /tmp/shared-build.log; then
  pass
else
  fail "Shared package build failed"
  cat /tmp/shared-build.log
fi

check "Building API"
if pnpm --filter @rapper-toon-sheet/api build &> /tmp/api-build.log; then
  pass
else
  fail "API build failed"
  cat /tmp/api-build.log
fi

check "Building Web frontend"
if pnpm --filter @rapper-toon-sheet/web build &> /tmp/web-build.log; then
  pass
else
  fail "Web build failed"
  cat /tmp/web-build.log
fi

section "5. Build Artifacts"

check "API dist/index.js exists"
if [ -f apps/api/dist/index.js ]; then
  pass
else
  fail "API build did not produce dist/index.js"
fi

check "API has all route files"
if [ -d apps/api/dist/routes ] && [ -f apps/api/dist/routes/health.js ]; then
  pass
else
  fail "API routes not properly built"
fi

check "Web dist exists"
if [ -d apps/web/dist ] && [ -f apps/web/dist/index.html ]; then
  pass
else
  fail "Web build did not produce dist/"
fi

section "6. API Health Check"

check "API can start (testing...)"
# Start API in background
OUTPUT_DIR=/tmp/test-outputs \
IMAGE_PROVIDER=openai \
OPENAI_API_KEY=test-key \
NODE_ENV=production \
PORT=3001 \
node apps/api/dist/index.js &> /tmp/api-test.log &
API_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
if curl -s http://localhost:3001/health | grep -q '"status":"ok"'; then
  pass
  # Stop the server
  kill $API_PID 2>/dev/null || true
  wait $API_PID 2>/dev/null || true
else
  fail "Health endpoint did not respond correctly"
  kill $API_PID 2>/dev/null || true
  cat /tmp/api-test.log
fi

section "7. Documentation"

check "README.md exists"
if [ -f README.md ]; then
  pass
else
  fail "Create README.md"
fi

check "PRD.md exists"
if [ -f PRD.md ]; then
  pass
else
  warn "PRD.md not found (optional)"
fi

check "DEPLOYMENT.md exists"
if [ -f DEPLOYMENT.md ]; then
  pass
else
  warn "DEPLOYMENT.md not found (optional but recommended)"
fi

check "API.md exists"
if [ -f API.md ]; then
  pass
else
  warn "API.md not found (optional but recommended)"
fi

section "8. Git Status"

check "No uncommitted critical files"
if ! git status --porcelain | grep -E "^(M|A|D)" | grep -E "\.(ts|js|json|toml)$" &> /dev/null; then
  pass
else
  warn "Uncommitted changes found:"
  git status --porcelain | grep -E "^(M|A|D)" | grep -E "\.(ts|js|json|toml)$"
fi

check "On a branch"
BRANCH=$(git branch --show-current)
if [ -n "$BRANCH" ]; then
  pass
  echo "    → Current branch: $BRANCH"
else
  fail "Not on a branch"
fi

# Summary
echo ""
echo -e "${BOLD}╔════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║                    SUMMARY                         ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════════════════╝${RESET}"
echo ""

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
  echo -e "${GREEN}${BOLD}✓ All checks passed! ($PASSED_CHECKS/$TOTAL_CHECKS)${RESET}"
  echo ""
  echo -e "${GREEN}The application is ready to deploy to Coolify!${RESET}"
  echo ""
  echo "Next steps:"
  echo "  1. Push to GitHub: git push origin $BRANCH"
  echo "  2. Create application in Coolify"
  echo "  3. Add environment variables"
  echo "  4. Deploy!"
  echo ""
  exit 0
else
  FAILED_CHECKS=$((TOTAL_CHECKS - PASSED_CHECKS))
  echo -e "${RED}${BOLD}✗ Some checks failed ($PASSED_CHECKS/$TOTAL_CHECKS passed, $FAILED_CHECKS failed)${RESET}"
  echo ""
  echo -e "${YELLOW}Please fix the issues above before deploying.${RESET}"
  echo ""
  exit 1
fi
