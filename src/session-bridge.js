import React from 'react';

export function SessionBridge(props) {
  const sessionId = props.sessionId;
  const inputActions = props.inputActions;
  const ui = props.ui;
  React.useEffect(
    function () {
      if (!sessionId) return undefined;
      ui.setSession({ id: sessionId, actions: inputActions || null });
      return function () {
        const current = ui.getSession();
        if (current && current.id === sessionId) ui.setSession(null);
      };
    },
    [sessionId, inputActions, ui],
  );
  return null;
}
