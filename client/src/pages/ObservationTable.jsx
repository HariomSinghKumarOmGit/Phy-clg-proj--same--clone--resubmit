import React from 'react';

const ObservationTable = ({ observationTable, onChange }) => {
  if (!observationTable || !observationTable.columns || !observationTable.rows) {
    return <p>No observation table available.</p>;
  }

  const handleInputChange = (rowIndex, colIndex, value) => {
    const newRows = [...observationTable.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;

    onChange({
      ...observationTable,
      rows: newRows
    });
  };

  const handleAddRow = () => {
    if (onChange) {
      // Create a new row with empty strings for each column
      const newRow = new Array(observationTable.columns.length).fill("");
      onChange({
        ...observationTable,
        rows: [...observationTable.rows, newRow]
      });
    }
  };

  const handleDeleteRow = (rowIndex) => {
    if (onChange) {
      const newRows = observationTable.rows.filter((_, index) => index !== rowIndex);
      onChange({
        ...observationTable,
        rows: newRows
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 mb-4">
        <thead>
          <tr>
            {observationTable.columns.map((col, index) => (
              <th key={index} className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {col.name || col}
              </th>
            ))}
            <th className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {observationTable.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-4 py-2 border-b border-gray-300">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                </td>
              ))}
              <td className="px-4 py-2 border-b border-gray-300">
                <button
                  onClick={() => handleDeleteRow(rowIndex)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleAddRow}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Row
      </button>
    </div>
  );
};

export default ObservationTable;
