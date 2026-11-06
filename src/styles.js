export const TRIGGER_CSS = `
.dshrc-trigger{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color .15s ease,color .15s ease}
.dshrc-trigger:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshrc-trigger[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary)}
.dshrc-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
`;

export const NOTE_CSS = `
.dshrc-note{display:inline-flex;align-items:center;gap:6px;min-width:0}
.dshrc-note-btn{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 6px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;cursor:pointer}
.dshrc-note-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshrc-note-btn:disabled{opacity:.6;cursor:default}
.dshrc-note-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshrc-note-label{white-space:nowrap}
.dshrc-note-msg{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.dshrc-note.is-error .dshrc-note-msg{color:var(--dsw-alias-state-error-primary)}
`;

export const PANEL_CSS = `
.dshrc-root{position:fixed;inset:0;pointer-events:none}
.dshrc-panel{position:absolute;top:12px;right:12px;bottom:12px;display:flex;flex-direction:column;width:min(560px,calc(100vw - 24px));max-width:calc(100vw - 24px);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 24px 64px -24px rgba(0,0,0,.5);overflow:hidden;pointer-events:none;opacity:0;visibility:hidden;transform:translateX(calc(100% + 28px));transition:transform .24s cubic-bezier(.22,.75,.2,1),opacity .18s ease,visibility 0s linear .24s}
.dshrc-panel[data-open="true"]{pointer-events:auto;opacity:1;visibility:visible;transform:none;transition:transform .24s cubic-bezier(.22,.75,.2,1),opacity .18s ease}
.dshrc-panel[data-mode="pdf"]{width:min(780px,calc(100vw - 24px))}
.dshrc-panel[data-resizing="true"]{user-select:none}
.dshrc-resize{position:absolute;left:0;top:0;bottom:0;width:7px;cursor:col-resize;touch-action:none;z-index:8;background:transparent}
.dshrc-resize:hover,.dshrc-panel[data-resizing="true"] .dshrc-resize{background:var(--dsw-alias-brand-primary)}
.dshrc-resize:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dshrc-head{display:flex;align-items:flex-start;gap:12px;padding:18px 18px 10px}
.dshrc-heading{flex:1;min-width:0}
.dshrc-eyebrow{margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}
.dshrc-book{margin:0;font-size:17px;font-weight:650;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshrc-sub{margin:4px 0 0;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshrc-headactions{display:flex;flex:0 0 auto;gap:4px}
.dshrc-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color .15s ease,color .15s ease}
.dshrc-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshrc-iconbtn[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary)}
.dshrc-iconbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshrc-tabs{display:flex;gap:2px;padding:0 18px 10px}
.dshrc-tab{height:26px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;cursor:pointer;transition:background-color .15s ease,color .15s ease}
.dshrc-tab:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshrc-tab[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshrc-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshrc-split{position:relative;flex:1;display:flex;min-width:0;min-height:0}
.dshrc-tocpane{flex:0 0 200px;width:200px;overflow:auto;padding:12px 8px;border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dshrc-tocpanehead{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:0 0 8px}
.dshrc-tocrail{flex:0 0 36px;width:36px;display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:12px;border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dshrc-tocrailtext{writing-mode:vertical-rl;font-size:11px;letter-spacing:.18em;color:var(--dsw-alias-label-secondary);user-select:none}
.dshrc-main{flex:1;min-width:0;display:flex;flex-direction:column}
.dshrc-tocnote{padding:8px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.dshrc-outline{display:flex;flex-direction:column;gap:1px;margin:0;padding:0;list-style:none}
.dshrc-outlineitem{display:flex;align-items:baseline;gap:8px;width:100%;padding:7px 8px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;text-align:left;cursor:pointer}
.dshrc-outlineitem:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.dshrc-outlineitem.is-current{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary)}
.dshrc-outlineitem:disabled{opacity:.55;cursor:default}
.dshrc-outlinetitle{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshrc-outlinepage{flex:0 0 auto;font-size:10.5px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.dshrc-pagegrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:4px;padding:2px}
.dshrc-pagenum{height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;font-variant-numeric:tabular-nums;cursor:pointer}
.dshrc-pagenum:hover{background:var(--dsw-alias-bg-layer-2)}
.dshrc-pagenum.is-current{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.dshrc-hintbar{display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dshrc-hintbar span{flex:1;min-width:0}
.dshrc-hintbar button{flex:0 0 auto;height:26px;padding:0 10px;border:0;border-radius:7px;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4d6bfe));color:var(--dsw-alias-label-primary-foreground,#fff);font:inherit;font-size:12px;cursor:pointer}
.dshrc-track{height:2px;background:var(--dsw-alias-border-l1)}
.dshrc-trackfill{height:100%;background:var(--dsw-alias-brand-primary);transition:width .2s ease}
.dshrc-body{flex:1;overflow-y:auto;padding:22px 24px 30px}
.dshrc-chaptermeta{margin-bottom:8px;font-size:11px;letter-spacing:.08em;color:var(--dsw-alias-label-secondary)}
.dshrc-chaptertitle{margin:0 0 18px;font-size:21px;font-weight:650;line-height:1.45}
.dshrc-p{margin:0 0 1.05em;font-size:16px;line-height:1.95;text-align:justify;color:var(--dsw-alias-label-primary)}
.dshrc-hint{margin:22px 0 0;padding-top:14px;border-top:1px dashed var(--dsw-alias-border-l1);font-size:12.5px;line-height:1.7;color:var(--dsw-alias-label-secondary)}
.dshrc-toclabel{margin:0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}
.dshrc-toclist{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.dshrc-tocitem{display:flex;align-items:baseline;gap:10px;width:100%;padding:10px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;transition:background-color .15s ease}
.dshrc-tocitem:hover{background:var(--dsw-alias-bg-layer-2)}
.dshrc-tocitem.is-current{background:var(--dsw-alias-bg-layer-2)}
.dshrc-tocnum{flex:0 0 auto;font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.dshrc-tocitem.is-current .dshrc-tocnum{color:var(--dsw-alias-brand-primary)}
.dshrc-toctitle{flex:1;min-width:0;font-size:14px;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshrc-tocmin{flex:0 0 auto;font-size:11px;color:var(--dsw-alias-label-secondary)}
.dshrc-foot{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--dsw-alias-border-l1)}
.dshrc-nav{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;transition:background-color .15s ease}
.dshrc-nav:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.dshrc-nav:disabled{opacity:.4;cursor:default}
.dshrc-nav:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshrc-meta{flex:1;min-width:0;font-size:11.5px;color:var(--dsw-alias-label-secondary);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshrc-zoomgroup{display:flex;align-items:center;gap:2px}
.dshrc-zoom{min-width:44px;height:30px;padding:0 6px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;font-variant-numeric:tabular-nums;cursor:pointer}
.dshrc-zoom:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshrc-pdfbody{position:relative;flex:1;display:flex;justify-content:flex-start;align-items:flex-start;overflow:auto;padding:16px;background:var(--dsw-alias-bg-base)}
.dshrc-pagewrap{position:relative;flex:0 0 auto;margin:0 auto;background:var(--dsw-alias-bg-layer-1);box-shadow:0 2px 14px rgba(0,0,0,.22)}
.dshrc-pagewrap canvas{display:block}
.dshrc-textLayer{position:absolute;inset:0;overflow:hidden;line-height:1;text-align:initial;transform-origin:0 0;z-index:1}
.dshrc-textLayer span,.dshrc-textLayer br{position:absolute;white-space:pre;color:transparent;transform-origin:0 0;cursor:text}
.dshrc-textLayer span.markedContent{top:0;height:0}
.dshrc-textLayer ::selection{background:rgba(77,107,254,.3)}
.dshrc-pagestatus{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;font-size:12.5px;line-height:1.6;text-align:center;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);z-index:2}
.dshrc-pagestatus.is-error{color:var(--dsw-alias-state-error-primary)}
.dshrc-pill{position:fixed;z-index:20;transform:translateX(-50%);display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:0;border-radius:999px;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4d6bfe));color:var(--dsw-alias-label-primary-foreground,#fff);font:inherit;font-size:12.5px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.28)}
.dshrc-pill:hover{filter:brightness(1.06)}
.dshrc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;flex:1;padding:40px 28px;text-align:center}
.dshrc-emptytext{margin:0;font-size:13px;line-height:1.7;color:var(--dsw-alias-label-secondary)}
.dshrc-primary{height:32px;padding:0 16px;border:0;border-radius:8px;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4d6bfe));color:var(--dsw-alias-label-primary-foreground,#fff);font:inherit;font-size:13px;cursor:pointer}
.dshrc-primary:hover:not(:disabled){filter:brightness(1.06)}
.dshrc-primary:disabled{opacity:.55;cursor:default}
.dshrc-ask{position:absolute;left:0;right:0;bottom:0;z-index:6;display:flex;flex-direction:column;gap:10px;padding:14px 16px 16px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);box-shadow:0 -12px 30px -18px rgba(0,0,0,.5)}
.dshrc-askhead{display:flex;align-items:center;justify-content:space-between;gap:10px}
.dshrc-asktitle{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-secondary);letter-spacing:.04em}
.dshrc-quote{max-height:96px;margin:0;overflow:auto;padding:8px 10px;border-left:3px solid var(--dsw-alias-brand-primary);border-radius:4px;background:var(--dsw-alias-bg-layer-2);font-size:12.5px;line-height:1.65;color:var(--dsw-alias-label-secondary);white-space:pre-wrap}
.dshrc-askinput{width:100%;box-sizing:border-box;resize:none;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.6}
.dshrc-askinput:focus{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px}
.dshrc-askfoot{display:flex;align-items:center;justify-content:space-between;gap:12px}
.dshrc-askactions{display:flex;flex:0 0 auto;align-items:center;gap:8px}
.dshrc-askstatus{flex:1;min-width:0;font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dshrc-askstatus.is-error{color:var(--dsw-alias-state-error-primary)}
.dshrc-askscope{font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dshrc-quoteimgwrap{display:flex;justify-content:center;max-height:160px;overflow:auto;padding:2px;border-radius:6px;background:var(--dsw-alias-bg-layer-2)}
.dshrc-quoteimg{display:block;max-width:100%;max-height:150px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:#fff}
.dshrc-regionoverlay{position:absolute;inset:0;z-index:3;cursor:crosshair;touch-action:none}
.dshrc-regionrect{position:absolute;border:1.5px solid var(--dsw-alias-brand-primary);background:rgba(77,107,254,.15);pointer-events:none}
@media (max-width:560px){.dshrc-panel{top:8px;right:8px;bottom:8px;width:calc(100vw - 16px)}.dshrc-p{font-size:15.5px}.dshrc-tocpane{position:absolute;top:0;bottom:0;left:0;z-index:4;box-shadow:12px 0 30px -18px rgba(0,0,0,.45)}}
@media (prefers-reduced-motion:reduce){.dshrc-panel,.dshrc-trackfill{transition:none}}
`;
