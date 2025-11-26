import React, { useState } from "react";

function InputForm({ setResult }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [disease, setDisease] = useState("Disease1");
  const [snps, setSnps] = useState([{ rsid: "", allele: "" }]);

  const addSnp = () => setSnps([...snps, { rsid: "", allele: "" }]);
  const updateSnp = (index, field, value) => {
    const newSnps = [...snps];
    newSnps[index][field] = value;
    setSnps(newSnps);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
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
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
      </div>
      <div>
        <label>Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label>Disease:</label>
        <input value={disease} onChange={(e) => setDisease(e.target.value)} required />
      </div>
      <div>
        <label>SNPs (rsID and allele):</label>
        {snps.map((snp, i) => (
          <div key={i}>
            <input placeholder="rsID" value={snp.rsid} onChange={(e) => updateSnp(i, "rsid", e.target.value)} required />
            <input placeholder="Allele" value={snp.allele} onChange={(e) => updateSnp(i, "allele", e.target.value)} required maxLength={1} />
          </div>
        ))}
        <button type="button" onClick={addSnp}>Add SNP</button>
      </div>
      <button type="submit">Predict Risk</button>
    </form>
  );
}

export default InputForm;
