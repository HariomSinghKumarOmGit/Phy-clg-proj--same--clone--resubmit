import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadExperimentById } from '../utils/loadExperiments';

export default function ExperimentStepsPage({ type }) {
  const { id } = useParams();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperimentById(id).then(data => {
      setExp(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-xl text-blue-600 font-semibold">Loading...</div>
    </div>
  );

  if (!exp) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl text-red-500 font-semibold">Experiment not found.</div>
    </div>
  );

  const isProcedure = type === 'procedure';
  const title = isProcedure ? 'Procedure' : 'Precautions';
  const steps = isProcedure ? exp.procedure : exp.precautions;
  const gradientClass = isProcedure
    ? 'from-blue-600 to-indigo-700'
    : 'from-amber-500 to-orange-600';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${gradientClass} text-white py-12 px-6 shadow-lg`}>
        <div className="max-w-4xl mx-auto">
          <Link
            to={`/experiment/${id}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Experiment
          </Link>
          <h1 className="text-4xl font-bold mb-2">{exp.title}</h1>
          <p className="text-xl opacity-90 font-light tracking-wide">Detailed {title}</p>
        </div>
      </div>

      {/* Steps Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8">
        <div className="space-y-6">
          {(steps || []).map((step, index) => (
            <div
              key={step.stepNo}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 flex gap-6 items-start"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-bold text-lg shadow-sm`}>
                {step.stepNo}
              </div>
              <div className="flex-grow pt-2">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
