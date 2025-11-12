
.PHONY: dev prod stop-dev stop-prod clean logs-dev logs-prod

# Development
dev:
	docker-compose -p claude_job_soccer_dev -f docker-compose.dev.yml up --build

dev-d:
	docker-compose -p claude_job_soccer_dev -f docker-compose.dev.yml up --build -d

stop-dev:
	docker-compose -p claude_job_soccer_dev -f docker-compose.dev.yml down -v

logs-dev:
	docker-compose -p claude_job_soccer_dev -f docker-compose.dev.yml logs -f

# Production
prod:
	docker-compose -p claude_job_soccer_prod -f docker-compose.prod.yml up --build

prod-d:
	docker-compose -p claude_job_soccer_prod -f docker-compose.prod.yml up --build -d

stop-prod:
	docker-compose -p claude_job_soccer_prod -f docker-compose.prod.yml down 

logs-prod:
	docker-compose -p claude_job_soccer_prod -f docker-compose.prod.yml logs -f

# Cleanup
clean:
	docker-compose -p claude_job_soccer_dev -f docker-compose.dev.yml down -v
	docker-compose -p claude_job_soccer_prod -f docker-compose.prod.yml down -v
	docker system prune -f