export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-7167909516-12009",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:865560649263:web:4eb900219dfc45c0b6f0da",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAdMO8g0XSYYz1D_JkPjHhJgvlofAyNFB4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-7167909516-12009"}.firebaseapp.com`,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "865560649263"
};

export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "949303626062-5sro1cu4f8ika0smc8nu2ka3nhrt9rlm.apps.googleusercontent.com";
