import { auth, db } from "./config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Union type for subjects/class data
type TeachingData = string[] | { subject: string; classLevel: string }[];

// Signup with role, fullName, and subjects/classes
export const registerWithRole = async (
  email: string,
  password: string,
  role: "student" | "teacher",
  fullName: string,
  subjectsOrTeaching: TeachingData
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Save extra info in Firestore
  await setDoc(doc(db, "users", user.uid), {
    fullName,
    email,
    role,
    ...(role === "student"
      ? { studentSubjects: subjectsOrTeaching }  // string[]
      : { teaching: subjectsOrTeaching }),       // {subject,classLevel}[]
    createdAt: serverTimestamp(),
  });

  return user;
};

// Login and fetch user data including role
export const loginWithRole = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Get user info from Firestore
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("User data not found in database.");
  }

  const userData = docSnap.data();

  return { 
    user, 
    role: userData.role as "student" | "teacher",
    studentSubjects: userData.studentSubjects || [], // for students
    teaching: userData.teaching || []               // for teachers
  };
};

// Logout
export const logout = () => signOut(auth);

// Optional: Get current user
export const getCurrentUser = (): User | null => auth.currentUser;
