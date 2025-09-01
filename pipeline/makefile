shell:
	source .venv/bin/activate

dev:
	@echo "Starting dev server"
	infisical run --command="uv run run_worker.py"

dbuild:
	@echo "Building..."
	docker build -t oloom-worker .

drun:
	@if [ -f .env ]; then \
		echo "Using existing .env file"; \
	else \
		echo "No .env file found"; \
		echo "Exporting env vars"; \
		infisical export > .env; \
	fi
	docker run --rm --env-file ./.env --name oloom-worker oloom-worker

dpush:
	@echo "Getting git commit hash..."
	$(eval COMMIT_HASH := $(shell git rev-parse --short HEAD))
	@echo "Building..."
	docker build -t holyc0w/oloom-worker:${COMMIT_HASH} -t holyc0w/oloom-worker:latest .
	@echo "Pushing..."
	docker push holyc0w/oloom-worker:${COMMIT_HASH}
	docker push holyc0w/oloom-worker:latest

.PHONY: shell dev
