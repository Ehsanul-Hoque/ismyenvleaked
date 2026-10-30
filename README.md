# IsMyEnvLeaked

**[ismyenvleaked.ehsanfahad.dev](https://ismyenvleaked.ehsanfahad.dev)**

Paste your `.env` and find out if it's leaked. Spoiler: it is. You just pasted it into a website.

This is a joke with a point. AI agents and careless commits keep leaking `.env` files, and leaked keys turn into huge cloud bills. The page runs a fake investigation, then tells you the truth: the only leak was you, pasting secrets into a random site. This one is harmless. The next one might not be.

## Nothing leaves your browser

That's the whole premise, so here is how you can check it instead of trusting me:

1. **There is no backend.** The site is four static files in [`site/`](site/): `index.html`, `styles.css`, `app.js`, `theme-init.js`. No build step, so the files in this repo are byte-for-byte what gets served.
2. **The browser blocks network requests.** [`site/_headers`](site/_headers) sets `connect-src 'none'` and `form-action 'none'` in the Content Security Policy. Even if the code tried to send your file somewhere, the browser would refuse.
3. **Only variable names are read.** [`site/app.js`](site/app.js) pulls out names like `OPENAI_API_KEY` to make the fake log feel personal. Values are never captured, and the textarea is cleared when the investigation starts.
4. **No analytics, no cookies, no third-party anything.** Fonts are self-hosted.

To see it yourself, open DevTools → Network, paste something, click **Investigate**, and watch nothing happen.

Even so, don't paste real secrets into websites. Including this one.

## If you did leak a key

- Rotate it. Deleting the commit or the message isn't enough; assume it's already copied.
- Keep `.env` in `.gitignore` and commit only `.env.example` with fake values.
- Deny AI agents read access to `.env` in their permission settings.
- Set spending limits and billing alerts with every API provider.

## Development

The site is plain HTML, CSS and JavaScript. Type safety comes from `// @ts-check` and JSDoc, checked by `tsc` without compiling anything.

```sh
npm install        # dev tools only: typescript, prettier
npm run dev        # serve site/ at http://localhost:4321
npm run check      # type-check site/*.js
npm run format     # prettier
npm run og         # re-render site/og.png from og/og.html (needs Google Chrome)
```

`_headers` only takes effect on Cloudflare Pages, so the CSP isn't applied by the local dev server.

## Deployment

Cloudflare Pages, connected to this repo:

- Production branch: `main`. Pull requests get preview URLs.
- Build command: _(none)_
- Build output directory: `site`

CI (GitHub Actions) runs the type check and format check on every PR.

## License

Code: [MIT](LICENSE). Fonts in `site/fonts/` (Geist, Geist Mono): [SIL Open Font License](site/fonts/OFL.txt).

Made by [Ehsanul Hoque](https://ehsanfahad.dev).
