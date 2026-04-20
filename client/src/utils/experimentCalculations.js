// Utility for experiment calculations

// Helper to parse angle string "148° 20'" or "148 20" or "148.33" to decimal degrees
const parseAngle = (str) => {
  if (!str) return NaN;
  str = str.toString().trim();

  // Check for degree/minute format
  const degMatch = str.match(/(\d+)[°\s]+(\d+)['\s]*/);
  if (degMatch) {
    return parseFloat(degMatch[1]) + parseFloat(degMatch[2]) / 60;
  }

  // Check for simple decimal
  const val = parseFloat(str);
  return isNaN(val) ? NaN : val;
};

// Helper to format decimal degrees to "D° M'"
const formatAngle = (deg) => {
  if (isNaN(deg)) return "";
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}° ${m}'`;
};

export const calculateRow = (experimentId, row, index, allRows, sampleData) => {
  const newRow = [...row];

  if (experimentId === 1) {
    // Newton's Rings
    const a = parseFloat(newRow[1]);
    const b = parseFloat(newRow[2]);

    if (!isNaN(a) && !isNaN(b)) {
      const Dn = Math.abs(a - b);
      newRow[3] = Dn.toFixed(3);
      const D2 = Dn * Dn;
      newRow[4] = D2.toFixed(4);
    }

    const p = parseInt(newRow[6]);
    const n = parseInt(newRow[0]);

    if (!isNaN(p) && !isNaN(n)) {
      const targetN = n + p;
      const targetRow = allRows ? allRows.find(r => parseInt(r[0]) === targetN) : null;

      if (targetRow) {
        const t_a = parseFloat(targetRow[1]);
        const t_b = parseFloat(targetRow[2]);
        if (!isNaN(t_a) && !isNaN(t_b)) {
          const t_Dn = Math.abs(t_a - t_b);
          const t_D2 = t_Dn * t_Dn;
          newRow[5] = t_D2.toFixed(4);
        }
      }
    }
  } else if (experimentId === 2) {
    // Diffraction Grating
    const x = parseFloat(newRow[3]);
    const y = parseFloat(newRow[4]);

    if (!isNaN(x) && !isNaN(y)) {
      const twoTheta = Math.abs(x - y);
      newRow[5] = twoTheta.toFixed(3);
      const theta = twoTheta / 2;
      newRow[6] = theta.toFixed(3);
      const thetaRad = (theta * Math.PI) / 180;
      const sinTheta = Math.sin(thetaRad);
      newRow[7] = sinTheta.toFixed(4);
    }
  } else if (experimentId === 3 || experimentId === 4) {
    // Prism (Refractive Index / Dispersive Power)
    // Cols: Type[0], Colour[1], Vernier[2], MSRa[3], VSRa[4], Totala[5], MSRb[6], VSRb[7], Totalb[8], Diff[9], Comp[10]

    // Auto-calc Total A and Total B if MSR/VSR are present
    // Assuming MSR is degrees, VSR is minutes
    const msrA = parseFloat(newRow[3]);
    const vsrA = parseFloat(newRow[4]);
    if (!isNaN(msrA) && !isNaN(vsrA)) {
      newRow[5] = formatAngle(msrA + vsrA / 60);
    }

    const msrB = parseFloat(newRow[6]);
    const vsrB = parseFloat(newRow[7]);
    if (!isNaN(msrB) && !isNaN(vsrB)) {
      newRow[8] = formatAngle(msrB + vsrB / 60);
    }

    // Calculate Difference
    const totalA = parseAngle(newRow[5]);
    const totalB = parseAngle(newRow[8]);

    if (!isNaN(totalA) && !isNaN(totalB)) {
      const diff = Math.abs(totalA - totalB);
      newRow[9] = formatAngle(diff);

      // Computed Quantity logic
      if (newRow[0].includes("Angle")) {
        newRow[10] = `2A = ${formatAngle(diff)}`;
      } else if (newRow[0].includes("Min Dev")) {
        newRow[10] = `δm = ${formatAngle(diff)}`; // Actually usually it's just diff if measuring direct vs deviated
        // If measuring two deviated positions (left/right), then it's 2*delta_m.
        // Based on Exp 4 sample data: "162 40" and "150 30" -> diff 12 10. Label "delta_m".
        // So it seems diff is delta_m directly (or 2 delta_m?).
        // Sample says "12°10'". If A is 60, delta_m around 40-50 usually. 
        // Wait, 12 deg is very small for minimum deviation of a glass prism (usually ~38-50 deg).
        // Ah, maybe the sample data in Exp 4 is just dummy or specific context.
        // Let's assume the column "Difference" is the value we need (either 2A or delta_m).
      }
    }
  } else if (experimentId === 5) {
    // Polarimeter
    // Cols: ... TotalWater[2] ... TotalSol[8], Theta[9]
    const water = parseAngle(newRow[2]);
    const sol = parseAngle(newRow[8]);

    if (!isNaN(water) && !isNaN(sol)) {
      const theta = sol - water;
      newRow[9] = theta.toFixed(3);

      // Calculate Concentration C if m and V are there
      const m = parseFloat(newRow[3]);
      const V = parseFloat(newRow[4]);
      if (!isNaN(m) && !isNaN(V) && V !== 0) {
        newRow[5] = (m / V).toFixed(3);
      }
    }
  } else if (experimentId === 6) {
    // He-Ne Laser
    // Cols: SNo[0], n[1], y[2], D[3], sinTheta[4], lambda_m[5], lambda_nm[6], lambda_A[7]
    const n = parseFloat(newRow[1]);
    const y = parseFloat(newRow[2]);
    const D = parseFloat(newRow[3]);

    if (!isNaN(n) && !isNaN(y) && !isNaN(D) && D !== 0) {
      const sinTheta = y / D; // Approximation or exact if y << D? Procedure says sinTheta = y/D.
      newRow[4] = sinTheta.toFixed(5);

      const N = 100000; // Lines/m (from sample data default). Should ideally come from sampleData or input.
      // But let's use a default if not in sampleData
      const N_val = sampleData?.N || 100000;

      const lambda = sinTheta / (n * N_val);
      newRow[5] = lambda.toExponential(4);
      newRow[6] = (lambda * 1e9).toFixed(2);
      newRow[7] = (lambda * 1e10).toFixed(1);
    }
  } else if (experimentId === 7) {
    // Compound Pendulum
    // Cols: Hole[0], Dist[1], t20[2], T[3]
    const t20 = parseFloat(newRow[2]);
    if (!isNaN(t20)) {
      newRow[3] = (t20 / 20).toFixed(3);
    }
  } else if (experimentId === 8) {
    // Planck's Constant
    // Cols: SNo[0], Wavelength[1], V0[2], 1/lambda[3]
    const lambda_nm = parseFloat(newRow[1]);
    if (!isNaN(lambda_nm) && lambda_nm > 0) {
      const lambda_m = lambda_nm * 1e-9;
      newRow[3] = (1 / lambda_m).toExponential(4);
    }
  } else if (experimentId === 9) {
    // Fresnel Biprism
    // Cols: SNo[0], N[1], MSR[2], VSR[3], Total[4], Diff10[5], Beta[6]
    const diff10 = parseFloat(newRow[5]);
    if (!isNaN(diff10)) {
      newRow[6] = (diff10 / 10).toFixed(4);
    }
  } else if (experimentId === 10) {
    // Numerical Aperture
    // Cols: SNo[0], L[1], D[2], NA[3]
    const L = parseFloat(newRow[1]);
    const D = parseFloat(newRow[2]);
    if (!isNaN(L) && !isNaN(D)) {
      const NA = D / Math.sqrt(4 * L * L + D * D);
      newRow[3] = NA.toFixed(4);
    }
  }

  return newRow;
};

export const calculateSummary = (experimentId, rows, sampleData) => {
  if (experimentId === 1) {
    // Newton's Rings Summary
    let sumDiff = 0;
    let count = 0;
    let pVal = 0;

    rows.forEach(row => {
      const d2_np = parseFloat(row[5]);
      const d2_n = parseFloat(row[4]);
      const p = parseInt(row[6]);

      if (!isNaN(d2_np) && !isNaN(d2_n) && !isNaN(p)) {
        sumDiff += (d2_np - d2_n);
        count++;
        pVal = p;
      }
    });

    if (count === 0) return "Enter readings to calculate wavelength.";
    const meanDiff = sumDiff / count;
    const R = 100; // cm

    const lambda_cm = meanDiff / (4 * pVal * R);
    const lambda_angstrom = lambda_cm * 1e8;
    const standard = 5896;
    const error = Math.abs((standard - lambda_angstrom) / standard) * 100;

    return `Formula Used:\nλ = (D²ₙ₊ₚ - D²ₙ) / (4pR)\n\nCalculations:\nMean (D²ₙ₊ₚ - D²ₙ) = ${meanDiff.toFixed(4)} cm²\np = ${pVal}\nR = ${R} cm\n\nSubstitution:\nλ = ${meanDiff.toFixed(4)} / (4 × ${pVal} × ${R})\nλ = ${lambda_cm.toExponential(4)} cm\nλ = ${lambda_angstrom.toFixed(2)} Å\n\nResult:\nStandard Value: ${standard} Å\nPercentage Error: ${error.toFixed(2)} %`;

  } else if (experimentId === 2) {
    // Diffraction Grating Summary
    const N = sampleData?.rulingsPerMeter || 600000;
    let sumLambda = 0;
    let count = 0;
    let lastCalc = "";

    rows.forEach(row => {
      const n = parseFloat(row[1]);
      const sinTheta = parseFloat(row[7]);

      if (!isNaN(n) && !isNaN(sinTheta) && n > 0) {
        const lambda = sinTheta / (n * N);
        sumLambda += lambda;
        count++;
        if (count === 1) {
          lastCalc = `For n=${n}, sinθ=${sinTheta}:\nλ = ${sinTheta} / (${n} × ${N}) = ${lambda.toExponential(4)} m`;
        }
      }
    });

    if (count === 0) return "Enter readings to calculate wavelength.";

    const meanLambda_m = sumLambda / count;
    const meanLambda_A = meanLambda_m * 1e10;
    const standard = 5893;
    const error = Math.abs((standard - meanLambda_A) / standard) * 100;

    return `Formula Used:\nλ = sinθ / (nN)\nWhere N = ${N} lines/m\n\nSample Calculation:\n${lastCalc}\n\nFinal Result:\nMean λ = ${meanLambda_A.toFixed(2)} Å\nStandard Value: ${standard} Å\nPercentage Error: ${error.toFixed(2)} %`;

  } else if (experimentId === 3 || experimentId === 4) {
    // Prism (Refractive Index / Dispersive Power)
    // Need A (from first few rows) and delta_m (from others)
    // Heuristic: Look for rows with Type "Angle A" (or "Prism Angle A") and "Min Dev" (or "Min Deviation")

    let A_values = [];
    let delta_values = { Red: [], Yellow: [], Violet: [] };

    rows.forEach(row => {
      const type = row[0] || "";
      const color = row[1] || "";
      const valStr = row[9] || row[10]; // "Difference" or "Computed"
      // In Exp 4 sample, "Computed" has "2A = ..." or "delta_m".
      // But "Difference" has the raw angle string.
      // Let's use "Difference" column [9] which is the angle value.

      const val = parseAngle(row[9]);
      if (isNaN(val)) return;

      if (type.includes("Angle")) {
        // If it's 2A, divide by 2.
        // Sample Exp 4: Diff is 120deg. 2A = 120. So A = 60.
        // Let's assume the diff is 2A.
        A_values.push(val / 2);
      } else if (type.includes("Min")) {
        // If it's delta_m.
        // Sample Exp 4: Diff is 12deg. delta_m.
        if (color.includes("Red")) delta_values.Red.push(val);
        else if (color.includes("Yellow")) delta_values.Yellow.push(val);
        else if (color.includes("Violet")) delta_values.Violet.push(val);
      }
    });

    if (A_values.length === 0) return "Enter Angle A readings.";

    const A = A_values.reduce((a, b) => a + b, 0) / A_values.length;

    // Helper for mu
    const calcMu = (dm) => {
      const rad = Math.PI / 180;
      return Math.sin((A + dm) / 2 * rad) / Math.sin(A / 2 * rad);
    };

    let output = `Calculated Prism Angle A = ${A.toFixed(2)}°\n\n`;

    if (experimentId === 3) {
      // Refractive Index (usually Yellow or just one)
      // If Yellow exists, use it, else use whatever is there
      const dms = delta_values.Yellow.length ? delta_values.Yellow : (delta_values.Red.length ? delta_values.Red : []);
      if (dms.length === 0) return output + "Enter Minimum Deviation readings.";

      const dm = dms.reduce((a, b) => a + b, 0) / dms.length;
      const mu = calcMu(dm);

      output += `Mean Minimum Deviation δm = ${dm.toFixed(2)}°\n`;
      output += `Refractive Index μ = sin((A+δm)/2) / sin(A/2)\n`;
      output += `μ = sin(${((A + dm) / 2).toFixed(2)}) / sin(${(A / 2).toFixed(2)})\n`;
      output += `μ = ${mu.toFixed(4)}`;
      return output;
    } else {
      // Dispersive Power
      const dR = delta_values.Red.length ? delta_values.Red.reduce((a, b) => a + b, 0) / delta_values.Red.length : null;
      const dV = delta_values.Violet.length ? delta_values.Violet.reduce((a, b) => a + b, 0) / delta_values.Violet.length : null;
      // Yellow is mean of R and V usually, or measured.
      const dY = delta_values.Yellow.length ? delta_values.Yellow.reduce((a, b) => a + b, 0) / delta_values.Yellow.length : null;

      if (dR === null || dV === null) return output + "Enter Red and Violet readings to calculate dispersive power.";

      const muR = calcMu(dR);
      const muV = calcMu(dV);
      const muY = dY !== null ? calcMu(dY) : (muR + muV) / 2; // Fallback if no yellow

      const omega = (muV - muR) / (muY - 1);

      output += `Mean δm (Red) = ${dR.toFixed(2)}° => μ_r = ${muR.toFixed(4)}\n`;
      output += `Mean δm (Violet) = ${dV.toFixed(2)}° => μ_v = ${muV.toFixed(4)}\n`;
      if (dY) output += `Mean δm (Yellow) = ${dY.toFixed(2)}° => μ_y = ${muY.toFixed(4)}\n`;
      else output += `Calculated μ_y (mean) = ${muY.toFixed(4)}\n`;

      output += `\nDispersive Power ω = (μ_v - μ_r) / (μ_y - 1)\n`;
      output += `ω = (${muV.toFixed(4)} - ${muR.toFixed(4)}) / (${muY.toFixed(4)} - 1)\n`;
      output += `ω = ${omega.toFixed(4)}`;
      return output;
    }

  } else if (experimentId === 5) {
    // Polarimeter
    let sumTheta = 0;
    let count = 0;
    let C_val = 0;
    let l_val = 2.0; // default 2dm

    rows.forEach(row => {
      const theta = parseFloat(row[9]);
      const C = parseFloat(row[5]);
      if (!isNaN(theta) && !isNaN(C)) {
        sumTheta += theta;
        count++;
        C_val = C;
      }
    });

    if (count === 0) return "Enter readings.";

    const meanTheta = sumTheta / count;
    const alpha = meanTheta / (l_val * C_val);
    const standard = 66.5;
    const error = Math.abs((standard - alpha) / standard) * 100;

    return `Formula: [α] = θ / (l × C)\nMean θ = ${meanTheta.toFixed(3)}°\nl = ${l_val} dm\nC = ${C_val.toFixed(3)} g/cc\n\n[α] = ${meanTheta.toFixed(3)} / (${l_val} × ${C_val.toFixed(3)})\n[α] = ${alpha.toFixed(2)} °·dm⁻¹·(g·cc⁻¹)\n\nStandard: ${standard}\nError: ${error.toFixed(2)}%`;

  } else if (experimentId === 6) {
    // He-Ne Laser
    // Already calc'd in row, just average
    let sumL = 0;
    let count = 0;
    rows.forEach(row => {
      const l = parseFloat(row[7]); // Angstroms
      if (!isNaN(l)) {
        sumL += l;
        count++;
      }
    });
    if (count === 0) return "Enter readings.";
    const meanL = sumL / count;
    const standard = 6328;
    const error = Math.abs((standard - meanL) / standard) * 100;

    return `Mean Wavelength λ = ${meanL.toFixed(1)} Å\nStandard: ${standard} Å\nError: ${error.toFixed(2)}%`;

  } else if (experimentId === 9) {
    // Fresnel Biprism
    let sumBeta = 0;
    let count = 0;
    rows.forEach(row => {
      const b = parseFloat(row[6]); // cm
      if (!isNaN(b)) {
        sumBeta += b;
        count++;
      }
    });
    if (count === 0) return "Enter readings.";
    const meanBeta = sumBeta / count;

    const D = sampleData?.D_cm || 100;
    const two_d = sampleData?.computed_2d_cm || 0.1; // Default to something reasonable if missing
    const lambda_cm = (meanBeta * two_d) / D;
    const lambda_A = lambda_cm * 1e8;

    return `Mean β = ${meanBeta.toFixed(4)} cm\nD = ${D} cm\n2d = ${two_d} cm\n\nλ = (β × 2d) / D\nλ = (${meanBeta.toFixed(4)} × ${two_d}) / ${D}\nλ = ${lambda_cm.toExponential(4)} cm\nλ = ${lambda_A.toFixed(1)} Å`;

  } else if (experimentId === 8) {
    // Planck's Constant Summary
    // Linear regression of V0 (y) vs 1/λ (x)
    // Slope m = (NΣxy - ΣxΣy) / (NΣx² - (Σx)²)
    // h = slope * e / c

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    let count = 0;

    rows.forEach(row => {
      const lambda_nm = parseFloat(row[1]);
      const V0 = parseFloat(row[2]);

      if (!isNaN(lambda_nm) && !isNaN(V0) && lambda_nm > 0) {
        const x = 1 / (lambda_nm * 1e-9); // 1/λ in m⁻¹
        const y = V0; // Volts

        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        count++;
      }
    });

    if (count < 2) return "Enter at least 2 readings to calculate slope.";

    const slope = (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);

    // Constants
    const e = 1.60217663e-19;
    const c = 2.99792458e8;

    const h = (slope * e) / c;
    const standard = 6.626e-34;
    const error = Math.abs((standard - h) / standard) * 100;

    return `Linear Regression (V₀ vs 1/λ):\nSlope = ${slope.toExponential(4)} V·m\n\nPlanck's Constant h = (Slope × e) / c\nh = (${slope.toExponential(4)} × ${e.toExponential(4)}) / ${c.toExponential(4)}\nh = ${h.toExponential(4)} J·s\n\nStandard Value: ${standard.toExponential(4)} J·s\nPercentage Error: ${error.toFixed(2)} %`;

  } else if (experimentId === 7) {
    // Compound Pendulum Summary
    // Cannot auto-calc g without L1, L2 from graph.
    return "Note: Acceleration due to gravity (g) and Radius of Gyration (K) must be calculated from the graph of T vs Distance.\n\ng = 4π²L / T²\nK = √(L₁L₂)";

  } else if (experimentId === 10) {
    // Numerical Aperture
    let sumNA = 0;
    let count = 0;
    rows.forEach(row => {
      const na = parseFloat(row[3]);
      if (!isNaN(na)) {
        sumNA += na;
        count++;
      }
    });
    if (count === 0) return "Enter readings.";
    const meanNA = sumNA / count;
    return `Mean Numerical Aperture (NA) = ${meanNA.toFixed(4)}`;
  }

  return "Calculations will appear here after data entry.";
};
