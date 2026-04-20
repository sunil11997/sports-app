# शासकीय माध्यमिक आश्रम शाळा वाघांबा - Sports Hub

This is the Sports & Health Management System for the Waghamba School, built with Next.js, Firebase, and Genkit.

## Local Setup Instructions

Once you have downloaded/exported this code from Firebase Studio, follow these steps to run it locally:

### 1. Prerequisites
- Install [Node.js](https://nodejs.org/) (v18 or higher recommended).
- Have a Firebase project set up (though the config is already in `src/firebase/config.ts`).

### 2. Installation
Open your terminal in the project root and run:
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your keys (especially if using AI features):
```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Running the App
Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:9002`.

### 5. Running for Mobile (Android)
If you wish to run this as an Android app:
```bash
# Build the web project
npm run build

# Add the android platform (if not already added)
npx cap add android

# Sync the web code to the android project
npx cap sync

# Open in Android Studio
npx cap open android
```

## Features
- **Student Registration**: Capture student details and photos.
- **Attendance Tracking**: Real-time monthly presence logs.
- **Fitness Assessments**: Institutional physical test scoring.
- **Sports Skill Hub**: Technical move analysis for various sports.
- **AI Performance Hub**: Personalized AI-powered training recommendations.
- **Daily Reports**: Print-ready official session summaries.
- **Cloud Sync**: All data is automatically backed up to Firebase.

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase Firestore & Authentication
- **AI**: Google Genkit & Gemini 2.5
- **UI**: Tailwind CSS, ShadCN UI, Lucide Icons
- **Mobile**: Capacitor (Android ready)
