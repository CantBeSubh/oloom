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

dbuild:
	@if [ -f .env ]; then \
		echo "Using existing .env file"; \
	else \
		echo "No .env file found"; \
		echo "Exporting env vars"; \
		infisical export > .env; \
	fi
	@echo "Building..."
	docker build -t oloom-web .

drun:
	@if [ -f .env ]; then \
		echo "Using existing .env file"; \
	else \
		echo "No .env file found"; \
		echo "Exporting env vars"; \
		infisical export > .env; \
	fi
	docker run --rm -p 3000:3000 --env-file ./.env --name oloom-web oloom-web

dpush:
	@if [ -f .env ]; then \
		echo "Using existing .env file"; \
	else \
		echo "No .env file found"; \
		echo "Exporting env vars"; \
		infisical export > .env; \
	fi
	@echo "Getting git commit hash..."
	$(eval COMMIT_HASH := $(shell git rev-parse --short HEAD))
	@echo "Building..."
	docker build -t holyc0w/oloom-web:${COMMIT_HASH} -t holyc0w/oloom-web:latest .
	@echo "Pushing..."
	docker push holyc0w/oloom-web:${COMMIT_HASH}
	docker push holyc0w/oloom-web:latest
