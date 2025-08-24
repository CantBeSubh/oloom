## TODO

- [ ] Add React Query
- [ ] Add Toast
- [ ] Customize Shadcn defaults
- [ ] Update and delete video
- [ ] Better video player
- [ ] Fix DataTable

## Imp commands

```bash
mkdir -p ~/minio/data

docker run \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -d \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=ROOTNAME" \
  -e "MINIO_ROOT_PASSWORD=CHANGEME123" \
  quay.io/minio/minio:RELEASE.2025-04-22T22-12-26Z-cpuv1 server /data --console-address ":9001"
```

## Run Locally

1. Install dependencies - bun, temporal, infisical
2. Deploy core services - postgres, minio
3. Start temporal server

- `cd pipeline`
- `uv venv`
- `temporal server start-dev`
- In another terminal - `temporal operator namespace create oloom`

7. Start temporal worker

- `cd pipeline`
- `uv venv`
- `infisical run --command="uv run run_worker.py"`

8. Run FE

- `cd web`
- `make dev`
