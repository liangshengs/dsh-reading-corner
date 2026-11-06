import { createUiStore } from './store.js';
import { DICTS, NS } from './i18n.js';
import { BookButton } from './book-button.js';
import { ReaderPanel } from './reader-panel.js';
import { SessionBridge } from './session-bridge.js';
import { NoteAction } from './note-action.js';

export const inject = ['slots', 'locale', 'sessions'];

export function apply(ctx) {
  const ui = createUiStore();

  ctx.effect(function () {
    const disposeZh = ctx.locale.register(NS, 'zh', DICTS.zh);
    const disposeEn = ctx.locale.register(NS, 'en', DICTS.en);
    return function () {
      disposeZh();
      disposeEn();
    };
  }, 'dsh-reading-corner: dictionaries');

  ctx.slots.inject('sidebar.footer.action', function () {
    return ctx.slots.register(
      {
        name: 'sidebar.footer.action',
        id: 'dsh-reading-corner',
        order: 40,
        inject: function () {
          return { ui: ui, i18n: ctx.locale };
        },
      },
      BookButton,
    );
  });

  ctx.slots.inject('shell.overlay', function () {
    return ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'dsh-reading-corner-panel',
        order: 40,
        inject: function () {
          return { ui: ui, i18n: ctx.locale, sessions: ctx.sessions };
        },
      },
      ReaderPanel,
    );
  });

  ctx.slots.inject('conversation.input.dock', function () {
    return ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: 'dsh-reading-corner-session',
        order: 90,
        inject: function () {
          return { ui: ui };
        },
      },
      SessionBridge,
    );
  });

  ctx.slots.inject('conversation.chat.assistant-actions', function () {
    return ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions',
        id: 'dsh-reading-corner-note',
        order: 20,
        inject: function () {
          return { i18n: ctx.locale };
        },
      },
      NoteAction,
    );
  });
}
