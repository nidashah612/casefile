# Casefile — a pocket case strategist for everyday disputes

**Live app:** [ADD YOUR DEPLOYED VERCEL URL HERE](https://your-app.vercel.app) ← *replace after deploying, see step 5 below*

## a. What it is, and who it's for

Most people who get wronged in a small, everyday way — a landlord who won't
return a security deposit, an employer who "forgets" to pay overtime, a shop
that refuses a refund it owes, a university that grades unfairly — have no
idea how to actually build a case. They don't know what evidence matters,
what to say, or when to escalate versus wait. So they either do nothing, or
they send one angry message that gets ignored and the matter dies there.

**Casefile turns "I got wronged" into an actual, working case file.** You
describe your dispute once. An AI case strategist reads it and:

- judges how strong your position realistically is,
- tells you exactly what evidence to gather (not generic advice — specific
  to your situation),
- builds a realistic **escalation ladder** (e.g. polite ask → formal written
  notice → regulatory complaint → small claims), and
- gives you one concrete first move.

From there, the case stays open. You log a timeline as things happen, and at
every stage you can ask the strategist for advice or have it **draft the
actual document** you need to send — in the right tone for how far things
have escalated — which you save straight into your case file.

This is built for **tenants, employees, customers, and students** — anyone
without a lawyer on speed dial who's dealing with someone who has more power
in the situation than they do.

## b. Live URL

👉 **[ADD YOUR DEPLOYED VERCEL URL HERE]** — replace this after you deploy
(step 5 in "How to run this project", below).

## c. Features

- **Case intake** — a short form describing the dispute, the other party,
  what you want, and where you are.
- **AI case analysis** — on submit, the strategist returns a structured
  read on your case: strength rating (strong / moderate / weak), a plain
  explanation of why, a summary, a list of specific evidence to collect, a
  tailored escalation ladder, and a recommended first action.
- **Escalation ladder** — a visual, clickable ladder of the realistic steps
  in your specific dispute. You move up it as things progress.
- **Stage-by-stage AI strategist chat** — ask for advice or ask it to draft
  the document for wherever you currently are on the ladder. The AI has
  your full case file as context and never invents facts you didn't give it.
- **One-click document drafting** — quick-action buttons ("Draft this
  stage's document", "What's my next move?") plus free-form chat.
- **Document vault** — save any AI reply as a named document, view it full
  screen, copy it to send.
- **Timeline** — log dated entries every time you send something, hear
  back, or find new evidence, building your paper trail.
- **Multiple cases** — your "filing cabinet" home page lists every case
  you've opened, each stamped with its AI-assessed strength.
- **Private by design** — case data is stored in your browser's
  `localStorage`, not on a server or database. Only the specific text you
  send to the AI ever leaves your device, and only to Google's API.

## d. The AI feature

The AI is the whole point of the app: it's a case strategist, not a generic
chatbot. It runs on **Google Gemini (`gemini-3.5-flash`)** via the Google AI
Studio API, called from two server-side routes so the API key is never
exposed to the browser.

**Moment 1 — opening a case** (`/api/analyze`, prompt in `lib/prompts.js` →
`CASE_ANALYST_SYSTEM_PROMPT`): given the dispute description, it must return
strict JSON — a strength rating, the reasoning behind it, a summary, a list
of concrete (not generic) evidence to gather, a 3–5 step escalation ladder
tailored to the dispute's domain, and one recommended first action. It's
explicitly instructed not to invent specific laws, statutes, or institutions
it isn't sure are real for the person's location, and to give exactly one
short "not a lawyer" disclaimer rather than hedging throughout.

**Moment 2 — working a case** (`/api/strategize`, prompt in
`lib/prompts.js` → `STRATEGIST_CHAT_SYSTEM_PROMPT`): a per-stage system
prompt that hands the model the full case file as ground truth and the
current escalation stage. It's instructed to draft full, ready-to-send
documents (matching tone to how serious the stage is) when asked, to give
short, case-specific advice otherwise, to never invent facts not in the case
file, and to say plainly when a question needs a real lawyer rather than
guessing at law it can't verify.

Both prompts are written from scratch for this app — you can read them in
full at [`lib/prompts.js`](./lib/prompts.js).

## e. Tools, services, and models used

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4, custom "case-file dossier" design system
  (see `app/globals.css`) — hand-built, no UI kit
- **AI model:** Google Gemini `gemini-3.5-flash`, via the Google AI Studio
  REST API (`generativelanguage.googleapis.com`)
- **Storage:** browser `localStorage` (no external database — see "Private
  by design" above)
- **Hosting:** Vercel
- **Fonts:** Fraunces, IBM Plex Mono, IBM Plex Sans (self-hosted via
  `@fontsource`, no external font requests at runtime)
- Built with the help of Claude (Anthropic) as a coding assistant.

## f. Screenshots

> Add at least 3 screenshots here once you've run the app (locally or on
> your live URL). Suggested shots: the home "filing cabinet" view, the case
> intake form, a case's Overview tab showing the AI's stamp and analysis,
> and the Strategy tab with the escalation ladder + chat.

```
![Home — filing cabinet](./docs/screenshot-home.png)
![New case intake](./docs/screenshot-new-case.png)
![Case overview with AI stamp](./docs/screenshot-overview.png)
![Strategy tab — ladder and chat](./docs/screenshot-strategy.png)
```

## g. How to run this project

### 1. Get a free Gemini API key
Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign
in with a Google account, and create an API key.

### 2. Run it locally
```bash
git clone https://github.com/YOUR-USERNAME/casefile.git
cd casefile
npm install
cp .env.example .env.local
# open .env.local and paste your key:
# GEMINI_API_KEY=your-key-here
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 3. Push to GitHub (must be public)
```bash
git init
git add .
git commit -m "Casefile: AI case strategist app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/casefile.git
git push -u origin main
```
Make sure the repo's visibility is **Public** in GitHub's settings.

### 4. Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. In the project's **Environment Variables**, add:
   - `GEMINI_API_KEY` = your Google AI Studio key
3. Deploy. Vercel auto-detects Next.js — no build config needed.

### 5. Update this README
Paste your live Vercel URL at the top of this file and in section (b), then
commit and push again.

## Project structure
```
app/
  page.js                 home — list of cases
  new/page.js             case intake form
  case/[id]/page.js       case detail (overview, strategy, timeline, docs)
  api/analyze/route.js    AI: initial case analysis (structured JSON)
  api/strategize/route.js AI: stage chat + document drafting
lib/
  prompts.js              the two system prompts — the actual AI feature
  gemini.js               Gemini API call wrapper
  storage.js              localStorage persistence
components/               UI components (ladder, chat, stamp, timeline, docs)
```

## Limitations & honest notes
- This is not legal advice, and the app says so. It's meant to help someone
  organize their thinking and communicate effectively, not replace a lawyer
  for anything serious.
- Case data lives in your browser only — clearing site data or switching
  devices means losing your cases. That's a deliberate privacy trade-off,
  not an oversight.
