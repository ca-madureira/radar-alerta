# Arquitetura do backend

O Radar segue a organização encontrada em `ivi/ivijur-core-client` e
`ivi/ivijur-core-admin`: funções Lambda por operação, módulos por domínio,
schemas separados, middleware compartilhado e composição em `serverless.ts`.

## Organização

- `src/modules/<domínio>/<operação>/handler.ts`: execução da operação HTTP ou job.
- `src/modules/<domínio>/<operação>/index.ts`: handler, método, rota ou agenda da Lambda.
- `src/modules/<domínio>/index.ts`: exportações das funções do domínio.
- `src/schemas/<domínio>/index.ts`: validações Zod e valores padrão.
- `src/middleware/`: autenticação Supabase e tratamento comum de erros.
- `src/config/`: configuração das funções e referências às variáveis de ambiente.
- `src/database/index.ts`: instância Prisma reutilizada entre invocações.
- `src/services/`: coleta, busca, correspondência, planos, datas e notificações.
- `src/utils/http.ts`: respostas HTTP e leitura de JSON, inclusive base64.
- `serverless.ts`: composição dos módulos, provider e CORS.

Para criar uma operação, adicione `handler.ts` e `index.ts`, exporte a função no
índice do domínio e importe esse domínio em `serverless.ts`. Operações protegidas
usam `authenticatedHandler`, que autentica antes de executar o handler e converte
erros de validação em HTTP 400. Apenas `/health` é público. Rotas desconhecidas
passam pela função `api`, que mantém a resposta 404 após autenticação.

## Compatibilidade

As URLs, os métodos, os corpos de resposta e as agendas existentes foram
preservados. Prisma, migrations e Supabase Auth continuam sendo usados.
Sequelize, Yup, pacotes privados `ivijur-utils` e a autenticação própria do IVI
não foram incorporados: exigiriam uma migração de persistência e de identidade,
além da reorganização do backend. As exportações antigas em `src/lib` e os dois
handlers antigos de jobs encaminham para as implementações novas.

A infraestrutura passa de uma Lambda HTTP central para uma Lambda por operação,
com fallback para rotas desconhecidas. O próximo deploy atualiza os recursos
CloudFormation; não houve publicação durante esta refatoração.

## Verificação

Execute `npm run check` para conferir formatação, TypeScript e testes.
Os testes cobrem os contratos registrados, middleware, JSON/base64, validação
parcial, montagem das consultas, correspondência e filtros temporais.
Testes com banco, Supabase e AWS reais continuam necessários para homologação.
