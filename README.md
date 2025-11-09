# AKI! Microservice B - Core

Gerenciamento de Eventos e Presenças (Attendances) 

## 👥 Alunos / Autores

- Camila Delarosa  
- Dimitri Prudente Delinski  
- Guilherme Belo  
- Yasmin Carmona

---
## 🎯 Objetivo do Microserviço
Este serviço provê a lógica de negócio para:
- Criação e manutenção de eventos de presença
- Registro de presenças via QR Code e geolocalização

Ele integra-se a outros microsserviços (ex.: Personas).j

---
## 🏛️ Arquitetura
Adota princípios de:
- Clean Architecture
- SOLID
- Vertical Slice Architecture

### Por que Vertical Slice?
Cada "slice" (feature) encapsula fluxo completo de um caso de uso: endpoint, validação, handler, domínio e persistência. Benefícios:
- Independência e evolutividade por caso de uso
- Redução de acoplamento entre features
- Testes mais focados (unitários por slice)
- Facilita remoção ou substituição de uma feature sem impacto amplo

### Regras de Arquitetura (validadas por testes TSArch)
1. Slices (`events`, `attendances`, `occurrences`) não importam diretamente umas às outras.
2. Código de domínio não depende de `infrastructure`.
3. Código de domínio não depende de `interface`.
4. Domínio não depende da implementação de persistência da própria slice.
5. Pasta `features` livre de ciclos de dependência.

Essas regras garantem isolamento, pureza do domínio e evitam regressões por acoplamento acidental.

### Camadas / Pastas
- `src/features/` : Vertical slices (cada subpasta representa uma feature com seus casos de uso)
- `src/infrastructure/` : Serviços técnicos (config, conexões DB, integrações externas)
- `src/interface/` : Middlewares e composição HTTP (ex.: autenticação, validação cross-cutting)
- `src/shared/` : Utilitários reutilizáveis (logger, errors, token, geo)

### Fluxo Típico (Ex.: Criar Evento)
1. Request chega ao endpoint `CreateEventEndpoint.ts` (Express handler).
2. Validação `CreateEventValidator.ts` (Zod / regras de entrada).
3. Handler `CreateEventHandler.ts` orquestra: cria entidade, chama repositório.
4. Repositório em `persistence/` persiste via Mongoose model.
5. Retorno padronizado (DTO/objeto) enviado ao cliente.

### Domínio vs Persistência
- Entidades e value objects (ex.: `Event`, `EventId`, `Location`) vivem em `domain/` dentro da slice.
- Modelos e implementações (Mongoose) em `persistence/`.
- Domínio não conhece Mongoose; dependências apontam sempre para interfaces/abstrações.

---
## 📂 Estrutura Resumida
```
src/
  index.ts
  features/
    events/
      create/ ...
      list/ ...
      get/ ...
      update/ ...
      delete/ ...
      domain/ (entidades, value objects, repos interfaces)
      persistence/ (implementações, models)
    attendances/
      createByQr/ ...
      list/ ...
      get/ ...
      update/ ...
      domain/
      persistence/
    occurrences/
      create/ ...
      list/ ...
      domain/
      persistence/
  infrastructure/
    config/Config.ts
    database/connections/MongoConnection.ts
    services/PersonasService.ts
  interface/
    middlewares/ (Auth, Error, Validation)
  shared/
    errors/AppErrors.ts
    logger/Logger.ts
    utils/GeoUtils.ts, TokenService.ts
```

---
## 🧪 Testes de Arquitetura
Arquivo: `tests/architecture/architecture.spec.ts`
Executa regras de isolamento via TSArch.

### Rodar
```
npm test
```

### Extensão
- Para adicionar novas regras (ex.: restringir uso de `shared`), editar o spec e incluir novas condições.

---
## 🚀 Executar o Serviço
### Build
```
npm run build
```

### Desenvolvimento
```
npm run dev
```

### Produção (após build)
```
npm start
```

Configurações via variáveis de ambiente (ex.: `MONGO_URI`, `PORT`). Usar `.env` + `dotenv`.

---
## 📏 Convenções
- Cada caso de uso possui: `Command` (input shape), `Validator`, `Handler`, `Endpoint`.
- Repositórios: interface no domínio + implementação em `persistence`.
- Value Objects encapsulam invariantes (ex.: IDs, status).
- Erros centralizados em `shared/errors/AppErrors.ts`.
