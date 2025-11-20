import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadExperimentById } from '../utils/loadExperiments';
import ChatBot from '../components/ChatBot';
import '../styles/ExperimentDetail.css';
import ObservationTable from './ObservatinTable';
import { calculateRow, calculateSummary } from '../utils/experimentCalculations';
import TypewriterText from '../components/TypewriterText';

import StepViewer from '../components/StepViewer';

export default function ExperimentDetail() {
  const [observationTable, setObservationTable] = useState({ columns: [], rows: [] });
  const [calculationResult, setCalculationResult] = useState("");

  const { id } = useParams();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperimentById(id).then(data => {
      setExp(data);
      if (data && data.observationTable) {
        setObservationTable(data.observationTable);
        // Initial calculation if any default rows exist
        const summary = calculateSummary(data.id, data.observationTable.rows || []);
        setCalculationResult(summary);
      }
      setLoading(false);
    });
  }, [id]);

  const handleTableChange = (newTable) => {
    if (!exp) return;

    // Auto-calculate rows
    const updatedRows = (newTable.rows || []).map(row => calculateRow(exp.id, row));

    const updatedTable = { ...newTable, rows: updatedRows };
    setObservationTable(updatedTable);

    // Auto-calculate summary
    const summary = calculateSummary(exp.id, updatedRows);
    setCalculationResult(summary);
  };

  if (loading) {
    return <p>Loading experiment...</p>;
  }

  if (!exp) {
    return <p>Experiment not found.</p>;
  }

  return (
    <div className="expDetailbg ">
      <div className="experiment-detail-container bg-gray-200 rounded-2xl">
        {/* Header */}
        <div className="experiment-header">
          <h1>{exp.title}</h1>
          <p className="experiment-category">{exp.category || 'General Chemistry'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl">
          {/* Objective */}
          <section className="experiment-section">
            <h2>Objective</h2>
            <p>{exp.objective}</p>
          </section>

          {/* Materials */}
          <section className="experiment-section">
            <h2>Materials Required</h2>
            <ul className="materials-list flex flex-wrap gap-4">
              {(exp.materials || []).map((m, i) => (
                <li key={i} className="basis-1/5 max-w-1/5">
                  {m}
                </li>
              ))}
            </ul>
          </section>

          {/* Theory */}
          <section>
            <div className="experiment-section">
              <h2>Theory</h2>
              <div>
                <p>{exp.theory}</p>
              </div>
            </div>
          </section>

          {/* Procedure */}
          <section className="experiment-section">
            <StepViewer steps={exp.procedure} title="Procedure" experimentId={exp.id} />
          </section>

          {/* Experimental Setup (ASCII Diagrams) */}
          {exp.asciiDiagrams && exp.asciiDiagrams.length > 0 && (
            <section className="experiment-section">
              <h2>Experimental Setup & Graphs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exp.asciiDiagrams.map((diagram, index) => (
                  <div key={index} className="flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2 ml-1">{diagram.label}</h3>
                    <div className="bg-gray-900 p-6 rounded-xl shadow-inner overflow-x-auto border border-gray-700 flex-grow">
                      <pre className="font-mono text-green-400 text-xs md:text-sm leading-relaxed whitespace-pre">
                        {diagram.art}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fallback for old single diagram format if exists */}
          {!exp.asciiDiagrams && exp.asciiDiagram && (
            <section className="experiment-section">
              <h2>Experimental Setup</h2>
              <div className="bg-gray-900 p-6 rounded-xl shadow-inner overflow-x-auto border border-gray-700">
                <pre className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre">
                  {exp.asciiDiagram}
                </pre>
              </div>
            </section>
          )}

          {/* Reaction Equation */}
          {exp.results?.reactionEquation && (
            <section className="experiment-section">
              <h2>Reaction Equation</h2>
              <p className="reaction-equation">{exp.results.reactionEquation}</p>
            </section>
          )}

          {/* Editable Observation Table */}
          <div style={{ marginTop: '2rem' }}>
            <ObservationTable
              observationTable={observationTable}
              onChange={handleTableChange}
            />
          </div>

          {/* Calculations */}
          <section className="experiment-section">
            <h2>Calculations</h2>
            <div className="p-4 bg-white rounded-lg shadow-inner min-h-[60px]">
              <TypewriterText text={calculationResult || exp.defaultResult?.calculation || "Enter data to see calculations..."} />
            </div>
          </section>

          {/* Precautions */}
          <section className="experiment-section">
            <StepViewer steps={exp.precautions} title="Precautions" experimentId={exp.id} />
          </section>

          {/* Safety Notes */}
          {exp.safetyNotes && (
            <section className="experiment-section safety-notes">
              <h2>⚠️ Safety Notes</h2>
              <p>{exp.safetyNotes}</p>
            </section>
          )}
        </div>

        <ChatBot experimentContext={exp.title} />
      </div>
    </div>
  );
};