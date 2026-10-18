# Backend AWS de desenvolvimento

- Conta: `433269483632` (projeto radar-alerta).
- Região: Ohio, `us-east-2`, atribuída pela experiência de projetos AWS.
- Stack: `alertas-monitoramento-dev`.
- API: `https://s2bndbrq81.execute-api.us-east-2.amazonaws.com`.
- Perfil local: `radar-alertas`.
- Supabase: migrations aplicadas e quatro planos iniciais cadastrados.

O arquivo local `mobile/.env` aponta para essa API. Reinicie o Expo após alterar variáveis de ambiente. Os arquivos `.env` não devem ser versionados.

## Validação realizada

- TypeScript e testes do backend passaram; a revisão atual inclui integração de monitoramento e coleta em três fontes oficiais (veja TESTE_POS_GRADUACAO.md).
- `GET /health`: HTTP 200, `{"ok":true}`.
- `GET /monitors` sem token: HTTP 401.
- Invocação manual da Lambda `cron`: `{"monitors":0,"checked":0,"found":0}`, sem erro de função.
- Invocação manual da Lambda `search`: `{"checked":0,"found":0}`, sem erro de função.
- As duas regras EventBridge estão habilitadas, com intervalos de 15 minutos e uma hora.
- Escrita e leitura de um registro temporário no banco passaram; rollback confirmado sem manter o registro.

Os jobs foram validados com banco sem monitoramentos. Isso não comprova detecção de mudanças nem entrega push em dispositivo real.

## Publicação

Gere o Prisma Client antes de publicar. O schema inclui o engine Linux para o runtime Node.js 22 da Lambda; o build inclui suporte a dependências CommonJS no bundle ESM.

```powershell
aws login --profile radar-alertas --region us-east-2
cd backend
npm.cmd run db:generate
npm.cmd run db:deploy
npm.cmd run typecheck
npm.cmd test
```

Se o SDK do Serverless não reconhecer a sessão da AWS CLI, carregue as credenciais temporárias somente no processo atual, sem imprimi-las:

```powershell
$deployCredentials = aws configure export-credentials --profile radar-alertas --format process | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Falha ao carregar sessao AWS' }
$env:AWS_ACCESS_KEY_ID = $deployCredentials.AccessKeyId
$env:AWS_SECRET_ACCESS_KEY = $deployCredentials.SecretAccessKey
$env:AWS_SESSION_TOKEN = $deployCredentials.SessionToken
$env:AWS_REGION = 'us-east-2'
npx.cmd serverless deploy --stage dev --region us-east-2
```

Neste computador o Serverless encontrou `EPERM` na pasta `.serverless` dentro do OneDrive. O deploy foi executado a partir de uma cópia em `%LOCALAPPDATA%/radar-alertas-deploy`. Para novos deploys, sincronize o código e as configurações dessa cópia antes de publicar.

## Limitações do ambiente

- A quota inicial da conta é de 10 execuções simultâneas. A reserva por job fica desativada por padrão; após aumentar a quota, configure `JOB_RESERVED_CONCURRENCY=1` no processo de deploy para restabelecer a reserva. Sem reserva, não há garantia de uma única execução simultânea de cada job.
- Monitoramento: a cada 15 minutos. Busca: a cada hora. Cada monitor também respeita o intervalo do seu plano.
- Busca web requer credenciais de um provedor, ainda não configuradas.
- Push requer registro de dispositivo e projeto Expo/EAS; envio real ainda precisa ser validado.
- RLS das tabelas do Supabase aplicada e verificada; a rotação das credenciais expostas continua pendente antes de produção.
- A publicação na AWS não publica o aplicativo nas lojas nem cria um repositório GitHub.
