# VeriFy.AI - Firebase Setup Guide

## 🚀 Quick Start (Demo Mode)

The app works immediately in **Demo Mode** without any configuration! 

- ✅ Use any email/password to sign in
- ✅ Verify content with mock AI analysis
- ✅ Test all features instantly
- ⚠️ Data won't persist (no database)
- ⚠️ Mock AI results (not real verification)

## 🔥 Production Setup (Real APIs)

### Step 1: Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose your region

### 4. Set Up Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /verifications/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Enable Storage
1. Go to **Storage**
2. Click **Get Started**
3. Start in **production mode**

### 6. Set Up Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /verifications/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon to add a web app
4. Copy the config object

### 8. Configure Environment Variables
Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini AI API (REQUIRED)
VITE_GEMINI_API_KEY=get_from_google_ai_studio

# Optional APIs
VITE_NEWS_API_KEY=get_from_newsapi.org
VITE_GOOGLE_FACT_CHECK_API_KEY=get_from_google_cloud
```

## 🤖 Get API Keys

### Gemini AI API (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or sign in to your Google account
3. Click **Get API Key**
4. Copy the key to `VITE_GEMINI_API_KEY`

### NewsAPI (Optional)
1. Go to [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Copy the API key to `VITE_NEWS_API_KEY`

### Google Fact Check API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable **Fact Check Tools API**
4. Create credentials (API key)
5. Copy to `VITE_GOOGLE_FACT_CHECK_API_KEY`

## 🚀 Run the App

```bash
npm install
npm run dev
```

## 📝 Notes

- **Firebase is now managing authentication** instead of Lovable Cloud
- You need to **manually configure Firebase** in the Firebase Console
- All backend data is stored in **Firebase Firestore**
- Files are stored in **Firebase Storage**
- Voice assistant uses **Web Speech API** (built into browser)
- Content verification uses **Gemini AI API**
