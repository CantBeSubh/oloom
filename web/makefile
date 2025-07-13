dev:
	@echo "Starting dev server"
	infisical run --command="bun dev"

build:
	@echo "Exporting env vars"
	infisical export > .env
	@echo "Building"
	bun run build
	@echo "Starting server"
	bun run start 

.PHONY: dev build