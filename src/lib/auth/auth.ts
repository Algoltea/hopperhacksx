import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError as FirebaseAuthError
} from 'firebase/auth';
import { auth } from '../firebase';

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    const authError = error as FirebaseAuthError;
    let errorMessage = "An error occurred.";
    if (authError.code === "auth/email-already-in-use") {
      errorMessage = "Email is already in use.";
    } else if (authError.code === "auth/weak-password") {
      errorMessage = "Password must be at least 6 characters.";
    }
    throw new Error(errorMessage);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    const authError = error as FirebaseAuthError;
    let errorMessage = "An error occurred.";
    if (authError.code === "auth/user-not-found") {
      errorMessage = "User not found.";
    } else if (authError.code === "auth/wrong-password") {
      errorMessage = "Incorrect password.";
    }
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    const authError = error as FirebaseAuthError;
    let errorMessage = "Failed to logout.";
    if (authError.code === "auth/no-current-user") {
      errorMessage = "No user is currently signed in.";
    }
    throw new Error(errorMessage);
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };