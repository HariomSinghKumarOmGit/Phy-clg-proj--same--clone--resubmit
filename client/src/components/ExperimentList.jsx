import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadExperiments } from '../utils/loadExperiments';
import '../styles/ExperimentList.css';

export default function ExperimentList({ data: propData }) {
  const [data, setData] = useState(propData || []);

  useEffect(() => {
    // If data is provided as prop, use it
    if (propData && propData.length > 0) {
      setData(propData);
    } else {
      // Otherwise, load from JSON file as fallback
      loadExperiments().then(setData);
    }
  }, [propData]);

  if (!data || data.length === 0) {
    return <p className="no-experiments">No experiments available yet.</p>;
  }

  return (
    <section className="experiment-list">
      {data.map(exp => (
        <Link key={exp.id} to={`/experiment/${exp.id}`} className="experiment-card">
          <h3>{exp.title}</h3>
          <p className="experiment-objective">{exp.objective}</p>
          <div className="experiment-meta">
            <span className="experiment-materials">
              {exp.materials?.length || 0} materials
            </span>
            <span className="experiment-steps">
              {exp.procedure?.length || 0} steps
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
