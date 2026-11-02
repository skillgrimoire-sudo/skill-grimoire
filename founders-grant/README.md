# Founder's Grant Challenge 2027 — on skillgrimoire.com

## What's where

| Path | What it is |
|---|---|
| `proj/public/register/index.html` | The event page + registration form, live at **www.skillgrimoire.com/register** |
| `proj/public/register/sg-monogram.png` | Logo used on that page |
| `proj/src/components/layout/FoundersGrantBanner.tsx` | Scrolling gold banner at the top of every public page, linking to the event page. Hidden on `/admin`. |
| `proj/src/app/globals.css` (end of file) | Banner styles |
| `proj/next.config.ts` | Serves `/register` |
| `founders-grant/apps-script/Code.gs` | Registration backend, run on Google Apps Script (not part of the website build) |

## How registrations are stored

The website runs on Netlify, and Netlify functions accept about 6 MB per request, which is too small for a 10 MB PDF. So the form sends each registration straight from the student's browser to **Google Apps Script**, running under the `foundersgrant@skillgrimoire.com` Google account. The script then:

- saves the PDF in **Google Drive**, in a folder for each sector
- adds a row to a **Google Sheet**
- gives the team a Registration ID (FGC27-00001…)
- emails the team lead a confirmation, and sends foundersgrant@ a daily summary

Students don't need a Google account.

## One-time setup

1. **Google account**: at accounts.google.com/signup choose **"Use your existing email"**, then enter `foundersgrant@skillgrimoire.com`. Buy at least 100 GB of Google One storage on it.
2. **Sheet + script**: signed in as that account, open sheets.new → name it **FGC 2027 Registrations** → **Extensions → Apps Script**. Paste all of `founders-grant/apps-script/Code.gs` and save. In **Project Settings**, set the time zone to India Standard Time.
3. Choose the **setup** function → **Run** → allow access.
4. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Copy the URL (ends in `/exec`).
5. In `proj/public/register/index.html`, near the bottom, replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL. Commit and push.

## Testing and going live

- Before 8 Nov the form is locked. Test it at **www.skillgrimoire.com/register?preview=1**. Test entries get IDs starting with `TEST-`.
- **Going live:** delete the test rows and PDFs. In Apps Script, set `TEST_MODE: false`, then **Deploy → Manage deployments → Edit → New version**. The URL stays the same.
- **After the event:** remove `<FoundersGrantBanner />` from `proj/src/app/layout.tsx` to take the banner down.

## Changing the banner text

Edit the `ITEMS` list in `FoundersGrantBanner.tsx`.
