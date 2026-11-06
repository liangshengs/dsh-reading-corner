import { createEngine } from './generated-engine.js';

let cache = null;

export function loadPdfEngine() {
  if (cache) return cache;
  cache = createEngine();
  return cache;
}
