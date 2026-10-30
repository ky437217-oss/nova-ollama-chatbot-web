# Nova AI — Public UI Preview

Static public interface preview. Each workspace has its own page.

## Pages
- `index.html` — Overview / navigation
- `chat.html` — AI Chat UI
- `coding.html` — Coding Studio UI
- `files.html` — File Intelligence UI
- `agents.html` — Agent Planner UI
- `vision.html` — Vision UI
- `voice.html` — Voice Center UI

## Windows 11 — setup commands (PowerShell)

Clone the repository:

```powershell
Set-Location $HOME\Desktop
git clone https://github.com/ky437217-oss/nova-ollama-chatbot-web.git
Set-Location .\nova-ollama-chatbot-web
```

Open the static preview in your default browser:

```powershell
Start-Process .\index.html
```

Optional local server (Node.js required):

```powershell
npx --yes serve .
```

Then open the local URL printed by the command. Stop the server with Ctrl+C.

## Update from GitHub

```powershell
git pull origin main
```

## Deploy to Vercel
1. Open https://vercel.com/new and connect GitHub.
2. Import `ky437217-oss/nova-ollama-chatbot-web`.
3. Select **Other** / static site. Leave Build Command and Output Directory empty/default.
4. No environment variables are required. Click Deploy.
5. Future pushes to `main` can trigger automatic deployments when Git integration is enabled.

## Important limitations
- UI-only preview; this is not a working AI chatbot.
- No AI inference, API, backend, database or API keys.
- File upload, microphone access, code execution and computer control are disabled.
- Do not enter private or sensitive information.

No other repository or local project is changed by this preview.
