import { useState, FormEvent } from "react";
import { addContent } from "../firebase/contentService"; // your addContent function
import { useLocation } from "react-router-dom";

export default function TeacherDashboard() {
  const location = useLocation();
  const teacherSubjects = location.state?.subjects || [];

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"note" | "assignment" | "quiz">("note");
  const [subject, setSubject] = useState(teacherSubjects[0] || "");
  const [classLevel, setClassLevel] = useState("SS1");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If file is uploaded, you can integrate a file-to-text conversion here
      // For now, we will just store description + metadata
      await addContent(
        title,
        type,
        subject,
        classLevel,
        description,
        "teacherId"
      );

      alert("Content uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center animate-pulse">
        Teacher Dashboard ✨
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
        <h2 className="text-xl font-semibold">Add New Content</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />

          <div className="flex gap-4 flex-wrap">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="note">Note</option>
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
            </select>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              {teacherSubjects.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Class Level (SS1, SS2...)"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <textarea
            placeholder="Type your content, questions, or instructions here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none h-32"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            {loading ? "Uploading..." : "Upload Content"}
          </button>
        </form>
      </div>

      <div className="mt-10 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Tips & Tricks</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            Type or paste content directly for notes, assignments, or quizzes.
          </li>
          <li>Upload files to convert text (OCR can be integrated later).</li>
          <li>Make sure you select the correct class and subject.</li>
          <li>
            Content appears immediately for all students in that class &
            subject.
          </li>
        </ul>
      </div>
    </div>
  );
}
