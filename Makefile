# ============================================
# InovaHelix - Makefile
# ============================================
# Atalhos para build, deploy e manutenção
# Uso: make <comando>
# ============================================

.PHONY: dev build deploy deploy-all deploy-hosting deploy-rules deploy-functions clean lint help

# Cores para output
GREEN  := \033[0;32m
CYAN   := \033[0;36m
YELLOW := \033[0;33m
RESET  := \033[0m

# ---- Desenvolvimento ----

dev: ## Inicia o servidor de desenvolvimento
	@echo "$(CYAN)▶ Iniciando servidor de desenvolvimento...$(RESET)"
	npm run dev

build: ## Build de produção (TypeScript + Vite)
	@echo "$(CYAN)▶ Gerando build de produção...$(RESET)"
	npm run build
	@echo "$(GREEN)✔ Build concluído com sucesso$(RESET)"

lint: ## Verifica erros de TypeScript sem gerar build
	@echo "$(CYAN)▶ Verificando tipos TypeScript...$(RESET)"
	npx tsc --noEmit
	@echo "$(GREEN)✔ Nenhum erro encontrado$(RESET)"

# ---- Deploy ----

deploy: build ## Build + Deploy completo (Hosting + Firestore Rules)
	@echo "$(CYAN)▶ Fazendo deploy para Firebase...$(RESET)"
	firebase deploy --only hosting,firestore:rules
	@echo "$(GREEN)✔ Deploy concluído: https://orizon-match.web.app$(RESET)"

deploy-all: build ## Build + Deploy de tudo (Hosting + Rules + Functions)
	@echo "$(CYAN)▶ Deploy completo (hosting + rules + functions)...$(RESET)"
	firebase deploy
	@echo "$(GREEN)✔ Deploy total concluído$(RESET)"

deploy-hosting: build ## Build + Deploy apenas do Hosting
	@echo "$(CYAN)▶ Deploy do Hosting...$(RESET)"
	firebase deploy --only hosting
	@echo "$(GREEN)✔ Hosting atualizado: https://orizon-match.web.app$(RESET)"

deploy-rules: ## Deploy apenas das regras do Firestore (sem build)
	@echo "$(CYAN)▶ Deploy das regras Firestore...$(RESET)"
	firebase deploy --only firestore:rules
	@echo "$(GREEN)✔ Regras atualizadas$(RESET)"

deploy-functions: ## Deploy apenas das Cloud Functions
	@echo "$(CYAN)▶ Deploy das Cloud Functions...$(RESET)"
	firebase deploy --only functions
	@echo "$(GREEN)✔ Functions atualizadas$(RESET)"

# ---- Utilitários ----

clean: ## Limpa artefatos de build
	@echo "$(YELLOW)▶ Limpando dist/ e cache...$(RESET)"
	rm -rf dist node_modules/.vite
	@echo "$(GREEN)✔ Limpo$(RESET)"

seed: ## Alimenta o banco com dados realistas
	@echo "$(CYAN)▶ Populando banco com dados de teste...$(RESET)"
	node scripts/seed.cjs
	@echo "$(GREEN)✔ Banco populado$(RESET)"

open: ## Abre o site em produção no browser
	@echo "$(CYAN)▶ Abrindo https://orizon-match.web.app$(RESET)"
	xdg-open https://orizon-match.web.app 2>/dev/null || open https://orizon-match.web.app 2>/dev/null || echo "Acesse: https://orizon-match.web.app"

console: ## Abre o console do Firebase
	@echo "$(CYAN)▶ Abrindo console Firebase...$(RESET)"
	xdg-open https://console.firebase.google.com/project/orizon-match/overview 2>/dev/null || echo "Acesse: https://console.firebase.google.com/project/orizon-match/overview"

status: ## Mostra status do projeto Firebase
	@echo "$(CYAN)▶ Status do projeto:$(RESET)"
	@firebase projects:list 2>/dev/null | grep orizon
	@echo ""
	@echo "$(CYAN)▶ Último deploy:$(RESET)"
	@firebase hosting:channel:list 2>/dev/null || echo "  Use 'firebase hosting:channel:list' para ver canais"

# ---- Help ----

help: ## Mostra esta lista de comandos
	@echo ""
	@echo "$(CYAN)InovaHelix — Comandos disponíveis:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# Default
.DEFAULT_GOAL := help
