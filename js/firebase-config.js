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
    apiKey: "AIzaSyCdj3265j_3wpnP09yhIEsmPjzSuJALVms",
    authDomain: "caysontechwebpage-548bf.firebaseapp.com",
    projectId: "caysontechwebpage-548bf",
    storageBucket: "caysontechwebpage-548bf.firebasestorage.app",
    messagingSenderId: "228371814866",
    appId: "1:228371814866:web:a4cadfd955c95f1e43d00b"
};

// Initialize Firebase (We will load libraries from CDN in HTML)
// This file is just for configuration reference or module usage if using bundler
window.firebaseConfig = firebaseConfig;
