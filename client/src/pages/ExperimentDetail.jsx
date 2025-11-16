import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadExperimentById } from '../utils/loadExperiments';
import ChatBot from '../components/ChatBot';
import '../styles/ExperimentDetail.css';
import ObservationTable from './ObservatinTable';


const defaultObservationTable = {
  columns: [
    { name: "Sno",  },
    { name: "Initial Observation", type: "number" },
    { name: "Final Observation", type: "number" },
    { name: "Net Volume", type: "text" },
  ],
  rows: [],
};

export default function ExperimentDetail() {
  const [observationTable, setObservationTable] = useState(defaultObservationTable);

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
      <div className="experiment-detail-container bg-gray-200 rounded-2xl">
       
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
            <ul className="materials-list flex flex-wrap gap-4">
              {(exp.materials || []).map((m, i) => (
                <li key={i} className='basis-1/5 max-w-1/5'>{m}</li>
              ))}
            </ul>
          </section>

          {/* Theory  */}
         <section>
          <div className='experiment-section'>
           <h2 >Theory</h2>
          <div className=''>
            <p>{exp.theory  }</p>
          </div>
          </div>
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
          {/* exp.results?.dataTable && (
            <section className="experiment-section">
              <h2>Data Table</h2>
              <pre>{JSON.stringify(exp.results.dataTable, null, 2)}</pre>
            </section>
          ) */}

            <div style={{ marginTop: "2rem" }}>
            <ObservationTable
              observationTable={observationTable}
              onChange={setObservationTable}
            />
          </div>
          

          {/* Observation Table */}
          {/* {exp.results?.observationTable && (
            <section className="experiment-section">
              <h2>Observation Table</h2>
              <pre>{JSON.stringify(exp.results.observationTable, null, 2)}</pre>
            </section>
          )} */}

          {/* Calculations */}
          {/* {exp.results?.calculations && ( */}
            <section className="experiment-section">
              <h2>Calculations</h2>
              <p>{exp.results.calculations}</p>
            </section>
          
           {/* )} */}

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
