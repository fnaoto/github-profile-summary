# GitHub Profile Summary

A lightweight Vercel-ready GitHub profile app built with static HTML, CSS, and JavaScript.

## Features

- Search any public GitHub username
- Show profile details, followers, and repo counts
- Highlight total stars and top languages
- List recent repositories

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Use the default static deployment settings.
4. Deploy.

The app uses the public GitHub API, so public profiles work without any API token.

## Embed a profile card in your GitHub README

After deploying to Vercel, add this to your GitHub profile README. The image updates from public GitHub data and links to the live app:

```html
<a href="https://github-profile-summary-omega.vercel.app/?username=fnaoto">
  <img src="https://github-profile-summary-omega.vercel.app/api/card?username=fnaoto" alt="GitHub Profile Summary for @fnaoto" />
</a>
```

Replace `fnaoto` with the GitHub username you want to display.
