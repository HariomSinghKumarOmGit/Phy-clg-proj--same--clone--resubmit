import fs from 'fs';

const content = fs.readFileSync('pdf_content.txt', 'utf-8');

const experiments = [];
const experimentRegex = /EXPERIMENT\s+(\d+)/g;
let match;
let lastIndex = 0;

const sections = [];

while ((match = experimentRegex.exec(content)) !== null) {
  if (sections.length > 0) {
    sections[sections.length - 1].end = match.index;
  }
  sections.push({
    id: parseInt(match[1]),
    start: match.index,
    end: content.length
  });
}

for (const section of sections) {
  const text = content.substring(section.start, section.end);

  const getSectionContent = (startMarker, endMarkers) => {
    const startRegex = new RegExp(`${startMarker}`, 'i');
    const matchStart = startRegex.exec(text);
    if (!matchStart) return '';

    const startIndex = matchStart.index + matchStart[0].length;
    let endIndex = text.length;

    for (const endMarker of endMarkers) {
      const endRegex = new RegExp(`${endMarker}`, 'i');
      // Search after the start index
      const subText = text.substring(startIndex);
      const matchEnd = endRegex.exec(subText);
      if (matchEnd) {
        const absoluteEndIndex = startIndex + matchEnd.index;
        if (absoluteEndIndex < endIndex) {
          endIndex = absoluteEndIndex;
        }
      }
    }

    return text.substring(startIndex, endIndex).trim();
  };

  const title = getSectionContent('Object:', ['Apparatus:', 'Formula Used:', 'Procedure:']).replace(/^To\s+/i, '').trim(); // Remove 'To ' from start
  const objective = getSectionContent('Object:', ['Apparatus:', 'Formula Used:']);
  const materialsStr = getSectionContent('Apparatus:', ['Formula Used:', 'Experimental setup', 'Procedure:']);
  const materials = materialsStr.split(',').map(m => m.trim()).filter(m => m);

  const theory = getSectionContent('Formula Used:', ['Experimental setup', 'Procedure:', 'Diagram:']);

  // Procedure is tricky as it has numbered steps
  const procedureStr = getSectionContent('Procedure:', ['Observations:', 'Observation:', 'Table']);
  const procedure = procedureStr.split(/\n\d+\.\s+/).filter(s => s.trim()).map((s, i) => ({
    stepNo: i + 1,
    instruction: s.trim().replace(/^\d+\.\s+/, '')
  }));

  // Precautions
  const precautionsStr = getSectionContent('Precautions:', ['VIVA VOCE', 'Result:']);
  const precautions = precautionsStr.split(/\n\d+\.\s+/).filter(s => s.trim()).map((s, i) => ({
    stepNo: i + 1,
    instruction: s.trim().replace(/^\d+\.\s+/, '')
  }));

  // Result
  const resultStr = getSectionContent('Result:', ['Precautions:', 'VIVA VOCE']);

  // Viva Voce
  const vivaStr = getSectionContent('VIVA VOCE', ['EXPERIMENT']);

  experiments.push({
    id: section.id + 6, // Offset by existing 6 experiments
    title: title || `Experiment ${section.id}`,
    date: "",
    studentName: "",
    class: "",
    objective: objective,
    hypothesis: "",
    materials: materials,
    asciiDiagrams: [], // Placeholder
    theory: theory,
    procedure: procedure,
    precautions: precautions,
    observationTable: {
      columns: [], // Hard to parse tables from text automatically without complex logic
      rows: []
    },
    defaultResult: {
      summary: resultStr,
      calculation: ""
    },
    discussion: {
      analysis: "",
      sourcesOfError: "",
      improvements: "",
      vivaVoce: vivaStr // Custom field for now
    },
    conclusion: "",
    safetyNotes: ""
  });
}

console.log(JSON.stringify(experiments, null, 2));
