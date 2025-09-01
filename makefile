up:
	docker compose -f dev.compose.yaml up --build --force-recreate --no-deps -d

down:
	docker compose -f dev.compose.yaml down
