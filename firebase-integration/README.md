# Firebase Integration Documentation

This folder documents the Firebase configuration, authentication providers, and database services integrated in CodeVerse.

## Firebase Console Link
To manage your database and authentication, log in to the **Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/).

## Configuration Environment Variables
To connect your app to Firebase services, configure the following keys in your `.env` or `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

---

## How to Get Your Config from Firebase Console
1. Go to the **Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Select your project (e.g., `CodeVerse`).
3. Click on the **Gear icon (Settings)** in the left sidebar and select **Project Settings**.
4. In the **General** tab, scroll down to the **Your apps** section.
5. Select your Web app (or click **Add app** > **Web `</>`** if you haven't created one yet).
6. Under the SDK setup, select the **Config** radio button.
7. You will see a `firebaseConfig` object. Copy each value to your `.env` file according to this exact mapping:

### Key Mapping Guide

| `.env` Environment Variable | Firebase Config Property | Description / Example |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `apiKey` | Your Firebase project web API key (e.g., `AIzaSy...`) |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | Unique identifier for your project (e.g., `code-verse-12345`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | Default Cloud Storage bucket (e.g., `code-verse-12345.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | Numeric sender ID for Cloud Messaging (e.g., `85496321742`) |
| `VITE_FIREBASE_APP_ID` | `appId` | Unique ID for this specific web application (e.g., `1:8549632:web:a1b2c3d4`) |
| `VITE_FIREBASE_MEASUREMENT_ID` | `measurementId` | Analytics measurement ID (e.g., `G-XYZ12345`) |

---


## Active Services & Integration

### 1. Active Configuration File
* **File Path:** `src/firebase.js`
* This file loads the environment variables, initializes the Firebase application instance, and exports the active services.

### 2. Firebase Authentication
CodeVerse uses Firebase Auth to handle user accounts, logins, and registrations.
* **Authentication Providers Configured:**
  * **Email & Password Login** (Built-in email signup).
  * **Google Sign-In** (`googleProvider`)
  * **GitHub Sign-In** (`githubProvider`)
  * **Facebook Sign-In** (`facebookProvider`)
* *Note: These providers must be enabled in the Firebase Console under **Build > Authentication > Sign-in method**.*

### 3. Cloud Firestore Database
* CodeVerse stores dynamic application data in **Firestore** (exported as `db` in `firebase.js`).
* **Main Firestore Collections:**
  * `users`: User profiles, custom settings, and scores.
  * `leaderboard`: Global developer ranking data.
  * `temp_otps`: Temporary registration OTP verification tokens.
* *Note: Security rules are defined in the `firestore.rules` file in the project root.*
