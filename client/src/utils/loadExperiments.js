// utils/loadExperiments.js
export async function loadExperiments() {
    try {
      const res = await fetch('/docs/experiments.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Failed to load experiments:", err);
      return [];
    }
  }
  
  export async function loadExperimentById(id) {
    try {
      const res = await fetch('/docs/experiments.json');
      const data = await res.json();
      return data.find(exp => String(exp.id) === String(id)) || null;
    } catch (err) {
      console.error("Failed to fetch experiment:", err);
      return null;
    }
  }
  