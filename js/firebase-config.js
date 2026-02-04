// Firebase Configuration & Initialization
// IMPORTANT: Replace the following config with your own project credentials from Firebase Console

/*
  [How to get these values]
  1. Go to Firebase Console (https://console.firebase.google.com/)
  2. Create a new project (or use existing)
  3. Register a web app (</> icon)
  4. Copy the firebaseConfig object here
*/

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (We will load libraries from CDN in HTML)
// This file is just for configuration reference or module usage if using bundler
window.firebaseConfig = firebaseConfig;
