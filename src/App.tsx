import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Quiz from "./pages/Quiz";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  );
}
export default App;
