# Radar de Alertas — Busca híbrida e filtro de datas

## O que foi implementado
- Interface para período de 1, 7, 30, 90 dias ou sem limite.
- Base de data: publicação, atualização ou primeira descoberta.
- Leitura conservadora de metadados HTML e JSON-LD para `datePublished` e `dateModified`.
- Rejeição de resultados com datas não comprovadas por padrão.
- Histórico inicial de resultados de busca sem disparar alertas retroativos.
- Comparação de mudanças em fontes acompanhadas, datas e tipo do alerta.
- API Google Programmable Search / Brave Search (credenciais próprias).
- SQL de instalação inicial e script de atualização de bancos existentes.

## Limitações importantes
- A data de descoberta não prova que a página foi publicada naquele dia.
- Algumas fontes não fornecem metadados confiáveis; essas páginas são ignoradas no modo estrito.
- O monitoramento compara blocos de texto: pode detectar um novo edital que reutilize um termo existente. Não interpreta todas as alterações semânticas.
- Resultados de busca são descobertos conforme indexação do provedor, sem garantia de completude.
- PDF, JavaScript dinâmico, lembretes de prazos, cobrança, cotas de busca por plano, RSS e deduplicação por evento entre URLs **não estão implementados**.
- `onlyNew=true` aplica baseline sem alertas antigos; `false` permite avaliar a primeira coleta.
- A opção `requireVerifiedDate=false` não substitui a data quando um filtro de período está ativo.

## Instalação de uma base nova
1. Configure `backend/.env` usando `.env.example`, incluindo DATABASE_URL e DIRECT_URL.
2. Configure Supabase Auth e as credenciais de busca Google ou Brave.
3. Execute `npm install`, `npx prisma generate`, `npx prisma migrate deploy` e `npx tsx prisma/seed.ts` na pasta backend.
4. Rode `npm run typecheck` e `npm test`.
5. Configure credenciais AWS e execute o deploy do Serverless.
6. Configure `mobile/.env` e execute `npm install` e `npx expo start`.

**Base existente:** NÃO execute a migration inicial sobre tabelas existentes. Faça backup e compare o schema atual com `backend/prisma/UPGRADE_EXISTING_DB.sql`. O histórico Prisma deverá ser reconciliado antes de usar `migrate deploy`.

## Status de entrega
Código-fonte disponibilizado, mas **não validado em ambiente real de produção**. As dependências não puderam ser instaladas no ambiente de geração, logo typecheck, testes integrados, migrações e deploy precisam ser executados antes de lançamento. Também são necessárias auditoria de segurança, rate limiting, verificação de recebimento de push, gestão de custos e conformidade com os termos das fontes consultadas.
