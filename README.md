# radar-alerta

Aplicativo Expo/React Native para acompanhar alterações em páginas públicas. Backend AWS Lambda/API Gateway/EventBridge, Supabase Auth e PostgreSQL/Prisma.

**Ambiente de desenvolvimento publicado e testado. Ainda não homologado para produção.** Consulte [RELEASE_STATUS.md](RELEASE_STATUS.md), [AWS dev](docs/AWS_DEV.md) e [o roteiro de pós-graduação](docs/TESTE_POS_GRADUACAO.md).

## Configurar

Requer Node.js 22 e npm. No Windows, use npm.cmd/npx.cmd se o PowerShell bloquear scripts .ps1.

```sh
cd backend
npm ci
# Copie .env.example para .env e preencha os valores locais.
npm run db:generate
npm run db:deploy
npm run db:seed
npm run check
npm run dev
```

O backend usa DATABASE_URL (pooler transaction), DIRECT_URL (migrations), SUPABASE_URL e SUPABASE_ANON_KEY (aceita publishable key). Não precisa de service role ou JWT secret. As migrations RLS bloqueiam o acesso direto às tabelas pela API pública Supabase; o app usa a Lambda autenticada.

```sh
cd mobile
npm ci
# Copie .env.example para .env e configure Supabase e API.
npm run typecheck
npm run web
```

Configure EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY e EXPO_PUBLIC_API_URL. Para push nativo, configure EXPO_PUBLIC_EAS_PROJECT_ID, credenciais do projeto Expo e um development build em celular físico. localhost no celular se refere ao próprio celular.

Configure no Supabase Auth os redirecionamentos de cadastro/recuperação para radaralertas://auth/callback e para a URL web publicada. Confirmação de e-mail, SMTP e deep links precisam ser validados nas plataformas finais.

## Monitoramento

- A primeira coleta estabelece uma referência e, com onlyNew=true, não alerta sobre conteúdo antigo.
- As coletas seguintes comparam blocos de texto. Um edital novo pode repetir o nome do curso que já existia na página.
- ANY/ALL e exclusões são aplicados à página. A correspondência textual não interpreta automaticamente prazos, gratuidade ou requisitos.
- Há deduplicação por monitor/fingerprint e cooldown por monitor.
- Cron global a cada 15min. Cada monitor respeita seu plano: gratuito 12h, básico 6h, pro 1h, premium 15min.
- URLs fixas não precisam de chave de busca. Busca web requer provedor configurado; interface e API bloqueiam esse modo sem credenciais.
- PDFs, JavaScript dinâmico, CAPTCHA e login não são suportados. Falhas ficam registradas; CAPTCHA não vira baseline válido.

## Testes e exemplos

```sh
cd backend
npm run check
# Usa o banco de desenvolvimento; limpa somente os registros do teste.
npm run test:integration
# Requer conta existente no Supabase Auth.
npm run examples:postgraduate -- seu-email@example.com
```

A integração verifica baseline, termos repetidos em novo edital, persistência, deduplicação, cooldown, falha/recuperação, pausa e retentativa da busca. Não envia push. Os exemplos consultam fontes oficiais e respeitam os limites do plano.

## Busca web

Para novos projetos, use SEARCH_PROVIDER=brave e BRAVE_SEARCH_API_KEY. Google exige GOOGLE_SEARCH_API_KEY e GOOGLE_SEARCH_ENGINE_ID, mas a [Custom Search JSON API está fechada para novos clientes e será encerrada em 01/01/2027](https://developers.google.com/custom-search/v1/overview). Não é preciso contratar busca para acompanhar URLs cadastradas.

## AWS e GitHub

O projeto AWS atual usa Ohio (us-east-2). O workflow de deploy é manual. Configure environments dev/prod, role OIDC e secrets AWS_DEPLOY_ROLE_ARN, DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_ANON_KEY e SERVERLESS_ACCESS_KEY, se exigido. Credenciais de busca são opcionais. Chaves e senhas ficam em .env locais ou secrets, nunca no Git.

Pagamentos automáticos, recibos finais de push, filas/DLQ, testes de carga e homologação em dispositivos reais continuam pendentes. O histórico de alertas é independente da entrega push.
