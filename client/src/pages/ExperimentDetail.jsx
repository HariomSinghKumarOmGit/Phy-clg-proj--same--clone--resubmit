import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadExperimentById } from '../utils/loadExperiments';
import ChatBot from '../components/ChatBot';
import '../styles/ExperimentDetail.css';
import ObservationTable from './ObservationTable';
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
    const updatedRows = (newTable.rows || []).map((row, index, array) => calculateRow(exp.id, row, index, array, exp.sampleData));

    const updatedTable = { ...newTable, rows: updatedRows };
    setObservationTable(updatedTable);

    // Auto-calculate summary
    const summary = calculateSummary(exp.id, updatedRows, exp.sampleData);
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

          {/* Viva Voce */}
          {exp.discussion?.vivaVoce && exp.discussion.vivaVoce.length > 0 && (
            <VivaVoceSection vivaVoce={exp.discussion.vivaVoce} />
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

function VivaVoceSection({ vivaVoce }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vivaVoce.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + vivaVoce.length) % vivaVoce.length);
  };

  if (showAll) {
    return (
      <section className="experiment-section">
        <div className="flex justify-between items-center mb-4">
          <h2>Viva Voce</h2>
          <button
            onClick={() => setShowAll(false)}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Show Carousel
          </button>
        </div>
        <div className="space-y-4">
          {vivaVoce.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="font-semibold text-gray-800 mb-2">Q{index + 1}. {item.question}</p>
              <p className="text-gray-600">Ans: {item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const currentItem = vivaVoce[currentIndex];

  return (
    <section className="experiment-section">
      <div className="flex justify-between items-center mb-4">
        <h2>Viva Voce</h2>
        <button
          onClick={() => setShowAll(true)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
        >
          View All Questions
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 relative min-h-[150px] flex flex-col justify-center items-center text-center transition-all duration-300">

        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors"
          aria-label="Previous Question"
        >
          &#8592; {/* Left Arrow */}
        </button>

        <div className="px-8">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Question {currentIndex + 1} of {vivaVoce.length}</p>
          <h3 className="text-lg font-bold text-gray-800 mb-3">{currentItem.question}</h3>
          <p className="text-gray-600 italic">"{currentItem.answer}"</p>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors"
          aria-label="Next Question"
        >
          &#8594; {/* Right Arrow */}
        </button>

      </div>
    </section>
  );
}