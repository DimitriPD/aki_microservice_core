# 🏗️ AKI! Microservice B - Core

> **Events, Attendances and Occurrences Management**  
> Clean Architecture + SOLID + Vertical Slice Architecture  
> TypeScript + Express + MongoDB + Mongoose

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)

---

## 📋 Overview

The **AKI! Microservice B - Core** is responsible for managing the core business logic of the AKI! attendance system:

- **Events**: Classroom events with QR code generation
- **Attendances**: Student attendance records with location validation  
- **Occurrences**: Automatic and manual incident reports

This microservice follows **Clean Architecture**, **SOLID principles**, and **Vertical Slice Architecture** to ensure maintainability, testability, and scalability.

---

## 🏗️ Architecture

### Folder Structure

```
src/
├── application/           # Application Layer (Use Cases & Services)
│   ├── use-cases/
│   │   ├── events/       # Event-related business logic
│   │   ├── attendances/  # Attendance-related business logic
│   │   └── occurrences/  # Occurrence-related business logic
│   └── services/         # External service integrations
├── domain/               # Domain Layer (Entities & Business Rules)
│   ├── entities/         # Domain entities
│   ├── repositories/     # Repository interfaces
│   └── value-objects/    # Value objects and types
├── infrastructure/       # Infrastructure Layer (Database, External APIs)
│   ├── database/
│   │   ├── models/       # Mongoose models
│   │   └── connections/  # Database connections
│   ├── repositories/     # Repository implementations
│   └── config/          # Configuration
├── interface/           # Interface Layer (Controllers, Routes, Middleware)
│   ├── controllers/     # HTTP controllers
│   ├── routes/         # Route definitions
│   └── middlewares/    # Express middlewares
├── shared/             # Shared utilities
│   ├── errors/         # Error definitions
│   ├── logger/         # Logging utilities
│   └── utils/          # Utility functions
└── index.ts           # Application entry point
```

### Design Principles

- **Clean Architecture**: Clear separation of concerns across layers
- **SOLID Principles**: Single responsibility, dependency inversion, etc.
- **Vertical Slice Architecture**: Each feature (Event, Attendance, Occurrence) is self-contained
- **Domain-Driven Design**: Rich domain models with business logic

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **MongoDB** 7.0+ (or MongoDB Atlas)
- **Docker** (optional)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd aki_microservice_core
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB** (if running locally):
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or use MongoDB Atlas (recommended)
```

4. **Run the application:**
```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start
```

### Using Docker

1. **Start with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- MongoDB database
- AKI Core microservice  
- MongoDB Express (database UI)

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/aki_core` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PERSONAS_BASE_URL` | Personas microservice URL | `http://localhost:3000` |
| `FUNCTION_NOTIFICATIONS_URL` | Notifications function URL | `http://localhost:7071` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `info` |

### Database Configuration

The application uses MongoDB with Mongoose ODM. Database indexes are automatically created for optimal performance.

---

## 📡 API Endpoints

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/events` | List events (with pagination/filters) |
| `POST` | `/v1/events` | Create new event |
| `GET` | `/v1/events/:id` | Get specific event |
| `PUT` | `/v1/events/:id` | Update event |
| `DELETE` | `/v1/events/:id` | Delete event |
| `GET` | `/v1/events/:id/qr` | Get QR token for event |

### Attendances

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/attendances` | List attendances |
| `POST` | `/v1/attendances` | Record attendance by QR |
| `GET` | `/v1/attendances/:id` | Get specific attendance |
| `PUT` | `/v1/attendances/:id` | Update attendance |

### Occurrences

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/occurrences` | List occurrences |
| `POST` | `/v1/occurrences` | Create occurrence |

---

## 🔍 Example Requests

### Create Event

```bash
POST /v1/events
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "class_id": 1,
  "teacher_id": 1,
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T12:00:00Z",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}
```

### Record Attendance by QR

```bash
POST /v1/attendances
Content-Type: application/json

{
  "qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "device_id": "device-12345",
  "student_cpf": "12345678901",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "device_time": "2024-01-15T10:30:00Z"
}
```

---

## 🔐 Authentication

The service uses JWT-based authentication. In development mode, authentication is mocked for easier testing.

**Production**: Include `Authorization: Bearer <jwt-token>` header.  
**Development**: Authentication is automatically mocked.

---

## 📊 Business Rules

### Events
- Cannot overlap for the same class
- Generate signed QR tokens (JWT) valid until event end
- Can only be deleted if not closed

### Attendances  
- Validate student belongs to the class (via Personas service)
- Check location within 10m radius of event location
- Prevent duplicate attendance records
- Support different statuses: `recorded`, `manual`, `retroactive`, `invalid`

### Occurrences
- Automatically created for invalid attendance attempts
- Manual creation by teachers for incidents
- Integration with notification system

---

## 🔗 External Integrations

### Personas Microservice
- Student validation and class membership verification
- In development mode, uses mock data

### Notification Function  
- Sends occurrence notifications to institution
- In development mode, logs to console

---

## 🐳 Docker Support

### Development
```bash
docker-compose up -d
```

### Production Build
```bash
docker build -t aki-microservice-core .
docker run -p 3001:3001 --env-file .env aki-microservice-core
```

---

## 📝 Logging

The application uses Winston for structured logging:

- **Development**: Console output with colors
- **Production**: File-based logging with rotation
- **Levels**: error, warn, info, debug

Log files are stored in the `logs/` directory.

---

## 🧪 Testing

```bash
# Unit tests (coming soon)
npm test

# Integration tests (coming soon)  
npm run test:integration

# Linting
npm run lint
npm run lint:fix
```

---

## 🔍 Health Check

The service provides a health check endpoint:

```bash
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "database": "connected"
}
```

---

## � Deployment

### Environment Setup

1. **Production MongoDB**: Use MongoDB Atlas or self-hosted MongoDB
2. **Environment Variables**: Set all required variables in production
3. **JWT Secret**: Use a strong, randomly generated secret
4. **Logging**: Configure appropriate log levels

### CI/CD Pipeline

The service is ready for containerized deployment with:
- Multi-stage Docker builds
- Health checks
- Graceful shutdown handling
- Production optimizations

---

## 🤝 Integration with AKI! Ecosystem

This microservice integrates with:

- **API Gateway**: Route and authenticate requests
- **BFF (Backend for Frontend)**: Aggregate data for frontends  
- **Personas Microservice**: Student and class data
- **Azure Functions**: Notifications and email services
- **Frontend Applications**: Teacher and student interfaces

---

## 📋 Development Guidelines

### Adding New Features

1. **Domain First**: Start with domain entities and business rules
2. **Use Cases**: Implement application logic in use cases
3. **Repository Pattern**: Data access through repository interfaces
4. **Controller**: HTTP interface in controllers
5. **Validation**: Use Zod schemas for request validation
6. **Error Handling**: Use custom error classes
7. **Testing**: Add unit tests for business logic

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for TypeScript
- **Prettier**: Code formatting (optional)
- **Conventional Commits**: For commit messages

---

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MongoDB is running and accessible
- Verify `MONGO_URI` environment variable
- Check network connectivity

**JWT Token Invalid**  
- Verify `JWT_SECRET` is set correctly
- Check token expiration
- Ensure Bearer token format

**Port Already in Use**
- Change `PORT` environment variable
- Kill existing processes on the port

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

---

## 📚 Additional Resources

- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 👥 Team

**AKI! Development Team**
- Camila Delarosa
- Dimitri Delinski  
- Guilherme Belo
- Yasmin Carmona

---

## 📄 License

This project is part of the AKI! attendance management system.

---

*For the complete system architecture and additional microservices, refer to the main AKI! documentation.*

## 3️⃣ Entidades Principais  

| Entidade | Atributos |
|-----------|------------|
| **Aluno** | CPF, nome, dispositivo associado (opcional) |
| **Professor** | CPF, nome, e-mail |
| **Turma** | Lista de alunos e professores |
| **Evento** | Turma, data/hora início, data/hora fim, localização, QR Code |
| **Presença** | Aluno, evento, status (registrada, manual, retroativa, inválida), horário, localização |
| **Observação** | Registro feito pelo professor quando um aluno não consta na turma |

---

## 4️⃣ Funcionalidades  

### 👨‍🏫 Professores
- Criar eventos para turmas vinculadas:  
  - Selecionar turma  
  - Definir data/hora início e fim  
  - Registrar localização atual  
- Excluir eventos (apenas se ainda não finalizados).  
- Corrigir presenças manualmente do evento.  
- Resetar dispositivo associado a um aluno.  
- Criar evento retroativo (quando não houve registro por QR).  

### 👨‍🎓 Alunos
- Escanear QR Code para marcar presença.  
- Primeira vez: informar CPF → associação com dispositivo.  
- Próximas vezes: presença automática.  
- Ver mensagem de confirmação de presença (“Presença registrada com sucesso”).  

### 🏫 Instituição
- Integração via API para gestão de dados (CRUD de alunos, professores e turmas).  
- Recebe notificações de observações feitas por professores.  
- Acessa relatórios consolidados.  

---

## 5️⃣ Regras de Negócio  

### 🗓️ Eventos
- Não podem se sobrepor na mesma turma.  
- Podem ser excluídos apenas antes de serem finalizados.  

### 🔐 QR Code
- Gerado ao iniciar o evento.  
- Expira quando o evento termina.  
- Contém token assinado (segurança contra falsificação).  

### 📍 Presença via QR
- Valida se aluno pertence à turma.  
- Verifica se a localização do dispositivo está a ≤10m da localização do evento.  
- Se localização falhar → evento retroativo é utilizado.  

### 🕒 Presença Retroativa
- Criada manualmente pelo professor.  
- Não tem validação de localização.  

### ⚠️ Observações
- Se aluno não estiver na lista, professor registra observação → notificação para a instituição.  

---

## 6️⃣ Auditoria e Logs  

- Registro de todas as presenças (QR, manual, retroativa).  
- Registro de localização (quando disponível).  
- Registro de quem criou/alterou/excluiu eventos.  
- Registro de correções feitas por professores.  
- Registro de tentativas inválidas (ex.: aluno de fora da turma).  

---

## 7️⃣ Relatórios (MVP)  

- Presença por evento.  
- Presença por aluno.  
- Presença por turma.  
- Exportação simples (CSV/Excel).  

---

## 8️⃣ Considerações Técnicas  

- Instituição deve fazer sincronização incremental para o AKI!.  
- Segurança: uso de tokens assinados (ex.: JWT) para QR Codes.  
- Disponibilidade offline:  
  - Se falhar a geolocalização, usa retroativo.  
  - Se não houver internet, professor cria evento retroativo posteriormente.  

---

# 🏗️ Arquitetura da Solução — Projeto AKI!  

## 📋 Visão Geral  
A solução é composta por múltiplos microsserviços independentes, duas interfaces (professor e aluno) e funções serverless responsáveis por notificações e comunicação orientada a eventos.  

Segue os princípios de:
- **Clean Architecture**  
- **SOLID**  
- **Vertical Slice Architecture**  

E inclui:
- Testes de arquitetura e unitários (Entrega 3)  
- API Gateway centralizado (Entrega 2 ou 3)  

---

## 🌐 API Gateway  

### Responsabilidades
- Todas as requisições passam obrigatoriamente pelo API Gateway.  
- Atua como ponto único de entrada para:  
  - Front End (BFF / Microfrontends)  
  - Requisições externas da instituição  
- Encaminha chamadas conforme origem:  
  - Front End → BFF  
  - Clientes externos → Microservices  
- Responsável por **autenticação e autorização** de todos os acessos.  

---

## 🧩 Microservices  

### 🧠 Microservice A – Personas (SQL Server)
**Entrega:** 2  
**Banco:** Azure SQL Server (Free 1 DTU)  

**Responsabilidades:**  
- CRUD completo de Aluno, Professor e Turma  
- Controlar vínculos entre alunos e turmas  
- Gerar evento para Function 2 (envio de e-mail de senha)  

**Stack:**  
`Node.js + Express + Sequelize`  

---

### ⚡ Microservice B – Core (MongoDB)
**Entrega:** 2  
**Banco:** MongoDB Atlas (Free Tier)  

**Responsabilidades:**  
- CRUD de Evento, Presença e Ocorrência  
- Registrar presenças e validar vínculos via Microservice A  
- Armazenar ocorrências automáticas e manuais  

**Stack:**  
`Node.js + Express + Mongoose`  

---

## ☁️ Azure Functions (Serverless)  

### 🔔 Function 1 – Notificação (Aluno não está na turma)
**Entrega:** 2  
**Arquitetura:** Orientada a Eventos  
**Banco:** Azure SQL Server  

**Responsabilidades:**  
- Receber requisições do BFF  
- Registrar observações no SQL  
- Enviar mensagens (PUB) notificando a instituição  

---

### ✉️ Function 2 – Envio de e-mail (Professor cadastrar senha)
**Entrega:** 2  
**Responsabilidades:**  
- Receber requisições do Microservice A  
- Disparar e-mails de criação de senha  

---

### 🔁 Function 3 – Envio de e-mail (Professor esqueceu senha)
**Entrega:** 2 (caso viável)  
**Responsabilidades:**  
- Receber requisições do BFF  
- Enviar e-mails com link de recuperação de senha  

---

### 🏫 Function 4 – Simulador de Instituição
**Entrega:** 3  
**Arquitetura:** Orientada a Eventos  
**Banco:** Base própria  

**Responsabilidades:**  
- Consumir mensagens publicadas pela Function 1  
- Persistir logs simulando o comportamento da instituição  

---

## 🧠 BFF – Backend for Frontend (Node.js)
**Entrega:** 2  
**Stack:** Node.js + Express  

**Responsabilidades:**  
- Agregação e orquestração entre microsserviços e funções  
- Todas as requisições do frontend passam pelo BFF  
- Comunicação com:  
  - Microservice A (Personas)  
  - Microservice B (Core)  
  - Function 1 (Notificações)  
  - Function 3 (E-mails)  
- Consolidação de dados em formato otimizado para o frontend  

---

## 💻 Microfrontends (React)  

### 👨‍🏫 Professor
**Entrega:** 2  
**Stack:** React + TypeScript  

**Funcionalidades:**  
- Login e recuperação de senha  
- Visualizar turmas e alunos  
- Excluir dispositivos cadastrados  
- Criar, editar e excluir eventos  

---

### 👨‍🎓 Aluno
**Entrega:** 2  
**Stack:** React + TypeScript  

**Funcionalidades:**  
- Escanear QR Code para registrar presença  
- Inserir CPF e vincular dispositivo  

---

## 🧩 Requisitos de Arquitetura (Obrigatórios)

| Tema | Descrição | Entrega |
|------|------------|----------|
| Padrões Arquiteturais | Clean Architecture, SOLID, Vertical Slice | 2 |
| Testes | Arquitetura e Unitários | 3 |
| API Gateway | Entrada única, auth, autorização | 2 |
| Arquitetura Orientada a Eventos | Functions 1 e 4 baseadas em mensagens | 2–3 |
| CI/CD e Deploy Docker | Publicação via GitHub e Docker Hub | Final |

---

## 🧱 Resumo Estrutural  

| Componente | Stack | Banco | Responsabilidades |
|-------------|--------|--------|-------------------|
| **API Gateway** | Node.js / Express | — | Entrada única, auth, roteamento |
| **BFF** | Node.js / Express | — | Agregação e orquestração |
| **Microservice A – Personas** | Node.js + Sequelize | Azure SQL | Aluno, Professor, Turma |
| **Microservice B – Core** | Node.js + Mongoose | MongoDB Atlas | Evento, Presença, Ocorrência |
| **Function 1** | Azure Function (HTTP + PUB/SUB) | Azure SQL | Notificação aluno fora da turma |
| **Function 2** | Azure Function (HTTP) | — | E-mail de cadastro de senha |
| **Function 3** | Azure Function (HTTP) | — | E-mail recuperação de senha |
| **Function 4** | Azure Function (Event Consumer) | Banco próprio | Simulador de instituição |
| **Frontend Professor** | React / TypeScript | — | CRUD de eventos e turmas |
| **Frontend Aluno** | React / TypeScript | — | QR Code, presença, dispositivo |
