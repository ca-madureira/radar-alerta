# Busca na web (versão experimental)

A busca usa API oficial Google Programmable Search JSON API ou Brave Search API, não faz scraping do Google. O usuário fornece palavras/frases e escolhe busca ampla. A Lambda `search` consulta resultados novos a cada hora e confere o texto da página antes de notificar. A primeira busca apenas cria o baseline; páginas novas nas próximas consultas podem gerar alertas.

## Configuração
- Para novos projetos, prefira Brave. A API Google Custom Search está fechada a novos clientes e será encerrada em 01/01/2027: https://developers.google.com/custom-search/v1/overview.
- Sem credenciais, o cadastro de busca web é bloqueado. URLs fixas e catálogo continuam funcionando sem chave de busca.
- `SEARCH_PROVIDER=google` e `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`, ou `SEARCH_PROVIDER=brave` e `BRAVE_SEARCH_API_KEY`.
- Aplique as migrations versionadas com `npm run db:deploy`, configure Supabase e publique as Lambdas.
- APIs têm cotas, preços e limitações de cobertura; operadores como `site:` e `filetype:` dependem do provedor.

## Limitações conhecidas
- Não é indexador universal. Não há cobertura garantida, PDF nem páginas que exigem JavaScript/autenticação.
- Sem deduplicação global de consultas, cobrança de uso de API por plano ou alertas cruzados.
- Requer homologação, testes de compilação e reforço de segurança antes da produção.
