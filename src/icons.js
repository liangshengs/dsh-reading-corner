import React from 'react';

export function Icon(props) {
  return React.createElement(
    'svg',
    {
      width: props.size || 16,
      height: props.size || 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    props.children,
  );
}
