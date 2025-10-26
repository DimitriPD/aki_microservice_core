Especificações MVP
Arquitetura e Soluções Cloud
CAMILA DELAROSA, DIMITRI DELINSKI, GUILHERME BELO E YASMIN CARMONA 

1. Visão Geral
Sistema de chamadas para instituições de ensino, baseado em eventos de presença criados pelos professores e confirmados pelos alunos via QR Code e geolocalização. A instituição é a responsável pelos cadastros (alunos, professores e turmas) e pelo controle de dados via API.
2. Perfis de Usuário
Instituição
Integra alunos, professores e turmas via API.
Recebe relatórios e notificações.
Professor
Autenticado via SSO.
Pode criar, excluir e gerenciar eventos das turmas em que leciona.
Pode dar presenças manuais, resetar dispositivos e corrigir presenças.
Aluno
Não possui login no sistema.
Marca presença escaneando QR Code com o dispositivo.
Primeira vez: informa CPF para associar o dispositivo.
Nas próximas vezes: presença registrada automaticamente.
3. Entidades Principais
Aluno: CPF, nome, dispositivo associado (opcional).
Professor: CPF, nome, e-mail.
Turma: lista de alunos e professores.
Evento: turma, data/hora início, data/hora fim, localização, QR Code.
Presença: aluno, evento, status (registrada, manual, retroativa, inválida), horário, localização.
Observação: registro feito pelo professor quando um aluno não consta na turma.
4. Funcionalidades
4.1 Professores
Criar eventos para turmas vinculadas:
Selecionar turma.
Definir data/hora início e fim.
Registrar localização atual.
Excluir eventos (apenas se ainda não finalizados).
Corrigir presenças manualmente do evento.
Resetar dispositivo associado a um aluno.
Criar evento retroativo (quando não houve registro por QR).
4.2 Alunos
Escanear QR Code para marcar presença.
Primeira vez: informar CPF → associação com dispositivo.
Próximas vezes: presença automática.
Ver mensagem de confirmação de presença (“Presença registrada com sucesso”).
4.3 Instituição
Integração via API para gestão de dados:
CRUD de alunos, professores e turmas.
Recebe notificações de observações feitas por professores.
Acessa relatórios consolidados.
5. Regras de Negócio
Eventos:
Não podem se sobrepor na mesma turma.
Podem ser excluídos apenas antes de serem finalizados.
QR Code:
Gerado ao iniciar o evento.
Expira quando o evento termina.
Contém token assinado (segurança contra falsificação).
Presença via QR:
Valida se aluno pertence à turma.
Verifica se localização do dispositivo está a ≤10m da localização do evento.
Se localização falhar → evento retroativo é utilizado.
Presença retroativa:
Professor cria manualmente, seleciona alunos presentes.
Não tem validação de localização.
Observações:
Se aluno não estiver na lista, professor registra observação → notificação para a instituição.
6. Auditoria e Logs
Registro de todas as presenças (QR, manual, retroativa).
Registro de localização (quando disponível).
Registro de quem criou/alterou/excluiu eventos.
Registro de correções feitas por professores.
Registro de tentativas inválidas (ex.: aluno de fora da turma).
7. Relatórios (mínimo MVP)
Presença por evento.
Presença por aluno.
Presença por turma.
Exportação simples (CSV/Excel).
8. Considerações Técnicas
Instituição deve fazer sincronização incremental para o AKI!.
Segurança: uso de tokens assinados (ex.: JWT) para QR Codes.
Disponibilidade offline:
Se falhar a geolocalização, usa retroativo.
Se não houver internet, professor cria evento retroativo posteriormente.




🏗️ Arquitetura da Solução — Projeto AKI!
📋 Visão Geral
A solução será composta por múltiplos microsserviços independentes, duas interfaces (professor e aluno) e funções serverless responsáveis por notificações e comunicação orientada a eventos.
Toda a arquitetura segue os princípios de:
Clean Architecture
SOLID
Vertical Slice Architecture
Além disso, serão implementados:
Testes de arquitetura e testes unitários (Entrega 3)
API Gateway centralizado (Entrega 3) //Tentar fazer na 2

🌐 API Gateway
Responsabilidades
Todas as requisições da solução passam obrigatoriamente pelo API Gateway.
Atua como ponto único de entrada para:
O Front End (BFF / Microfrontends)
E para requisições externas da instituição (ex: integração para registrar professores, turmas e alunos).
Encaminhamento das requisições:
Chamadas do Front End → direcionadas ao BFF;
Chamadas de clientes externos → direcionadas diretamente aos microsserviços;
Responsável por autenticação e autorização de todos os acessos.

🧩 Microservices
🧠 Microservice A – Personas (SQL Server)
Entrega: 2
Banco: Azure SQL Server (Free 1 DTU)
Responsabilidades
Receber requisições vindas do BFF;
Realizar o CRUD completo de:
Aluno
Professor
Turma
Controlar vínculos entre alunos e turmas;
Ao cadastrar um professor sem senha, gerar um evento para a Function 2 (responsável pelo envio do e-mail de criação de senha);
Tecnologias
Node.js + Express + Sequelize

⚡ Microservice B – Core (MongoDB)
Entrega: 2
 Banco: MongoDB Atlas (Free Tier)
Responsabilidades
Receber requisições vindas do BFF;
Executar CRUD de:
Evento
Presença
Ocorrência
Registrar presenças e validar o vínculo de alunos via Microservice A;
Armazenar ocorrências automáticas (ex: aluno fora da turma) e ocorrências manuais registradas por professores.
Tecnologias
Node.js + Express + Mongoose

☁️ Azure Functions (Serverless)
🔔 Function 1 – Notificação (Aluno não está na turma)
Entrega: 2
Arquitetura: Orientada a Eventos
Banco: Azure SQL Server (Free 1 DTU)
Responsabilidades
Receber requisições do BFF;
Registrar observações e avisos para a instituição no SQL;
Enviar mensagens (PUB) notificando a instituição sobre o erro (por exemplo, tentativa de presença em turma incorreta);



✉️ Function 2 – Envio de e-mail (Professor cadastrar senha)
Entrega: 2
Responsabilidades
Receber requisições do Microservice A;
Disparar e-mails para professores recém-cadastrados, orientando-os a definir sua senha de acesso.

🔁 Function 3 – Envio de e-mail (Professor esqueceu senha)
Entrega: 2 (caso viável)
Responsabilidades
Receber requisições do BFF;
Enviar e-mails com link de recuperação de senha para professores.

🏫 Function 4 – Simulador de Instituição
Entrega: 3
 Arquitetura: Orientada a Eventos
 Banco: Base própria para logs e simulação
Responsabilidades
Consumir mensagens publicadas pela Function 1;
Persistir essas mensagens em um banco próprio, simulando o comportamento da instituição que recebe os alertas.

🧠 BFF – Backend for Frontend (Node.js)
Entrega: 2
Stack: Node.js + Express
Responsabilidades
Agregação e orquestração entre os microsserviços e funções;
Todas as requisições dos microfrontends passam obrigatoriamente pelo BFF;
Comunicação com:
Microservice A (SQL – Personas)
Microservice B (Mongo – Core)
Function 1 (notificações)
Function 3 (e-mails de recuperação)
Reúne e consolida informações em um formato otimizado para o frontend.

💻 Microfrontends (React)
👨‍🏫 Microfrontend – Interface do Professor
Entrega: 2
Stack: React + TypeScript
Telas e funcionalidades
Login e recuperação de senha
Acesso ao sistema e fluxo de esquecimento de senha
Tela principal
Minhas turmas
Ler/visualizar turmas e alunos;
Excluir dispositivos cadastrados por aluno.
Meus eventos
Criar novo evento;
Editar evento existente;
Excluir evento (não finalizado);
Ler/visualizar eventos anteriores.

👨‍🎓 Microfrontend – Interface do Aluno
Entrega: 2
Stack: React + TypeScript
Telas e funcionalidades
Tela de QR Code
Gerar QR Code para registro de presença.
Cadastro de dispositivo
Inserir CPF e vincular o dispositivo ao aluno.

🧩 Requisitos de Arquitetura (Obrigatórios)
Tema
Descrição
Entrega
Padrões Arquiteturais
Clean Architecture, SOLID, Vertical Slice
Entrega 2
Testes de Arquitetura e Unitários
Implementação obrigatória nos microsserviços
Entrega 3
API Gateway
Ponto único de entrada, autenticação, autorização
Entrega 2
Arquitetura Orientada a Eventos
Functions 1 e 4 baseadas em mensagens ServiceBUS
Entrega 2–3
CI/CD e Deploy Docker
Publicação dos serviços e functions no GitHub e Docker Hub
Entrega final


🧱 Resumo Estrutural
Componente
Linguagem / Stack
Banco
Responsabilidades principais
API Gateway
Node.js / Express
—
Entrada única, auth, roteamento
BFF
Node.js / Express
—
Agregação e orquestração
Microservice A – Personas
Node.js + Sequelize
Azure SQL
Aluno, Professor, Turma
Microservice B – Core
Node.js + Mongoose
MongoDB Atlas
Evento, Presença, Ocorrência
Function 1
Azure Function (HTTP + PUB/SUB)
Azure SQL
Notificar aluno fora da turma
Function 2
Azure Function (HTTP)
—
E-mail cadastro de senha
Function 3
Azure Function (HTTP)
—
E-mail recuperação de senha
Function 4
Azure Function (Event Consumer)
Banco próprio
Simulador de instituição
Frontend Professor
React / TypeScript
—
CRUD eventos, turmas
Frontend Aluno
React / TypeScript
—
QR Code, presença, dispositivo


