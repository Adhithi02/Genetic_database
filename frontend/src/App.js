import React, { useState } from "react";
import "./App.css";
import Home from "./components/Home";
import InputPage from "./components/InputPage";
import ResultsDashboard from "./components/ResultsDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [pageData, setPageData] = useState(null);

  const navigate = (page, data) => {
    setCurrentPage(page);
    if (data) setPageData(data);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "input":
        return <InputPage onNavigate={navigate} initialDisease={pageData} />;
      case "results":
        return <ResultsDashboard data={pageData} onNavigate={navigate} />;
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
