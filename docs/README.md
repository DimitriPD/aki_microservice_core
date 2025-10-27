# 📘 Especificações MVP

### Arquitetura e Soluções Cloud

**Autores:** Camila Delarosa, Dimitri Delinski, Guilherme Belo e Yasmin Carmona

---

## 1️⃣ Visão Geral

Sistema de chamadas para instituições de ensino, baseado em eventos de presença criados pelos professores e confirmados pelos alunos via QR Code e geolocalização.  
A instituição é responsável pelos cadastros (alunos, professores e turmas) e pelo controle de dados via API.

---

## 2️⃣ Perfis de Usuário

### 🏫 Instituição

- Integra alunos, professores e turmas via API.
- Recebe relatórios e notificações.

### 👨‍🏫 Professor

- Autenticado via SSO.
- Pode criar, excluir e gerenciar eventos das turmas em que leciona.
- Pode dar presenças manuais, resetar dispositivos e corrigir presenças.

### 👨‍🎓 Aluno

- Não possui login no sistema.
- Marca presença escaneando QR Code com o dispositivo.
- Primeira vez: informa CPF para associar o dispositivo.
- Próximas vezes: presença registrada automaticamente.

---

## 3️⃣ Entidades Principais

| Entidade       | Atributos                                                                              |
| -------------- | -------------------------------------------------------------------------------------- |
| **Aluno**      | CPF, nome, dispositivo associado (opcional)                                            |
| **Professor**  | CPF, nome, e-mail                                                                      |
| **Turma**      | Lista de alunos e professores                                                          |
| **Evento**     | Turma, data/hora início, data/hora fim, localização, QR Code                           |
| **Presença**   | Aluno, evento, status (registrada, manual, retroativa, inválida), horário, localização |
| **Observação** | Registro feito pelo professor quando um aluno não consta na turma                      |

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

| Tema                            | Descrição                                 | Entrega |
| ------------------------------- | ----------------------------------------- | ------- |
| Padrões Arquiteturais           | Clean Architecture, SOLID, Vertical Slice | 2       |
| Testes                          | Arquitetura e Unitários                   | 3       |
| API Gateway                     | Entrada única, auth, autorização          | 2       |
| Arquitetura Orientada a Eventos | Functions 1 e 4 baseadas em mensagens     | 2–3     |
| CI/CD e Deploy Docker           | Publicação via GitHub e Docker Hub        | Final   |

---

## 🧱 Resumo Estrutural

| Componente                    | Stack                           | Banco         | Responsabilidades               |
| ----------------------------- | ------------------------------- | ------------- | ------------------------------- |
| **API Gateway**               | Node.js / Express               | —             | Entrada única, auth, roteamento |
| **BFF**                       | Node.js / Express               | —             | Agregação e orquestração        |
| **Microservice A – Personas** | Node.js + Sequelize             | Azure SQL     | Aluno, Professor, Turma         |
| **Microservice B – Core**     | Node.js + Mongoose              | MongoDB Atlas | Evento, Presença, Ocorrência    |
| **Function 1**                | Azure Function (HTTP + PUB/SUB) | Azure SQL     | Notificação aluno fora da turma |
| **Function 2**                | Azure Function (HTTP)           | —             | E-mail de cadastro de senha     |
| **Function 3**                | Azure Function (HTTP)           | —             | E-mail recuperação de senha     |
| **Function 4**                | Azure Function (Event Consumer) | Banco próprio | Simulador de instituição        |
| **Frontend Professor**        | React / TypeScript              | —             | CRUD de eventos e turmas        |
| **Frontend Aluno**            | React / TypeScript              | —             | QR Code, presença, dispositivo  |