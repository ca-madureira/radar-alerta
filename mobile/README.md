# Radar de Alertas — Mobile (React Native + Expo)
App mobile integrado ao backend na pasta `../backend`.

## Executar
1. `npm install`
2. Copie `.env.example` para `.env` e configure Supabase e URL pública/acessível da API.
3. `npx expo start` ou `npm run web` para pré-visualização no StackBlitz.
4. No Supabase Auth, configure as políticas de confirmação de e-mail conforme sua necessidade.

## Telas
- Login e cadastro (Supabase Auth)
- Dashboard com plano e impacto
- Listagem, pausa, ativação e exclusão de monitoramentos
- Cadastro com URLs e termos inclusivos/exclusivos
- Notificações, abertura da URL original e feedback
- Perfil e registro de token Expo Push

## Atenção
- Web no StackBlitz é prévia da interface; notificações push nativas precisam de dispositivo e build configurada.
- `localhost` no telefone não aponta para o computador: use uma URL acessível pela rede ou deploy da API.
- O backend atual monitora URLs informadas pelo usuário; descoberta automática na web e gatilhos cruzados ainda não foram implementados.
