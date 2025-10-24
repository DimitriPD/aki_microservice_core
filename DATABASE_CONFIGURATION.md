# 🗄️ Configuração do Banco de Dados - aki-core-db

## ✅ Configuração Implementada

A aplicação AKI! Microservice B - Core foi configurada com sucesso para usar seu banco de dados **"aki-core-db"**.

### 📋 Detalhes da Configuração

**Arquivo**: `.env`
```properties
MONGO_URI="mongodb+srv://dimitrisonet_db_user:7NfLgQniAIlHCVXZ@aki-cluster.dswh8xv.mongodb.net/aki-core-db?appName=AKI-Cluster"
```

### 🔍 Informações da Conexão

- **Banco de Dados**: `aki-core-db`
- **Cluster**: `aki-cluster.dswh8xv.mongodb.net`
- **Usuário**: `dimitrisonet_db_user`
- **Porta**: `27017` (padrão MongoDB)
- **App Name**: `AKI-Cluster`

### 📊 Collections Existentes

Durante o teste de conexão, foram identificadas as seguintes collections:
- ✅ `events` - Para armazenar eventos de aulas
- ✅ `attendances` - Para armazenar registros de presença

### 🧪 Teste de Conexão Realizado

```bash
✅ Connected to MongoDB successfully!
📁 Database name: aki-core-db
🌐 Host: ac-q59gspo-shard-00-00.dswh8xv.mongodb.net
🔌 Port: 27017
📋 Collections: [ 'events', 'attendances' ]
```

### 🚀 Status da Aplicação

- ✅ **Conexão**: Estabelecida com sucesso
- ✅ **Servidor**: Rodando na porta 3001
- ✅ **Swagger Docs**: Disponível em `/docs`
- ✅ **API Endpoints**: Funcionais e prontos para uso

### 🔧 Como Iniciar

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

### 📡 Endpoints Disponíveis

Todos os endpoints estão configurados para usar o banco `aki-core-db`:

- **GET /v1/events** - Listar eventos
- **POST /v1/events** - Criar evento
- **GET /v1/events/{id}** - Obter evento específico
- **PUT /v1/events/{id}** - Atualizar evento
- **DELETE /v1/events/{id}** - Deletar evento
- **GET /v1/events/{id}/qr** - Obter token QR

- **GET /v1/attendances** - Listar presenças
- **POST /v1/attendances** - Registrar presença por QR
- **GET /v1/attendances/{id}** - Obter presença específica
- **PUT /v1/attendances/{id}** - Atualizar presença

- **GET /v1/occurrences** - Listar ocorrências
- **POST /v1/occurrences** - Criar ocorrência

- **POST /v1/admin/export/attendances** - Exportar presenças

### 🔐 Autenticação

Use o token `mock-token` para desenvolvimento e testes.

### 📖 Documentação

Acesse a documentação interativa em: `http://localhost:3001/docs`

---

## ✅ **CONFIGURAÇÃO CONCLUÍDA**

Sua aplicação AKI! Microservice B - Core está agora configurada e funcionando com o banco de dados **aki-core-db**! 🎉