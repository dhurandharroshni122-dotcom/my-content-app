/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STARTER_CONCEPTS: string[] = [
  'Consumer Bias',
  'Social Proof',
  'Scarcity Effect',
  'Loss Aversion',
  'Decoy Effect',
  'Reciprocity',
  'Mere Exposure Effect',
  'Cognitive Dissonance',
  'Dormant Effect',
  'Choice Overload',
  'Framing Effect',
  'Confirmation Bias',
  'Bandwagon Effect',
  'Price Perception',
  'Status Quo Bias',
  'Emotional Buying',
  'Sunk Cost Fallacy',
  'Halo Effect',
  'FOMO',
  'Peak-End Rule'
];

/**
 * Sanitizes and splits a string of terms separated by commas, semicolons, or newlines.
 * Trims whitespace, filters empty strings, and deduplicates case-insensitively.
 */
export function parseAndDeduplicateTerms(
  rawInput: string,
  existingTerms: string[] = []
): { validNewTerms: string[]; duplicateCount: number } {
  const existingLower = new Set(existingTerms.map((t) => t.trim().toLowerCase()));
  const candidateTerms = rawInput
    .split(/[\n,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const seenInBatch = new Set<string>();
  const validNewTerms: string[] = [];
  let duplicateCount = 0;

  for (const term of candidateTerms) {
    const lower = term.toLowerCase();
    if (existingLower.has(lower) || seenInBatch.has(lower)) {
      duplicateCount++;
    } else {
      seenInBatch.add(lower);
      validNewTerms.push(term);
    }
  }

  return { validNewTerms, duplicateCount };
}
