import React from 'react';
import { useTranslate } from './i18n.js';
import { useUi } from './store.js';
import { Icon } from './icons.js';
import { TRIGGER_CSS } from './styles.js';

const h = React.createElement;

export function BookButton(props) {
  const t = useTranslate(props.i18n);
  const ui = useUi(props.ui);
  const open = ui.isOpen();
  return h(
    React.Fragment,
    null,
    h(
      'button',
      {
        type: 'button',
        className: 'dshrc-trigger',
        title: t('actionLabel'),
        'aria-label': t('actionLabel'),
        'aria-pressed': open ? 'true' : 'false',
        'aria-expanded': open ? 'true' : 'false',
        onClick: function () {
          ui.setOpen(!open);
        },
      },
      h(
        Icon,
        { size: 17 },
        h('path', {
          d: 'M12 6.8C10.4 5.2 8.3 4.5 6 4.5H3.5v13H6c2.3 0 4.4.7 6 2.3 1.6-1.6 3.7-2.3 6-2.3h2.5v-13H18c-2.3 0-4.4.7-6 2.3Z',
        }),
        h('path', { d: 'M12 6.8v13' }),
      ),
    ),
    h('style', null, TRIGGER_CSS),
  );
}
