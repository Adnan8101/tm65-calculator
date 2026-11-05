const fail = (r: any) => ({ error: r.error, message: 'The calculation could not be completed for these inputs. Check the replaced parts and materials.' });

const mats = (rows: any[]) =>
  rows
    .filter((m) => m.share !== null && m.share > 0)
    .map((m) => ({ name: m.name, share: m.share, embodied: m.embodied, ...(m.linearDistanceKm !== undefined ? { distanceKm: m.linearDistanceKm } : {}) }));

export function view(r: any) {
  const c = r.common;
  const out: any = {
    common: {
      productType: c.productType,
      capacity: c.capacity.trim(),
      productWeightKg: c.productWeightKg,
      materialShare: c.materialSharePct,
      serviceLifeYears: c.serviceLifeYears,
      refrigerant: c.refrigerant.name,
      refrigerantChargeKg: c.refrigerantChargeKg,
    },
  };
  if (r.basic) {
    const b = r.basic;
    out.basic = b.error
      ? fail(b)
      : {
          report: { A1: b.report.A1, A1Replaced: b.report.A1Replaced, totalExRefrigerant: b.report.totalExRefrigerant, refrigerantLeakage: b.report.refrigerantLeakage, total: b.report.total },
          chart: b.chart,
          materials: mats(b.materials),
          repairsListed: b.replacements.some((x: any) => x.name),
        };
  }
  if (r.mid) {
    const m = r.mid;
    out.mid = m.error
      ? fail(m)
      : {
          report: {
            lines: m.report.lines.filter((l: any) => l.value !== 'n/a').map((l: any) => ({ code: l.code, label: l.label, value: l.value })),
            totalNoBuffer: m.report.totalNoBuffer,
            totalWithBuffer: m.report.totalWithBuffer,
            refrigerantLeakage: m.report.refrigerantLeakage,
            total: m.report.total,
          },
          chart: m.chart,
          materials: mats(m.materials),
          factory: m.factory.label,
          energyPerUnit: m.energyPerUnit,
        };
  }
  return out;
}
