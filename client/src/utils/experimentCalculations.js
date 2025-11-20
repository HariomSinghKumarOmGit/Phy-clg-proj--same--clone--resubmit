/**
 * Calculates the result for a single row based on the experiment ID.
 * @param {number|string} experimentId
 * @param {Array} row - Array of cell values (strings or numbers)
 * @returns {Array} The updated row with calculated values
 */
export const calculateRow = (experimentId, row) => {
  const newRow = [...row];
  const id = Number(experimentId);

  // Helper to safely parse float
  const val = (idx) => parseFloat(newRow[idx]);

  if (id === 1) {
    // Ohm's Law: V (col 1), I (col 2) -> R = V/I (col 3)
    const V = val(1);
    const I = val(2);
    if (!isNaN(V) && !isNaN(I) && I !== 0) {
      newRow[3] = (V / I).toFixed(2);
    } else {
      newRow[3] = "";
    }
  } else if (id === 2) {
    // Vernier Caliper: MSR (1), VSR (2) -> TR = MSR + (VSR * 0.01) (3)
    const MSR = val(1);
    const VSR = val(2);
    const LC = 0.01; // cm
    if (!isNaN(MSR) && !isNaN(VSR)) {
      newRow[3] = (MSR + VSR * LC).toFixed(3);
    } else {
      newRow[3] = "";
    }
  } else if (id === 3) {
    // Screw Gauge: PSR (1), CSR (2) -> TR = PSR + (CSR * 0.01) (3)
    // Assuming LC = 0.01 mm
    const PSR = val(1);
    const CSR = val(2);
    const LC = 0.01; // mm
    if (!isNaN(PSR) && !isNaN(CSR)) {
      newRow[3] = (PSR + CSR * LC).toFixed(3);
    } else {
      newRow[3] = "";
    }
  } else if (id === 4) {
    // Simple Pendulum: L (1), t (2) -> T = t/20 (3), T^2 (4)
    const L = val(1);
    const t = val(2);
    if (!isNaN(t) && t !== 0) {
      const T = t / 20;
      newRow[3] = T.toFixed(3);
      newRow[4] = (T * T).toFixed(3);
    } else {
      newRow[3] = "";
      newRow[4] = "";
    }
  } else if (id === 5) {
    // Focal Length: u (1), v (2) -> f = uv/(u-v) (3)
    // Note: u is typically negative in sign convention, but if user enters magnitude:
    // Formula: 1/f = 1/v - 1/u. If u is -ve real object, v is +ve real image.
    // f = uv / (u - v). If user enters raw values (e.g. u=30, v=60), we might need to handle signs.
    // Standard lab practice: u is entered as positive magnitude, v as positive magnitude.
    // Real object, Real image: u is -ve, v is +ve.
    // 1/f = 1/v - 1/(-u) = 1/v + 1/u => f = uv/(u+v).
    // Let's assume user enters magnitudes for real image formation.
    const u = val(1);
    const v = val(2);
    if (!isNaN(u) && !isNaN(v) && (u + v) !== 0) {
      newRow[3] = ((u * v) / (u + v)).toFixed(2);
    } else {
      newRow[3] = "";
    }
  } else if (id === 6) {
    // Hooke's Law: Load (1), Reading (2) -> Extension (3)
    // Extension needs an initial reading. This is tricky row-by-row.
    // Let's assume col 3 is just user entered or we calculate if we knew initial.
    // For simplicity, let's assume user enters Load and Extension directly or 
    // we just calculate Extension if Reading is provided? 
    // Actually, usually it's Load vs Reading -> Extension = Reading - Initial.
    // Without initial, we can't calc row-wise purely.
    // Let's assume the user enters Load and Extension directly for now, or 
    // if we want to be smart, we'd need the first row's reading as zero error.
    // Let's leave Hooke's law row calc simple or empty if complex.
    // If the table has Load, Pointer Reading, Extension.
    // We can't calculate Extension without knowing the zero-load reading.
    // We'll skip auto-calc for Extension unless we enforce row 0 is 0 load.

    // Alternative: Just ensure numeric types.
  }

  return newRow;
};

/**
 * Calculates the summary text based on the experiment ID and all rows.
 * @param {number|string} experimentId
 * @param {Array} rows
 * @returns {string}
 */
export const calculateSummary = (experimentId, rows) => {
  const id = Number(experimentId);
  const validRows = rows.filter(r => r && r.length > 0);

  if (validRows.length === 0) return "Enter observations to see calculations.";

  let steps = "Calculation Steps:\n";

  if (id === 1) {
    // Ohm's Law
    const Rs = [];
    validRows.forEach((r, i) => {
      const V = parseFloat(r[1]);
      const I = parseFloat(r[2]);
      if (!isNaN(V) && !isNaN(I) && I !== 0) {
        const R = V / I;
        Rs.push(R);
        steps += `${i + 1}. R${i + 1} = V/I = ${V}/${I} = ${R.toFixed(2)} Ω\n`;
      }
    });

    if (Rs.length === 0) return "Calculating Resistance...";

    const meanR = Rs.reduce((a, b) => a + b, 0) / Rs.length;
    steps += `\nMean Resistance R = (${Rs.map(r => r.toFixed(2)).join(" + ")}) / ${Rs.length}\n`;
    steps += `Mean R = ${meanR.toFixed(2)} Ω`;
    return steps;

  } else if (id === 2) {
    // Vernier Caliper
    const readings = [];
    validRows.forEach((r, i) => {
      const MSR = parseFloat(r[1]);
      const VSR = parseFloat(r[2]);
      if (!isNaN(MSR) && !isNaN(VSR)) {
        const TR = MSR + (VSR * 0.01);
        readings.push(TR);
        steps += `${i + 1}. TR${i + 1} = MSR + (VSR × LC) = ${MSR} + (${VSR} × 0.01) = ${TR.toFixed(3)} cm\n`;
      }
    });

    if (readings.length === 0) return "Calculating...";

    const meanD = readings.reduce((a, b) => a + b, 0) / readings.length;
    steps += `\nMean Dimension = (${readings.map(r => r.toFixed(3)).join(" + ")}) / ${readings.length}\n`;
    steps += `Mean Dimension = ${meanD.toFixed(3)} cm`;

    // If we assume it's a cylinder and we need volume, we need length too.
    // But the table structure for exp 2 is generic. Let's stick to mean dimension for now.
    return steps;

  } else if (id === 3) {
    // Screw Gauge
    const readings = [];
    validRows.forEach((r, i) => {
      const PSR = parseFloat(r[1]);
      const CSR = parseFloat(r[2]);
      if (!isNaN(PSR) && !isNaN(CSR)) {
        const TR = PSR + (CSR * 0.01); // Assuming LC 0.01 mm
        readings.push(TR);
        steps += `${i + 1}. TR${i + 1} = PSR + (CSR × LC) = ${PSR} + (${CSR} × 0.01) = ${TR.toFixed(3)} mm\n`;
      }
    });

    if (readings.length === 0) return "Calculating...";

    const meanD = readings.reduce((a, b) => a + b, 0) / readings.length;
    steps += `\nMean Diameter = (${readings.map(r => r.toFixed(3)).join(" + ")}) / ${readings.length}\n`;
    steps += `Mean Diameter = ${meanD.toFixed(3)} mm`;
    return steps;

  } else if (id === 4) {
    // Simple Pendulum
    let sumLbyT2 = 0;
    let count = 0;
    steps += "Formula: g = 4π² × (L/T²)\n\n";

    validRows.forEach((r, i) => {
      const L = parseFloat(r[1]); // cm
      const T2 = parseFloat(r[4]);
      if (!isNaN(L) && !isNaN(T2) && T2 !== 0) {
        const ratio = L / T2;
        sumLbyT2 += ratio;
        count++;
        steps += `${i + 1}. L/T² = ${L}/${T2} = ${ratio.toFixed(2)}\n`;
      }
    });

    if (count === 0) return "Calculating g...";

    const meanLbyT2 = sumLbyT2 / count;
    steps += `\nMean (L/T²) = ${meanLbyT2.toFixed(2)}\n`;

    const g = 4 * Math.PI * Math.PI * meanLbyT2;
    steps += `g = 4 × (3.14)² × ${meanLbyT2.toFixed(2)} = ${g.toFixed(1)} cm/s²`;
    return steps;

  } else if (id === 5) {
    // Focal Length
    const fs = [];
    validRows.forEach((r, i) => {
      const u = parseFloat(r[1]);
      const v = parseFloat(r[2]);
      if (!isNaN(u) && !isNaN(v) && (u + v) !== 0) {
        const f = (u * v) / (u + v);
        fs.push(f);
        steps += `${i + 1}. f${i + 1} = uv/(u+v) = (${u}×${v})/(${u}+${v}) = ${f.toFixed(2)} cm\n`;
      }
    });

    if (fs.length === 0) return "Calculating Focal Length...";

    const meanF = fs.reduce((a, b) => a + b, 0) / fs.length;
    steps += `\nMean f = (${fs.map(r => r.toFixed(2)).join(" + ")}) / ${fs.length}\n`;
    steps += `Mean Focal Length f = ${meanF.toFixed(2)} cm`;
    return steps;

  } else if (id === 6) {
    // Hooke's Law
    const ks = [];
    validRows.forEach((r, i) => {
      const m = parseFloat(r[1]);
      const x = parseFloat(r[3]);
      if (!isNaN(m) && !isNaN(x) && x !== 0) {
        const k = m / x;
        ks.push(k);
        steps += `${i + 1}. k${i + 1} = Load/Ext = ${m}/${x} = ${k.toFixed(2)} g/cm\n`;
      }
    });

    if (ks.length === 0) return "Calculating Spring Constant...";

    const meanK = ks.reduce((a, b) => a + b, 0) / ks.length;
    steps += `\nMean k = (${ks.map(r => r.toFixed(2)).join(" + ")}) / ${ks.length}\n`;
    steps += `Mean Spring Constant k ≈ ${meanK.toFixed(2)} g-wt/cm`;
    return steps;
  }

  return "Calculations updated.";
};
