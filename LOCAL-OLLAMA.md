# Run Nova with local Ollama (Windows 11)

## Requirements

- Windows 11
- Node.js 18 or newer
- Ollama installed and running
- A local model such as `llama3.2:latest`

## Start

Open PowerShell in this repository folder:

```powershell
ollama list
```

If `llama3.2:latest` is already listed, do not download it again. Start Ollama if needed, then:

```powershell
npm start
```

Open http://127.0.0.1:4173/chat.html

## Optional model selection

```powershell
$env:OLLAMA_MODEL = "llama3.2:latest"
npm start
```

The server binds to loopback only (127.0.0.1). It does not accept connections from other devices. Prompts are sent to the local Ollama service; they are not sent to Vercel.

## Stop

Press Ctrl+C in the PowerShell window.

## Troubleshooting

- If the page says Ollama is offline, start the Ollama desktop app or service.
- Check `ollama list` for the model name.
- Check `http://127.0.0.1:4173/api/health` in your browser.
- No npm packages are required; the server uses Node.js built-ins and Node's built-in fetch.
