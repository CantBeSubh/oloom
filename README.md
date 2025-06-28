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