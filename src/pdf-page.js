import React from 'react';
import { Icon } from './icons.js';

const h = React.createElement;

export function PdfPage(props) {
  const doc = props.doc;
  const pdfjs = props.pdfjs;
  const t = props.t;
  const pageNumber = props.pageNumber;
  const zoom = props.zoom;

  const hostRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const textRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const frameRef = React.useRef(0);
  const overlayRef = React.useRef(null);
  const dragStartRef = React.useRef(null);
  const dragRectRef = React.useRef(null);
  const lastStepRef = React.useRef(0);
  const restoredRef = React.useRef(false);

  const [width, setWidth] = React.useState(0);
  const [status, setStatus] = React.useState('loading');
  const [error, setError] = React.useState('');
  const [pill, setPill] = React.useState(null);
  const [dragRect, setDragRect] = React.useState(null);

  React.useEffect(
    function () {
      if (props.regionMode) setPill(null);
    },
    [props.regionMode],
  );

  React.useEffect(function () {
    const element = hostRef.current;
    if (!element) return undefined;
    let timer = 0;
    const measureNow = function () {
      setWidth(element.clientWidth);
    };
    const measureSoon = function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(measureNow, 120);
    };
    measureNow();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measureSoon);
      observer.observe(element);
      return function () {
        window.clearTimeout(timer);
        observer.disconnect();
      };
    }
    window.addEventListener('resize', measureSoon);
    return function () {
      window.clearTimeout(timer);
      window.removeEventListener('resize', measureSoon);
    };
  }, []);

  React.useEffect(
    function () {
      const element = hostRef.current;
      if (element) element.scrollTop = 0;
      setPill(null);
    },
    [pageNumber],
  );

  React.useEffect(function () {
    const element = hostRef.current;
    if (!element) return undefined;
    let frame = 0;
    const onScroll = function () {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        if (props.onScroll) props.onScroll(element.scrollTop);
      });
    };
    element.addEventListener('scroll', onScroll, { passive: true });
    return function () {
      element.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  React.useEffect(function () {
    const element = hostRef.current;
    if (!element) return undefined;
    const onWheel = function (event) {
      if (event.ctrlKey) return;
      const atTop = element.scrollTop <= 0;
      const atBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
      if (!atTop && !atBottom) return;
      const forward = event.deltaY > 0;
      if (forward ? !atBottom : !atTop) return;
      event.preventDefault();
      const now = Date.now();
      if (now - lastStepRef.current < 400) return;
      lastStepRef.current = now;
      if (props.onStep) props.onStep(forward ? 1 : -1);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return function () {
      element.removeEventListener('wheel', onWheel);
    };
  }, []);

  React.useEffect(
    function () {
      if (!doc || !width) return undefined;
      let cancelled = false;
      let renderTask = null;
      let layer = null;
      setStatus('loading');
      setError('');
      setPill(null);

      (async function () {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const scale = Math.max(0.4, Math.min(3, ((width - 36) / base.width) * zoom));
        const viewport = page.getViewport({ scale: scale });
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        const textDiv = textRef.current;
        if (!canvas || !wrap || !textDiv) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssWidth = Math.floor(viewport.width);
        const cssHeight = Math.floor(viewport.height);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = cssWidth + 'px';
        canvas.style.height = cssHeight + 'px';
        wrap.style.width = cssWidth + 'px';
        wrap.style.height = cssHeight + 'px';
        wrap.style.setProperty('--scale-factor', String(scale));
        textDiv.innerHTML = '';

        const context = canvas.getContext('2d');
        renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
          transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0],
        });
        await renderTask.promise;
        if (cancelled) return;

        const content = await page.getTextContent();
        if (cancelled) return;
        layer = new pdfjs.TextLayer({
          textContentSource: content,
          container: textDiv,
          viewport: viewport,
        });
        layerRef.current = layer;
        await layer.render();
        if (cancelled) return;

        if (props.onTextInfo) {
          const hasText = content.items.some(function (item) {
            return item.str && item.str.trim().length > 0;
          });
          props.onTextInfo(hasText);
        }
        if (!restoredRef.current) {
          restoredRef.current = true;
          const initialScroll = Math.max(0, Number(props.initialScrollTop) || 0);
          const element = hostRef.current;
          if (initialScroll > 0 && element) {
            const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
            element.scrollTop = Math.min(initialScroll, maxScroll);
          }
        }
        setStatus('idle');
      })().catch(function (reason) {
        if (cancelled) return;
        setError(String((reason && reason.message) || reason));
        setStatus('error');
      });

      return function () {
        cancelled = true;
        if (renderTask) {
          try {
            renderTask.cancel();
          } catch (reason) {
            /* already settled */
          }
        }
        if (layer) {
          try {
            layer.cancel();
          } catch (reason) {
            /* already settled */
          }
        }
        layerRef.current = null;
      };
    },
    [doc, pageNumber, zoom, width, pdfjs],
  );

  React.useEffect(function () {
    const wrap = wrapRef.current;
    const onSelectionChange = function () {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(function () {
        frameRef.current = 0;
        const selection = window.getSelection();
        const text = selection ? selection.toString().replace(/\s+/g, ' ').trim() : '';
        if (!selection || selection.isCollapsed || !text || !wrap) {
          setPill(null);
          return;
        }
        const anchor = selection.anchorNode;
        const anchorElement =
          anchor && (anchor.nodeType === 1 ? anchor : anchor.parentElement);
        if (!anchorElement || !wrap.contains(anchorElement)) {
          setPill(null);
          return;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          setPill(null);
          return;
        }
        const above = rect.bottom + 8 > window.innerHeight - 90;
        setPill({
          text: text,
          top: above ? rect.top - 42 : rect.bottom + 8,
          left: Math.min(window.innerWidth - 60, Math.max(60, rect.left + rect.width / 2)),
        });
      });
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return function () {
      document.removeEventListener('selectionchange', onSelectionChange);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const takeQuote = function () {
    if (!pill) return;
    const text = pill.text.slice(0, 2000);
    setPill(null);
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
    props.onQuote(text);
  };

  const pointOf = function (event) {
    const overlay = overlayRef.current;
    if (!overlay) return { x: 0, y: 0 };
    const rect = overlay.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    };
  };

  const beginRegion = function (event) {
    if (event.button !== 0) return;
    event.preventDefault();
    const point = pointOf(event);
    dragStartRef.current = point;
    dragRectRef.current = { x0: point.x, y0: point.y, x1: point.x, y1: point.y };
    setDragRect(dragRectRef.current);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (reason) {
      /* pointer capture is best-effort */
    }
  };

  const moveRegion = function (event) {
    const start = dragStartRef.current;
    if (!start) return;
    const point = pointOf(event);
    dragRectRef.current = { x0: start.x, y0: start.y, x1: point.x, y1: point.y };
    setDragRect(dragRectRef.current);
  };

  const endRegion = function (event) {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    const region = dragRectRef.current;
    dragRectRef.current = null;
    setDragRect(null);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (reason) {
      /* capture may already be gone */
    }
    if (!region) return;
    const left = Math.min(region.x0, region.x1);
    const top = Math.min(region.y0, region.y1);
    const width = Math.abs(region.x1 - region.x0);
    const height = Math.abs(region.y1 - region.y0);
    if (width < 16 || height < 16) return;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const rect = overlay.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const sourceX = Math.max(0, Math.round(left * scaleX));
    const sourceY = Math.max(0, Math.round(top * scaleY));
    const sourceWidth = Math.max(1, Math.min(canvas.width - sourceX, Math.round(width * scaleX)));
    const sourceHeight = Math.max(1, Math.min(canvas.height - sourceY, Math.round(height * scaleY)));
    const maxSide = 1600;
    const ratio = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(sourceWidth * ratio));
    out.height = Math.max(1, Math.round(sourceHeight * ratio));
    out
      .getContext('2d')
      .drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, out.width, out.height);
    let dataUrl = '';
    try {
      dataUrl = out.toDataURL('image/png');
    } catch (reason) {
      dataUrl = '';
    }
    if (!dataUrl) return;
    props.onRegion({
      dataUrl: dataUrl,
      name: 'reading-corner-page-' + pageNumber + '.png',
    });
  };

  return h(
    'div',
    { className: 'dshrc-pdfbody', ref: hostRef },
    h(
      'div',
      { className: 'dshrc-pagewrap', ref: wrapRef },
      h('canvas', { ref: canvasRef }),
      h('div', { className: 'dshrc-textLayer', ref: textRef }),
      props.regionMode && status === 'idle'
        ? h(
            'div',
            {
              className: 'dshrc-regionoverlay',
              ref: overlayRef,
              onPointerDown: beginRegion,
              onPointerMove: moveRegion,
              onPointerUp: endRegion,
              onPointerCancel: endRegion,
            },
            dragRect
              ? h('div', {
                  className: 'dshrc-regionrect',
                  style: {
                    left: Math.min(dragRect.x0, dragRect.x1) + 'px',
                    top: Math.min(dragRect.y0, dragRect.y1) + 'px',
                    width: Math.abs(dragRect.x1 - dragRect.x0) + 'px',
                    height: Math.abs(dragRect.y1 - dragRect.y0) + 'px',
                  },
                })
              : null,
          )
        : null,
    ),
    status !== 'idle'
      ? h(
          'div',
          { className: 'dshrc-pagestatus' + (status === 'error' ? ' is-error' : '') },
          status === 'error' ? t('pdfError', { message: error }) : t('loadingPage'),
        )
      : null,
    pill && !props.regionMode
      ? h(
          'button',
          {
            type: 'button',
            className: 'dshrc-pill',
            style: { top: pill.top + 'px', left: pill.left + 'px' },
            onMouseDown: function (event) {
              event.preventDefault();
            },
            onClick: takeQuote,
          },
          h(Icon, { size: 14 }, h('path', { d: 'M4 5h16M4 12h10M4 19h6' })),
          h('span', null, t('ask')),
        )
      : null,
  );
}
