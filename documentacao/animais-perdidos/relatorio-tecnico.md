# Módulo Animais Perdidos — Relatório técnico

Projeto **Peludinhos** · disciplina de Sistemas Distribuídos · branch `feature/animais-perdidos`

> Documento gerado a partir da leitura direta do código do projeto. As referências usam caminhos relativos a esta pasta e, quando útil, o número da linha (`#L42`). Os números de linha refletem o código no momento em que este relatório foi escrito.

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Arquitetura e tecnologias](#2-arquitetura-e-tecnologias)
3. [Inventário dos arquivos](#3-inventário-dos-arquivos)
4. [Arquivos e funções mais importantes](#4-arquivos-e-funções-mais-importantes)
5. [Banco de dados](#5-banco-de-dados)
6. [API REST](#6-api-rest)
7. [Fluxos completos](#7-fluxos-completos)
8. [Autenticação, autorização e segurança](#8-autenticação-autorização-e-segurança)
9. [Relação com Sistemas Distribuídos](#9-relação-com-sistemas-distribuídos)
10. [Testes e validação](#10-testes-e-validação)
11. [Evolução do desenvolvimento](#11-evolução-do-desenvolvimento)
12. [Limitações e melhorias futuras](#12-limitações-e-melhorias-futuras)

---

## 1. Visão geral

### Objetivo
Permitir que tutores publiquem o desaparecimento dos **seus** animais de estimação e que outros usuários da plataforma vejam essas publicações e entrem em contato com o tutor quando tiverem pistas.

### Problemas que resolve
- Centraliza, num só lugar da plataforma, os anúncios de animais desaparecidos (antes a tela `/perdidos` só tinha dois exemplos fixos no código).
- Dá um canal de contato direto (telefone e WhatsApp) entre quem viu o animal e o tutor.
- Permite que o tutor mantenha o anúncio atualizado: editar dados, trocar a foto, marcar como encontrado e excluir.

### Funcionalidades implementadas
| Funcionalidade | Onde |
|---|---|
| Listagem das publicações reais, com busca e filtro por status | `/perdidos` |
| Cadastro com foto opcional | `/perdidos/novo` |
| Detalhes, com contato do tutor (telefone e WhatsApp) | `/perdidos/:id` |
| Edição dos dados e da foto (manter, substituir ou remover) | `/perdidos/:id/editar` |
| Alteração de status PERDIDO ↔ ENCONTRADO, com confirmação | detalhes (autor) |
| Exclusão definitiva, com confirmação | detalhes (autor) |
| Compartilhamento do link da publicação | botão em cada card |
| Fotos privadas, entregues somente a usuários autenticados | `GET /api/perdidos/:id/foto` |

### Integração com o restante do Peludinhos
- Usa o **mesmo login** (JWT) e o mesmo cliente HTTP (`src/api.js`) das outras telas.
- Usa o mesmo **servidor Express** e o mesmo **banco PostgreSQL**; as rotas foram montadas em `/api/perdidos`.
- O telefone exibido vem do **perfil do usuário** (tabela `usuario`); ele não é copiado para a publicação.
- Aparece no menu inferior existente (item "Perdidos", em [`Navigation.jsx`](../../src/components/Navigation.jsx#L4), que não foi alterado).

### Animais Perdidos × Avistamentos
| | Animais Perdidos | Avistamentos |
|---|---|---|
| Quem publica | O **tutor** do animal | Qualquer pessoa que **viu** um animal na rua |
| Tabela | `publica_perda` (sem relação com `animal`) | `animal` + `avistamento` |
| Localização | Texto livre (`local_desaparecimento`) | Coordenadas (latitude/longitude), exibidas no mapa |
| Foto | Pasta **privada** `server/uploads-perdidos/`, servida só com JWT | Pasta pública `server/uploads/` |
| Status | `PERDIDO` / `ENCONTRADO` | — |
| Edição/exclusão | Sim, pelo autor | Não implementadas |

### Quem pode acessar
- **Somente usuários autenticados** (com token JWT válido) veem a lista, os detalhes e as fotos e podem publicar.
- Para **publicar**, o usuário precisa ter **telefone cadastrado** no perfil.

### Operações exclusivas do autor
Editar, alterar o status e excluir. O backend confere, em cada requisição, se `publica_perda.id_usuario_tutor` é igual ao `id_usuario` do token.

---

## 2. Arquitetura e tecnologias

### Diagrama

```
┌──────────────────────────── Máquina do usuário ────────────────────────────┐
│ Navegador                                                                   │
│  ├─ Aplicação React (SPA) — páginas, componentes, React Router              │
│  ├─ localStorage: token JWT                                                 │
│  └─ fetch() ──── HTTP + JSON / multipart ───────────────┐                   │
└──────────────────────────────────────────────────────────┼──────────────────┘
                                                           ▼
┌──────────────────────────── Servidor (processo Node.js) ───────────────────┐
│ Express (server/server.js)                                                  │
│  ├─ express.static(dist)  → entrega os arquivos do React compilado          │
│  ├─ /api/perdidos → perdaRoutes.js                                          │
│  │     autenticarToken (JWT) → multer (upload em memória) → perdaController │
│  │                                                                          │
│  ├─ pg Pool ─── TCP (protocolo do PostgreSQL) ──► PostgreSQL (outro processo)│
│  │                                                  tabela publica_perda     │
│  │                                                  tabela usuario           │
│  └─ fs (sistema de arquivos) ──► server/uploads-perdidos/  (fotos privadas)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

Em desenvolvimento (`npm run dev` + `npm run dev:api`), o Vite serve o React em `127.0.0.1:5173` e repassa (`proxy`) as chamadas `/api` e `/uploads` para o Express ([`vite.config.mjs`](../../vite.config.mjs)).

### Tecnologias: onde, por quê e como

| Tecnologia | Onde é usada no módulo | Por que é necessária | Como participa |
|---|---|---|---|
| **React 19** | Todas as telas (`src/pages/*Perdid*.jsx`) e componentes (`src/components/`) | Monta a interface a partir do estado (dados da API, formulário, diálogos) | Componentes com `useState`, `useEffect`, `useMemo`, `useRef`; a tela é redesenhada quando o estado muda |
| **React Router 7** | [`App.jsx`](../../src/App.jsx#L34-L41), `Link`, `useNavigate`, `useParams`, `useLocation` | Navegação entre telas sem recarregar a página (SPA) e leitura do `:id` da URL | Rotas `/perdidos`, `/perdidos/novo`, `/perdidos/:id`, `/perdidos/:id/editar` dentro de `<Protected>`; `navigate()` após salvar/excluir; `state` para avisos e para o retorno após o login |
| **JavaScript** | Frontend e backend | Linguagem única nas duas pontas | ES modules no frontend (Vite); CommonJS no backend (`require`) |
| **Node.js** | Processo do servidor | Executa o Express e acessa disco e banco | E/S assíncrona (event loop): enquanto espera o banco ou o disco, atende outras requisições |
| **Express 5** | [`server.js`](../../server/server.js), [`perdaRoutes.js`](../../server/routes/perdaRoutes.js) | Recebe as requisições HTTP e as encaminha às funções certas | Middlewares em cadeia: `express.json()` → `autenticarToken` → `multer` → função do controller |
| **PostgreSQL** | Tabelas `publica_perda` e `usuario` | Persistência durável e transações | Consultas via biblioteca `pg` com parâmetros `$1, $2…`; `BEGIN/COMMIT/ROLLBACK`; `SELECT … FOR UPDATE` |
| **JWT** (`jsonwebtoken`) | [`authMiddleware.js`](../../server/middleware/authMiddleware.js), [`api.js`](../../src/api.js#L7) | Identificar o usuário em cada requisição sem guardar sessão no servidor | O login gera o token; o frontend o envia no cabeçalho `Authorization: Bearer …`; o backend o valida com `jwt.verify` |
| **Multer** | [`perdaRoutes.js:6-14`](../../server/routes/perdaRoutes.js#L6-L14) | Ler requisições `multipart/form-data` (campos + arquivo) | Guarda a foto **em memória** (`memoryStorage`) com limite de 5 MB e 1 arquivo; o controller valida os bytes antes de gravar no disco |
| **Fetch API** | [`api.js`](../../src/api.js) (`api` e `apiBlob`) | Fazer as requisições HTTP do navegador | `api()` devolve JSON; `apiBlob()` devolve a foto como `Blob` |
| **Vite 8** | `npm run dev`, `npm run build` | Servidor de desenvolvimento e compilação do React para `dist/` | Em dev, faz proxy de `/api` para o Express; em produção, o Express serve o `dist/` |
| **Tailwind CSS 4** | Classes nos componentes (`bg-brand-teal`, `rounded-xl`…) | Manter a identidade visual existente sem CSS novo | Usa as cores do tema definidas em [`styles.css`](../../src/styles.css#L3-L14); nenhum estilo global foi alterado pelo módulo |

---

## 3. Inventário dos arquivos

Legenda: **C** = criado · **R** = renomeado · **M** = modificado.

### Frontend

| Arquivo | | Responsabilidade | Principais funções/componentes | Usa | Usado por |
|---|---|---|---|---|---|
| [`src/pages/AnimaisPerdidos.jsx`](../../src/pages/AnimaisPerdidos.jsx) | R + M (era `Lost.jsx`) | Tela `/perdidos`: lista, busca, filtro, compartilhamento, botão "Divulgar Fuga" | `AnimaisPerdidos`, `share`, `clearAll` | `useAnimaisPerdidos`, `PerdidoCard`, `buscaPerdidos.js`, `Navigation` | Rota `/perdidos` |
| [`src/pages/DetalhesPerdido.jsx`](../../src/pages/DetalhesPerdido.jsx) | C | Tela `/perdidos/:id`: dados completos, contato, seção do autor | `DetalhesPerdido`, `localPhone`, `formatPhone`, `whatsappLink`, `Info` | `api`, `FotoPerdido`, `GerenciarPerdido`, `PerdidoCard` (helpers), `PerdidoForm` (`friendlyError`), `PageHeader` | Rota `/perdidos/:id` |
| [`src/pages/NovoPerdido.jsx`](../../src/pages/NovoPerdido.jsx) | C | Formulário de cadastro, aviso de telefone, envio multipart | `NovoPerdido` (`submit`, `choosePhoto`, `update`) | `PerdidoForm` (campos e funções), `api`, `PageHeader` | Rota `/perdidos/novo` |
| [`src/pages/EditarPerdido.jsx`](../../src/pages/EditarPerdido.jsx) | C | Edição: carrega a publicação, confere o autor, envia PUT | `EditarPerdido`, `EditForm`, `saveEdit`, `accessStatus`, `loadErrorStatus`, `Message` | `PerdidoForm`, `FotoPerdido`, `api` | Rota `/perdidos/:id/editar` |
| [`src/components/PerdidoCard.jsx`](../../src/components/PerdidoCard.jsx) | C | Card da lista; também exporta formatações usadas em outras telas | `PerdidoCard`, `perdidoName`, `perdidoDate`, `perdidoSince` | `FotoPerdido`, `Link` | `AnimaisPerdidos`, `DetalhesPerdido`, `buscaPerdidos.js` |
| [`src/components/PerdidoForm.jsx`](../../src/components/PerdidoForm.jsx) | C | Campos e regras compartilhados por cadastro e edição | `PerdidoFields` (padrão), `validatePerdido`, `perdidoFormData`, `perdidoToForm`, `photoFileError`, `usePhotoPreview`, `friendlyError`, `todayLocal`, `emptyPerdido` | React | `NovoPerdido`, `EditarPerdido`, `DetalhesPerdido`, `GerenciarPerdido`, `useAnimaisPerdidos` |
| [`src/components/FotoPerdido.jsx`](../../src/components/FotoPerdido.jsx) | C | Exibe a foto privada buscando-a com o token | `FotoPerdido` | `apiBlob` | `PerdidoCard`, `DetalhesPerdido`, `EditarPerdido` |
| [`src/components/GerenciarPerdido.jsx`](../../src/components/GerenciarPerdido.jsx) | C | Seção do autor: editar, alterar status, excluir | `GerenciarPerdido`, `nextStatus`, `updateStatus`, `deletePerdido`, `singleFlight`, `actionError`, `executeAction` | `ConfirmDialog`, `api`, `friendlyError` | `DetalhesPerdido` |
| [`src/components/ConfirmDialog.jsx`](../../src/components/ConfirmDialog.jsx) | C | Diálogo de confirmação acessível (`<dialog>` nativo) | `ConfirmDialog` | React | `GerenciarPerdido` |
| [`src/components/buscaPerdidos.js`](../../src/components/buscaPerdidos.js) | C | Busca, filtro, estados vazios e compartilhamento (funções puras) | `normalizeSearch`, `filterPerdidos`, `emptyState`, `sharePerdido`, `statusFilters` | `perdidoName` | `AnimaisPerdidos` |
| [`src/hooks/useAnimaisPerdidos.js`](../../src/hooks/useAnimaisPerdidos.js) | C | Carrega e recarrega a lista | `useAnimaisPerdidos` → `{ perdidos, loading, error, reload }` | `api`, `friendlyError` | `AnimaisPerdidos` |

### Backend

| Arquivo | | Responsabilidade | Principais funções | Usa |
|---|---|---|---|---|
| [`server/controllers/perdaController.js`](../../server/controllers/perdaController.js) | C | Regras de negócio, validação, SQL, transações e arquivos de foto | `listar`, `buscar`, `criar`, `editar`, `alterarStatus`, `excluir`, `foto`; auxiliares `validate`, `validId`, `imageExtension`, `deletePhoto`, `today` | `pg` (via `config/database.js`), `fs`, `path`, `crypto.randomUUID` |
| [`server/routes/perdaRoutes.js`](../../server/routes/perdaRoutes.js) | C | Liga URL + método HTTP à função do controller; aplica autenticação e upload | `receivePhoto`; 7 rotas | `express.Router`, `multer`, `authMiddleware`, `perdaController` |
| [`server/server.js`](../../server/server.js#L16) | M (1 linha) | Monta `/api/perdidos` antes do 404 da API | `app.use('/api/perdidos', …)` | `perdaRoutes` |
| [`server/middleware/authMiddleware.js`](../../server/middleware/authMiddleware.js) | já existia, **não alterado** | Valida o JWT e preenche `req.usuario` | `autenticarToken` | `jsonwebtoken` |
| [`server/config/database.js`](../../server/config/database.js) | já existia, **não alterado** | Cria o `Pool` de conexões do PostgreSQL a partir do `.env` | `Pool` | `pg`, `dotenv` |

### Integração e configuração

| Arquivo | | O que mudou para o módulo |
|---|---|---|
| [`src/api.js`](../../src/api.js) | M | O erro passou a carregar o código HTTP (`error.status`, linha 16); nova função `apiBlob` (linhas 21-30) para baixar arquivos protegidos |
| [`src/App.jsx`](../../src/App.jsx) | M | Importa as 4 telas; rotas de perdidos (linhas 36-38); `Protected` guarda a página pedida em `state.from` (linhas 16-19); a sessão expirada também leva `from` (linha 25) |
| [`src/pages/Auth.jsx`](../../src/pages/Auth.jsx#L15-L19) | M | `safeRedirect` e retorno à página original após o login (linha 40) |
| [`package.json`](../../package.json) | M | Script `test:perdidos` |
| [`.gitignore`](../../.gitignore) | M | `server/uploads-perdidos/` (fotos enviadas não vão para o Git) |

### Banco de dados e testes

| Item | | Observação |
|---|---|---|
| Tabela `publica_perda` ([`database/banco_peludinhos.sql:42-64`](../../database/banco_peludinhos.sql#L42-L64)) | já existia, **schema não alterado** | Usada como estava |
| [`tests/perdidos.test.cjs`](../../tests/perdidos.test.cjs) | C | 23 testes de integração do backend (`node:test`) |

### Outros arquivos relevantes
- [`src/components/Navigation.jsx`](../../src/components/Navigation.jsx#L4) — já tinha o item "Perdidos" → `/perdidos`; **não alterado**.
- [`src/components/PageHeader.jsx`](../../src/components/PageHeader.jsx) — cabeçalho com "voltar", reutilizado nos detalhes, cadastro e edição; **não alterado**.
- `server/uploads-perdidos/` — pasta criada em tempo de execução para as fotos privadas; ignorada pelo Git.
- [`README.md`](../../README.md#L51) — **não foi atualizado**: ainda diz "A tela de perdidos ainda é demonstrativa".
- `legacy/pages/perdidos.html` — versão HTML antiga, apenas referência visual; não é servida.

---

## 4. Arquivos e funções mais importantes

### Prioridade de estudo

| Prioridade | Arquivos |
|---|---|
| **Essencial** | `perdaController.js`, `perdaRoutes.js`, `authMiddleware.js`, `api.js`, `PerdidoForm.jsx`, `GerenciarPerdido.jsx`, `FotoPerdido.jsx` |
| **Importante** | `DetalhesPerdido.jsx`, `NovoPerdido.jsx`, `EditarPerdido.jsx`, `AnimaisPerdidos.jsx`, `App.jsx` + `Auth.jsx` (rotas e retorno ao login), tabela `publica_perda` |
| **Complementar** | `PerdidoCard.jsx`, `buscaPerdidos.js`, `useAnimaisPerdidos.js`, `ConfirmDialog.jsx`, `tests/perdidos.test.cjs`, `server.js` |

### 4.1 Rotas — `perdaRoutes.js`

```js
router.use(authenticate);                                   // L16: todas as rotas exigem JWT
router.get('/', controller.listar);                         // L17
router.get('/:id', controller.buscar);                      // L18
router.get('/:id/foto', controller.foto);                   // L19
router.post('/', receivePhoto, controller.criar);           // L20: multer antes do controller
router.put('/:id', receivePhoto, controller.editar);        // L21
router.patch('/:id/status', controller.alterarStatus);      // L22
router.delete('/:id', controller.excluir);                  // L23
```

- `router.use(authenticate)` aplica o middleware de JWT a **todas** as rotas do arquivo. Sem ele, qualquer pessoa sem login leria e alteraria publicações.
- `receivePhoto` (L7-14) chama o multer configurado com `memoryStorage`, `fileSize: 5 MB` e `files: 1`. Se o arquivo passar do limite, responde **413**; outros problemas de upload, **400**.

### 4.2 Middleware — `autenticarToken` ([`authMiddleware.js`](../../server/middleware/authMiddleware.js))

```js
const partes = authHeader.split(" ");                       // "Bearer <token>"
if (partes.length !== 2 || partes[0] !== "Bearer") { … 401 }
const dados = jwt.verify(token, process.env.JWT_SECRET);    // confere assinatura e expiração
req.usuario = dados;                                        // { id_usuario, tipo_usuario, iat, exp }
next();
```

- **Recebe** a requisição; **não retorna** dado: ou chama `next()` ou responde 401.
- `jwt.verify` falha se o token foi alterado (assinatura não confere) ou expirou (8 h, definidos no login em `authController.js`).
- `req.usuario.id_usuario` é a **única** fonte de identidade usada pelo controller. Sem este middleware, `req.usuario` não existiria e as verificações de autor seriam impossíveis.

### 4.3 Controller — validação ([`perdaController.js:42-64`](../../server/controllers/perdaController.js#L42-L64))

`validate(body)` recebe o corpo da requisição e **retorna** um objeto limpo com os 8 campos editáveis, ou **lança** um erro com a mensagem que vira resposta 400.

- Para cada campo texto: rejeita tipo diferente de string, rejeita o caractere nulo `\0` (o PostgreSQL não aceita), remove espaços das pontas, transforma vazio em `null` e aplica o limite de tamanho da coluna.
- `especie` precisa ser `Cachorro`, `Gato` ou `Outro`; `genero`, vazio, `Macho` ou `Fêmea`.
- `local_desaparecimento` e `data_desaparecimento` são obrigatórios; a data precisa existir de verdade (recusa `2026-02-30`), ser a partir de 1900 e não ser futura.
- Campos como `id_usuario_tutor`, `status_perda` e `data_publicacao` **não são lidos** — por isso o cliente não consegue alterá-los.

### 4.4 Controller — cadastro com transação ([`criar`, L97-146](../../server/controllers/perdaController.js#L97-L146))

```js
client = await pool.connect();
await client.query('BEGIN');
const tutor = await client.query('SELECT telefone FROM Usuario WHERE id_usuario = $1', [req.usuario.id_usuario]);
if (!tutor.rows[0].telefone?.trim()) { await client.query('ROLLBACK'); return res.status(400)… }
if (req.file) {
    photo = `perda-${randomUUID()}.${extension}`;           // nome gerado pelo servidor
    await fs.writeFile(savedFile, req.file.buffer, { flag: 'wx' });
}
const created = await client.query(`INSERT INTO Publica_Perda (…, status_perda, id_usuario_tutor)
    VALUES ($1,…,$9,'PERDIDO',$10) RETURNING id_perda`, [ …, req.usuario.id_usuario]);
await client.query('COMMIT'); committed = true;
…
} catch (error) {
    if (client && !committed) await client.query('ROLLBACK').catch(() => {});
    if (savedFile && !committed) await fs.unlink(savedFile).catch(() => {});   // remove a foto órfã
} finally { client?.release(); }
```

- **Parâmetros:** `req.body` (campos), `req.file` (foto do multer), `req.usuario` (do JWT).
- **Retorna:** 201 `{ mensagem, perdido }`.
- O tutor é **sempre** `req.usuario.id_usuario`; o status inicial é **sempre** `'PERDIDO'`.
- Se o `INSERT` falhar depois de a foto ter sido gravada, o `catch` desfaz a transação e apaga o arquivo. Sem esse bloco, sobrariam fotos sem publicação no disco.

### 4.5 Controller — verificação de autor ([`editar`, L169-181](../../server/controllers/perdaController.js#L169-L181))

```js
const current = await client.query(
  'SELECT id_usuario_tutor, foto FROM Publica_Perda WHERE id_perda = $1 FOR UPDATE', [req.params.id]);
if (!current.rowCount) { …ROLLBACK; return 404 }
if (String(current.rows[0].id_usuario_tutor) !== String(req.usuario.id_usuario)) { …ROLLBACK; return 403 }
```

- `FOR UPDATE` **trava a linha** até o fim da transação: duas edições simultâneas da mesma publicação acontecem uma depois da outra.
- `String(...)` compara os IDs como texto, porque o `pg` devolve `BIGINT` como string e o token pode trazer número ou string.
- O mesmo padrão aparece em `alterarStatus` (L216-224) e `excluir` (L246-254).
- Na edição, a foto antiga só é apagada **depois** do `COMMIT` (L197-198), para nunca existir um registro apontando para um arquivo apagado.

### 4.6 Controller — foto protegida ([`foto`, L268-288](../../server/controllers/perdaController.js#L268-L288))

```js
const result = await pool.query('SELECT foto FROM Publica_Perda WHERE id_perda = $1', [req.params.id]);
const match = photoName.exec(filename || '');               // /^perda-[0-9a-f-]{36}\.(jpg|png|webp)$/
if (!match) return res.status(404)…
res.set({ 'Content-Type': contentTypes[match[1]], 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' });
res.sendFile(filename, { root: uploads, dotfiles: 'deny', … });
```

- O nome do arquivo **vem do banco**, nunca da URL; e só é aceito se tiver o formato que o próprio servidor gera. Isso impede ler arquivos fora da pasta (ex.: `../../.env`).
- `root: uploads` restringe o envio à pasta `server/uploads-perdidos/`, que **não** é servida pelo `express.static`.
- `Cache-Control: private, no-store` evita que uma foto trocada continue aparecendo por cache.

### 4.7 Cliente HTTP — [`api.js`](../../src/api.js)

```js
export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api${path}`, { ...options, headers: {
      ...(options.body && !(options.body instanceof Blob) && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json();
  if (response.status === 401 && path !== '/login') { localStorage.removeItem('token'); window.dispatchEvent(new Event('session-expired')); }
  if (!response.ok) throw Object.assign(new Error(data.erro || '…'), { status: response.status });
  return data;
}
```

- **Recebe** o caminho (sem `/api`) e as opções do `fetch`; **retorna** o JSON da resposta ou **lança** um erro com `message` e `status`.
- Para `FormData`, **não** define `Content-Type`: o navegador gera o `multipart/form-data` com o *boundary* correto.
- 401 → apaga o token e dispara `session-expired`; o [`App.jsx`](../../src/App.jsx#L23-L28) escuta e leva ao login.
- `apiBlob` (L21-30) é a versão para arquivos: mesma autenticação, mas devolve `response.blob()`.

### 4.8 Foto no navegador — [`FotoPerdido.jsx`](../../src/components/FotoPerdido.jsx)

```js
useEffect(() => {
  setSrc('');
  if (!temFoto) return;
  const controller = new AbortController();
  let url;
  apiBlob(`/perdidos/${id}/foto`, { signal: controller.signal, cache: 'no-store' })
    .then(blob => { if (controller.signal.aborted || !blob.type.startsWith('image/')) return;
                    url = URL.createObjectURL(blob); setSrc(url); })
    .catch(() => {});
  return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
}, [id, temFoto]);
return <img src={src || placeholder} alt={src ? alt : ''} className={className} />;
```

- Uma tag `<img src="/api/...">` **não envia** o cabeçalho `Authorization`; por isso a foto é baixada com `fetch` (via `apiBlob`) e exibida por uma URL temporária `blob:`.
- A função de limpeza cancela o download pendente e libera a URL (`revokeObjectURL`), evitando vazamento de memória.
- Enquanto não há foto, mostra o logo do projeto com `alt=""` (decorativo).

### 4.9 Formulário — [`PerdidoForm.jsx`](../../src/components/PerdidoForm.jsx)

- `validatePerdido(data, today)` (L17-31) — espelha as regras do backend e devolve um objeto `{ campo: mensagem }`. O backend continua sendo a autoridade final.
- `perdidoFormData(data, { photo, removePhoto })` (L39-45) — monta o `FormData` com **os 8 campos** e, no máximo, **uma** das duas coisas: `foto` **ou** `remover_foto=true`.
- `perdidoToForm(item)` (L34-36) — converte a publicação da API para o formulário (null → `''`).
- `usePhotoPreview(photo)` (L53-61) — cria e libera a URL da prévia da foto escolhida.
- `friendlyError(err)` (L63-65) — se o erro tem código HTTP, mostra a mensagem do backend; se não (rede caiu, resposta não-JSON), mostra uma mensagem amigável.

### 4.10 Gerenciamento — [`GerenciarPerdido.jsx`](../../src/components/GerenciarPerdido.jsx)

- `updateStatus(item)` envia `PATCH /perdidos/:id/status` com `{ status_perda: nextStatus(item.status_perda) }`.
- `deletePerdido(item)` envia `DELETE /perdidos/:id`.
- `singleFlight()` (L18-25) — ignora cliques enquanto uma requisição está em andamento (evita PATCH/DELETE duplicados).
- `executeAction(request, { onSuccess, onFailure })` (L36-40) — só chama `onSuccess` depois da resposta de sucesso; em erro, converte o status HTTP em `notFound`, `forbidden`, `session` ou `error` (`actionError`, L28-33).
- A tela só muda **depois** da confirmação do servidor; em caso de erro, o status anterior permanece.

---

## 5. Banco de dados

### Tabela `publica_perda` ([schema](../../database/banco_peludinhos.sql#L42-L64))

| Coluna | Tipo | Obrigatória | Finalidade | Observação |
|---|---|---|---|---|
| `id_perda` | `BIGINT GENERATED ALWAYS AS IDENTITY` | sim (PK) | Identificador | Gerado pelo banco |
| `nome_animal` | `VARCHAR(100)` | não | Nome do animal | |
| `especie` | `VARCHAR(50)` | **sim** | Cachorro, Gato ou Outro | Lista validada no backend |
| `raca` | `VARCHAR(50)` | não | Raça | |
| `cor` | `VARCHAR(50)` | não | Cor | |
| `genero` | `VARCHAR(20)` | não | Macho/Fêmea | |
| `foto` | `VARCHAR(500)` | não | **Nome do arquivo** da foto (ex.: `perda-<uuid>.jpg`) | Nunca uma URL; nunca enviado ao frontend |
| `local_desaparecimento` | `VARCHAR(255)` | **sim** | Onde o animal sumiu | Texto livre |
| `data_desaparecimento` | `TIMESTAMP` | **sim** | Quando sumiu | Gravada como data (meia-noite); lida com `to_char(…,'YYYY-MM-DD')` |
| `descricao` | `TEXT` | não | Detalhes | Limitada a 1000 caracteres pelo backend |
| `status_perda` | `VARCHAR(30)` | **sim**, padrão `'PERDIDO'` | `PERDIDO` ou `ENCONTRADO` | Não há `CHECK` no banco; a lista é validada no backend |
| `id_usuario_tutor` | `BIGINT` | **sim** | Autor/tutor | Chave estrangeira |
| `data_publicacao` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | — | Data da publicação | Preenchida pelo banco; nunca alterada |

### Relacionamento
```sql
ALTER TABLE Publica_Perda ADD CONSTRAINT fk_publica_perda_tutor
  FOREIGN KEY (id_usuario_tutor) REFERENCES Usuario (id_usuario) ON DELETE RESTRICT;
```
- Cada publicação pertence a **um** usuário; um usuário pode ter várias publicações (1:N).
- `ON DELETE RESTRICT` impede apagar um usuário que ainda tenha publicações.
- **Não existe** relação com `animal` nem com `avistamento` (decisão do projeto: `animal` é para animais de rua).

### Como o backend usa a tabela
| Operação | SQL (resumo) | Função |
|---|---|---|
| Listar | `SELECT … FROM Publica_Perda p ORDER BY p.data_publicacao DESC, p.id_perda DESC LIMIT $1` | `listar` |
| Detalhar | `SELECT …, u.nome, u.telefone, (p.id_usuario_tutor = $2) AS eh_autor FROM Publica_Perda p JOIN Usuario u … WHERE p.id_perda = $1` | `buscar` |
| Inserir | `INSERT … VALUES ($1…$9,'PERDIDO',$10) RETURNING id_perda` | `criar` |
| Atualizar dados | `UPDATE … SET nome_animal = $1, …, foto = $6, … WHERE id_perda = $10` | `editar` |
| Atualizar status | `UPDATE Publica_Perda SET status_perda = $1 WHERE id_perda = $2` | `alterarStatus` |
| Excluir | `DELETE FROM Publica_Perda WHERE id_perda = $1` | `excluir` |

- O `SELECT` reutiliza a constante `fields` ([L14-16](../../server/controllers/perdaController.js#L14-L16)), que devolve `(p.foto IS NOT NULL) AS tem_foto` em vez do nome do arquivo.

### Consultas parametrizadas
Os valores nunca são concatenados no texto SQL; vão num array separado (`[valor1, valor2]`) e o banco os trata como **dados**, não como comandos. Isso impede *SQL injection*. A única parte montada no texto é a constante `fields`, que é fixa no código.

### Transações e rollback
- `criar`, `editar`, `alterarStatus` e `excluir` usam uma conexão exclusiva (`pool.connect()`) com `BEGIN … COMMIT`.
- Em qualquer erro antes do `COMMIT`, `ROLLBACK` desfaz tudo; a conexão é sempre devolvida no `finally` (`client.release()`).
- `SELECT … FOR UPDATE` trava a linha enquanto a transação decide (autor, foto atual), evitando que duas requisições concorrentes se sobreponham.
- Banco e disco **não** participam da mesma transação. O código compensa: grava a foto antes do `INSERT/UPDATE` e a apaga se o banco falhar; apaga a foto antiga só **depois** do `COMMIT`.

---

## 6. API REST

Todas as rotas exigem `Authorization: Bearer <token>`; sem ele, **401**. Respostas sempre em JSON (exceto a foto). Os IDs passam por `validId` (inteiro positivo dentro do limite de `BIGINT`); inválido → **400**.

### `GET /api/perdidos` — listar
- **Controller:** `listar` · **Parâmetro opcional:** `?limit=1..500` (padrão 200).
- **Banco:** `SELECT` ordenado pela publicação mais recente.
- **Resposta 200:**
```json
{ "perdidos": [ { "id_perda": "26", "nome_animal": "Bidu", "especie": "Cachorro", "raca": "SRD", "cor": "Caramelo",
  "genero": "Macho", "tem_foto": true, "local_desaparecimento": "Praça Central",
  "data_desaparecimento": "2026-10-26", "descricao": "Coleira azul", "status_perda": "PERDIDO",
  "data_publicacao": "2026-10-27T…" } ] }
```
- Não traz telefone, nome do tutor nem nome do arquivo. **Erros:** 400 (`limit` inválido), 401, 500.

### `GET /api/perdidos/:id` — detalhes
- **Controller:** `buscar` · **Banco:** `SELECT` com `JOIN Usuario`.
- **Resposta 200:** `{ "perdido": { …campos da lista…, "tutor_nome": "Ana", "tutor_telefone": "93991234567", "eh_autor": true } }`
- `eh_autor` é calculado no SQL comparando o tutor com o usuário do token. **Erros:** 400, 401, 404, 500.

### `GET /api/perdidos/:id/foto` — foto protegida
- **Controller:** `foto` · **Banco:** `SELECT foto` · **Disco:** `res.sendFile` da pasta privada.
- **Resposta 200:** bytes da imagem, com `Content-Type` (`image/jpeg|png|webp`), `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.
- **Erros:** 400, 401, 404 (publicação ou foto inexistente), 500.

### `POST /api/perdidos` — cadastrar
- **Controller:** `criar` · **Corpo:** `multipart/form-data` com `especie`, `local_desaparecimento`, `data_desaparecimento` (obrigatórios), `nome_animal`, `raca`, `cor`, `genero`, `descricao` e o arquivo `foto` (opcionais).
- **Validações:** `validate`, bytes reais da imagem (`imageExtension`), 5 MB, telefone do autor cadastrado.
- **Banco:** transação com `SELECT telefone` + `INSERT`.
- **Exemplo:**
```
POST /api/perdidos
Authorization: Bearer eyJ…
Content-Type: multipart/form-data; boundary=…
especie=Cachorro, local_desaparecimento=Praça Central, data_desaparecimento=2026-10-26, foto=<arquivo>
```
```json
201 { "mensagem": "Desaparecimento publicado!", "perdido": { "id_perda": "26", "status_perda": "PERDIDO", "tem_foto": true, … } }
```
- **Erros:** 400 (dados, imagem inválida, sem telefone), 401, 403 (usuário do token não existe), 413 (foto > 5 MB), 500.

### `PUT /api/perdidos/:id` — editar
- **Controller:** `editar` · **Corpo:** multipart com os 8 campos + opcionalmente `foto` **ou** `remover_foto=true`.
- **Semântica:** substituição completa — um campo opcional ausente ou vazio vira `NULL`. A foto é a exceção: sem arquivo e sem `remover_foto`, é mantida.
- **Banco:** `SELECT … FOR UPDATE` (existência e autor) + `UPDATE`.
- **Resposta 200:** `{ "mensagem": "Publicação atualizada!", "perdido": { … } }`.
- **Erros:** 400 (dados, foto e remoção juntas), 401, 403 (não é o autor), 404, 413, 500.

### `PATCH /api/perdidos/:id/status` — alterar status
- **Controller:** `alterarStatus` · **Corpo JSON:** `{ "status_perda": "ENCONTRADO" }` (ou `"PERDIDO"`).
- **Banco:** `SELECT … FOR UPDATE` + `UPDATE` somente se o status mudou.
- **Resposta 200:** `{ "mensagem": "Publicação marcada como encontrada!", "perdido": { … } }`.
- **Erros:** 400 (status inválido), 401, 403, 404, 500.

### `DELETE /api/perdidos/:id` — excluir
- **Controller:** `excluir` · **Banco:** `SELECT … FOR UPDATE` + `DELETE`; depois do `COMMIT`, apaga o arquivo da foto.
- **Resposta 200:** `{ "mensagem": "Publicação excluída com sucesso." }` (200 com JSON, não 204, porque o `api.js` sempre lê JSON).
- **Erros:** 400, 401, 403, 404, 500.

### Por que métodos diferentes
| Método | Significado no HTTP | Uso no módulo |
|---|---|---|
| `GET` | Ler, sem efeito colateral | Lista, detalhes, foto |
| `POST` | Criar um recurso novo | Nova publicação |
| `PUT` | Substituir a representação do recurso | Edição completa dos dados |
| `PATCH` | Alteração parcial | Apenas o status |
| `DELETE` | Remover o recurso | Exclusão definitiva |

Usar o método certo deixa a API previsível: a URL identifica **o recurso** (`/api/perdidos/26`) e o método diz **o que fazer** com ele.

---

## 7. Fluxos completos

### A. Listagem
1. O usuário abre `/perdidos`. `Protected` ([`App.jsx:16-19`](../../src/App.jsx#L16-L19)) confere se há sessão.
2. `AnimaisPerdidos` chama `useAnimaisPerdidos()`; o `useEffect` do hook faz `api('/perdidos')`.
3. `api.js` envia `GET /api/perdidos` com o token.
4. Express → `autenticarToken` → `listar` → `SELECT … LIMIT 200` no PostgreSQL.
5. Resposta `{ perdidos }` → o hook guarda em estado → `filterPerdidos` aplica busca/filtro → um `PerdidoCard` por item.
6. Cada card com `tem_foto` monta um `FotoPerdido`, que baixa a foto pela rota autenticada.

### B. Cadastro
1. "Divulgar Fuga" → `/perdidos/novo` (`NovoPerdido`).
2. O usuário preenche os campos (`PerdidoFields`) e escolhe a foto (`photoFileError` confere tipo/tamanho; `usePhotoPreview` mostra a prévia).
3. `submit` → `validatePerdido`; se houver erro, mostra junto aos campos e não envia.
4. `perdidoFormData(data, { photo })` → `api('/perdidos', { method: 'POST', body })`.
5. Backend: multer lê o multipart → `criar` → `validate` → `imageExtension` → `BEGIN` → telefone → grava a foto no disco → `INSERT` → `COMMIT` → 201.
6. Frontend: `navigate('/perdidos/' + id_perda, { replace: true })` → a tela de detalhes faz um novo `GET`.

### C. Detalhes
1. Clique no card (link no nome que cobre o card inteiro) ou em "Tenho pistas" → `/perdidos/:id`.
2. `DetalhesPerdido` lê o `id` com `useParams` e faz `api('/perdidos/' + id)`.
3. `buscar`: `JOIN` com `usuario` para `tutor_nome` e `tutor_telefone`; calcula `eh_autor`.
4. A tela formata o telefone (`localPhone`, `formatPhone`) e monta o link `https://wa.me/55…` (`whatsappLink`). Se o número não for válido, não gera link.
5. Se `eh_autor` for verdadeiro, mostra `GerenciarPerdido`.

### D. Edição
1. "Editar publicação" → `/perdidos/:id/editar`. `EditarPerdido` faz `GET` e decide com `accessStatus`: autor → formulário; outro usuário → "Edição não permitida".
2. `EditForm` inicia com `perdidoToForm(item)`; a foto atual aparece por `FotoPerdido`.
3. O usuário altera campos e escolhe manter, trocar ou remover a foto.
4. `saveEdit` → `PUT` com `perdidoFormData(data, { photo, removePhoto })`.
5. Backend `editar`: `FOR UPDATE` → confere autor → grava foto nova (se houver) → `UPDATE` → `COMMIT` → apaga a foto antiga.
6. Frontend: `navigate('/perdidos/:id', { replace: true, state: { updated: true } })`; os detalhes recarregam e mostram "Alterações salvas com sucesso.".

### E. Alteração de status
1. "Marcar como encontrado" → abre `ConfirmDialog` (nenhuma requisição ainda).
2. Confirmar → `confirmStatus` → `runOnce` (bloqueia cliques repetidos) → `executeAction(updateStatus(item))`.
3. `PATCH /api/perdidos/:id/status` com `{ "status_perda": "ENCONTRADO" }` → `alterarStatus` → `FOR UPDATE` → autor → `UPDATE` → `COMMIT`.
4. Sucesso: `onUpdated` mescla a resposta em `item` → selo, faixa, botão e mensagem do WhatsApp mudam; a confirmação aparece na própria seção.

### F. Exclusão
1. "Excluir publicação" → diálogo com três avisos.
2. "Excluir definitivamente" → `executeAction(deletePerdido(item))` → `DELETE /api/perdidos/:id`.
3. `excluir`: `FOR UPDATE` → autor → `DELETE` → `COMMIT` → `deletePhoto`.
4. Frontend: `navigate('/perdidos', { replace: true, state: { deleted: true } })` → a lista recarrega e mostra "Publicação excluída com sucesso.".

### G. Fotografias privadas
1. **Upload:** o navegador envia o arquivo no `FormData` → multer guarda em memória → `imageExtension` confere os primeiros bytes (JPG/PNG/WEBP) → `perda-<uuid>.<ext>` é gravado em `server/uploads-perdidos/` → o banco guarda só esse nome.
2. **Leitura:** `FotoPerdido` → `apiBlob('/perdidos/:id/foto')` com token → `foto` busca o nome no banco, confere o formato e envia o arquivo → o navegador cria uma URL `blob:` → `<img>`.
3. A pasta não é publicada pelo `express.static` (que só publica `server/uploads/`), então não existe URL pública para essas fotos.

### H. Busca e filtros
1. O texto digitado e o status escolhido ficam em estado (`query`, `status`) na `AnimaisPerdidos`.
2. `useMemo(() => filterPerdidos(perdidos, { query, status }))` recalcula a lista visível a cada mudança — **sem nova requisição**.
3. `normalizeSearch` remove acentos (`normalize('NFD')`), passa para minúsculas e tira espaços; a busca compara com nome, espécie, raça, cor e local.
4. `emptyState` diferencia "não há publicações" de "a busca não encontrou nada".

### I. Compartilhamento
1. Clique no botão de compartilhar do card → `share(item)` → `sharePerdido(item)`.
2. URL: `new URL('/perdidos/' + id, location.origin)` — usa o endereço atual do site.
3. Se existir `navigator.share`, abre o compartilhamento nativo; cancelar não mostra erro. Caso contrário, copia com `navigator.clipboard.writeText` e avisa "Link copiado…". Se nada funcionar, mostra o link para copiar à mão.
4. Quem abre o link sem login cai em `Protected`, que redireciona para `/login` com `state.from = '/perdidos/<id>'`; após o login, `safeRedirect` devolve a pessoa à publicação.
5. O conteúdo compartilhado tem só o link e um texto neutro com o nome do animal — sem telefone, sem token.

---

## 8. Autenticação, autorização e segurança

| Mecanismo | Como funciona | Arquivo |
|---|---|---|
| **JWT** | Token assinado com `JWT_SECRET`, contendo `id_usuario` e `tipo_usuario`, válido por 8 h | `server/controllers/authController.js` (login) |
| Envio do token | `Authorization: Bearer <token>`, lido do `localStorage` | `src/api.js` |
| Validação | `jwt.verify`; falha → 401 | `authMiddleware.js` |
| Identidade | `req.usuario.id_usuario` | todas as funções do controller |
| **Autorização (autor)** | `SELECT id_usuario_tutor … FOR UPDATE` + comparação com o token → 403 | `editar`, `alterarStatus`, `excluir` |
| Por que não basta esconder botões | Qualquer pessoa pode enviar requisições HTTP diretamente (DevTools, curl). Os botões escondidos (`eh_autor`) são só conforto visual; quem protege é o backend. Os testes confirmam 403 para outro usuário | `GerenciarPerdido` (visual) + controller (proteção) |
| 401 | Token ausente/inválido/expirado → `api.js` apaga o token → login, levando a página atual | `api.js`, `App.jsx:23-28` |
| 403 | Não é o autor → tela "Edição não permitida" ou alerta de permissão | `EditarPerdido`, `GerenciarPerdido.actionError` |
| 404 | Publicação inexistente → tela "Publicação não encontrada" | `DetalhesPerdido`, `EditarPerdido`, `GerenciarPerdido` |
| Fotos protegidas | Pasta fora do `express.static`; rota com JWT; nome lido do banco | `perdaController.foto` |
| Validação do upload | Tamanho (multer, 5 MB, 1 arquivo) + **bytes reais** da imagem, não a extensão nem o tipo informado pelo navegador | `perdaRoutes.js`, `imageExtension` |
| Nomes de arquivo seguros | Gerados pelo servidor (`perda-<uuid>.<ext>`), gravados com `flag: 'wx'` (não sobrescreve); só nomes nesse formato viram caminho (`photoName`) | `perdaController.js` |
| Consultas parametrizadas | `$1, $2…` com valores separados | todo o controller |
| Dados do tutor | Telefone e nome só nos detalhes; nunca `email`, `senha_hash` ou `id_usuario_tutor`; `eh_autor` é só um booleano | `buscar`, `fields` |
| Campos protegidos | `id_usuario_tutor`, `status_perda` e `data_publicacao` enviados pelo cliente são ignorados | `validate`, `criar`, `editar` |
| Retorno após login | `Protected` guarda `state.from`; `safeRedirect` aceita só caminhos internos (`/…`), recusando `//site`, `/\site`, URLs absolutas e `/login` | `App.jsx`, `Auth.jsx:15-19` |

---

## 9. Relação com Sistemas Distribuídos

### O Peludinhos é um sistema distribuído?
**Em sentido básico, sim**: é uma aplicação **cliente-servidor em três camadas**, em que partes do sistema rodam em **processos diferentes** e se comunicam **por troca de mensagens pela rede**. Não é, porém, um sistema distribuído no sentido de infraestrutura (não há réplicas, vários servidores, balanceamento ou microsserviços).

### Separação lógica × separação física

| Componente | Onde executa | Separado logicamente? | Separado fisicamente? |
|---|---|---|---|
| Frontend React | **Navegador** do usuário | Sim | **Sim** — roda na máquina de cada cliente |
| Backend Express | Processo Node.js | Sim | Processo próprio (no projeto, na mesma máquina do banco) |
| PostgreSQL | Processo do SGBD | Sim | Processo próprio; comunicação por TCP, mesmo em `localhost` |
| Armazenamento de fotos | Disco local do servidor | Sim (pasta privada) | Não — mesmo processo/máquina do backend |

Em produção (`npm start`), o mesmo processo Node entrega os arquivos do React **e** a API. Em desenvolvimento, Vite e Express são processos separados.

### Características presentes

| Conceito | Como aparece no código |
|---|---|
| **Cliente-servidor** | O navegador pede; o Express responde (`api.js` ↔ `perdaRoutes.js`) |
| **Comunicação por mensagens** | Requisições e respostas HTTP; corpo em **JSON** ou **multipart** |
| **API REST** | Recursos em `/api/perdidos/:id`, operações pelos métodos HTTP, respostas sem estado de sessão |
| **Comunicação assíncrona** | `fetch` + `async/await` no navegador; no servidor, `await pool.query(...)` e `await fs.writeFile(...)` não bloqueiam o event loop do Node |
| **Autenticação sem estado (stateless)** | O servidor não guarda sessão; cada requisição traz o JWT, que basta para identificar o usuário |
| **Persistência** | PostgreSQL guarda os dados de forma durável; as fotos ficam no sistema de arquivos |
| **Concorrência** | Vários usuários usam o sistema ao mesmo tempo; o `Pool` atende várias conexões; `SELECT … FOR UPDATE` serializa alterações concorrentes na mesma publicação |
| **Transações e consistência** | `BEGIN/COMMIT/ROLLBACK` garantem que cada operação seja tudo-ou-nada no banco |
| **Consistência entre recursos diferentes** | Banco e disco não compartilham transação; o código usa **ações compensatórias** (apaga a foto nova se o banco falhar; apaga a antiga só após o `COMMIT`). Se a remoção do arquivo falhar depois do `COMMIT`, sobra um arquivo órfão (registrado no log) |
| **Falhas de rede** | `friendlyError` trata falha de conexão; botões "Tentar novamente"; `AbortController` cancela downloads de foto abandonados; envio duplicado bloqueado (`useRef`, `singleFlight`) |

### Características **não** implementadas
- Vários servidores, replicação do banco, balanceamento de carga, microsserviços, filas de mensagens, cache distribuído.
- Armazenamento compartilhado de arquivos: as fotos ficam no disco de **uma** máquina. Por isso, rodar duas instâncias do backend exigiria um armazenamento comum (ex.: serviço de objetos) — a autenticação por JWT, por outro lado, já não seria obstáculo.
- Tolerância a falhas: se o processo do servidor ou o PostgreSQL cair, o sistema fica indisponível.

---

## 10. Testes e validação

> Nenhum teste foi executado em navegador real. Os resultados abaixo são os registrados nas etapas de desenvolvimento.

### Tipos de teste

| Tipo | O que exercita | Onde está |
|---|---|---|
| **Testes de API (integração)** | Servidor real numa porta temporária + PostgreSQL real, com usuários e publicações temporários criados e apagados pelo próprio teste | [`tests/perdidos.test.cjs`](../../tests/perdidos.test.cjs) — **versionado no projeto** |
| **Validações integradas pontuais** | Fluxos completos via endpoints reais de cadastro/login, com funções reais do frontend montando as requisições | Scripts temporários fora do projeto (não versionados) |
| **Verificações em memória** | Funções e componentes do frontend renderizados pelo SSR do Vite, com `fetch`/`navigator` simulados | Scripts temporários fora do projeto (não versionados) |
| **Testes reais de interface** | Cliques, diálogos, navegação no navegador | **Não realizados** (pendentes) |

### `tests/perdidos.test.cjs` — 23 testes
Grupos ([linhas 92-416](../../tests/perdidos.test.cjs#L92)):
- **Autenticação:** 401 sem token em todas as rotas.
- **Cadastro:** telefone obrigatório; tutor vem do token; status inicial `PERDIDO`; caracteres nulos recusados.
- **Fotos:** entrega só com JWT e com os cabeçalhos certos; nenhuma rota pública entrega a foto; sem foto → 404.
- **Transações:** falha controlada no `INSERT` (sessão somente leitura), no `UPDATE` e no `DELETE` (lock com tempo limite) — o banco é revertido e os arquivos ficam corretos.
- **Edição:** autor edita; outro usuário recebe 403; campos protegidos ignorados; manter/trocar/remover foto; foto + remoção juntas → 400.
- **Status:** validações, PERDIDO ↔ ENCONTRADO sem alterar outras colunas.
- **Exclusão:** validações, com e sem foto, status ENCONTRADO, só o arquivo da publicação é removido.
- **Limpeza:** `after()` apaga só os IDs criados; registra se os usuários e as publicações que já existiam ficaram idênticos.

**Resultados registrados:** 23/23, com a tabela vazia e também com uma publicação pré-existente (que permaneceu idêntica).

### Validações integradas (API real + funções do frontend)
| Etapa | Fluxo | Resultado |
|---|---|---|
| 9.1 | Cadastro → lista → detalhes → foto | 32/32 |
| 10.1 | Edição (manter, trocar e remover foto; 403) | 33/33 |
| 11.1 | Status e exclusão (403, 401, foto removida, outra publicação preservada) | 30/30 |

### Verificações em memória (frontend)
Detalhes 50/50 · cadastro 33/33 (Etapa 9) · edição 44/44 · status e exclusão 36/36 · correções da auditoria 18/18 · busca, filtros e compartilhamento 42/42.

### Preservação do banco
Em cada execução que gravou dados, foi comparado o estado antes e depois: usuários originais (13, 14, 15) com o mesmo hash de todas as colunas, tabelas e pastas de fotos idênticas.

### Regressão de Avistamentos
`npm run test:avistamentos`: 5/5, com o banco idêntico ao inicial; nenhum arquivo do módulo de avistamentos foi alterado.

### Pendente no navegador
Interação real com todas as telas; diálogos (Esc, foco, teclado); compartilhamento nativo e cópia; layout em 360 px, 390 px e desktop; retorno após login a partir de um link compartilhado.

---

## 11. Evolução do desenvolvimento

> Não há commits do módulo: todo o trabalho está no diretório de trabalho da branch `feature/animais-perdidos`. A cronologia abaixo vem dos registros das etapas, não do histórico do Git.

| Etapa | O que foi feito |
|---|---|
| Análise | Levantamento do projeto: a tela de perdidos era estática e a tabela `publica_perda` existia sem uso |
| 1 | `Lost.jsx` renomeado para `AnimaisPerdidos.jsx` |
| 2 | Backend de leitura: `GET /api/perdidos` e `GET /api/perdidos/:id` |
| 3 | Cadastro (`POST`), pasta privada de fotos e rota autenticada de foto; criação de `tests/perdidos.test.cjs` |
| 4 | Edição (`PUT`) com manter/trocar/remover foto e `FOR UPDATE` |
| 5 | Status (`PATCH`) e recusa de caracteres nulos |
| 6 | Exclusão definitiva (`DELETE`) com remoção da foto após o `COMMIT` |
| 7 | Frontend da listagem com dados reais e `FotoPerdido` |
| 8 | Tela de detalhes, WhatsApp e retorno à página original após o login |
| 9 / 9.1 | Formulário de cadastro; validação integrada |
| 10 / 10.1 | Tela de edição e extração do `PerdidoForm` compartilhado; validação integrada |
| 11 / 11.1 | Gerenciamento (status e exclusão) com `ConfirmDialog`; validação integrada |
| 12 | Auditoria: 4 problemas moderados e 11 ajustes pequenos identificados |
| 12.1 | Correções: mensagens amigáveis, retorno após sessão expirada, testes com dados reais, avisos que reapareciam, confirmação perto dos botões, acessibilidade |
| 12.2 | Busca, filtros e compartilhamento |
| 12.3 | Regressão final (perdidos 23/23, avistamentos 5/5, build) |
| Ajustes finais | Botão "Divulgar Fuga" reposicionado acima da barra inferior; remoção dos ícones de menu e notificações sem função |

---

## 12. Limitações e melhorias futuras

### Problemas ou limitações existentes
| Limitação | Detalhe |
|---|---|
| Busca só nas publicações carregadas | O backend devolve no máximo 200 (`limit`); a busca é feita no navegador |
| Sem paginação | A lista não carrega além das 200 mais recentes |
| Dados do formulário se perdem quando a sessão expira | O usuário volta para a página certa após o login, mas o que digitou não é guardado |
| Acessibilidade pendente | Foco não vai ao primeiro campo com erro; foco se perde quando a seção do autor some após um 403; no Chrome, Esc repetido pode fechar o diálogo durante o envio; o fundo pode rolar com o diálogo aberto |
| "Carregando publicações…" pisca | A lista recarrega sempre que a janela recebe foco |
| Fotos em disco local | Impede rodar várias instâncias do servidor sem armazenamento compartilhado; arquivo órfão possível se a remoção falhar após o `COMMIT` |
| Status sem `CHECK` no banco | A restrição a PERDIDO/ENCONTRADO existe só no backend |
| Compartilhamento/cópia exigem contexto seguro | Fora de `localhost`/HTTPS, o navegador bloqueia; aparece o link para copiar à mão |
| Testes de interface | Nenhum teste em navegador foi feito |
| Testes em memória não versionados | Apenas `tests/perdidos.test.cjs` está no projeto |
| README desatualizado | [`README.md:51`](../../README.md#L51) ainda descreve a tela como demonstrativa |
| Código duplicado | A detecção de imagem por bytes existe também nos controllers de avistamentos e usuários (não foi unificada para não alterar outros módulos) |

### Fora do escopo (não são defeitos)
Painel administrativo (o campo `tipo_usuario` existe no token, mas não é usado), notificações, mapa para animais perdidos (a tabela não tem coordenadas), busca no servidor, verificação do campo `ativo` da conta (decisão do projeto), ligação entre publicações perdidas e avistamentos.
