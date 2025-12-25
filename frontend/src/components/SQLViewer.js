import React from "react";
import "../styles/SQLViewer.css";

function SQLViewer({ sql, stepTitle }) {
  // Simple SQL syntax highlighting
  const highlightSQL = (sqlString) => {
    const keywords = [
      "SELECT", "FROM", "WHERE", "JOIN", "INSERT", "INTO", "VALUES",
      "UPDATE", "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "INDEX",
      "AND", "OR", "NOT", "IN", "LIKE", "ORDER", "BY", "GROUP", "HAVING",
      "RETURNING", "AS", "ON", "SUM", "AVG", "COUNT", "MAX", "MIN",
      "INNER", "LEFT", "RIGHT", "FULL", "OUTER", "UNION", "DISTINCT"
    ];

    let highlighted = sqlString;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      highlighted = highlighted.replace(regex, (match) => {
        return `<span class="sql-keyword">${match}</span>`;
      });
    });

    // Highlight strings
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');
    highlighted = highlighted.replace(/:(\w+)/g, '<span class="sql-parameter">:$1</span>');

    return highlighted;
  };

  return (
    <div className="sql-viewer">
      <div className="sql-header">
        <strong>SQL Query for {stepTitle}</strong>
      </div>
      <div className="sql-code">
        <pre>
          <code 
            dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }}
          />
        </pre>
      </div>
      <div className="sql-explanation">
        <strong>Understanding this query:</strong>
        <ul>
          {sql.includes("SELECT") && (
            <li><strong>SELECT</strong> retrieves data from tables</li>
          )}
          {sql.includes("JOIN") && (
            <li><strong>JOIN</strong> combines data from multiple tables</li>
          )}
          {sql.includes("WHERE") && (
            <li><strong>WHERE</strong> filters rows based on conditions</li>
          )}
          {sql.includes("INSERT") && (
            <li><strong>INSERT</strong> adds new records to a table</li>
          )}
          {(sql.includes("SUM") || sql.includes("AVG")) && (
            <li><strong>Aggregation</strong> functions combine multiple values</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default SQLViewer;

