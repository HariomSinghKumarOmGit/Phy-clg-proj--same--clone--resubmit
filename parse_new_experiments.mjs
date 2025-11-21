import fs from 'fs';

const text = fs.readFileSync('pdf_content.txt', 'utf-8');

// Helper to convert LaTeX-like strings to Unicode for better display without a LaTeX renderer
const latexToUnicode = (str) => {
  if (!str) return '';
  return str
    .replace(/\$\$\\lambda = \\frac\{D_\{n\+p\}\^2 - D_n\^2\}\{4pR\}\$\$/g, 'λ = (D²ₙ₊ₚ - D²ₙ) / 4pR')
    .replace(/\$D_\{n\+p\} =\$/g, 'Dₙ₊ₚ =')
    .replace(/\$\(n\+p\)\^\{th\}\$/g, '(n+p)ᵗʰ')
    .replace(/\$D_n =\$/g, 'Dₙ =')
    .replace(/\$n\^\{th\}\$/g, 'nᵗʰ')
    .replace(/\$P =\$/g, 'p =')
    .replace(/\$R =\$/g, 'R =')
    .replace(/\(a\+b\)sinθ=nλ/g, '(a+b)sinθ = nλ')
    .replace(/λ=n\(a\+b\)sinθ/g, 'λ = n(a+b)sinθ')
    .replace(/μ = \\frac\{\\sin\(\\frac\{A \+ \\delta_m\}\{2\}\)\}\{\\sin\(\\frac\{A\}\{2\}\)\}/g, 'μ = sin((A + δₘ)/2) / sin(A/2)')
    .replace(/\$\\delta_m\$/g, 'δₘ')
    .replace(/ω=μy −1μv −μr/g, 'ω = (μᵥ - μᵣ) / (μ_y - 1)')
    .replace(/μ=sin\(2A \)sin\(2A\+δm \)/g, 'μ = sin(A + δₘ/2) / sin(A/2)')
    .replace(/S=l×Cθ =l⋅mθ⋅V/g, 'S = θ / (l × C) = (θ × V) / (l × m)')
    .replace(/T=2πgL/g, 'T = 2π√(L/g)')
    .replace(/g=T24π2L/g, 'g = 4π²L / T²')
    .replace(/K=L1 ×L2/g, 'K = √(L₁ × L₂)')
    .replace(/L=2AD\+BE/g, 'L = (AD + BE) / 2')
    .replace(/AC×BC/g, 'AC × BC')
    .replace(/CD×CE/g, 'CD × CE')
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '($1)/($2)')
    .replace(/\\times/g, '×')
    .replace(/\\circ/g, '°')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\pi/g, 'π')
    .replace(/\\mathring\{A\}/g, 'Å')
    .replace(/\\text\{(.+?)\}/g, '$1')
    .replace(/_\{(.+?)\}/g, '$1')
    .replace(/\^\{(.+?)\}/g, '^$1');
};

const cleanText = (str) => {
  if (!str) return "";
  return str.replace(/\s+\d+$/, '').replace(/\.$/, '').trim();
};

const getSectionContent = (fullText, startMarker, endMarkers) => {
  const startRegex = new RegExp(`${startMarker}`, 'i');
  const matchStart = startRegex.exec(fullText);
  if (!matchStart) return '';

  const startIndex = matchStart.index + matchStart[0].length;
  let endIndex = fullText.length;

  for (const endMarker of endMarkers) {
    const endRegex = new RegExp(`${endMarker}`, 'i');
    const subText = fullText.substring(startIndex);
    const matchEnd = endRegex.exec(subText);
    if (matchEnd) {
      const absoluteEndIndex = startIndex + matchEnd.index;
      if (absoluteEndIndex < endIndex) {
        endIndex = absoluteEndIndex;
      }
    }
  }

  return fullText.substring(startIndex, endIndex).trim();
};

const extractDiagrams = (text) => {
  const diagrams = [];
  const diagramRegex = /(?:Diagram|Experimental Setup Diagram|Graph).*?:\s*\n(?:.*Plaintext\s*\n)?([\s\S]*?)(?=\n[A-Z][a-z]+:|\n\d+)/g;
  let match;
  while ((match = diagramRegex.exec(text)) !== null) {
    let label = "Experimental Setup";
    if (match[0].toLowerCase().includes("graph")) {
      label = "Graph";
    }
    diagrams.push({
      label: label,
      art: match[1].trim()
    });
  }
  return diagrams;
};

const parseAsciiTable = (rawTable) => {
  if (!rawTable) return { columns: [], rows: [] };

  const lines = rawTable.trim().split('\n');
  const contentLines = lines.filter(line => !line.trim().startsWith('+'));

  if (contentLines.length < 2) return { columns: [], rows: [] };

  const headerLine = contentLines[0];
  const headers = headerLine.split('|')
    .map(h => h.trim())
    .filter(h => h);

  const columns = headers.map(h => ({ name: h, type: "string" }));

  const rows = [];
  for (let i = 1; i < contentLines.length; i++) {
    const line = contentLines[i];
    const rawCells = line.split('|').map(c => c.trim());
    if (rawCells[0] === '') rawCells.shift();
    if (rawCells[rawCells.length - 1] === '') rawCells.pop();

    if (rawCells.length > 0) {
      const rowObj = {};
      columns.forEach((col, idx) => {
        rowObj[col.name] = rawCells[idx] || "";
      });
      rows.push(rowObj);
    }
  }

  return { columns, rows };
};

const extractTable = (text) => {
  const tableRegex = /Observation Table:[\s\S]*?Plaintext\s*\n([\s\S]*?)(?=\n[A-Z][a-z]+:|\n\d+)/;
  const match = tableRegex.exec(text);
  if (match) {
    const raw = match[1].trim();
    const structured = parseAsciiTable(raw);
    return {
      raw: raw,
      columns: structured.columns.length > 0 ? structured.columns : [{ name: "Data", type: "string" }],
      rows: structured.rows
    };
  }
  return null;
};

const experiments = [];
const experimentSections = text.split(/EXPERIMENT\s+\d+/i).slice(1);

experimentSections.forEach((sectionText, index) => {
  const id = index + 1;

  let title = getSectionContent(sectionText, 'Object:', ['Apparatus:', 'Materials:', 'Objective']);
  if (!title) title = getSectionContent(sectionText, 'Objective:', ['Apparatus:', 'Materials:']);

  const objective = title;

  const apparatusStr = getSectionContent(sectionText, 'Apparatus:', ['Formula Used:', 'Theory:', 'Diagram:']);
  const materials = apparatusStr.split(',').map(s => s.trim()).filter(s => s);

  const theoryRaw = getSectionContent(sectionText, 'Formula Used:', ['Procedure:', 'Diagram:', 'Experimental Setup']);
  const theory = latexToUnicode(theoryRaw);

  const procedureStr = getSectionContent(sectionText, 'Procedure:', ['Observations:', 'Observation:', 'Table', 'Precautions']);
  let procedure = [];

  const numberedStepRegex = /^\s*(\d+(?:\.\d+)?)\.?\s+(.*)/gm;
  let matchStep;
  while ((matchStep = numberedStepRegex.exec(procedureStr)) !== null) {
    procedure.push({
      stepNo: matchStep[1],
      instruction: matchStep[2].trim().replace(/\s+\d+$/, '')
    });
  }

  if (procedure.length < 2) {
    procedure = [];
    const lines = procedureStr.split('\n').filter(l => l.trim().length > 5);
    lines.forEach((line, index) => {
      const cleanLine = line.trim().replace(/\s+\d+$/, '');
      const potentialNumber = cleanLine.match(/^(\d+(?:\.\d+)?)\.?\s+(.*)/);
      if (potentialNumber) {
        procedure.push({
          stepNo: potentialNumber[1],
          instruction: potentialNumber[2]
        });
      } else {
        procedure.push({
          stepNo: (index + 1).toString(),
          instruction: cleanLine
        });
      }
    });
  }

  const cleanTitleStr = cleanText(title);

  const precautionsStr = getSectionContent(sectionText, 'Precautions:', ['Result:', 'Viva Voce:', 'Discussion']);
  const precautions = [];
  const precautionRegex = /^\s*(\d+)\.?\s+(.*)/gm;
  let matchPrec;
  while ((matchPrec = precautionRegex.exec(precautionsStr)) !== null) {
    precautions.push({
      stepNo: parseInt(matchPrec[1]),
      instruction: matchPrec[2].trim().replace(/\s+\d+$/, '')
    });
  }

  const asciiDiagrams = extractDiagrams(sectionText);
  const observationTable = extractTable(sectionText);
  const resultStr = getSectionContent(sectionText, 'Result:', ['Viva Voce:', 'Precautions:', 'Discussion']);

  const vivaStr = getSectionContent(sectionText, 'Viva Voce:', ['EXPERIMENT', '$']);
  const vivaQuestions = [];
  const vivaRegex = /Q\.\s*(\d+)\s*(.*?)\s*Ans\.\s*(.*?)(?=(?:Q\.|$))/gs;
  let vivaMatch;
  while ((vivaMatch = vivaRegex.exec(vivaStr)) !== null) {
    vivaQuestions.push({
      question: vivaMatch[2].trim(),
      answer: vivaMatch[3].trim().replace(/\s+\d+$/, '')
    });
  }

  experiments.push({
    id: id,
    title: cleanTitleStr || `Experiment ${id}`,
    date: "",
    studentName: "",
    class: "",
    objective: cleanText(objective),
    hypothesis: "",
    materials: materials,
    asciiDiagrams: asciiDiagrams,
    theory: theory,
    procedure: procedure,
    precautions: precautions,
    observationTable: observationTable || { columns: [], rows: [] },
    defaultResult: {
      summary: latexToUnicode(resultStr),
      calculation: latexToUnicode(theory)
    },
    discussion: {
      analysis: "",
      sourcesOfError: "",
      improvements: "",
      vivaVoce: vivaQuestions
    },
    conclusion: "",
    safetyNotes: ""
  });
});

console.log(JSON.stringify(experiments, null, 2));
