import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import Typical from "react-typical";

import estimationImg from "../assets/estimationManagement.png";
import lessonDetails from "../assets/lessonLearnedDetails.png";
import lessonRegister from "../assets/lessonLEarnedRegister.png";
import roleManagement from "../assets/roleManagement.png";
import sideNav from "../assets/sideNav.png";
import sprintDetails from "../assets/sprintDetails.png";
import taskDetails from "../assets/TasksDetails.png";
import storyCreation from "../assets/userStoryCreation.png";

const LandingPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    contact: "",
    message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Request submitted! Backend functionality coming soon.");
  };

  const featureCards = [
    { title: "Role Management", img: roleManagement },
    { title: "User Management", img: sideNav },
    { title: "Project Management", img: storyCreation },
    { title: "Estimation (T-shirt Sizing)", img: estimationImg },
    { title: "Epic & Sprint Management", img: sprintDetails },
    { title: "Task Tracking", img: taskDetails },
    { title: "Lessons Learned Register", img: lessonRegister },
    { title: "Lessons Learned Details", img: lessonDetails },
  ];

  const workflowSteps = [
    "Define Epics",
    "Create User Stories",
    "Plan Sprints",
    "Assign & Estimate",
    "Track Tasks",
    "Log Lessons Learned",
  ];

  const benefits = [
    "Centralized backlog and sprint visualization",
    "Automated time tracking and changelogs",
    // "Smart AI recommendations for sprint planning",
    "Secure and role-specific access control",
    "Team-wide visibility with personalized views",
    "Streamlined onboarding and attendance management",
    "Continuous improvement through lessons learned",
  ];

  const smhHighlights = [
    "Industry Expertise",
    "Customized Solutions",
    "Proven Track Record",
    "Comprehensive Services",
    "Cutting-Edge Technology",
    "Customer-Centric Approach",
    "Enhanced Efficiency",
    "Robust Security",
  ];

  return (
    <div className="font-sans bg-black text-white scroll-smooth">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50 shadow-md border-b border-red-600">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-extrabold tracking-wide text-red-500">
            ActionLoop
          </h1>
          <nav className="space-x-6 text-sm">
            {["about", "features", "workflow", "benefits", "smh", "demo"].map(
              (sec, i) => (
                <Link
                  key={i}
                  to={sec}
                  smooth
                  duration={500}
                  className="hover:text-red-500 cursor-pointer capitalize"
                >
                  {sec}
                </Link>
              )
            )}
            <a
              href="/login"
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 text-sm"
            >
              Sign In
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="about"
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-black to-red-950"
      >
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          Welcome to ActionLoop
        </motion.h2>
        <Typical
          steps={[
            "Empowering Agile Teams",
            2000,
            "From Chaos to Clarity",
            2000,
            "Plan. Assign. Deliver. Learn.",
            2000,
          ]}
          loop={Infinity}
          wrapper="h3"
          className="text-xl text-red-400 font-medium mb-8"
        />
        <p className="max-w-3xl mx-auto text-gray-300 text-lg">
          ActionLoop is a modern, AI-powered Scrum & Project Management platform
          that streamlines execution with intelligent backlog management,
          document control, employee onboarding, attendance tracking, and
          lessons learned analytics — all tailored for growing agile teams.
        </p>
        <div className="mt-10 animate-bounce">
          <Link
            to="features"
            smooth
            duration={600}
            className="text-red-400 cursor-pointer hover:text-white"
          >
            ↓ Explore Features
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-black py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Core Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featureCards.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900 border border-red-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-500 transition-all"
              >
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-48 object-cover border-b border-red-600"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-white text-center">
                    {card.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="bg-gradient-to-br from-red-950 to-black py-20 px-6"
      >
        {/* <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-white">
            How ActionLoop Works
          </h2>
          <div className="flex overflow-x-auto gap-10 px-4 pb-4">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                className="min-w-[220px] bg-gray-800 border border-red-600 rounded-xl p-6 shadow text-white flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold mb-4">
                  {i + 1}
                </div>
                <p className="text-lg font-semibold">{step}</p>
              </motion.div>
            ))}
          </div>
        </div> */}

        <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12 text-white">
                How ActionLoop Works
            </h2>

            <div
                className="flex overflow-x-auto gap-6 px-4 pb-4 scroll-smooth snap-x snap-mandatory"
                style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#dc2626 #1f2937", // red + gray background
                }}
            >
                {workflowSteps.map((step, i) => (
                <motion.div
                    key={i}
                    className="min-w-[260px] snap-start bg-gray-800 border border-red-600 rounded-xl p-6 shadow text-white flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                >
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold mb-4">
                    {i + 1}
                    </div>
                    <p className="text-lg font-semibold">{step}</p>
                </motion.div>
                ))}
            </div>
            </div>


      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-black py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-10">
            Why Teams Love ActionLoop
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-gray-900 text-white border border-gray-700 rounded-xl p-6 hover:border-red-500 transition-all"
              >
                <p className="text-lg">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SMH Global */}
      <section
        id="smh"
        className="bg-gradient-to-r from-yellow-100 via-white to-blue-100 py-20 px-6 text-black"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-[#003366]">
            SMH Global Services
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-800 mb-10">
            At SMH Global Services, we understand that choosing the right
            partner for your IT and business solutions is crucial for success.
            With a proven track record of excellence, industry expertise, and a
            customer-centric approach, we are dedicated to delivering tailored
            solutions that meet your unique needs and drive your business
            forward.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {smhHighlights.map((item, i) => (
              <motion.div
                key={i}
                className="bg-white border-l-4 border-red-500 p-6 rounded-lg shadow hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <p className="text-lg font-semibold text-[#003366]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section id="demo" className="bg-black py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white mb-6">
              Request a Demo
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="p-3 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="p-3 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="p-3 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className="p-3 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
                />
              </div>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What would you like to know more about?"
                className="w-full p-3 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400 h-32"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded transition-all"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 text-center border-t border-red-700">
        <p>
          &copy; {new Date().getFullYear()} ActionLoop by SMH Global Services.
          All rights reserved.
        </p>
        <p className="text-sm mt-2 text-gray-400">
          Crafted for high-performance agile teams.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

