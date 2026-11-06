import React from 'react';

export function createUiStore() {
  let open = false;
  let session = null;
  const listeners = new Set();
  const emit = function () {
    listeners.forEach(function (listener) {
      try {
        listener();
      } catch (error) {
        /* a broken listener must not stop the others */
      }
    });
  };
  return {
    isOpen: function () {
      return open;
    },
    setOpen: function (next) {
      const value = next === true;
      if (value === open) return;
      open = value;
      emit();
    },
    getSession: function () {
      return session;
    },
    setSession: function (next) {
      const id = next && next.id ? next.id : null;
      const current = session && session.id ? session.id : null;
      if (id === current) {
        if (session && next && next.actions && session.actions !== next.actions) {
          session.actions = next.actions;
          emit();
        }
        return;
      }
      session = id ? { id: id, actions: (next && next.actions) || null } : null;
      emit();
    },
    subscribe: function (listener) {
      listeners.add(listener);
      return function () {
        listeners.delete(listener);
      };
    },
  };
}

export function useUi(ui) {
  const [, bump] = React.useState(0);
  React.useEffect(
    function () {
      return ui.subscribe(function () {
        bump(function (n) {
          return n + 1;
        });
      });
    },
    [ui],
  );
  return ui;
}
