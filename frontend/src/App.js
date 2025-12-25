import React, { useState } from "react";
import "./App.css";
import "./styles/Navigation.css";
import Home from "./components/Home";
import RiskPredictor from "./pages/RiskPredictor";
import GlossaryPage from "./pages/GlossaryPage";
import BlogPage from "./pages/BlogPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const navigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "predictor":
        return <RiskPredictor onNavigate={navigate} />;
      case "glossary":
        return <GlossaryPage onNavigate={navigate} />;
      case "blog":
        return <BlogPage onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-wrapper">
      {renderPage()}
    </div>
  );
}

export default App;
