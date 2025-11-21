import fs from 'fs';

const currentExperiments = JSON.parse(fs.readFileSync('client/public/docs/experiments.json', 'utf-8'));
const newExperiments = JSON.parse(fs.readFileSync('new_experiments.json', 'utf-8'));

// Filter out empty or invalid entries from newExperiments
const validNewExperiments = newExperiments.filter(exp => {
  return exp.objective && exp.objective.trim() !== '' && exp.materials.length > 0;
});

// Remove duplicates based on ID, keeping the last one (assuming it might be better parsed) or just check uniqueness
const uniqueNewExperiments = [];
const seenIds = new Set();

for (const exp of validNewExperiments) {
  if (!seenIds.has(exp.id)) {
    uniqueNewExperiments.push(exp);
    seenIds.add(exp.id);
  } else {
    // If we already have this ID, check if this one is "better" (e.g. longer description)
    // For now, let's just log it and skip, or replace?
    // The previous analysis showed the *second* one was good.
    // But my filter above checks for objective and materials. 
    // The bad entry had empty objective and empty materials.
    // So the filter should have handled it.
    console.log(`Duplicate ID ${exp.id} found. Skipping.`);
  }
}

// Re-assign IDs to ensure continuity
let lastId = currentExperiments.length > 0 ? currentExperiments[currentExperiments.length - 1].id : 0;

const finalNewExperiments = uniqueNewExperiments.map((exp, index) => {
  return {
    ...exp,
    id: lastId + 1 + index
  };
});

const mergedExperiments = [...currentExperiments, ...finalNewExperiments];

fs.writeFileSync('client/public/docs/experiments.json', JSON.stringify(mergedExperiments, null, 2));

console.log(`Merged ${finalNewExperiments.length} new experiments.`);
console.log(`Total experiments: ${mergedExperiments.length}`);
