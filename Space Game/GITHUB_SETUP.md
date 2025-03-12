# GitHub Setup Instructions

Follow these steps to host your AI DEFENDER game on GitHub Pages:

## 1. Create a GitHub Account

If you don't already have a GitHub account:
1. Go to [github.com](https://github.com)
2. Click "Sign up" and follow the instructions

## 2. Create a New Repository

1. Log in to GitHub
2. Click the "+" icon in the top-right corner
3. Select "New repository"
4. Name your repository (e.g., "ai-defender")
5. Add a description (optional)
6. Make sure it's set to "Public"
7. Click "Create repository"

## 3. Upload Your Files

### Option 1: Using Git (Recommended)

If you have Git installed:

```bash
# Navigate to your game directory
cd path/to/your/game

# Initialize a new Git repository
git init

# Add all files to the repository
git add .

# Commit the files
git commit -m "Initial commit"

# Add the GitHub repository as a remote
git remote add origin https://github.com/yourusername/ai-defender.git

# Push the files to GitHub
git push -u origin main
```

### Option 2: Using GitHub Web Interface

If you don't have Git installed:

1. On your repository page, click "uploading an existing file"
2. Drag and drop all your game files or click "choose your files"
3. Add a commit message (e.g., "Initial upload")
4. Click "Commit changes"

## 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (tab at the top)
3. In the left sidebar, click "Pages"
4. Under "Source", select "main" from the branch dropdown
5. Click "Save"
6. Wait a few minutes for your site to be published
7. You'll see a message saying "Your site is published at https://yourusername.github.io/ai-defender/"

## 5. Update Social Sharing URLs

1. Edit the `index.html` file in your repository
2. Update the meta tags with your actual GitHub Pages URL:
   ```html
   <meta property="og:image" content="https://yourusername.github.io/ai-defender/screenshot.png">
   <meta property="og:url" content="https://yourusername.github.io/ai-defender">
   ```
3. Replace "yourusername" with your actual GitHub username
4. Commit the changes

## 6. Add a Screenshot

1. Take a screenshot of your game
2. Name it `screenshot.png`
3. Upload it to your repository
4. This image will be used when sharing your game on social media

## 7. Update the README

1. Edit the `README.md` file
2. Update the "Play Now!" link with your actual GitHub Pages URL:
   ```markdown
   Play AI DEFENDER online at: [https://yourusername.github.io/ai-defender](https://yourusername.github.io/ai-defender)
   ```
3. Replace "yourusername" with your actual GitHub username
4. Commit the changes

## 8. Share Your Game!

Once everything is set up, share your game URL with friends and on social media:
```
https://yourusername.github.io/ai-defender
```

## Troubleshooting

- If your site doesn't appear after enabling GitHub Pages, wait a few minutes and refresh
- If you see a 404 error, make sure your repository is public and that GitHub Pages is enabled
- If your game doesn't work, check the browser console for errors
- Make sure all file paths are correct (case-sensitive) 