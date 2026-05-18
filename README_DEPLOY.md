# Deployment Instructions for OmniSanitas (Zero Config)

OmniSanitas is now built to work **out-of-the-box** on Vercel without any external API keys or databases.

## 1. Frontend Deployment (Vercel) - RECOMMENDED
1.  Import your project into **Vercel**.
2.  Deploy!
3.  **No Environment Variables needed.** 
    *   The app will automatically detect it's on Vercel and switch to **"Local Mode"**.
    *   Your data (Users, Medications) will be saved securely in your browser's LocalStorage.

## 2. Advanced: Full-Stack Mode (Optional)
If you want to sync data across different devices, you can deploy a Node.js backend:
1.  Deploy the code to a platform like **Render.com**.
2.  Set `MONGODB_URI` if you want persistence, or it will use a demo memory-store.
3.  Set `VITE_API_URL` on Vercel to point to your backend.

### How it works:
*   **Static Host (Vercel):** Uses browser storage. Perfect for demos and private use.
*   **Full-Stack Host:** Uses the Express backend and Database.
*   **Zero API Keys:** No Gemini keys or external service keys are required for the AI assistant or medical features.
