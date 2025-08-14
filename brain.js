export function cleanText(input) {
  return input
    .replace(/\r\n|\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "the","is","in","at","of","a","and","to","it","for","on","with","as","that","this","by","from","or","an","be","are","was","were","but","not","have","has","had","you","we","they","their","our","your"
]);

export function summarizeText(text, sentenceCount = 4) {
  const cleaned = cleanText(text);
  const sentences = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .filter(s => s.trim().length > 0);
  if (sentences.length <= sentenceCount) return sentences;

  const freq = new Map();
  const tokenize = (s) => s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w));

  sentences.forEach(s => {
    tokenize(s).forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  });

  const scores = sentences.map((s, i) => ({
    i,
    s,
    score: tokenize(s).reduce((acc, w) => acc + (freq.get(w) || 0), 0) / Math.max(1, s.length)
  }));

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.i - b.i)
    .map(x => x.s.trim());
}

export function extractInfo(text, opts) {
  const out = {};
  const work = cleanText(text);

  if (opts.emails) out.emails = Array.from(new Set(work.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []));
  if (opts.phones) out.phones = Array.from(new Set(work.match(/(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,4}\)[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{3,4})?/g) || [])).map(s=>s.trim());
  if (opts.urls) out.urls = Array.from(new Set(work.match(/https?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?/gi) || []));
  if (opts.dates) out.dates = Array.from(new Set(work.match(/\b(?:\d{1,2}[\/\-.]){2}\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/gi) || []));
  if (opts.amounts) out.amounts = Array.from(new Set(work.match(/(?:USD|EUR|GBP|\$|€|£)\s?\d{1,3}(?:[\s,]\d{3})*(?:\.\d{1,2})?/g) || []));

  if (opts.custom && opts.custom.length) {
    for (const { label, pattern } of opts.custom) {
      try {
        const re = new RegExp(pattern, "gi");
        out[label] = Array.from(new Set(work.match(re) || []));
      } catch {
        // ignore invalid regex
      }
    }
  }

  return out;
}