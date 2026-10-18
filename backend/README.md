# Backend Radar

Node.js 22, TypeScript, Prisma/PostgreSQL, Supabase Auth e AWS Lambda/API Gateway/EventBridge. Organização em [ARCHITECTURE.md](ARCHITECTURE.md).

```sh
npm ci
# Configure .env a partir de .env.example.
npm run db:generate
npm run db:deploy
npm run db:seed
npm run check
npm run dev
```

Use migrations versionadas. Service role não é utilizada. RLS bloqueia acesso direto às tabelas pela API pública; Prisma usa o proprietário do banco.

## API

Exceto GET /health, todas as rotas exigem Authorization: Bearer com token Supabase do usuário.

- GET /health: estado e disponibilidade da busca web.
- GET /catalog, GET /me/plan.
- GET /monitors, POST /monitors, PATCH /monitors/{id}, DELETE /monitors/{id}.
- GET /notifications, POST /devices.
- GET /me/impact, POST /feedback.
- POST /admin/plan: somente usuários de ADMIN_USER_IDS.

URLs fixas e busca web não podem ser misturadas. O plano gratuito permite três monitores e uma fonte por monitor, com coleta a cada 12h.

## Validar

```sh
npm run check
npm run test:integration
npm run examples:postgraduate -- email-da-conta@example.com
```

Integração usa o banco configurado, registros isolados por usuário lógico aleatório e limpeza em finally. Não envia push. Logs de falha controlada são esperados. Exemplos reais exigem conta cadastrada no Supabase Auth.

[README principal](../README.md) · [Roteiro](../docs/TESTE_POS_GRADUACAO.md) · [AWS dev](../docs/AWS_DEV.md) · [Limitações](../RELEASE_STATUS.md).
