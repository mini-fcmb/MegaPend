import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { registerWithRole } from "../firebase/authService";

export default function Signup() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [classLevel, setClassLevel] = useState<string>("SS1"); // For students
  const [teaching, setTeaching] = useState<
    { subject: string; classLevel: string }[]
  >([]); // For teachers
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (role === "student") {
        // Students: store array of classes/levels (comma separated)
        const studentSubjects = classLevel.split(",").map((c) => c.trim());
        await registerWithRole(
          email,
          password,
          role,
          fullName,
          studentSubjects
        );
      } else {
        // Teachers: store array of {subject, classLevel} objects
        await registerWithRole(email, password, role, fullName, teaching);
      }

      alert("Account created successfully!");
      navigate("/login");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create Account ✨</h2>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={role === "teacher" ? "active" : ""}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>
        </div>

        <form className="signup-form" onSubmit={handleSignup}>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {role === "student" ? (
            <div>
              <label>Class / Level (comma separated if multiple)</label>
              <input
                type="text"
                placeholder="e.g., SS2, SS3"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label>Subjects & Classes</label>
              <button
                type="button"
                onClick={() =>
                  setTeaching([...teaching, { subject: "", classLevel: "" }])
                }
              >
                Add Subject
              </button>
              {teaching.map((t, i) => (
                <div key={i} style={{ marginTop: "5px" }}>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={t.subject}
                    onChange={(e) => {
                      const newTeaching = [...teaching];
                      newTeaching[i].subject = e.target.value;
                      setTeaching(newTeaching);
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Class"
                    value={t.classLevel}
                    onChange={(e) => {
                      const newTeaching = [...teaching];
                      newTeaching[i].classLevel = e.target.value;
                      setTeaching(newTeaching);
                    }}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="signup-btn">
            Sign Up as {role === "student" ? "Student" : "Teacher"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
