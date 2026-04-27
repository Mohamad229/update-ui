#!/bin/bash

# Damira Pharma - Vercel Deployment Quick Start Script
# This script guides you through the deployment process

set -e

echo "🚀 Damira Pharma - Vercel Deployment Setup"
echo "=========================================="
echo ""

# Step 1: Verify Git
echo "Step 1️⃣  Verifying Git Repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not in a Git repository. Please run this from your project root."
  exit 1
fi

if ! git remote get-url origin > /dev/null 2>&1; then
  echo "❌ No remote 'origin' found. Please add GitHub remote first:"
  echo "   git remote add origin https://github.com/yourusername/repo-name.git"
  exit 1
fi

REPO_URL=$(git remote get-url origin)
echo "✓ Git repo: $REPO_URL"
echo ""

# Step 2: Check uncommitted changes
echo "Step 2️⃣  Checking for uncommitted changes..."
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  You have uncommitted changes:"
  git status --short
  echo ""
  read -p "Commit these changes? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Pre-deployment: Prepare for Vercel"
  else
    echo "Please commit your changes before deploying."
    exit 1
  fi
fi

echo "✓ Working tree clean"
echo ""

# Step 3: Verify local build
echo "Step 3️⃣  Testing production build locally..."
echo "   (This may take 2-3 minutes the first time)"

if ! npm run build > /dev/null 2>&1; then
  echo "❌ Build failed. Fix errors above and try again."
  exit 1
fi

echo "✓ Production build successful"
echo ""

# Step 4: Check Prisma
echo "Step 4️⃣  Checking Prisma setup..."
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ prisma/schema.prisma not found"
  exit 1
fi

if [ ! -d "prisma/migrations" ]; then
  echo "⚠️  No migrations found. Creating initial migration..."
  npm run prisma migrate dev --name "initial-migration" || true
fi

echo "✓ Prisma configured"
echo ""

# Step 5: Push to GitHub
echo "Step 5️⃣  Pushing to GitHub..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push -u origin "$CURRENT_BRANCH"
echo "✓ Pushed to GitHub"
echo ""

# Step 6: Generate AUTH_SECRET
echo "Step 6️⃣  Generating AUTH_SECRET..."
AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated AUTH_SECRET:"
echo "$AUTH_SECRET"
echo ""
echo "📝 Copy this value - you'll need it in Vercel dashboard"
echo ""

# Step 7: Instructions
echo "=========================================="
echo "✅ Pre-deployment checks passed!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1️⃣  Go to https://vercel.com/dashboard"
echo ""
echo "2️⃣  Import your GitHub repository:"
echo "    - Click 'Add New' → 'Project'"
echo "    - Select your GitHub account"
echo "    - Search for and import: $(basename "$REPO_URL" .git)"
echo ""
echo "3️⃣  Configure Environment Variables:"
echo "    - Settings → Environment Variables"
echo ""
echo "    Required variables:"
echo "    ├─ DATABASE_URL=postgresql://user:password@host/database"
echo "    ├─ AUTH_SECRET=$AUTH_SECRET"
echo "    ├─ AUTH_URL=https://yourdomain.com (or vercel domain)"
echo "    ├─ NEXT_PUBLIC_APP_URL=https://yourdomain.com"
echo "    └─ NEXT_PUBLIC_APP_NAME=Damira Pharma"
echo ""
echo "    ℹ️  Set each variable for Production, Preview, and Development"
echo ""
echo "4️⃣  Database Setup (choose one):"
echo ""
echo "    Option A (Recommended): Vercel Postgres"
echo "    ├─ In Vercel dashboard → Storage → Create Database"
echo "    ├─ Select PostgreSQL"
echo "    ├─ Copy Prisma connection string"
echo "    └─ Use as DATABASE_URL"
echo ""
echo "    Option B: Railway"
echo "    ├─ Go to https://railway.app"
echo "    ├─ Create PostgreSQL database"
echo "    ├─ Copy connection URL"
echo "    └─ Use as DATABASE_URL"
echo ""
echo "    Option C: Neon"
echo "    ├─ Go to https://neon.tech"
echo "    ├─ Create database"
echo "    ├─ Copy connection string"
echo "    └─ Use as DATABASE_URL"
echo ""
echo "5️⃣  Deploy:"
echo "    - In Vercel, click 'Deploy'"
echo "    - Wait 5-10 minutes for build"
echo "    - Check build logs if errors occur"
echo ""
echo "6️⃣  Verify:"
echo "    - Open deployment URL"
echo "    - Test /admin/login page"
echo "    - Check Vercel logs for errors"
echo ""
echo "📚 Full guide: docs/VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
