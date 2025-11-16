import { useState, useEffect } from "react";


export default function ObservationTable({ observationTable, onChange }) {
  const [table, setTable] = useState(
    observationTable || { columns: [], rows: [] }
  );
  

  useEffect(() => {
    setTable(observationTable || { columns: [], rows: [] });
  }, [observationTable]);

  if (!table || !table.columns || table.columns.length === 0) {
    return <p>No observation table defined.</p>;
  }

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...(table.rows || [])];
    const row = [...(newRows[rowIndex] || [])];
    row[colIndex] = value;
    newRows[rowIndex] = row;

    const newTable = { ...table, rows: newRows };
    setTable(newTable);
    onChange?.(newTable);
  };
  // adding sno in the table 
  const handleAddRow = () => {
      const rowIndex = (table.rows?.length || 0) + 1; // this is your i++
      
      const emptyRow = table.columns.map((col, colIndex) => {
        if (colIndex === 0) {
          // Sno column
          return rowIndex;
        }
        return "";
      });

      const newTable = {
        ...table,
        rows: [...(table.rows || []), emptyRow],
      };

      setTable(newTable);
      onChange?.(newTable);
    };

  // const handleAddRow = () => {
  //   const emptyRow = table.columns.map(() => "");
  //   const newTable = {
  //     ...table,
  //     rows: [...(table.rows || []), emptyRow],
  //   };
  //   setTable(newTable);
  //   onChange?.(newTable);
  // };

  const handleDeleteRow = (rowIndex) => {
    const newRows = (table.rows || []).filter((_, i) => i !== rowIndex);
    const newTable = { ...table, rows: newRows };
    setTable(newTable);
    onChange?.(newTable);
  };

  const getInputType = (col) => {
    if (col.type === "number") return "number";
    if (col.type === "date") return "date";
    return "text";
  };

  return (
    <div className="experiment-section">
      <h2>Observation Table</h2>

      <div className="overflow-x-auto bg-gray-100  ">
        <table className="observation-table  ">
          <thead>
            <tr className="bg-pink-50 ">
              
              {table.columns.map((col, colIndex) => (
               <th key={colIndex}>{col.name}
                </th>
              ))}
              
              <th className="">Actions</th>
            </tr>
          </thead>

          <tbody>
            {(table.rows || []).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type={getInputType(col)}
                      value={row?.[colIndex] ?? ""}
                      onChange={(e) =>
                        handleCellChange(rowIndex, colIndex, e.target.value)
                      }
                    />
                  </td>
                ))}
                <td>
                  <button type="button" onClick={() => handleDeleteRow(rowIndex)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {(!table.rows || table.rows.length === 0) && (
              <tr>
                <td
                  colSpan={table.columns.length + 1}
                  style={{ textAlign: "center" }}
                >
                  No rows yet. Click &quot;Add row&quot; to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button type="button" className=" text-purple-500 " onClick={handleAddRow}>
        Add row
      </button>
    </div>
  );
}