import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadExperimentById } from '../utils/loadExperiments';

export default function ExperimentFullDoc() {
  const { id } = useParams();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperimentById(id).then(data => {
      setExp(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!exp) return <div className="p-8 text-center">Experiment not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <Link to={`/experiment/${id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Experiment
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{exp.title}</h1>
        <p className="text-gray-500 mb-8">Full Documentation</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Procedure</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              {(exp.procedure || []).map(step => (
                <li key={step.stepNo} className="pl-2">
                  <span className="font-medium">Step {step.stepNo}:</span> {step.instruction}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Precautions</h2>
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              {(exp.precautions || []).map(step => (
                <li key={step.stepNo} className="pl-2">
                  {step.instruction}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
