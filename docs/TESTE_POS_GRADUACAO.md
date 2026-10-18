# Teste de monitoramento — pós-graduação EaD

Verificação em **18/10/2026**, horário de Brasília. O rótulo “Aberto(a)” da página de um processo não substitui o cronograma de inscrições.

| Fonte oficial | Situação | Uso no Radar |
| --- | --- | --- |
| [IF Sudeste MG — Full Stack, Edital 23/2026](https://www.ifsudestemg.edu.br/editais/reitoria/processo-seletivo/2027.1/pos-graduacao/lato-sensu/edital-no-20-2025-pos-graduacao-lato-sensu-em-desenvolvimento-full-stack/) | 25 vagas, 100% EaD, sem mensalidade. Inscrições até 29/09/2026 na 4ª retificação, já encerradas. Há taxa de seleção e regras de isenção. | Acompanhar retificações, sem anunciar inscrições abertas agora. |
| [IFSULDEMINAS — Campus Passos](https://portal.pas.ifsuldeminas.edu.br/) | Oferta Desenvolvimento Web EaD. O [Edital 123/2026](https://portal.ifsuldeminas.edu.br/index.php/pos-graduacao-ead2/pos-graduacao-encerrados-ead/7472-edital-123-2026-2-semestre-de-2026-processo-seletivo-para-ingresso-em-cursos-de-pos-graduacao-cursos-na-modalidade-a-distancia-ead) está encerrado e previa taxa de inscrição. | Acompanhar novos anúncios. A página geral da reitoria apresentou CAPTCHA e foi substituída pelo portal do campus. |
| [UFGD — Tecnologias de Sistemas de Informação](https://portal.ufgd.edu.br/noticias/ufgd-abre-inscricoes-para-300-vagas-em-duas-especializacoes-gratuitas-a-distancia) | Inscrições até 26/10/2026, sem taxa ou mensalidade. Área afim de tecnologia; pode haver encontros nos polos do MS. | Conferir edital e disponibilidade para polos. Não é um curso especificamente de desenvolvimento web nem garantia de ser 100% remoto. |

As três fontes tiveram coleta real e baseline persistido. URLs e nomes estão em `backend/scripts/postgraduate-sources.json`. Os exemplos também preenchem o formulário do aplicativo.

## Usar

1. Cadastre a conta no app e confirme o e-mail quando exigido.
2. No backend, execute `npm run examples:postgraduate -- seu-email@example.com`.
3. Entre no aplicativo e confira os três monitoramentos.
4. A primeira coleta não envia alertas antigos. O plano gratuito verifica cada monitor a cada 12h; o cron global de 15min não muda esse limite.
5. Para inscrições já abertas, consulte a fonte. O monitor acompanha mudanças futuras e não interpreta requisitos ou prazos automaticamente.

O script é idempotente por nome/URL, respeita o plano e não altera uma assinatura para criar os exemplos.

## Teste controlado

```sh
cd backend
npm run test:integration
```

Usa o Supabase configurado, um usuário lógico e um plano aleatórios; não cria conta Auth nem envia e-mail/push. Após executar, remove somente os registros dessa execução.

- Baseline sem alerta antigo.
- Novo edital fictício repetindo “desenvolvimento web”.
- Detecção e notificação `PENDING` persistidas.
- Deduplicação e cooldown.
- Erro de coleta e recuperação.
- Monitor pausado ignorado.
- Busca com baseline, falha de coleta, retentativa e deduplicação.

Testes unitários também cobrem blocos HTML, CAPTCHA, disponibilidade do provedor e tickets Expo. A busca controlada usa resultados simulados; o provedor externo real continua sem chave.

## Push e chaves

O histórico do app independe do push. Para receber no sistema operacional, configure `EXPO_PUBLIC_EAS_PROJECT_ID`, credenciais de push Expo/EAS e um development build em celular físico. Use **Minha conta → Ativar notificações push**. O recebimento no celular ainda precisa ser homologado; tickets aceitos não são recibos finais.

URLs não precisam de Google/Brave. Para busca ampla, configure `SEARCH_PROVIDER=brave` e `BRAVE_SEARCH_API_KEY` somente no backend. A [Google Custom Search API está fechada para novos clientes e será encerrada em 01/01/2027](https://developers.google.com/custom-search/v1/overview).

Senhas, conexões e credenciais de teste ficam em `.env*`, ignorados pelo Git e excluídos do pacote Lambda.
