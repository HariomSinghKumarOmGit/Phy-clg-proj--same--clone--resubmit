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
    // e/m by J.J. Thomson method
    // Cols: SNo[0], V[1], y[2], theta[3], H[4], e/m[5]
    const V = parseFloat(newRow[1]);
    const y = parseFloat(newRow[2]);
    const theta = parseFloat(newRow[3]);
    const l = 5.0;
    const L = 12.0;
    const d = 1.0;

    if (!isNaN(theta)) {
      const H = 0.32 * Math.tan((theta * Math.PI) / 180);
      if (isFinite(H)) {
        newRow[4] = H.toFixed(3);
      }
    }

    const Hval = parseFloat(newRow[4]);
    if (!isNaN(V) && !isNaN(y) && !isNaN(Hval) && Hval !== 0) {
      const em = (V * y) / (l * L * Hval * Hval * d);
      newRow[5] = em.toFixed(3);
    }
  } else if (experimentId === 2) {
    // RC charging/discharging: no row-level derived columns
  } else if (experimentId === 3) {
    // Zener reverse characteristics: no row-level derived columns
  } else if (experimentId === 4) {
    // Hall Effect
    // Cols: SNo[0], Ix_mA[1], Ey_mV[2], Ey/Ix[3]
    const Ix = parseFloat(newRow[1]);
    const Ey = parseFloat(newRow[2]);
    if (!isNaN(Ix) && !isNaN(Ey) && Ix !== 0) {
      // (mV / mA) is numerically equal to (V / A)
      newRow[3] = (Ey / Ix).toFixed(3);
    }
  } else if (experimentId === 5) {
    // Melde's Method
    // Cols: SNo[0], M[1], p[2], L[3], l[4], Mode[5], v[6]
    const M = parseFloat(newRow[1]);
    const p = parseFloat(newRow[2]);
    const L = parseFloat(newRow[3]);
    const mode = (newRow[5] || "").toLowerCase();
    const m = 0.0025;
    const g = 980;

    if (!isNaN(L) && !isNaN(p) && p !== 0) {
      const loopLen = L / p;
      newRow[4] = loopLen.toFixed(2);
    }

    const l = parseFloat(newRow[4]);
    if (!isNaN(M) && !isNaN(l) && l !== 0) {
      const waveTerm = Math.sqrt((M * g) / m);
      let v = NaN;
      if (mode.includes("long")) {
        v = waveTerm / l;
      } else if (mode.includes("trans")) {
        v = waveTerm / (2 * l);
      }
      if (!isNaN(v) && isFinite(v)) {
        newRow[6] = v.toFixed(1);
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
    // e/m by J.J. Thomson method summary
    let sumEm = 0;
    let count = 0;
    const standard = 1.756;

    rows.forEach((row) => {
      const em = parseFloat(row[5]);
      if (!isNaN(em)) {
        sumEm += em;
        count++;
      }
    });

    if (count === 0) return "Enter readings to calculate e/m.";
    const meanEm = sumEm / count;
    const error = Math.abs((standard - meanEm) / standard) * 100;
    return `Calculated Mean e/m: ${meanEm.toFixed(3)} × 10⁷ emu/gm\nStandard Value: ${standard.toFixed(3)} × 10⁷ emu/gm\n\nPercentage Error: ${error.toFixed(2)} %`;

  } else if (experimentId === 2) {
    // RC time constant summary
    const validRows = rows
      .map((r) => ({
        t: parseFloat(r[1]),
        charging: parseFloat(r[2]),
        discharging: parseFloat(r[3])
      }))
      .filter((r) => !isNaN(r.t) && (!isNaN(r.charging) || !isNaN(r.discharging)))
      .sort((a, b) => a.t - b.t);

    if (validRows.length === 0) return "Enter readings to calculate time constant.";

    const chargingVals = validRows.map((r) => r.charging).filter((v) => !isNaN(v));
    const dischargingVals = validRows.map((r) => r.discharging).filter((v) => !isNaN(v));
    const I0 = Math.max(
      chargingVals.length ? Math.max(...chargingVals) : 0,
      dischargingVals.length ? Math.max(...dischargingVals) : 0
    );
    if (!I0) return "Enter valid current readings to calculate time constant.";

    const chargeTarget = 0.632 * I0;
    const dischargeTarget = 0.368 * I0;

    const nearestTime = (key, target) => {
      let best = null;
      validRows.forEach((r) => {
        const val = r[key];
        if (!isNaN(val)) {
          const diff = Math.abs(val - target);
          if (!best || diff < best.diff) {
            best = { t: r.t, diff };
          }
        }
      });
      return best?.t;
    };

    const tauCharge = nearestTime("charging", chargeTarget);
    const tauDischarge = nearestTime("discharging", dischargeTarget);
    const tauValues = [tauCharge, tauDischarge].filter((v) => typeof v === "number");
    if (!tauValues.length) return "Need more readings around 0.632I0 and 0.368I0 to estimate τ.";

    const tau = tauValues.reduce((a, b) => a + b, 0) / tauValues.length;
    const theoretical = 1.0;
    const error = Math.abs((theoretical - tau) / theoretical) * 100;

    return `Calculated Time Constant (from readings): ${tau.toFixed(3)} s\nTheoretical Value: τ = RC = ${theoretical.toFixed(1)} s\n\nI₀ = ${I0.toFixed(3)} mA\n0.632 × I₀ = ${chargeTarget.toFixed(3)} mA\n0.368 × I₀ = ${dischargeTarget.toFixed(3)} mA\n\nPercentage Error: ${error.toFixed(2)} %`;

  } else if (experimentId === 3) {
    // Zener breakdown voltage summary
    const validRows = rows
      .map((r) => ({ V: parseFloat(r[1]), I: parseFloat(r[2]) }))
      .filter((r) => !isNaN(r.V) && !isNaN(r.I))
      .sort((a, b) => a.V - b.V);

    if (validRows.length < 2) return "Enter more readings to calculate breakdown voltage.";

    let vz = null;
    // Practical criterion: first voltage where current reaches 1 mA
    for (const point of validRows) {
      if (point.I >= 1) {
        vz = point.V;
        break;
      }
    }

    // Fallback: max slope point (knee)
    if (vz === null) {
      let maxSlope = -Infinity;
      for (let i = 1; i < validRows.length; i++) {
        const dV = validRows[i].V - validRows[i - 1].V;
        const dI = validRows[i].I - validRows[i - 1].I;
        if (dV !== 0) {
          const slope = dI / dV;
          if (slope > maxSlope) {
            maxSlope = slope;
            vz = validRows[i].V;
          }
        }
      }
    }

    const standard = 5.6;
    const error = Math.abs((standard - vz) / standard) * 100;
    return `Calculated Breakdown Voltage Vz: ${vz.toFixed(2)} V\nStandard (Rated) Value: ${standard.toFixed(1)} V\n\nPercentage Error: ${error.toFixed(2)} %`;

  } else if (experimentId === 4) {
    // Hall effect summary
    const validRows = rows
      .map((r) => ({ Ix: parseFloat(r[1]), Ey: parseFloat(r[2]), ratio: parseFloat(r[3]) }))
      .filter((r) => !isNaN(r.Ix) && !isNaN(r.Ey) && r.Ix !== 0);
    if (!validRows.length) return "Enter readings to calculate Hall coefficient.";

    // Mean slope in V/A (same numeric as mV/mA)
    let sumRatio = 0;
    let ratioCount = 0;
    validRows.forEach((r) => {
      const ratio = !isNaN(r.ratio) ? r.ratio : (r.Ey / r.Ix);
      if (!isNaN(ratio)) {
        sumRatio += ratio;
        ratioCount++;
      }
    });
    if (!ratioCount) return "Enter valid Ix and Ey readings.";

    const slope = sumRatio / ratioCount;
    const t = 5.0e-4;
    const Bz = 0.30;
    const sigma = 2.5;
    const e = 1.6e-19;

    const RH = slope * (t / Bz);
    const n = 1 / (e * RH);
    const mu = RH * sigma;

    return `Calculated Hall Coefficient RH: ${RH.toFixed(5)} m³/C\nCalculated Carrier Density n: ${n.toExponential(3)} per m³\nCalculated Mobility μ: ${mu.toFixed(5)} m²/V·s`;

  } else if (experimentId === 5) {
    // Melde's method summary
    let sumT = 0;
    let countT = 0;
    let sumL = 0;
    let countL = 0;

    rows.forEach((row) => {
      const mode = (row[5] || "").toLowerCase();
      const v = parseFloat(row[6]);
      if (!isNaN(v)) {
        if (mode.includes("trans")) {
          sumT += v;
          countT++;
        } else if (mode.includes("long")) {
          sumL += v;
          countL++;
        }
      }
    });

    if (!countT && !countL) return "Enter readings to calculate frequency.";

    const meanT = countT ? (sumT / countT) : NaN;
    const meanL = countL ? (sumL / countL) : NaN;
    const aggregate = [meanT, meanL].filter((v) => !isNaN(v));
    const meanOverall = aggregate.reduce((a, b) => a + b, 0) / aggregate.length;
    const standard = 100;
    const error = Math.abs((standard - meanOverall) / standard) * 100;

    const transverseText = !isNaN(meanT) ? `Calculated Mean Frequency (Transverse): ${meanT.toFixed(2)} Hz\n` : "";
    const longitudinalText = !isNaN(meanL) ? `Calculated Mean Frequency (Longitudinal): ${meanL.toFixed(2)} Hz\n` : "";
    return `${transverseText}${longitudinalText}Overall Mean Frequency: ${meanOverall.toFixed(2)} Hz\nStandard Value: ${standard} Hz\n\nPercentage Error: ${error.toFixed(2)} %`;

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
