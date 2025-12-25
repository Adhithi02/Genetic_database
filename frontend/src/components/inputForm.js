import React, { useState } from "react";
import "../styles/InputForm.css";

function InputForm({ setResult }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [disease, setDisease] = useState("Type 2 Diabetes");
  const [snps, setSnps] = useState([{ rsid: "", allele: "" }]);
  const [loading, setLoading] = useState(false);

  const addSnp = () => setSnps([...snps, { rsid: "", allele: "" }]);

  const removeSnp = (index) => {
    if (snps.length > 1) {
      setSnps(snps.filter((_, i) => i !== index));
    }
  };

  const updateSnp = (index, field, value) => {
    const newSnps = [...snps];
    newSnps[index][field] = value;
    setSnps(newSnps);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: { name, age: Number(age), gender },
          disease_name: disease,
          snps,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Failed to get prediction. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="input-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Patient Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter patient name"
            required
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            min="1"
            max="120"
            required
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Disease</label>
          <select
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            required
          >
            <option value="Type 2 Diabetes">Type 2 Diabetes</option>
            <option value="Coronary Artery Disease">Coronary Artery Disease</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Breast Cancer">Breast Cancer</option>
          </select>
        </div>
      </div>

      <div className="form-group snps-section">
        <label>Genetic Variants (SNPs)</label>
        <div className="snps-info">
          <span className="snps-hint">
            Check the Glossary for detailed explanations of genetic terms
          </span>
        </div>
        <div className="snps-list">
          {snps.map((snp, i) => (
            <div key={i} className="snp-row">
              <input
                type="text"
                placeholder="rsID (e.g., rs123456)"
                value={snp.rsid}
                onChange={(e) => updateSnp(i, "rsid", e.target.value)}
                required
                className="snp-input"
              />
              <input
                type="text"
                placeholder="Allele (A, T, G, or C)"
                value={snp.allele}
                onChange={(e) => updateSnp(i, "allele", e.target.value.toUpperCase())}
                required
                maxLength={1}
                className="snp-input allele-input"
                pattern="[ATGC]"
              />
              {snps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSnp(i)}
                  className="btn-remove"
                  title="Remove SNP"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addSnp} className="btn btn-secondary">
          Add Another SNP
        </button>
      </div>

      <button type="submit" className="btn submit-btn" disabled={loading}>
        {loading ? "Predicting..." : "Predict Risk"}
      </button>
    </form>
  );
}

export default InputForm;
