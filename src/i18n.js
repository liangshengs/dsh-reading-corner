import React from 'react';

export const NS = 'reading-corner';

export const DICTS = {
  zh: {
    actionLabel: '读书角',
    tabBook: '小书',
    tabPdf: 'PDF',
    toc: '目录',
    close: '关闭',
    prev: '上一章',
    next: '下一章',
    progress: '第 {n} 章 · 共 {total} 章',
    minutes: '约 {m} 分钟',
    hint: '慢慢读，它还在忙。',
    importPdf: '导入 PDF',
    openPdf: '选择 PDF 文件',
    pdfEmpty: '还没有导入 PDF。选一本技术书，边读边问。',
    pdfLoading: '正在打开 PDF…',
    pageOf: '第 {n} 页 / 共 {total} 页',
    prevPage: '上一页',
    nextPage: '下一页',
    zoomIn: '放大',
    zoomOut: '缩小',
    fitWidth: '适应宽度',
    loadingPage: '正在加载页面…',
    pdfError: '打开 PDF 失败：{message}',
    pdfPassword: '这个 PDF 已加密，暂不支持。',
    ask: '提问',
    askTitle: '就这段话提问',
    askPlaceholder: '写下你的问题；留空会问“这段话是什么意思？”',
    askHint: '选一种方式：放进输入框继续编辑，或直接发送到会话。',
    insertToComposer: '放到输入框',
    insertHint: '引用会插入当前会话的输入框，补完问题再发送。',
    myQuestion: '我的问题：',
    insertFailed: '没能放进输入框，请先点一下输入框再试。',
    resize: '拖动调整宽度',
    outlineLoading: '正在读取目录…',
    pages: '页码',
    collapseToc: '收起目录',
    expandToc: '展开目录',
    regionMode: '框选',
    regionHint: '这一页没有文字层。切到「框选」，拖一个框圈出要问的内容。',
    regionDragHint: '在页面上拖出一个矩形，选中要提问的区域。',
    regionAskTitle: '就选中的区域提问',
    where: '《{book}》第 {page} / {total} 页',
    sectionSuffix: ' · {title}',
    askIntro: '我在读{where}{section}，下面这段话没太看懂：',
    imageAskIntro: '我在读{where}{section}，圈出的这块没太看懂：',
    teacherNote: '请以老师给学生的口吻讲解：先说明它在讲什么，再解释为什么，最后点出容易误解的地方。',
    askScope: '会自动带上：{scope}',
    imageOnlySend: '图片会直接发送到对话。',
    noteAdd: '加入笔记',
    noteSaving: '正在加入…',
    noteAdded: '已加入笔记',
    noteExists: '已在笔记中',
    noteFailed: '加入失败',
    defaultQuestion: '这段话是什么意思？',
    send: '发送到对话',
    sending: '正在发送…',
    sent: '已发送到对话',
    sendFailed: '发送失败',
    needSession: '先打开一个会话，才能把问题发到对话里。',
    quoteLabel: '引用',
    askQuestion: '我的问题：{question}',
  },
  en: {
    actionLabel: 'Reading corner',
    tabBook: 'Book',
    tabPdf: 'PDF',
    toc: 'Contents',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    progress: 'Chapter {n} of {total}',
    minutes: '{m} min read',
    hint: 'Take your time — it is still working.',
    importPdf: 'Import PDF',
    openPdf: 'Choose a PDF file',
    pdfEmpty: 'No PDF yet. Pick a technical book to read and ask about.',
    pdfLoading: 'Opening the PDF…',
    pageOf: 'Page {n} of {total}',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fitWidth: 'Fit width',
    loadingPage: 'Loading page…',
    pdfError: 'Could not open the PDF: {message}',
    pdfPassword: 'This PDF is encrypted and not supported yet.',
    ask: 'Ask',
    askTitle: 'Ask about this passage',
    askPlaceholder: 'Type your question; leave it empty to ask what the passage means.',
    askHint: 'Pick one: put it in the input for editing, or send it now.',
    insertToComposer: 'Put in input',
    insertHint: 'The quote goes into the current chat input; finish the question and send.',
    myQuestion: 'My question: ',
    insertFailed: 'Could not insert into the input. Click the input first and retry.',
    resize: 'Drag to resize',
    outlineLoading: 'Reading contents…',
    pages: 'Pages',
    collapseToc: 'Collapse contents',
    expandToc: 'Expand contents',
    regionMode: 'Select area',
    regionHint: 'This page has no text layer. Switch to Select area and drag a box around what you want to ask about.',
    regionDragHint: 'Drag a box on the page to select the area you want to ask about.',
    regionAskTitle: 'Ask about this area',
    where: '"{book}", page {page} of {total}',
    sectionSuffix: ' · {title}',
    askIntro: 'I am reading {where}{section} and do not fully follow this passage:',
    imageAskIntro: 'I am reading {where}{section} and do not follow the highlighted area:',
    teacherNote: 'Please explain it the way a teacher would to a student: first what it says, then why it matters, and finally the part that is easy to misunderstand.',
    askScope: 'Included automatically: {scope}',
    imageOnlySend: 'The image will be sent to the chat.',
    noteAdd: 'Add to notes',
    noteSaving: 'Adding…',
    noteAdded: 'Added to notes',
    noteExists: 'Already in notes',
    noteFailed: 'Could not add',
    defaultQuestion: 'What does this passage mean?',
    send: 'Send to chat',
    sending: 'Sending…',
    sent: 'Sent to the chat',
    sendFailed: 'Could not send',
    needSession: 'Open a conversation first, then ask.',
    quoteLabel: 'Quoted',
    askQuestion: 'My question: {question}',
  },
};

export function translate(i18n, key, vars) {
  let active = 'en';
  let text;
  if (i18n) {
    try {
      const snapshot = i18n.getLocale();
      if (snapshot && typeof snapshot.active === 'string') active = snapshot.active;
    } catch (error) {
      /* keep the fallback locale */
    }
    try {
      text = i18n.bind(NS)(key);
    } catch (error) {
      text = undefined;
    }
  }
  if (typeof text !== 'string' || text === '' || text === key) {
    const dict = String(active).toLowerCase().indexOf('zh') === 0 ? DICTS.zh : DICTS.en;
    text = dict[key] || key;
  }
  if (vars) {
    Object.keys(vars).forEach(function (name) {
      text = text.split('{' + name + '}').join(String(vars[name]));
    });
  }
  return text;
}

export function useTranslate(i18n) {
  const [, bump] = React.useState(0);
  React.useEffect(function () {
    if (!i18n || typeof i18n.subscribe !== 'function') return undefined;
    return i18n.subscribe(function () {
      bump(function (n) {
        return n + 1;
      });
    });
  }, [i18n]);
  return React.useMemo(
    function () {
      return function (key, vars) {
        return translate(i18n, key, vars);
      };
    },
    [i18n],
  );
}
