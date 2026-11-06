# Publishing checklist

## 1. Create the repository

Create a public GitHub repository (for example
`https://github.com/<owner>/dsh-reading-corner`), then add to `package.json`:

```json
"repository": { "type": "git", "url": "https://github.com/<owner>/dsh-reading-corner" },
"homepage": "https://github.com/<owner>/dsh-reading-corner#readme"
```

Add the `dsh-plugin` topic. The repository must be at least one day old before
the community catalog accepts it.

## 2. Build and inspect

```powershell
node tools/pdf-build/build-engine.mjs            # only when pdf.js changes
node tools/pdf-build/build-reading-corner.mjs
node --check index.js
node --check client.js
pnpm pack
tar -tf dsh-reading-corner-1.6.0.tgz
```

The tarball must contain `client.js`, `index.js`, `cordis.patch.yml`, both
locales, `icon.svg`, `README.md`, `LICENSE` and `THIRD_PARTY_NOTICES.md`.

## 3. Test in a clean profile

```powershell
dsh plugin --profile publish-test add .\dsh-reading-corner-1.6.0.tgz
```

Start that profile once and check the book button, PDF import/paging/selection,
region capture, the ask panel and the "加入笔记" action. Remove the scratch
profile afterwards if you do not need it.

## 4. Publish to npm

```powershell
npm login
npm publish --access public
```

`publishConfig.access` is already `public`. The package has no install scripts,
so users do not approve a build when installing from npm.

Users install it with:

```powershell
dsh plugin --profile web add dsh-reading-corner
```

## 5. Optional GitHub Release tarball

```powershell
gh release create v1.6.0 .\dsh-reading-corner-1.6.0.tgz
```

## 6. Submit to the community catalog

The market and the Discover index read the curated
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
list. Open a PR there adding one file, `data/plugins/<owner>__<repo>.yml`:

```yaml
url: https://github.com/<owner>/dsh-reading-corner
name: <owner>/dsh-reading-corner
category: ui
description:
  en: 'Read a built-in mini-book or import a PDF beside the chat; select text or drag a region and ask the agent with the quote or screenshot attached, then append the answer to a per-book Markdown notebook.'
  zh: '在聊天旁边读内置小书或导入 PDF，划词或框选后带着原文/截图向智能体提问，并把回答一键收进按书分的 Markdown 笔记。'
icon: https://raw.githubusercontent.com/<owner>/dsh-reading-corner/main/assets/icon-180.png
```

- `dsh.bundle` must exist in `package.json` (it does); `dsh.client` alone is
  rejected.
- At most three entries per PR; do not edit the generated READMEs.
- The catalog tile icon is optional but must be a GitHub-hosted raster image.
  `icon.svg` remains the plugin-manager icon.

## 7. Versioning

Change `version`, rebuild `client.js`, pack and install the tarball in a scratch
profile, then `npm publish` and tag the release. The catalog shows the npm
version and detects updates from the registry.

## Security notes

- The Host half runs in-process, reads the session log and writes only
  `<workspace>/读书笔记/`.
- Its route is same-origin and fenced by `connection.requestRejection`; the
  plugin makes no network requests.
- The PDF engine is bundled from pdf.js; see `THIRD_PARTY_NOTICES.md`.
- The Host half declares its Web services through `ctx.inject`, so installing it
  into a headless profile does not fail activation.
