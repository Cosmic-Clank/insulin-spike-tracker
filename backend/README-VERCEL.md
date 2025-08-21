Deploying this FastAPI backend to Vercel — notes and caveats

Quick summary

-   Vercel's Python serverless runtime can run FastAPI apps by exposing an ASGI `app` under `api/<file>.py`.
-   We added `api/app.py` which re-exports your existing `backend.main:app` as `app`.

Important caveats

-   Native compiled dependencies: your backend uses `numpy`, `pyzbar` and `Pillow`. Vercel's serverless Python environment may not include these binaries or may be incompatible.
    -   `pyzbar` depends on system libraries and often fails on serverless platforms.
    -   `numpy` may increase slug size and cause cold-start issues.

Options

1. Try Vercel serverless directly

    - Add project to Vercel, point to this repo, and set Root to repo root.
    - Vercel will install `backend/requirements.txt` and run functions from `api/*.py`.
    - If install fails due to binary deps, see option 2.

2. Use a container (recommended for native deps)

    - Build a small Dockerfile (install system libs for zbar and pillow) and deploy using Vercel's Docker support or use another host (Render, Fly, Railway).

3. Move heavy tasks to an external worker or cloud function
    - Keep lightweight endpoints on Vercel and call a separate service (e.g., Cloud Run) for barcode decoding or heavy numpy processing.

Local testing

-   Create a virtualenv, install `backend/requirements.txt`, then run:

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Environment

-   Ensure `.env` contains OpenAI API keys and any other secrets. On Vercel, set these as Environment Variables in the dashboard.

Next steps I can do for you

-   Create a Dockerfile that installs system deps for `pyzbar` and packages the app — quick path to cloud hosting.
-   Or try a direct Vercel deploy and help debug any build errors you hit.
