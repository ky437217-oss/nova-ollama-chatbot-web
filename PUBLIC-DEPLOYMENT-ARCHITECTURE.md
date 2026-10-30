# Nova AI — Separate Public Deployment Architecture

## Important separation

The local Ollama mode and public AI service are separate deployments.

- The local app binds only to `127.0.0.1` and calls Ollama at `127.0.0.1:11434`.
- A Vercel-hosted static page cannot access the developer's laptop Ollama process for other visitors.
- Never expose the local Ollama port directly to the internet.

## Recommended public architecture (planning only)

```text
Public visitor
    |
    v
Vercel static frontend
    |
    v
HTTPS API gateway / backend (separately hosted)
    |
    +--> Authentication + rate limits + abuse controls
    |
    v
Remote inference host (Ollama or another permitted model runtime)
    |
    v
Hosted model
```

## Required before public AI launch

1. Select a remote host with an explicit compute budget and shutdown controls.
2. Confirm the provider's minimum age, acceptable-use, privacy and billing terms with a parent/guardian where required.
3. Put inference behind a backend; never place provider credentials in browser JavaScript.
4. Add authentication, per-user quotas, request-size limits, rate limits and abuse monitoring.
5. Add privacy notice, retention policy, logging minimization and deletion process.
6. Test cold starts, concurrency, model memory requirements and failure behavior.
7. Review expected monthly costs before enabling any paid resource.

## Not enabled

No remote host, paid compute, API key, database, domain, DNS, production deployment or public inference endpoint is configured by this repository change.
