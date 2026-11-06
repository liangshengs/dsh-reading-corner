import React from 'react';
import { BOOK } from './book.js';
import { useTranslate } from './i18n.js';
import { useUi } from './store.js';
import { Icon } from './icons.js';
import { PANEL_CSS } from './styles.js';
import {
  BOOK_POSITION_KEY,
  DEFAULT_WIDTHS,
  MIN_WIDTH,
  loadBookPosition,
  loadPdfPosition,
  loadWidths,
  readStoredPdf,
  saveJson,
  savePdfPosition,
  saveWidths,
  storePdf,
} from './storage.js';
import { loadPdfEngine } from './engine.js';
import { PdfPage } from './pdf-page.js';

const h = React.createElement;

function iconButton(label, onClick, paths, pressed) {
  return h(
    'button',
    {
      type: 'button',
      className: 'dshrc-iconbtn',
      title: label,
      'aria-label': label,
      'aria-pressed': pressed === undefined ? undefined : pressed ? 'true' : 'false',
      onClick: onClick,
    },
    h(Icon, { size: 16 }, paths),
  );
}

export function ReaderPanel(props) {
  const ui = props.ui;
  const sessions = props.sessions;
  const t = useTranslate(props.i18n);
  useUi(ui);
  const open = ui.isOpen();
  const session = ui.getSession();

  const initialBook = React.useRef(null);
  if (initialBook.current === null) initialBook.current = loadBookPosition();
  const initialWidths = React.useRef(null);
  if (initialWidths.current === null) initialWidths.current = loadWidths();

  const [chapter, setChapter] = React.useState(initialBook.current.chapter);
  const [tocOpen, setTocOpen] = React.useState(true);
  const [widths, setWidths] = React.useState(initialWidths.current);
  const [resizing, setResizing] = React.useState(false);
  const [outline, setOutline] = React.useState([]);
  const [outlineState, setOutlineState] = React.useState('idle');
  const [mode, setMode] = React.useState('book');
  const [doc, setDoc] = React.useState(null);
  const [pdf, setPdf] = React.useState(null);
  const [pdfState, setPdfState] = React.useState({ status: 'idle', message: '' });
  const [pageNumber, setPageNumber] = React.useState(function () {
    return loadPdfPosition().page;
  });
  const [zoom, setZoom] = React.useState(function () {
    return loadPdfPosition().zoom;
  });
  const [regionMode, setRegionMode] = React.useState(false);
  const [pageHasText, setPageHasText] = React.useState(true);
  const [ask, setAsk] = React.useState(null);
  const [question, setQuestion] = React.useState('');
  const [sendState, setSendState] = React.useState({ status: 'idle', message: '' });
  const [restoreScroll, setRestoreScroll] = React.useState(function () {
    return loadPdfPosition().scrollTop;
  });

  const bodyRef = React.useRef(null);
  const chapterRef = React.useRef(chapter);
  chapterRef.current = chapter;
  const pageRef = React.useRef(pageNumber);
  pageRef.current = pageNumber;
  const zoomRef = React.useRef(zoom);
  zoomRef.current = zoom;
  const pdfRef = React.useRef(pdf);
  pdfRef.current = pdf;
  const widthsRef = React.useRef(widths);
  widthsRef.current = widths;
  const pdfScrollRef = React.useRef(loadPdfPosition().scrollTop);
  const scrollSaveTimerRef = React.useRef(0);
  const fileRef = React.useRef(null);
  const docRef = React.useRef(null);
  const taskRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const bootRef = React.useRef(false);
  const importSeq = React.useRef(0);
  const askInputRef = React.useRef(null);
  const sentTimerRef = React.useRef(0);
  const draggingRef = React.useRef(false);

  const persistBook = function () {
    const element = bodyRef.current;
    saveJson(BOOK_POSITION_KEY, {
      chapter: chapterRef.current,
      scrollTop: element ? element.scrollTop : 0,
    });
  };

  const persistPdf = function () {
    const currentPdf = pdfRef.current;
    savePdfPosition({
      name: currentPdf ? currentPdf.name : loadPdfPosition().name,
      page: pageRef.current,
      zoom: zoomRef.current,
      scrollTop: pdfScrollRef.current,
    });
  };

  const handlePdfScroll = function (scrollTop) {
    pdfScrollRef.current = scrollTop;
    window.clearTimeout(scrollSaveTimerRef.current);
    scrollSaveTimerRef.current = window.setTimeout(function () {
      persistPdf();
    }, 500);
  };

  const goChapter = function (index) {
    const next = Math.max(0, Math.min(BOOK.chapters.length - 1, index));
    if (next === chapterRef.current) return;
    saveJson(BOOK_POSITION_KEY, { chapter: next, scrollTop: 0 });
    setChapter(next);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  };

  const goPage = function (index) {
    if (!pdfRef.current) return;
    const next = Math.max(1, Math.min(pdfRef.current.pages, index));
    if (next === pageRef.current) return;
    pdfScrollRef.current = 0;
    setPageNumber(next);
  };

  const beginResize = function (event) {
    if (event.button !== 0) return;
    event.preventDefault();
    draggingRef.current = true;
    setResizing(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (reason) {
      /* pointer capture is best-effort */
    }
  };

  const moveResize = function (event) {
    if (!draggingRef.current) return;
    const next = Math.max(
      MIN_WIDTH,
      Math.min(window.innerWidth - 40, window.innerWidth - event.clientX - 12),
    );
    setWidths(function (previous) {
      const updated = { book: previous.book, pdf: previous.pdf };
      updated[mode] = next;
      return updated;
    });
  };

  const endResize = function (event) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setResizing(false);
    saveWidths(widthsRef.current);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (reason) {
      /* capture may already be gone */
    }
  };

  const nudgeWidth = function (delta) {
    setWidths(function (previous) {
      const updated = { book: previous.book, pdf: previous.pdf };
      updated[mode] = Math.max(
        MIN_WIDTH,
        Math.min(window.innerWidth - 40, previous[mode] + delta),
      );
      return updated;
    });
  };

  const resetWidth = function () {
    setWidths(function (previous) {
      const updated = { book: previous.book, pdf: previous.pdf };
      updated[mode] = DEFAULT_WIDTHS[mode];
      return updated;
    });
  };

  React.useEffect(function () {
    const element = bodyRef.current;
    if (!element) return;
    element.scrollTop = initialBook.current.scrollTop;
  }, []);

  React.useEffect(function () {
    const element = bodyRef.current;
    if (!element) return undefined;
    let frame = 0;
    const onScroll = function () {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        saveJson(BOOK_POSITION_KEY, {
          chapter: chapterRef.current,
          scrollTop: element.scrollTop,
        });
      });
    };
    element.addEventListener('scroll', onScroll, { passive: true });
    return function () {
      element.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  React.useEffect(
    function () {
      if (!doc) return undefined;
      const timer = window.setTimeout(function () {
        savePdfPosition({
          name: pdf ? pdf.name : '',
          page: pageNumber,
          zoom: zoom,
          scrollTop: pdfScrollRef.current,
        });
      }, 300);
      return function () {
        window.clearTimeout(timer);
      };
    },
    [doc, pageNumber, zoom, pdf],
  );

  React.useEffect(function () {
    const timer = window.setTimeout(function () {
      saveWidths(widthsRef.current);
    }, 300);
    return function () {
      window.clearTimeout(timer);
    };
  }, [widths]);

  React.useEffect(
    function () {
      if (!open) return undefined;
      const onKey = function (event) {
        if (event.key === 'Escape') {
          if (ask) {
            setAsk(null);
            setSendState({ status: 'idle', message: '' });
            return;
          }
          persistBook();
          persistPdf();
          ui.setOpen(false);
          return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        if (mode !== 'pdf' || !doc) return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target;
        if (target) {
          const tag = target.tagName ? target.tagName.toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;
        }
        event.preventDefault();
        goPage(pageRef.current + (event.key === 'ArrowRight' ? 1 : -1));
      };
      window.addEventListener('keydown', onKey);
      return function () {
        window.removeEventListener('keydown', onKey);
      };
    },
    [open, ask, mode, doc, ui],
  );

  React.useEffect(
    function () {
      if (ask && askInputRef.current) askInputRef.current.focus();
    },
    [ask],
  );

  React.useEffect(function () {
    return function () {
      window.clearTimeout(sentTimerRef.current);
      window.clearTimeout(scrollSaveTimerRef.current);
    };
  }, []);

  React.useEffect(function () {
    if (mode !== 'pdf') setRegionMode(false);
  }, [mode]);

  React.useEffect(function () {
    const onUnload = function () {
      persistBook();
      persistPdf();
      saveWidths(widthsRef.current);
    };
    window.addEventListener('beforeunload', onUnload);
    return function () {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  React.useEffect(
    function () {
      if (!doc) {
        setOutline([]);
        setOutlineState('idle');
        return undefined;
      }
      let cancelled = false;
      setOutline([]);
      setOutlineState('loading');
      (async function () {
        try {
          const raw = await doc.getOutline();
          if (cancelled || !raw) {
            if (!cancelled) setOutlineState('ready');
            return;
          }
          const flat = [];
          const walk = async function (items, depth) {
            for (const item of items) {
              let page = null;
              try {
                let destination = item.dest;
                if (typeof destination === 'string') {
                  destination = await doc.getDestination(destination);
                }
                if (Array.isArray(destination) && destination.length) {
                  const first = destination[0];
                  const index =
                    typeof first === 'number' ? first - 1 : await doc.getPageIndex(first);
                  page = index + 1;
                }
              } catch (reason) {
                page = null;
              }
              flat.push({ title: item.title || '', depth: depth, page: page });
              if (item.items && item.items.length) await walk(item.items, depth + 1);
            }
          };
          await walk(raw, 0);
          if (!cancelled) {
            setOutline(flat);
            setOutlineState('ready');
          }
        } catch (reason) {
          if (!cancelled) {
            setOutline([]);
            setOutlineState('ready');
          }
        }
      })();
      return function () {
        cancelled = true;
      };
    },
    [doc],
  );

  React.useEffect(
    function () {
      if (!open || bootRef.current) return undefined;
      bootRef.current = true;
      let cancelled = false;
      (async function () {
        try {
          const saved = await readStoredPdf();
          if (!saved || cancelled || !saved.data) return;
          await openDocument(saved.name || 'PDF', saved.data);
        } catch (reason) {
          /* no remembered file is a normal first run */
        }
      })();
      return function () {
        cancelled = true;
      };
    },
    [open],
  );

  const destroyDoc = async function () {
    if (taskRef.current) {
      try {
        await taskRef.current.destroy();
      } catch (reason) {
        /* already destroyed */
      }
      taskRef.current = null;
    }
    docRef.current = null;
    setDoc(null);
  };

  const openDocument = async function (name, buffer) {
    const sequence = ++importSeq.current;
    await destroyDoc();
    if (sequence !== importSeq.current) return;
    setPdf({ name: name, pages: 0 });
    setPdfState({ status: 'loading', message: '' });
    setMode('pdf');
    setRegionMode(false);
    setPageHasText(true);
    try {
      const engine = loadPdfEngine();
      engineRef.current = engine.pdfjs;
      const task = engine.pdfjs.getDocument({
        data: new Uint8Array(buffer),
        isEvalSupported: false,
      });
      taskRef.current = task;
      const loaded = await task.promise;
      if (sequence !== importSeq.current) {
        try {
          await task.destroy();
        } catch (reason) {
          /* superseded */
        }
        return;
      }
      docRef.current = loaded;
      setDoc(loaded);
      setPdf({ name: name, pages: loaded.numPages });
      const saved = loadPdfPosition();
      const sameBook = saved.name === name;
      const nextPage = sameBook ? Math.min(saved.page, loaded.numPages) : 1;
      const nextScroll = sameBook ? saved.scrollTop : 0;
      pdfScrollRef.current = nextScroll;
      setRestoreScroll(nextScroll);
      setPageNumber(Math.max(1, nextPage));
      setPdfState({ status: 'idle', message: '' });
    } catch (reason) {
      const message =
        reason && reason.name === 'PasswordException'
          ? t('pdfPassword')
          : String((reason && reason.message) || reason);
      setPdfState({ status: 'error', message: message });
      setMode('pdf');
    }
  };

  const pickFile = function () {
    if (!fileRef.current) return;
    fileRef.current.value = '';
    fileRef.current.click();
  };

  const onFilePicked = async function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      try {
        await storePdf(file.name, buffer);
      } catch (reason) {
        /* reading works even when the file cannot be remembered */
      }
      await openDocument(file.name, buffer);
    } catch (reason) {
      setPdfState({
        status: 'error',
        message: String((reason && reason.message) || reason),
      });
      setMode('pdf');
    }
  };

  const bookTitle = function () {
    const name = pdf ? pdf.name : BOOK.title;
    return String(name).replace(/\.pdf$/i, '');
  };

  const sectionTitle = function () {
    let title = '';
    for (let index = 0; index < outline.length; index += 1) {
      const entry = outline[index];
      if (entry.page !== null && entry.page <= pageNumber && entry.title) title = entry.title;
    }
    return title;
  };

  const scopeLine = function () {
    const where = t('where', {
      book: bookTitle(),
      page: pageNumber,
      total: pdf ? pdf.pages : 0,
    });
    const section = sectionTitle();
    return where + (section ? t('sectionSuffix', { title: section }) : '');
  };

  const composeAsk = function (quote, isImage, options) {
    const allowEmpty = !!(options && options.allowEmpty);
    const typed = (question || '').trim();
    const asked = typed || (allowEmpty ? '' : t('defaultQuestion'));
    const where = t('where', {
      book: bookTitle(),
      page: pageNumber,
      total: pdf ? pdf.pages : 0,
    });
    const section = sectionTitle();
    const sectionPart = section ? t('sectionSuffix', { title: section }) : '';
    const questionLine = asked ? t('askQuestion', { question: asked }) : t('myQuestion');
    const intro = isImage
      ? t('imageAskIntro', { where: where, section: sectionPart })
      : t('askIntro', { where: where, section: sectionPart });
    const lines = [intro];
    if (!isImage) {
      lines.push(
        quote
          .split(/\n/)
          .map(function (line) {
            return '> ' + line;
          })
          .join('\n'),
      );
    }
    lines.push(t('teacherNote'));
    lines.push(questionLine);
    return lines.join('\n\n');
  };

  const sendAsk = async function () {
    if (!ask) return;
    const isImage = !!ask.image;
    const quote = (ask.text || '').trim();
    if (!isImage && !quote) return;
    if (!session) {
      setSendState({ status: 'error', message: t('needSession') });
      return;
    }
    let binding;
    try {
      binding = sessions.binding(session.id);
    } catch (reason) {
      binding = undefined;
    }
    if (!binding) {
      setSendState({ status: 'error', message: t('needSession') });
      return;
    }
    setSendState({ status: 'sending', message: t('sending') });
    try {
      const parts = [];
      if (isImage) {
        const dataUrl = String(ask.image.dataUrl || '');
        const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
        if (!base64) {
          setSendState({ status: 'error', message: t('regionHint') });
          return;
        }
        parts.push({
          type: 'image',
          mediaType: 'image/png',
          data: base64,
          name: ask.image.name || 'reading-corner-page.png',
        });
      }
      parts.push({ type: 'text', text: composeAsk(quote, isImage) });
      const result = await binding.session.prompt(parts, 'queue');
      if (result && result.ok) {
        setSendState({ status: 'sent', message: t('sent') });
        window.clearTimeout(sentTimerRef.current);
        sentTimerRef.current = window.setTimeout(function () {
          setAsk(null);
          setQuestion('');
          setSendState({ status: 'idle', message: '' });
        }, 900);
      } else {
        const message =
          result && result.error && result.error.message ? result.error.message : t('sendFailed');
        setSendState({ status: 'error', message: message });
      }
    } catch (reason) {
      setSendState({ status: 'error', message: String((reason && reason.message) || reason) });
    }
  };

  const placeQuote = function () {
    if (!ask || ask.image) return;
    const quote = ask.text.trim();
    if (!quote) return;
    const actions = session && session.actions;
    if (
      !actions ||
      typeof actions.captureInsertion !== 'function' ||
      typeof actions.insertText !== 'function'
    ) {
      setSendState({ status: 'error', message: t('needSession') });
      return;
    }
    const body = composeAsk(quote, false, { allowEmpty: true });
    let inserted = false;
    try {
      let span = actions.captureInsertion();
      inserted = actions.insertText(body + '\n', span) === true;
      if (!inserted) {
        span = actions.captureInsertion();
        inserted = actions.insertText(body + '\n', span) === true;
      }
    } catch (reason) {
      inserted = false;
    }
    if (!inserted) {
      setSendState({ status: 'error', message: t('insertFailed') });
      return;
    }
    setAsk(null);
    setQuestion('');
    setSendState({ status: 'idle', message: '' });
    persistBook();
    persistPdf();
    ui.setOpen(false);
  };

  const close = function () {
    persistBook();
    persistPdf();
    saveWidths(widthsRef.current);
    setAsk(null);
    setSendState({ status: 'idle', message: '' });
    ui.setOpen(false);
  };

  const total = BOOK.chapters.length;
  const current = BOOK.chapters[chapter] || BOOK.chapters[0];
  const percent = Math.round(((chapter + 1) / total) * 100);

  let activeOutline = -1;
  for (let index = 0; index < outline.length; index += 1) {
    if (outline[index].page !== null && outline[index].page <= pageNumber) {
      activeOutline = index;
    }
  }

  const tabs = h(
    'div',
    { className: 'dshrc-tabs', role: 'tablist' },
    h(
      'button',
      {
        type: 'button',
        role: 'tab',
        className: 'dshrc-tab',
        'aria-pressed': mode === 'book' ? 'true' : 'false',
        onClick: function () {
          setMode('book');
        },
      },
      t('tabBook'),
    ),
    h(
      'button',
      {
        type: 'button',
        role: 'tab',
        className: 'dshrc-tab',
        'aria-pressed': mode === 'pdf' ? 'true' : 'false',
        onClick: function () {
          setMode('pdf');
          if (!docRef.current && pdfState.status !== 'loading') pickFile();
        },
      },
      t('tabPdf'),
    ),
  );

  const tocView = h(
    'div',
    { className: 'dshrc-toc' },
    h(
      'ol',
      { className: 'dshrc-toclist' },
      BOOK.chapters.map(function (item, index) {
        return h(
          'li',
          { key: index },
          h(
            'button',
            {
              type: 'button',
              className: 'dshrc-tocitem' + (index === chapter ? ' is-current' : ''),
              onClick: function () {
                goChapter(index);
              },
            },
            h('span', { className: 'dshrc-tocnum' }, String(index + 1).padStart(2, '0')),
            h('span', { className: 'dshrc-toctitle' }, item.title),
            h('span', { className: 'dshrc-tocmin' }, t('minutes', { m: item.minutes })),
          ),
        );
      }),
    ),
  );

  const paneLabel =
    mode === 'book'
      ? t('toc')
      : outline.length || outlineState === 'loading'
        ? t('toc')
        : t('pages');

  const pdfTocView = h(
    'div',
    { className: 'dshrc-pdftoc' },
    outlineState === 'loading'
      ? h('div', { className: 'dshrc-tocnote' }, t('outlineLoading'))
      : outline.length > 0
        ? h(
            'ol',
            { className: 'dshrc-outline' },
            outline.map(function (entry, index) {
              return h(
                'li',
                { key: index },
                h(
                  'button',
                  {
                    type: 'button',
                    className:
                      'dshrc-outlineitem' + (index === activeOutline ? ' is-current' : ''),
                    style: { paddingLeft: 8 + entry.depth * 12 + 'px' },
                    title: entry.title,
                    disabled: !entry.page,
                    onClick: function () {
                      if (entry.page) goPage(entry.page);
                    },
                  },
                  h('span', { className: 'dshrc-outlinetitle' }, entry.title),
                  entry.page
                    ? h('span', { className: 'dshrc-outlinepage' }, String(entry.page))
                    : null,
                ),
              );
            }),
          )
        : pdf
          ? h(
              'div',
              { className: 'dshrc-pagegrid' },
              Array.from({ length: pdf.pages }, function (_, index) {
                return index + 1;
              }).map(function (page) {
                return h(
                  'button',
                  {
                    key: page,
                    type: 'button',
                    className: 'dshrc-pagenum' + (page === pageNumber ? ' is-current' : ''),
                    onClick: function () {
                      goPage(page);
                    },
                  },
                  String(page),
                );
              }),
            )
          : h('div', { className: 'dshrc-tocnote' }, ''),
  );

  const chapterView = h(
    'article',
    { className: 'dshrc-chapter' },
    h('div', { className: 'dshrc-chaptermeta' }, t('progress', { n: chapter + 1, total })),
    h('h3', { className: 'dshrc-chaptertitle' }, current.title),
    current.paragraphs.map(function (paragraph, index) {
      return h('p', { className: 'dshrc-p', key: index }, paragraph);
    }),
    chapter === total - 1 ? h('p', { className: 'dshrc-hint' }, t('hint')) : null,
  );

  let body = null;
  if (mode === 'book') {
    body = chapterView;
  } else if (pdfState.status === 'error') {
    body = h(
      'div',
      { className: 'dshrc-empty' },
      h('p', { className: 'dshrc-emptytext' }, t('pdfError', { message: pdfState.message })),
      h(
        'button',
        { type: 'button', className: 'dshrc-primary', onClick: pickFile },
        t('openPdf'),
      ),
    );
  } else if (!doc) {
    body = h(
      'div',
      { className: 'dshrc-empty' },
      h(
        'p',
        { className: 'dshrc-emptytext' },
        pdfState.status === 'loading' ? t('pdfLoading') : t('pdfEmpty'),
      ),
      pdfState.status === 'loading'
        ? null
        : h(
            'button',
            { type: 'button', className: 'dshrc-primary', onClick: pickFile },
            t('openPdf'),
          ),
    );
  } else {
    body = h(PdfPage, {
      key: pdf ? pdf.name : 'pdf',
      doc: doc,
      pageNumber: pageNumber,
      zoom: zoom,
      t: t,
      pdfjs: engineRef.current,
      regionMode: regionMode,
      initialScrollTop: restoreScroll,
      onScroll: handlePdfScroll,
      onStep: function (delta) {
        goPage(pageRef.current + delta);
      },
      onTextInfo: function (hasText) {
        setPageHasText(hasText);
      },
      onRegion: function (image) {
        setAsk({ text: '', image: image });
        setQuestion('');
        setSendState({ status: 'idle', message: '' });
        setRegionMode(false);
      },
      onQuote: function (text) {
        setAsk({ text: text });
        setQuestion('');
        setSendState({ status: 'idle', message: '' });
      },
    });
  }

  const askBusy = sendState.status === 'sending' || sendState.status === 'sent';
  const askIsImage = !!(ask && ask.image);
  const askSheet = ask
    ? h(
        'div',
        { className: 'dshrc-ask', role: 'dialog', 'aria-label': t('askTitle') },
        h(
          'div',
          { className: 'dshrc-askhead' },
          h(
            'span',
            { className: 'dshrc-asktitle' },
            askIsImage ? t('regionAskTitle') : t('askTitle'),
          ),
          iconButton(
            t('close'),
            function () {
              setAsk(null);
              setSendState({ status: 'idle', message: '' });
            },
            h('path', { d: 'M6 6l12 12M18 6L6 18' }),
          ),
        ),
        askIsImage
          ? h(
              'div',
              { className: 'dshrc-quoteimgwrap' },
              h('img', { className: 'dshrc-quoteimg', src: ask.image.dataUrl, alt: '' }),
            )
          : h('blockquote', { className: 'dshrc-quote' }, ask.text),
        h('div', { className: 'dshrc-askscope' }, t('askScope', { scope: scopeLine() })),
        h('textarea', {
          ref: askInputRef,
          className: 'dshrc-askinput',
          rows: 2,
          value: question,
          placeholder: t('askPlaceholder'),
          onChange: function (event) {
            setQuestion(event.target.value);
          },
        }),
        h(
          'div',
          { className: 'dshrc-askfoot' },
          h(
            'span',
            {
              className:
                'dshrc-askstatus' + (sendState.status === 'error' ? ' is-error' : ''),
            },
            sendState.message || (askIsImage ? t('imageOnlySend') : t('askHint')),
          ),
          h(
            'div',
            { className: 'dshrc-askactions' },
            h(
              'button',
              {
                type: 'button',
                className: askIsImage ? 'dshrc-primary' : 'dshrc-nav',
                disabled: askBusy,
                onClick: sendAsk,
              },
              t('send'),
            ),
            askIsImage
              ? null
              : h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshrc-primary',
                    disabled: askBusy || !session,
                    title: session ? t('insertHint') : t('needSession'),
                    onClick: placeQuote,
                  },
                  t('insertToComposer'),
                ),
          ),
        ),
      )
    : null;

  const bookFooter = h(
    'footer',
    { className: 'dshrc-foot' },
    h(
      'button',
      {
        type: 'button',
        className: 'dshrc-nav',
        disabled: chapter === 0,
        onClick: function () {
          goChapter(chapter - 1);
        },
      },
      h(Icon, { size: 14 }, h('path', { d: 'M15 5l-7 7 7 7' })),
      h('span', null, t('prev')),
    ),
    h(
      'span',
      { className: 'dshrc-meta' },
      t('progress', { n: chapter + 1, total }) + ' · ' + t('minutes', { m: current.minutes }),
    ),
    h(
      'button',
      {
        type: 'button',
        className: 'dshrc-nav',
        disabled: chapter === total - 1,
        onClick: function () {
          goChapter(chapter + 1);
        },
      },
      h('span', null, t('next')),
      h(Icon, { size: 14 }, h('path', { d: 'M9 5l7 7-7 7' })),
    ),
  );

  const pdfFooter = h(
    'footer',
    { className: 'dshrc-foot' },
    h(
      'div',
      { className: 'dshrc-zoomgroup' },
      iconButton(
        t('regionMode'),
        function () {
          setRegionMode(!regionMode);
        },
        [
          h('path', { key: 'a', d: 'M6 2v14a2 2 0 0 0 2 2h14' }),
          h('path', { key: 'b', d: 'M18 22V8a2 2 0 0 0-2-2H2' }),
        ],
        regionMode,
      ),
      iconButton(
        t('zoomOut'),
        function () {
          setZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10));
        },
        h('path', { d: 'M5 12h14' }),
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'dshrc-zoom',
          title: t('fitWidth'),
          onClick: function () {
            setZoom(1);
          },
        },
        Math.round(zoom * 100) + '%',
      ),
      iconButton(
        t('zoomIn'),
        function () {
          setZoom(Math.min(3, Math.round((zoom + 0.1) * 10) / 10));
        },
        h('path', { d: 'M12 5v14M5 12h14' }),
      ),
    ),
    h(
      'span',
      { className: 'dshrc-meta' },
      pdf ? t('pageOf', { n: pageNumber, total: pdf.pages }) : '',
    ),
    h(
      'div',
      { className: 'dshrc-zoomgroup' },
      iconButton(
        t('prevPage'),
        function () {
          goPage(pageNumber - 1);
        },
        h('path', { d: 'M15 5l-7 7 7 7' }),
      ),
      iconButton(
        t('nextPage'),
        function () {
          goPage(pageNumber + 1);
        },
        h('path', { d: 'M9 5l7 7-7 7' }),
      ),
    ),
  );

  return h(
    'div',
    { className: 'dshrc-root', 'aria-hidden': open ? undefined : 'true' },
    h('style', null, PANEL_CSS),
    h('input', {
      ref: fileRef,
      type: 'file',
      accept: 'application/pdf,.pdf',
      style: { display: 'none' },
      onChange: onFilePicked,
    }),
    h(
      'aside',
      {
        className: 'dshrc-panel',
        'data-open': open ? 'true' : 'false',
        'data-mode': mode,
        'data-resizing': resizing ? 'true' : undefined,
        style: { width: Math.round(widths[mode]) + 'px' },
        role: 'dialog',
        'aria-modal': 'false',
        'aria-label': mode === 'pdf' && pdf ? pdf.name : BOOK.title,
      },
      h(
        'div',
        {
          className: 'dshrc-resize',
          role: 'separator',
          'aria-orientation': 'vertical',
          'aria-label': t('resize'),
          tabIndex: 0,
          onPointerDown: beginResize,
          onPointerMove: moveResize,
          onPointerUp: endResize,
          onPointerCancel: endResize,
          onDoubleClick: resetWidth,
          onKeyDown: function (event) {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudgeWidth(24);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudgeWidth(-24);
            }
          },
        },
      ),
      h(
        'header',
        { className: 'dshrc-head' },
        h(
          'div',
          { className: 'dshrc-heading' },
          h('div', { className: 'dshrc-eyebrow' }, t('actionLabel')),
          h(
            'h2',
            { className: 'dshrc-book', title: mode === 'pdf' && pdf ? pdf.name : BOOK.title },
            mode === 'pdf' && pdf ? pdf.name : BOOK.title,
          ),
          h(
            'p',
            {
              className: 'dshrc-sub',
              title:
                mode === 'pdf' && pdf
                  ? t('pageOf', { n: pageNumber, total: pdf.pages })
                  : BOOK.subtitle,
            },
            mode === 'pdf' && pdf
              ? pdf.pages
                ? t('pageOf', { n: pageNumber, total: pdf.pages })
                : t('pdfLoading')
              : BOOK.subtitle,
          ),
        ),
        h(
          'div',
          { className: 'dshrc-headactions' },
          iconButton(
            t('importPdf'),
            pickFile,
            h('path', { d: 'M12 3v12M8 7l4-4 4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4' }),
          ),
          iconButton(
            t('toc'),
            function () {
              setTocOpen(!tocOpen);
            },
            h('path', { d: 'M4 7h16M4 12h16M4 17h10' }),
            tocOpen,
          ),
          iconButton(t('close'), close, h('path', { d: 'M6 6l12 12M18 6L6 18' })),
        ),
      ),
      tabs,
      mode === 'book'
        ? h(
            'div',
            { className: 'dshrc-track' },
            h('div', { className: 'dshrc-trackfill', style: { width: percent + '%' } }),
          )
        : null,
      mode === 'pdf' && doc && (regionMode || !pageHasText)
        ? h(
            'div',
            { className: 'dshrc-hintbar' },
            h('span', null, regionMode ? t('regionDragHint') : t('regionHint')),
            regionMode
              ? null
              : h(
                  'button',
                  {
                    type: 'button',
                    onClick: function () {
                      setRegionMode(true);
                    },
                  },
                  t('regionMode'),
                ),
          )
        : null,
      h(
        'div',
        { className: 'dshrc-split' },
        tocOpen
          ? h(
              'div',
              { className: 'dshrc-tocpane' },
              h(
                'div',
                { className: 'dshrc-tocpanehead' },
                h('span', { className: 'dshrc-toclabel' }, paneLabel),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshrc-iconbtn',
                    title: t('collapseToc'),
                    'aria-label': t('collapseToc'),
                    onClick: function () {
                      setTocOpen(false);
                    },
                  },
                  h(Icon, { size: 14 }, h('path', { d: 'M15 5l-7 7 7 7' })),
                ),
              ),
              mode === 'book' ? tocView : pdfTocView,
            )
          : h(
              'div',
              { className: 'dshrc-tocrail' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshrc-iconbtn',
                  title: t('expandToc'),
                  'aria-label': t('expandToc'),
                  onClick: function () {
                    setTocOpen(true);
                  },
                },
                h(Icon, { size: 14 }, h('path', { d: 'M9 5l7 7-7 7' })),
              ),
              h('span', { className: 'dshrc-tocrailtext' }, t('toc')),
            ),
        h(
          'div',
          { className: 'dshrc-main' },
          mode === 'book'
            ? h('div', { className: 'dshrc-body', ref: bodyRef }, body)
            : h(
                'div',
                { className: 'dshrc-pdfhost', style: { flex: 1, display: 'flex', minHeight: 0 } },
                body,
              ),
        ),
      ),
      mode === 'book' ? bookFooter : pdfFooter,
      askSheet,
    ),
  );
}
