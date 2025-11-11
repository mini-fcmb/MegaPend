// src/components/CreateQuizComponent.tsx
import React, { useEffect, useState } from "react";

/*
CreateQuizComponent.tsx
- No backend required; uses local state + localStorage.
- Two timers:
  1) durationSeconds -> how long a student has once they start (per attempt)
  2) startAt / endAt -> scheduled availability (Upcoming / Live / Expired)
- Live clock updates every second so statuses/countdowns update automatically.
*/

type Option = { id: string; text: string };

type Question = {
  id: string;
  question: string;
  options: Option[];
  answerId: string | null;
};

type Quiz = {
  id: string;
  title: string;
  category?: string;
  startAt: string; // ISO
  endAt: string; // ISO
  durationSeconds: number; // how long the quiz lasts when student starts (in seconds)
  questions: Question[];
  createdAt: string;
};

const uid = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export default function CreateQuizComponent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const raw = localStorage.getItem("quizzes_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 'now' updates every second so UI status (Upcoming / Live / Expired) is reactive
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [durationAmount, setDurationAmount] = useState(30); // numeric
  const [durationUnit, setDurationUnit] = useState<"seconds" | "minutes">(
    "minutes"
  );
  const [questions, setQuestions] = useState<Question[]>(() => [
    {
      id: uid("q"),
      question: "",
      options: [
        { id: uid("o"), text: "" },
        { id: uid("o"), text: "" },
        { id: uid("o"), text: "" },
        { id: uid("o"), text: "" },
      ],
      answerId: null,
    },
  ]);

  useEffect(() => {
    localStorage.setItem("quizzes_v1", JSON.stringify(quizzes));
  }, [quizzes]);

  // helpers
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setStartAt("");
    setEndAt("");
    setDurationAmount(30);
    setDurationUnit("minutes");
    setQuestions([
      {
        id: uid("q"),
        question: "",
        options: [
          { id: uid("o"), text: "" },
          { id: uid("o"), text: "" },
          { id: uid("o"), text: "" },
          { id: uid("o"), text: "" },
        ],
        answerId: null,
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions((s) => [
      ...s,
      {
        id: uid("q"),
        question: "",
        options: [
          { id: uid("o"), text: "" },
          { id: uid("o"), text: "" },
          { id: uid("o"), text: "" },
          { id: uid("o"), text: "" },
        ],
        answerId: null,
      },
    ]);
  };

  const removeQuestion = (qid: string) => {
    setQuestions((s) => s.filter((q) => q.id !== qid));
  };

  const updateQuestionText = (qid: string, text: string) => {
    setQuestions((s) =>
      s.map((q) => (q.id === qid ? { ...q, question: text } : q))
    );
  };

  const updateOptionText = (qid: string, oid: string, text: string) => {
    setQuestions((s) =>
      s.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oid ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const addOption = (qid: string) => {
    setQuestions((s) =>
      s.map((q) =>
        q.id === qid
          ? { ...q, options: [...q.options, { id: uid("o"), text: "" }] }
          : q
      )
    );
  };

  const removeOption = (qid: string, oid: string) => {
    setQuestions((s) =>
      s.map((q) => {
        if (q.id !== qid) return q;
        const filtered = q.options.filter((o) => o.id !== oid);
        const answerId = filtered.some((o) => o.id === q.answerId)
          ? q.answerId
          : null;
        return { ...q, options: filtered, answerId };
      })
    );
  };

  const setAnswer = (qid: string, oid: string) => {
    setQuestions((s) =>
      s.map((q) => (q.id === qid ? { ...q, answerId: oid } : q))
    );
  };

  const durationInSeconds = () =>
    durationUnit === "minutes" ? durationAmount * 60 : durationAmount;

  const validateAndSave = () => {
    // basic validation
    if (!title.trim()) return alert("Please provide a quiz title.");
    if (!startAt || !endAt) return alert("Please set start and end date/time.");
    if (new Date(startAt) >= new Date(endAt))
      return alert("End time must be after start time.");
    if (questions.length === 0) return alert("Add at least one question.");

    for (const q of questions) {
      if (!q.question.trim()) return alert("All questions must have text.");
      if (q.options.length < 2)
        return alert("Each question must have at least two options.");
      if (!q.answerId)
        return alert("Please choose an answer for each question.");
      for (const o of q.options)
        if (!o.text.trim()) return alert("All options must have text.");
    }

    const newQuiz: Quiz = {
      id: uid("quiz"),
      title: title.trim(),
      category: category.trim(),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      durationSeconds: durationInSeconds(),
      questions: questions,
      createdAt: new Date().toISOString(),
    };

    setQuizzes((s) => [newQuiz, ...s]);
    setIsOpen(false);
    resetForm();
  };

  const quizStatus = (quiz: Quiz) => {
    const start = new Date(quiz.startAt);
    const end = new Date(quiz.endAt);
    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Live";
    return "Expired";
  };

  const secondsUntil = (t: Date) =>
    Math.max(0, Math.floor((t.getTime() - now.getTime()) / 1000));

  const formatCountdown = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const canStudentStart = (quiz: Quiz) => quizStatus(quiz) === "Live";

  // Simulate student starting a quiz. In real app you'd create a student attempt record.
  const startQuizForStudent = (quiz: Quiz) => {
    if (!canStudentStart(quiz)) return alert("Quiz is not available to start.");

    // when the student starts, they should have quiz.durationSeconds seconds to complete.
    // For demo we just alert with the allowed duration and show the number of questions.
    alert(
      `Starting quiz: ${quiz.title}\nYou have ${quiz.durationSeconds} seconds to finish ${quiz.questions.length} questions.`
    );
  };

  // UI
  return (
    <div className="cq-root">
      <style>{`
      .cq-root{font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:28px; background:#f5f7fb; min-height:100vh}
      .container{max-width:980px;margin:0 auto;background:white;border-radius:12px;box-shadow:0 8px 20px rgba(15,23,42,0.06);overflow:hidden}
      .header{display:flex;justify-content:space-between;align-items:center;padding:20px 28px;border-bottom:1px solid #eef2f6}
      .title{font-weight:600;font-size:18px;color:#111827}
      .controls{display:flex;gap:12px;align-items:center}
      .btn{padding:8px 14px;border-radius:8px;border:none;cursor:pointer;font-weight:600}
      .btn-primary{background:#6b46c1;color:white}
      .btn-ghost{background:transparent;border:1px solid #e6e9ef;color:#333}
      .table-wrap{padding:18px}
      table{width:100%;border-collapse:collapse}
      th,td{padding:12px 8px;text-align:left;font-size:14px;color:#394049}
      th{font-weight:600;color:#6b7280}
      tr+tr td{border-top:1px solid #f1f5f9}
      .status{padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px}
      .status.Upcoming{background:#fff7ed;color:#92400e;border:1px solid #ffedd5}
      .status.Live{background:#ecfdf5;color:#065f46;border:1px solid #bbf7d0}
      .status.Expired{background:#f8fafc;color:#475569;border:1px solid #e2e8f0}
      .smallmuted{font-size:12px;color:#6b7280}

      /* modal */
      .modal-backdrop{position:fixed;inset:0;background:rgba(2,6,23,0.45);display:flex;align-items:center;justify-content:center;z-index:60}
      .modal{width:720px;background:white;border-radius:12px;padding:18px;box-shadow:0 20px 50px rgba(2,6,23,0.45);max-height:86vh;overflow:auto}
      .modal h3{margin:0 0 8px 0}
      .form-row{display:flex;gap:12px;margin-bottom:12px}
      .col{flex:1}
      label{display:block;font-size:13px;color:#374151;margin-bottom:6px}
      input[type="text"], input[type="datetime-local"], select, textarea{width:100%;padding:10px;border:1px solid #e6e9ef;border-radius:8px}
      textarea{min-height:80px}
      .questions{margin-top:12px}
      .question-card{border:1px dashed #e6e9ef;padding:12px;border-radius:8px;margin-bottom:10px;background:#fbfdff}
      .opts{display:flex;flex-direction:column;gap:8px}
      .opt-row{display:flex;gap:8px;align-items:center}
      .opt-row input[type="text"]{flex:1}
      .muted{font-size:13px;color:#6b7280}
      .q-actions{display:flex;gap:8px;align-items:center;margin-top:8px}

      @media (max-width:800px){
        .modal{width:92%;}
        .form-row{flex-direction:column}
      }
      `}</style>

      <div className="container">
        <div className="header">
          <div>
            <div className="title">Assessments</div>
            <div className="smallmuted">
              Uploaded quizzes and their schedule
            </div>
          </div>
          <div className="controls">
            <button className="btn btn-ghost">Filter</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              + Create Quiz
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Schedule</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                    No quizzes uploaded yet — click "Create Quiz" to add one.
                  </td>
                </tr>
              )}

              {quizzes.map((qz) => {
                const status = quizStatus(qz);
                const start = new Date(qz.startAt);
                const end = new Date(qz.endAt);
                const startsIn = secondsUntil(start);
                const endsIn = secondsUntil(end);

                return (
                  <tr key={qz.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{qz.title}</div>
                      <div className="smallmuted">
                        {qz.category || "General"}
                      </div>
                    </td>
                    <td>
                      <div>{start.toLocaleString()}</div>
                      <div className="smallmuted">
                        to {end.toLocaleString()}
                      </div>
                      <div className="smallmuted" style={{ marginTop: 6 }}>
                        {status === "Upcoming" &&
                          `Starts in ${formatCountdown(startsIn)}`}
                        {status === "Live" &&
                          `Ends in ${formatCountdown(endsIn)}`}
                        {status === "Expired" &&
                          `Ended ${formatCountdown(
                            Math.floor((now.getTime() - end.getTime()) / 1000)
                          )} ago`}
                      </div>
                    </td>
                    <td>
                      <div>
                        {qz.durationSeconds >= 60
                          ? `${Math.round(qz.durationSeconds / 60)} min`
                          : `${qz.durationSeconds} sec`}
                      </div>
                      <div className="smallmuted">Per student attempt</div>
                    </td>
                    <td>
                      <div>{qz.questions.length} questions</div>
                    </td>
                    <td>
                      <div className={`status ${status}`}>{status}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            if (canStudentStart(qz)) {
                              startQuizForStudent(qz);
                            } else {
                              alert(
                                `Quiz is not available to students. Status: ${quizStatus(
                                  qz
                                )}`
                              );
                            }
                          }}
                        >
                          {canStudentStart(qz) ? "Start quiz" : "Preview"}
                        </button>

                        <button
                          className="btn"
                          onClick={() => {
                            if (confirm("Delete this quiz?"))
                              setQuizzes((s) =>
                                s.filter((x) => x.id !== qz.id)
                              );
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Quiz</h3>
            <div className="muted">
              Create a quiz with multiple questions. Students will only access
              the quiz between start and end time.
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="form-row">
                <div className="col">
                  <label>Quiz Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="col">
                  <label>Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    type="text"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="col">
                  <label>Start Date & Time</label>
                  <input
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    type="datetime-local"
                  />
                </div>
                <div className="col">
                  <label>End Date & Time</label>
                  <input
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    type="datetime-local"
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: 220 }}>
                  <label>Duration (how long student has to finish)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      value={durationAmount}
                      onChange={(e) =>
                        setDurationAmount(Number(e.target.value))
                      }
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #e6e9ef",
                      }}
                    />
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as any)}
                      style={{ padding: 10, borderRadius: 8 }}
                    >
                      <option value="minutes">minutes</option>
                      <option value="seconds">seconds</option>
                    </select>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label>&nbsp;</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        resetForm();
                      }}
                    >
                      Reset
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                      className="btn"
                      onClick={() => {
                        /* placeholder for import */
                      }}
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>

              <div className="questions">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <strong>Questions</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => addQuestion()}
                    >
                      + Add Question
                    </button>
                  </div>
                </div>

                {questions.map((qq, idx) => (
                  <div key={qq.id} className="question-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <label>Q{idx + 1}. Question</label>
                        <input
                          type="text"
                          value={qq.question}
                          onChange={(e) =>
                            updateQuestionText(qq.id, e.target.value)
                          }
                          placeholder="Write the question here"
                        />

                        <div style={{ marginTop: 8 }}>
                          <label>Options</label>
                          <div className="opts">
                            {qq.options.map((opt) => (
                              <div className="opt-row" key={opt.id}>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) =>
                                    updateOptionText(
                                      qq.id,
                                      opt.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option text"
                                />
                                <label style={{ whiteSpace: "nowrap" }}>
                                  <input
                                    type="radio"
                                    name={`answer_${qq.id}`}
                                    checked={qq.answerId === opt.id}
                                    onChange={() => setAnswer(qq.id, opt.id)}
                                  />{" "}
                                  Answer
                                </label>
                                <button
                                  className="btn btn-ghost"
                                  onClick={() => removeOption(qq.id, opt.id)}
                                  aria-label="Remove option"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}

                            <div
                              style={{ display: "flex", gap: 8, marginTop: 8 }}
                            >
                              <button
                                className="btn btn-ghost"
                                onClick={() => addOption(qq.id)}
                              >
                                + Add option
                              </button>
                              <div style={{ flex: 1 }} />
                              <button
                                className="btn"
                                onClick={() => removeQuestion(qq.id)}
                              >
                                Remove question
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => validateAndSave()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
