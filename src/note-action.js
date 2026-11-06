import React from 'react';
import { useTranslate } from './i18n.js';
import { Icon } from './icons.js';
import { NOTE_CSS } from './styles.js';

const h = React.createElement;

export function NoteAction(props) {
  const t = useTranslate(props.i18n);
  const [state, setState] = React.useState('idle');
  const [detail, setDetail] = React.useState('');
  const [filePath, setFilePath] = React.useState('');
  const timerRef = React.useRef(0);

  React.useEffect(function () {
    return function () {
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const run = async function () {
    if (state === 'saving') return;
    setState('saving');
    setDetail('');
    try {
      const response = await fetch('reading-corner/note', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId: props.sessionId,
          messageId: props.messageId,
        }),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (reason) {
        data = {};
      }
      if (!response.ok || !data.ok) {
        throw new Error(
          (data && data.error) ||
            (response.status === 404 ? '笔记服务还没有加载（重启一次应用即可）' : t('noteFailed')),
        );
      }
      setState('done');
      setFilePath(typeof data.path === 'string' ? data.path : '');
      setDetail(data.duplicate ? t('noteExists') : t('noteAdded'));
    } catch (error) {
      setState('error');
      setFilePath('');
      setDetail(String((error && error.message) || error));
    }
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(function () {
      setState('idle');
      setDetail('');
      setFilePath('');
    }, 4500);
  };

  const label =
    state === 'saving'
      ? t('noteSaving')
      : state === 'done'
        ? t('noteAdded')
        : state === 'error'
          ? t('noteFailed')
          : t('noteAdd');

  return h(
    'span',
    { className: 'dshrc-note' + (state === 'error' ? ' is-error' : '') },
    h('style', null, NOTE_CSS),
    h(
      'button',
      {
        type: 'button',
        className: 'dshrc-note-btn',
        title: (detail || label) + (filePath ? '\n' + filePath : ''),
        'aria-label': label,
        disabled: state === 'saving',
        onClick: run,
      },
      state === 'done'
        ? h(Icon, { size: 14 }, h('path', { d: 'M5 12l5 5L20 7' }))
        : h(
            Icon,
            { size: 14 },
            h('path', { d: 'M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z' }),
            h('path', { d: 'M14 2v4h4' }),
            h('path', { d: 'M12 11v6M9 14h6' }),
          ),
      h('span', { className: 'dshrc-note-label' }, label),
    ),
    detail && state !== 'idle'
      ? h('span', { className: 'dshrc-note-msg', title: detail }, detail)
      : null,
  );
}
