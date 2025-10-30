// src/firebase/authService.ts
import { auth, db } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

type TeachingData = string[] | { subject: string; classLevel: string }[];

interface VerificationData {
  lastSent: Timestamp;
  attemptsToday: number;
}

/**
 * ✅ Register user with role + send verification email
 */
export const registerWithRole = async (
  email: string,
  password: string,
  role: "student" | "teacher",
  fullName: string,
  subjectsOrTeaching: TeachingData
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: fullName });

  // Save extra info in Firestore including verification tracking
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    fullName,
    email,
    role,
    ...(role === "student"
      ? { studentSubjects: subjectsOrTeaching }
      : { teaching: subjectsOrTeaching }),
    verification: { lastSent: serverTimestamp(), attemptsToday: 1 }, // initialize
    createdAt: serverTimestamp(),
  });

  await sendEmailVerification(user); // send first verification email

  return user;
};

/**
 * ✅ Resend verification email (with 10-min expiry and 3 attempts/day)
 */
export const resendVerificationEmail = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) throw new Error("User not found.");

  const data = docSnap.data();
  const now = Timestamp.now();
  const verification: VerificationData = data.verification || { lastSent: now, attemptsToday: 0 };

  // Reset attempts if new day
  const lastSentDate = verification.lastSent.toDate();
  const today = new Date();
  if (
    lastSentDate.getFullYear() !== today.getFullYear() ||
    lastSentDate.getMonth() !== today.getMonth() ||
    lastSentDate.getDate() !== today.getDate()
  ) {
    verification.attemptsToday = 0;
  }

  // Check attempts limit
  if (verification.attemptsToday >= 3) {
    throw new Error("You have reached the maximum of 3 verification attempts today.");
  }

  // Check 10-min cooldown
  const diff = now.toMillis() - verification.lastSent.toMillis();
  if (diff < 10 * 60 * 1000) {
    throw new Error("You can only request a new verification email every 10 minutes.");
  }

  // Send email
  await sendEmailVerification(user);

  // Update Firestore
  await updateDoc(userRef, {
    verification: { lastSent: now, attemptsToday: verification.attemptsToday + 1 },
  });
};

/**
 * ✅ Login with role
 * Throws error if email not verified
 */
export const loginWithRole = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error("User data not found in database.");

  const userData = docSnap.data();

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  return {
    user,
    role: userData.role as "student" | "teacher",
    studentSubjects: userData.studentSubjects || [],
    teaching: userData.teaching || [],
  };
};

export const logout = async () => await signOut(auth);
export const getCurrentUser = (): User | null => auth.currentUser;
