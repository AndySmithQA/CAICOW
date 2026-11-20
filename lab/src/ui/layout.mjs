import { escapeHtml, stylesheet } from "./design-system/components.mjs";

export function page({ title, user, body }) {
  const account = user
    ? `Signed in as ${escapeHtml(user.name)} · <a href="/sign-in">Switch user</a>`
    : `<a href="/sign-in">Sign in</a>`;
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)} · ServiceFlow</title><style>${stylesheet()}</style></head>
<body>
<header><strong><a href="/">ServiceFlow</a></strong><span>${account}</span></header>
<main><h1>${escapeHtml(title)}</h1>${body}</main>
</body>
</html>`;
}

export function signInPage(users) {
  const links = users
    .map((user) => `<li><a href="/sign-in?user=${encodeURIComponent(user.id)}">${escapeHtml(user.name)}</a> (${escapeHtml(user.role)})</li>`)
    .join("");
  return page({ title: "Sign in", body: `<p>Choose who you are for this session.</p><ul>${links}</ul>` });
}
