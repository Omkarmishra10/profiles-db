# Member Directory

A static site that lists app members as cards (name + photo) and links each
one to a full profile page. Pure HTML/CSS/JS, no build tooling — hostable
directly on GitHub Pages.

## Structure

- `index.html` / `js/index.js` — card grid with search, filters (gender,
  country, VIP/verified/online), sorting, and infinite scroll.
- `profile.html` / `js/profile.js` — full detail view for a single member
  (`profile.html?id=<userId>`).
- `js/main.js` — shared helpers (data loading, HTML escaping, flag emojis,
  relative time, avatar fallback).
- `data/users.json` — **sanitized** dataset actually served to the browser.
- `build.py` — regenerates `data/users.json` from a raw export.

## Regenerating the data

`build.py` expects a raw export at `../dumped_users.json` (one level above
this folder) and rewrites `data/users.json` from it:

```
python build.py
```

The raw export is **never** meant to be committed or published. `build.py`
strips every field that isn't appropriate for a public profile page —
emails, IP address history, push-notification tokens, admin/ban/moderation
flags, and internal counters are all dropped — and it excludes banned,
blocked, fake, or otherwise invalid accounts entirely. Only
`data/users.json` (the sanitized output) belongs in the repo you publish.

## Hosting on GitHub Pages

From inside this `site/` folder:

```
git init
git add index.html profile.html css js data build.py README.md .gitignore
git commit -m "Member directory site"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then in the repo's Settings → Pages, set the source to the `main` branch,
root folder. The site will be live at
`https://<your-username>.github.io/<repo-name>/`.

## Notes

- Profile photos are hotlinked from their original storage URLs (Firebase /
  DigitalOcean Spaces) — nothing is re-uploaded.
- If you regenerate `data/users.json` from a newer export, just commit and
  push the updated file; no other changes are needed.
