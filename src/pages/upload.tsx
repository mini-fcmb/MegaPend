// ExamUploadPage.tsx
import React, { useState } from "react";
import "./upload.css";

interface Question {
  id: number;
  category: string;
  question: string;
  answer: string;
  file?: File;
}

const ExamUploadPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      category: "Graduate Trainee",
      question: "What is React?",
      answer: "A JavaScript library",
      file: undefined,
    },
    {
      id: 2,
      category: "New Tech",
      question: "Explain TypeScript",
      answer: "Typed JavaScript",
      file: undefined,
    },
    {
      id: 3,
      category: "Work experience",
      question: "Previous role?",
      answer: "Frontend Dev",
      file: undefined,
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (category && question && answer) {
      const newQuestion: Question = {
        id: questions.length + 1,
        category,
        question,
        answer,
        file,
      };
      setQuestions([...questions, newQuestion]);
      setIsModalOpen(false);
      // Reset form
      setCategory("");
      setQuestion("");
      setAnswer("");
      setFile(null);
    }
  };

  return (
    <div className="exam-container">
      {/* Header */}
      <header className="header">
        <div className="profile">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Sohag Islam"
          />
          <div>
            <strong>Sohag Islam for Saasfactor</strong>
            <span>Available for work</span>
            <a href="#">Follow</a>
          </div>
        </div>
        <button className="get-in-touch">Get in touch</button>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <strong>MAIN</strong>
            </li>
            <li>Dashboard</li>
            <li>Hiring</li>
            <li>Create a job</li>
            <li className="active">
              <strong>TALENT MANAGEMENT</strong>
            </li>
            <li>Candidates</li>
            <li>Assessments</li>
            <li>
              <strong>TOOLS</strong>
            </li>
            <li className="highlighted">Survey Builder</li>
            <li>Events</li>
            <li>Analytics</li>
            <li>Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="breadcrumb">
          <span>Interview Dashboard</span> / <span>Create Quiz</span> /{" "}
          <span>Overview</span>
        </div>

        <div className="content-header">
          <h2>
            <span className="logo">interview👤</span> Survey Builder
          </h2>
          <input type="text" placeholder="Search..." className="search-bar" />
        </div>

        <div className="assessments-panel">
          <div className="panel-header">
            <h3>Assessments</h3>
            <div className="actions">
              <select>
                <option>All</option>
              </select>
              <button
                className="create-quiz-btn"
                onClick={() => setIsModalOpen(true)}
              >
                + Create Quiz
              </button>
            </div>
          </div>

          <table className="questions-table">
            <thead>
              <tr>
                <th>Quiz Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.category}</td>
                  <td>
                    <span className="status active">Active</span>
                  </td>
                  <td>
                    <button className="action-btn">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>Graduate scheme: Investment ESG Analyst</td>
                <td>
                  <span className="status inactive">Inactive</span>
                </td>
                <td>
                  <button className="action-btn">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Quiz</h3>
            <div className="modal-content">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option>Graduate Trainee</option>
                <option>New Tech</option>
                <option>Work experience</option>
                <option>Actuary for hire</option>
                <option>(LIB) Legal</option>
                <option>Banking Operations</option>
                <option>Blockchain</option>
                <option>Business Analysis</option>
                <option>Previous</option>
              </select>

              <label>Question</label>
              <input
                type="text"
                placeholder="Write here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <label>Answer</label>
              <input
                type="text"
                placeholder="Write here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <div className="file-upload">
                <div className="upload-area">
                  {file ? file.name : "Choose a file or drag & drop it here."}
                  <input type="file" onChange={handleFileChange} />
                  <button className="browse-btn">Browse File</button>
                </div>
              </div>

              <div className="modal-actions">
                <button className="add-more">+ Add More</button>
                <div>
                  <button
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamUploadPage;
