# Peludinhos — React + Express + PostgreSQL

O frontend usa React, React Router, Vite e Tailwind CSS. A API continua em Node.js/Express e os dados de usuários ficam no PostgreSQL.

## Configurar em outro computador

Requisitos: Node.js 24 ou superior e PostgreSQL 17 ou superior.

1. Clone o repositório ou atualize a branch com `git pull`.
2. Na pasta do projeto, execute `npm ci`.
3. Copie `.env.example` para `.env`. Preencha `DB_PASSWORD` com a senha do PostgreSQL desse computador e ajuste host, porta e usuário se necessário.
4. Gere um segredo com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` e coloque o resultado em `JWT_SECRET` no `.env`.
5. Crie um banco vazio chamado `peludinhos` no PostgreSQL. Execute `database/banco_peludinhos.sql` nele pelo Query Tool do pgAdmin, uma única vez. Se o banco já foi configurado, não execute o script novamente.
6. Execute `npm start`: ele compila o React e inicia o Express. Abra http://localhost:3001 (ou a porta definida em `PORT`).
7. Clique em **Criar conta** e depois faça login.

O `.env` e as fotos enviadas não são versionados. Cada computador usa suas credenciais e seu banco. Nunca coloque senhas em variáveis `VITE_`, pois elas são públicas no frontend.

## Desenvolver com atualização automática

Abra dois terminais na pasta do projeto:

```sh
# Terminal 1: API e PostgreSQL
npm run dev:api
```

```sh
# Terminal 2: frontend React
npm run dev
```

Acesse http://127.0.0.1:5173. O Vite encaminha `/api` e `/uploads` para o Express na porta configurada no `.env`. O CSS é recompilado automaticamente pelo Vite.

Para gerar os arquivos finais: `npm run build`. Para servir a versão compilada: `npm start`.

## Estrutura

- `src/pages`: telas em componentes React/JSX.
- `src/components`: menu compartilhado e mapa Leaflet com limpeza ao sair da tela.
- `src/App.jsx`: rotas, compatibilidade com URLs antigas e proteção das telas.
- `src/api.js`: chamadas à API e tratamento de sessão expirada.
- `src/styles.css`: Tailwind e estilos do frontend.
- `public/assets`: imagens e ícones públicos.
- `server`: API Express e conexão com PostgreSQL.
- `database`: script SQL.
- `dist`: build gerado, ignorado pelo Git.

Os HTMLs, CSS e scripts antigos foram mantidos na pasta `legacy` apenas como referência visual. Eles não são servidos pela aplicação. O único HTML de entrada é `index.html`, que carrega o React; não o abra diretamente no navegador.

Cadastro, login, edição do perfil, alteração de senha e foto de perfil usam a API. Animais, perdidos e avistamentos continuam sendo telas de demonstração, sem persistência implementada; a migração de framework não adiciona endpoints para essas funcionalidades. A foto pode ser enviada pelo perfil depois do cadastro.
