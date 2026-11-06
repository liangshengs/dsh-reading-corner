import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Host half of Reading Corner.
 *
 * The Client's "加入笔记" action posts { sessionId, messageId } to
 * `/reading-corner/note` (same-origin, fenced by the connection trust check).
 * This half reads the authoritative session log, finds the reading-corner ask
 * that produced that answer, and appends one entry to
 * `<workspace>/读书笔记/<book>.md`.
 */

const ROUTE = '/reading-corner/note';
const FOLDER = '读书笔记';
const BODY_LIMIT = 1024 * 1024;

function writeJson(res, status, value) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    let size = 0;
    req.on('data', function (chunk) {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(new Error('请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', function () {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

function textOfMessage(message) {
  if (!message || !Array.isArray(message.content)) return '';
  const parts = [];
  for (const block of message.content) {
    if (block && block.type === 'text' && typeof block.text === 'string') {
      parts.push(block.text);
    }
  }
  return parts.join('\n');
}

export function parseAskText(text) {
  const zh = /我在读《([^》]+)》第\s*(\d+)\s*\/\s*(\d+)\s*页(?:\s*·\s*([^，\n]+))?，/;
  const en = /I am reading "([^"]+)", page\s*(\d+)\s*of\s*(\d+)(?:\s*·\s*([^,\n]+?))?(?:,|\s+and\b)/;
  const match = zh.exec(text) || en.exec(text);
  if (!match) return null;
  const questionZh = /(?:^|\n)我的问题：\s*([^\n]*)/.exec(text);
  const questionEn = /(?:^|\n)My question:\s*([^\n]*)/.exec(text);
  const question = ((questionZh && questionZh[1]) || (questionEn && questionEn[1]) || '').trim();
  const quote = text
    .split('\n')
    .filter(function (line) {
      return line.indexOf('> ') === 0;
    })
    .map(function (line) {
      return line.slice(2);
    })
    .join('\n')
    .trim();
  return {
    book: match[1].trim(),
    page: Number(match[2]) || 1,
    total: Number(match[3]) || 0,
    section: (match[4] || '').trim(),
    question: question,
    quote: quote,
  };
}

function safeFileStem(name) {
  const cleaned = String(name)
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || 'book').slice(0, 80);
}

function shortHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

export function renderEntry(parsed, answer, images, marker) {
  const lines = [];
  const section = parsed.section ? ' · ' + parsed.section : '';
  lines.push('## 第 ' + parsed.page + (parsed.total ? ' / ' + parsed.total : '') + ' 页' + section);
  lines.push('');
  lines.push('**问：** ' + (parsed.question || '（未填写问题）'));
  lines.push('');
  lines.push('**答：**');
  lines.push('');
  lines.push(answer.trim());
  if (parsed.quote) {
    lines.push('');
    lines.push('> 原文：');
    for (const line of parsed.quote.split('\n')) lines.push('> ' + line);
  }
  for (const image of images) {
    lines.push('');
    lines.push('![截图](' + image + ')');
  }
  lines.push('');
  lines.push(marker);
  lines.push('');
  return lines.join('\n');
}

async function addNote(ctx, sessionId, messageId) {
  const agent = ctx.agents.get(sessionId);
  if (!agent) throw new Error('当前会话没有打开，无法写入笔记');
  const session = agent.session;
  if (!session || typeof session.snapshotEvents !== 'function') throw new Error('会话记录不可用');
  const events = session.snapshotEvents();

  let answerEvent = null;
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (
      event.type === 'assistant/message' &&
      event.data &&
      event.data.message &&
      event.data.message.id === messageId
    ) {
      answerEvent = event;
      break;
    }
  }
  if (!answerEvent) throw new Error('在会话记录里找不到这条回答');

  let askEvent = null;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event.seq >= answerEvent.seq) break;
    if (event.type !== 'user/message') continue;
    const text = textOfMessage(event.data && event.data.message);
    if (text.includes('我在读《') || text.includes('I am reading "')) askEvent = event;
  }
  if (!askEvent) throw new Error('这条回答不是来自读书角提问，无法确定是哪本书');

  const askText = textOfMessage(askEvent.data && askEvent.data.message);
  const parsed = parseAskText(askText);
  if (!parsed) throw new Error('没能从提问里解析出书名和页码');
  const answer = textOfMessage(answerEvent.data && answerEvent.data.message);
  if (!answer.trim()) throw new Error('这条回答是空的');

  const cwd = await ctx.workingDirectory.ensure(agent);
  const folder = path.join(cwd, FOLDER);
  const stem = safeFileStem(parsed.book);
  const file = path.join(folder, stem + '.md');
  const marker = '<!-- reading-corner: ' + shortHash(sessionId + ':' + messageId) + ' -->';

  await fs.mkdir(folder, { recursive: true });
  let existing = '';
  try {
    existing = await fs.readFile(file, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (existing.includes(marker)) {
    return { duplicate: true, path: file, title: parsed.book };
  }

  const images = [];
  const attachments = ctx.get('attachments');
  const content =
    askEvent.data && askEvent.data.message && Array.isArray(askEvent.data.message.content)
      ? askEvent.data.message.content
      : [];
  if (attachments) {
    for (const block of content) {
      if (!block || block.type !== 'image' || !block.attachment) continue;
      try {
        const stored = await attachments.readImage(block.attachment);
        const mediaType = stored.ref && stored.ref.mediaType;
        const extension =
          mediaType === 'image/jpeg'
            ? 'jpg'
            : mediaType === 'image/webp'
              ? 'webp'
              : mediaType === 'image/gif'
                ? 'gif'
                : 'png';
        const assets = path.join(folder, 'assets', stem);
        await fs.mkdir(assets, { recursive: true });
        const name =
          shortHash(sessionId + ':' + messageId + ':' + block.attachment.attachmentId) +
          '.' +
          extension;
        await fs.writeFile(path.join(assets, name), stored.data);
        images.push('assets/' + stem + '/' + name);
      } catch (error) {
        /* the note still lands even if one image cannot be copied */
      }
    }
  }

  const entry = renderEntry(parsed, answer, images, marker);
  const header = existing || '# 《' + parsed.book + '》读书笔记\n\n';
  await fs.writeFile(file, header + entry, 'utf8');
  return {
    duplicate: false,
    path: file,
    title: parsed.book,
    images: images.length,
  };
}

export function apply(ctx) {
  // The note route needs the Web carrier and the connection trust check. Both
  // are optional so a headless profile can still load this bundle (the Client
  // half simply has no host route there), and a profile without attachments
  // still gets text-only notes.
  ctx.inject(
    ['webServer', 'connection', 'agents', 'workingDirectory'],
    function (scope) {
      scope.effect(
        function () {
          return scope.webServer.register({
            kind: 'exact',
            path: ROUTE,
            handler: async function (req, res) {
              if (scope.connection.requestRejection(req) !== undefined) {
                writeJson(res, 403, { ok: false, error: 'forbidden' });
                return;
              }
              if (req.method !== 'POST') {
                writeJson(res, 405, { ok: false, error: 'method not allowed' });
                return;
              }
              try {
                const payload = JSON.parse(await readBody(req));
                const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : '';
                const messageId = typeof payload.messageId === 'string' ? payload.messageId : '';
                if (!sessionId || !messageId) throw new Error('缺少会话或消息标识');
                const result = await addNote(scope, sessionId, messageId);
                writeJson(res, 200, Object.assign({ ok: true }, result));
              } catch (error) {
                writeJson(res, 400, {
                  ok: false,
                  error: String((error && error.message) || error),
                });
              }
            },
          });
        },
        'dsh-reading-corner: note route',
      );
    },
  );
}
