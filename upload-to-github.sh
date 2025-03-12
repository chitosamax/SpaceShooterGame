#!/bin/bash

echo "AI DEFENDER - GitHub Upload Helper"
echo "==================================="
echo

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed or not in your PATH."
    echo "Please install Git from https://git-scm.com/downloads"
    echo "or use the manual upload method described in GITHUB_SETUP.md"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Git is installed. Proceeding with setup..."
echo

# Ask for GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
echo

# Ask for repository name
read -p "Enter your repository name (default: ai-defender): " REPO_NAME
REPO_NAME=${REPO_NAME:-ai-defender}
echo

# Initialize Git repository
echo "Initializing Git repository..."
git init
echo

# Add all files
echo "Adding files to repository..."
git add .
echo

# Commit files
echo "Committing files..."
git commit -m "Initial commit of AI DEFENDER game"
echo

# Add remote
echo "Adding GitHub remote..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
echo

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main
echo

echo "==================================="
echo "Next steps:"
echo "1. Go to https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "2. Under \"Source\", select \"main\" branch"
echo "3. Click \"Save\""
echo "4. Wait a few minutes for your site to be published"
echo "5. Your game will be available at: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo
echo "Don't forget to update the URLs in index.html and README.md with your actual GitHub username!"
echo

read -p "Press Enter to exit..." 