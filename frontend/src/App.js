import React from "react";
import InputForm from "./components/InputForm";
import Results from "./components/Results";

function App() {
  const [result, setResult] = React.useState(null);

  return (
    <div style={{ margin: "20px" }}>
      <h1>Genetic Disease Risk Predictor</h1>
      <InputForm setResult={setResult} />
      {result && <Results result={result} />}
    </div>
  );
}

export default App;
