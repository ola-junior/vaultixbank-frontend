import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqMVvyuoBojhxy-O1kTXCOhsm421uuIqw",
  authDomain: "vaultix-8e140.firebaseapp.com",
  projectId: "vaultix-8e140",
  storageBucket: "vaultix-8e140.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with Twitter
export const signInWithTwitter = async () => {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Twitter sign-in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutFromFirebase = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { success: false, error: error.message };
  }
};

export { auth };