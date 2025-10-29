import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import "../index.css";

const fadeIn = (
  direction: "up" | "down" | "left" | "right" = "up",
  delay = 0
): Variants => ({
  hidden: {
    opacity: 0,
    y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
    x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      delay,
      duration: 0.8,
      ease: "easeOut",
    },
  },
});

const MainContent: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: "📊",
      title: "Smart Quizzes",
      text: "Test your knowledge and track your progress instantly.",
    },
    {
      icon: "👩‍🏫",
      title: "Teacher Tools",
      text: "Upload lessons, manage students, and view results in real time.",
    },
    {
      icon: "🎯",
      title: "Personalized Learning",
      text: "AI-powered recommendations based on your strengths.",
    },
    {
      icon: "🌍",
      title: "Learn Anywhere",
      text: "Mobile-friendly and always available online.",
    },
  ];

  return (
    <main className="main-container min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      <section className="hero-section flex flex-col items-center justify-center text-center py-20 px-6 md:px-12">
        <motion.h1
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold mb-4"
        >
          Learn Smarter. Teach Better. Connect Freely.
        </motion.h1>

        <motion.p
          variants={fadeIn("up", 0.4)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8"
        >
          MegaPend is your all-in-one learning platform — where students take
          interactive quizzes, teachers share materials, and performance grows
          with every click.
        </motion.p>

        <motion.div
          variants={fadeIn("up", 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition">
            Get Started
          </button>
          <button className="border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-2xl font-semibold transition">
            Explore Courses
          </button>
        </motion.div>
      </section>

      <section className="features-section py-20 bg-gray-50 dark:bg-gray-800 text-center">
        <motion.h2
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12"
        >
          Why Choose MegaPend?
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn(i % 2 === 0 ? "left" : "right", i * 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="feature-card p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="testimonials-section py-20 px-6 text-center">
        <motion.blockquote
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="italic text-lg md:text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300"
        >
          “MegaPend has made studying so easy! I can track my quiz scores and
          improve every week.”
          <footer className="mt-4 text-blue-600 dark:text-blue-400 font-semibold">
            — Chika, Student
          </footer>
        </motion.blockquote>
      </section>

      <section className="cta-section py-20 bg-blue-600 dark:bg-blue-700 text-center text-white">
        <motion.h2
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Join thousands of students and teachers on MegaPend today.
        </motion.h2>
        <motion.button
          variants={fadeIn("up", 0.4)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-white text-blue-700 hover:bg-gray-200 px-8 py-3 rounded-2xl font-semibold transition"
        >
          Create Your Account Now 🚀
        </motion.button>
      </section>
    </main>
  );
};

export default MainContent;
