<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Ug3gOTMZEbAMFj9fxf1Hgmxx_PQbl1SM

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Demo accounts

Authentication is handled entirely in the browser now. On the login screen choose one of the bundled demo accounts (Director, Leader, or Counsellor) and click **Sign in**. The dropdown reflects any accounts you add through the Admin panel, so you can create additional demo users without touching Firebase.

## Deploy to Vercel

1. Install the Vercel CLI (`npm i -g vercel`) or connect the repository in the Vercel dashboard.
2. Commit the repository (including `vercel.json`) and push it to the branch you want to deploy.
3. Run `vercel deploy` (or trigger a deployment from the dashboard). Vercel will execute `npm install` followed by `npm run build` and serve the static assets from the `dist/` directory defined in `vercel.json`.
4. Configure any environment variables (for example `GEMINI_API_KEY`) inside the Vercel project settings so they are available during build time.

Because the application no longer depends on Firebase services, no additional backend configuration is required for Vercel.

### About the `node-domexception` warning on Vercel

During `npm install` Vercel may print `npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead`.
This message comes from a transitive dependency chain (`@google/genai → google-auth-library → gaxios → node-fetch → fetch-blob → node-domexception`).
All modern Node runtimes already include a built-in `DOMException`, so the `node-domexception` package is effectively unused when your build runs on Node 18/20.
You can safely ignore the warning; no action is required and it does not affect the deployed application.
