@echo off
echo AI DEFENDER - GitHub Upload Helper
echo ===================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/downloads
    echo or use the manual upload method described in GITHUB_SETUP.md
    pause
    exit /b
)

echo Git is installed. Proceeding with setup...
echo.

REM Ask for GitHub username
set /p GITHUB_USERNAME=Enter your GitHub username: 
echo.

REM Ask for repository name
set /p REPO_NAME=Enter your repository name (default: ai-defender): 
if "%REPO_NAME%"=="" set REPO_NAME=ai-defender
echo.

REM Initialize Git repository
echo Initializing Git repository...
git init
echo.

REM Add all files
echo Adding files to repository...
git add .
echo.

REM Commit files
echo Committing files...
git commit -m "Initial commit of AI DEFENDER game"
echo.

REM Add remote
echo Adding GitHub remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main
echo.

echo ===================================
echo Next steps:
echo 1. Go to https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/settings/pages
echo 2. Under "Source", select "main" branch
echo 3. Click "Save"
echo 4. Wait a few minutes for your site to be published
echo 5. Your game will be available at: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo.
echo Don't forget to update the URLs in index.html and README.md with your actual GitHub username!
echo.

pause 