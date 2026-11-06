export const BOOK_POSITION_KEY = 'dsh.reading-corner.v1';
export const PDF_POSITION_KEY = 'dsh.reading-corner.pdf.v1';
export const WIDTH_KEY = 'dsh.reading-corner.width.v1';
export const PDF_DB_NAME = 'dsh-reading-corner';
export const PDF_DB_STORE = 'pdf';
export const PDF_RECORD_KEY = 'current';
export const QUOTE_LIMIT = 2000;
export const MIN_WIDTH = 360;
export const DEFAULT_WIDTHS = { book: 560, pdf: 780 };

export function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

export function saveJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* storage can be unavailable; reading still works without it */
  }
}

export function loadBookPosition() {
  const saved = loadJson(BOOK_POSITION_KEY, null);
  const chapter = saved
    ? Math.min(Math.max(0, Number(saved.chapter) || 0), 7)
    : 0;
  return { chapter: chapter, scrollTop: saved ? Math.max(0, Number(saved.scrollTop) || 0) : 0 };
}

export function loadPdfPosition() {
  const saved = loadJson(PDF_POSITION_KEY, null) || {};
  return {
    name: typeof saved.name === 'string' ? saved.name : '',
    page: Math.max(1, Number(saved.page) || 1),
    zoom: Math.min(3, Math.max(0.5, Number(saved.zoom) || 1)),
    scrollTop: Math.max(0, Number(saved.scrollTop) || 0),
  };
}

export function savePdfPosition(value) {
  saveJson(PDF_POSITION_KEY, {
    name: value.name || '',
    page: value.page || 1,
    zoom: value.zoom || 1,
    scrollTop: value.scrollTop || 0,
  });
}

export function loadWidths() {
  const saved = loadJson(WIDTH_KEY, null) || {};
  const book = Number(saved.book);
  const pdf = Number(saved.pdf);
  return {
    book: Number.isFinite(book) ? Math.max(MIN_WIDTH, book) : DEFAULT_WIDTHS.book,
    pdf: Number.isFinite(pdf) ? Math.max(MIN_WIDTH, pdf) : DEFAULT_WIDTHS.pdf,
  };
}

export function saveWidths(widths) {
  saveJson(WIDTH_KEY, {
    book: Math.round(widths.book),
    pdf: Math.round(widths.pdf),
  });
}

export function openPdfDatabase() {
  return new Promise(function (resolve, reject) {
    if (typeof window.indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }
    const request = window.indexedDB.open(PDF_DB_NAME, 1);
    request.onupgradeneeded = function () {
      const database = request.result;
      if (!database.objectStoreNames.contains(PDF_DB_STORE)) {
        database.createObjectStore(PDF_DB_STORE);
      }
    };
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error || new Error('IndexedDB open failed'));
    };
  });
}

export async function readStoredPdf() {
  const database = await openPdfDatabase();
  return new Promise(function (resolve, reject) {
    const transaction = database.transaction(PDF_DB_STORE, 'readonly');
    const request = transaction.objectStore(PDF_DB_STORE).get(PDF_RECORD_KEY);
    request.onsuccess = function () {
      resolve(request.result || null);
    };
    request.onerror = function () {
      reject(request.error || new Error('IndexedDB read failed'));
    };
  });
}

export async function storePdf(name, data) {
  const database = await openPdfDatabase();
  return new Promise(function (resolve, reject) {
    const transaction = database.transaction(PDF_DB_STORE, 'readwrite');
    transaction
      .objectStore(PDF_DB_STORE)
      .put({ name: name, data: data, savedAt: Date.now() }, PDF_RECORD_KEY);
    transaction.oncomplete = function () {
      resolve();
    };
    transaction.onerror = function () {
      reject(transaction.error || new Error('IndexedDB write failed'));
    };
  });
}
