// src/firebase/authService.ts
import { auth, db } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Union type for subjects/class data
type TeachingData = string[] | { subject: string; classLevel: string }[];

/**
 * ✅ Register user with role (student/teacher)
 * Stores extra user info in Firestore and updates Firebase Auth profile
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

  // ✅ Set display name in Firebase Auth (for use in dashboards)
  await updateProfile(user, { displayName: fullName });

  // ✅ Save extra info in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    role,
    ...(role === "student"
      ? { studentSubjects: subjectsOrTeaching } // string[]
      : { teaching: subjectsOrTeaching }), // {subject,classLevel}[]
    createdAt: serverTimestamp(),
  });

  return user;
};

/**
 * ✅ Login and return user data + role
 */
export const loginWithRole = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("User data not found in database.");
  }

  const userData = docSnap.data();

  return {
    user,
    role: userData.role as "student" | "teacher",
    studentSubjects: userData.studentSubjects || [],
    teaching: userData.teaching || [],
  };
};

/**
 * ✅ Logout user
 */
export const logout = async () => {
  await signOut(auth);
};

/**
 * ✅ Optional helper to get current logged-in user
 */
export const getCurrentUser = (): User | null => auth.currentUser;
