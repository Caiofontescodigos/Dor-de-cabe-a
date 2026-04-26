# 🚀 Setup do Projeto

## Pré-requisitos

- **Node.js**: 20 LTS ou superior
- **npm**: 10+ (incluído com Node.js)
- **Git**: 2.37+

## 📋 Instalação Rápida

### 1. Clonar repositório

```bash
git clone https://github.com/seu-usuario/projeto_01-domino.git
cd projeto_01-domino
```

### 2. Instalar dependências

```bash
# Instala dependências de todos os workspaces
npm install
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env conforme necessário
nano .env  # ou use seu editor favorito
```

### 4. Rodar em desenvolvimento

```bash
# Terminal 1: Backend
npm run dev -w server

# Terminal 2: Frontend (novo terminal)
npm run dev -w client
```

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## 🐳 Setup com Docker

### Build e rodar

```bash
docker-compose up -d
```

### Logs

```bash
docker-compose logs -f
```

### Parar

```bash
docker-compose down
```

## 📦 Cadeia de Suprimentos & Versões

**Todas as dependências estão com versões FIXAS até janeiro de 2026:**

```
Sem atualização automática:
✅ Não usar ^, ~ em versões
✅ Versões explícitas: 1.2.3
✅ Lock files: package-lock.json obrigatório
✅ Reproduzibilidade: sempre mesmas versões
```

### Versões Pinadas

**Backend:**
- `express`: 4.18.2
- `socket.io`: 4.7.2
- `typescript`: 5.3.3

**Frontend:**
- `react`: 18.2.0
- `vite`: 5.0.8
- `typescript`: 5.3.3

**Compartilhadas:**
- `Node.js`: 20 LTS
- `npm`: 10+

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Rodar dev em ambos packages
npm run dev -w server   # Apenas backend
npm run dev -w client   # Apenas frontend

# Build
npm run build           # Build de produção
npm run build -w server
npm run build -w client

# Type checking
npm run type-check      # Validar tipos TypeScript
npm run type-check -w server
npm run type-check -w client

# Produção
npm start               # Rodar servidor (após build)
```

## 📁 Estrutura de Pastas

```
projeto_01-domino/
├── packages/
│   ├── server/          # Backend Node.js + Express
│   └── client/          # Frontend React + Vite
├── docs/                # Documentação
├── .env.example         # Variáveis de ambiente (template)
├── .env                 # Variáveis de ambiente (local, não commitar)
├── package.json         # Root monorepo
├── docker-compose.yml   # Orquestração Docker
└── README.md            # Este arquivo
```

## 🛡️ Segurança de Dependências

### Verificar vulnerabilidades

```bash
npm audit
```

### Atualizar com cuidado

⚠️ **IMPORTANTE**: Versões estão fixas até janeiro de 2026. Qualquer atualização deve ser:

1. Necessária por segurança crítica
2. Testada completamente
3. Documentada no Git
4. Aprovada em PR

```bash
# Atualizar uma dependência (raro!)
npm install express@4.19.0  # Especificar versão exata
npm install                 # Atualizar package-lock.json
```

## 🐛 Troubleshooting

### "node_modules não encontrado"

```bash
npm install  # Reinstalar
```

### "Porta 3001 já em uso"

```bash
# Encontrar processo
lsof -i :3001

# Matar processo (Linux/Mac)
kill -9 PID

# Ou usar porta diferente
PORT=3002 npm run dev -w server
```

### "Erro de CORS"

Verificar `.env`:

```
CLIENT_URL=http://localhost:5173  # Frontend URL
```

### Docker não encontra dependências

```bash
docker-compose down -v  # Remove volumes
docker-compose up --build  # Rebuild
```

## 📚 Próximos Passos

1. Ler [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura completa
2. Ler [README.md](README.md) - Especificações do jogo
3. Começar com [Fase 2: Lógica do Jogo](README.md#-divisão-de-etapas)

## 💬 Suporte

- Dúvidas? Abra uma [issue no GitHub](https://github.com/seu-usuario/projeto_01-domino/issues)
- Quer contribuir? Veja [ARCHITECTURE.md](docs/ARCHITECTURE.md)
