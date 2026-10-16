# Peludinhos

Requisitos: Node.js 24 ou superior e PostgreSQL 17 ou superior.

## Configurar em outro computador

1. Clone o repositório ou atualize a branch `main` com `git pull origin main`.
2. Na pasta do projeto, execute `npm ci`.
3. Copie `.env.example` para `.env` e preencha `DB_PASSWORD` com a senha do PostgreSQL desse computador. Ajuste usuário, host e porta se necessário.
4. Gere um segredo com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` e coloque o resultado em `JWT_SECRET` no `.env`.
5. Crie um banco vazio chamado `peludinhos` no PostgreSQL. Execute `database/banco_peludinhos.sql` nele pelo Query Tool do pgAdmin. Execute o script uma única vez; ele cria as tabelas.
6. Execute `npm start` e abra http://localhost:3001 (ou a porta escolhida em `PORT`).
7. Clique em **Criar conta** para cadastrar seu usuário e depois faça login.

Pelo terminal com as ferramentas PostgreSQL no PATH, o passo 5 também pode ser feito com:

```sh
createdb -h localhost -U postgres peludinhos
psql -h localhost -U postgres -d peludinhos -v ON_ERROR_STOP=1 --single-transaction -f database/banco_peludinhos.sql
```

O `.env` e as fotos enviadas não são versionados. Cada computador usa seu próprio banco e suas próprias credenciais. Não abra o HTML diretamente; acesse pelo servidor iniciado com `npm start`.

Cadastro, login e perfil estão conectados ao PostgreSQL. As telas de animais, perdidos e avistamentos ainda exibem exemplos e não têm persistência implementada.

Para recompilar o CSS durante alterações: `npm run dev:css`.
