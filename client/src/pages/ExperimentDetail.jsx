import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadExperimentById } from '../utils/loadExperiments';
import ChatBot from '../components/ChatBot';
import '../styles/ExperimentDetail.css';

export default function ExperimentDetail() {
  const { id } = useParams();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperimentById(id).then(data => {
      setExp(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <p>Loading experiment...</p>;
  }

  if (!exp) {
    return <p>Experiment not found.</p>;
  }

  return (
    <div className="expDetailbg ">
      <div className="experiment-detail-container bg-gray-100 rounded-2xl">
       
        {/* Header */}
        <div className="experiment-header">
          <h1>{exp.title}</h1>
          <p className="experiment-category">{exp.category || 'General Chemistry'}</p>
        </div>
        <div className=" bg-gray-50 p-4 rounded-2xl">
          {/* Objective */}
          <section className="experiment-section " >
            <h2>Objective</h2>
            <p>{exp.objective}</p>
          </section>

          {/* Materials */}
          <section className="experiment-section">
            <h2>Materials Required</h2>
            <ul className="materials-list flex justify-between g-4 ">
              {(exp.materials || []).map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </section>

          {/* Procedure */}
          <section className="experiment-section">
            <h2>Procedure</h2>
            <ol className="steps-list">
              {(exp.procedure || []).map(step => (
                <li key={step.stepNo}>
                  <strong>Step {step.stepNo}:</strong> {step.instruction}
                </li>
              ))}
            </ol>
          </section>

          {/* Reaction Equation */}
          {exp.results?.reactionEquation && (
            <section className="experiment-section">
              <h2>Reaction Equation</h2>
              <p className="reaction-equation">{exp.results.reactionEquation}</p>
            </section>
          )}

          {/* Data Table */}
          {exp.results?.dataTable && (
            <section className="experiment-section">
              <h2>Data Table</h2>
              <pre>{JSON.stringify(exp.results.dataTable, null, 2)}</pre>
            </section>
          )}

          {/* Observation Table */}
          {exp.results?.observationTable && (
            <section className="experiment-section">
              <h2>Observation Table</h2>
              <pre>{JSON.stringify(exp.results.observationTable, null, 2)}</pre>
            </section>
          )}

          {/* Calculations */}
          {exp.results?.calculations && (
            <section className="experiment-section">
              <h2>Calculations</h2>
              <p>{exp.results.calculations}</p>
            </section>
          )}

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
}
