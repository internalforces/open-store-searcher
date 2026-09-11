import type { ValidationDiagnosticV1, ValidationMetricsV1 } from './refresh-validation-types.js';
import { compareText, requireValue } from './refresh-validation-types.js';

/** Research diagnostics never waive source-cut, policy or baseline review. */
export function researchObservationDiagnostics(
  metrics: ValidationMetricsV1,
): ValidationDiagnosticV1[] {
  const ids = Object.keys(metrics.categories).sort(compareText);
  const diagnostics: ValidationDiagnosticV1[] = [
    { code: 'data_as_of_unverified', severity: 'review' },
    { code: 'policy_review_required', severity: 'review' },
    { code: 'baseline_review_required', severity: 'review' },
  ];
  if (metrics.total.recordCount === 0)
    diagnostics.push({ code: 'empty_refresh', severity: 'rejection' });
  for (const categoryId of ids) {
    const unknown = requireValue(metrics.categories[categoryId]).unknownPairCount;
    if (unknown > 0)
      diagnostics.push({
        code: 'aggregate_pair_review_required',
        severity: 'review',
        categoryId,
        metric: 'unknownPairCount',
        actual: unknown,
      });
  }
  diagnostics.sort(
    (a, b) =>
      compareText(a.code, b.code) ||
      compareText(a.categoryId ?? '', b.categoryId ?? '') ||
      compareText(a.metric ?? '', b.metric ?? ''),
  );
  return diagnostics;
}
