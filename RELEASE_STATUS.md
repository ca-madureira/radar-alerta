# Status — 18/10/2026

Backend dev publicado na AWS e conectado ao Supabase. Preparado para testes de uso; ainda não homologado como produto de produção.

## Verificado

- Migração inicial aplicada e quatro planos cadastrados.
- RLS nas 13 tabelas públicas. Chave pública sem leitura dos dados protegidos e sem permissão de inserir planos.
- API Gateway, 15 Lambdas, health público e rotas de dados autenticadas.
- Cron de monitoramento a cada 15min e busca a cada hora, respeitando os intervalos de cada plano.
- Prisma Linux e compatibilidade CommonJS/ESM no pacote.
- Comparação por blocos para detectar editais que repetem termos existentes.
- Coleta com DNS IPv4 público fixado por requisição, TLS, validação de redirects, timeout, limite de leitura e detecção de CAPTCHA.
- Busca bloqueada sem credenciais; busca web e URLs fixas exigem monitores separados.
- Retentativa de coleta de resultados de busca; onlyNew respeitado.
- Catálogo oficial, exemplos de pós-graduação e testes de integração isolados, com limpeza.
- TypeScript no backend/app e exportação web Expo.

## Pendente para produção

- Rotacionar senha do banco e invalidar a service role anteriormente expostas fora do repositório; atualizar configurações locais e Lambda.
- Homologar confirmação de e-mail, SMTP, recuperação de senha e deep links.
- Configurar Expo/EAS e receber push em celular real. SENT significa tickets aceitos pelo Expo, não recebimento comprovado. Recibos finais e tratamento completo de tokens inválidos não estão implementados.
- Chave Brave para busca ampla. Google Custom Search está fechado para novos clientes.
- Filas/DLQ, retries, rate limiting, observabilidade, quotas por domínio e teste de carga.
- Quota Lambda inicial de 10: sem reserva por job até aumentar a quota. Evitar duplicação de push entre jobs concorrentes e em envios parcialmente aceitos; não há entrega exatamente uma vez.
- Homologar concorrência nos limites de planos e dimensionar os lotes para o tempo máximo da Lambda.
- GitHub environments/secrets e role OIDC para deploy pelo workflow.

## Limites funcionais

Sem PDF, JavaScript dinâmico, CAPTCHA, login, RSS, regras cruzadas, pagamentos automáticos ou alertas por WhatsApp/e-mail. A correspondência é textual por página e não garante gratuidade, inscrições abertas ou elegibilidade geográfica. Alterações durante cooldown são suprimidas e incorporadas ao estado da fonte.

Veja [docs/TESTE_POS_GRADUACAO.md](docs/TESTE_POS_GRADUACAO.md).
