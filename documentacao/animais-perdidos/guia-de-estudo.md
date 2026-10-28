# Animais Perdidos — Guia de estudo para a apresentação

Material de preparação para explicar o módulo ao professor. Os detalhes completos estão em [`relatorio-tecnico.md`](relatorio-tecnico.md).

---

## A. Roteiro oral (5 a 8 minutos)

**1. O problema (≈ 40 s)**
"O Peludinhos já registrava avistamentos de animais de rua. Faltava um espaço para o tutor avisar que o **seu** animal sumiu. Antes, a tela de perdidos só tinha dois exemplos fixos no código. Eu implementei o módulo completo: listar, publicar, ver detalhes com contato, editar, marcar como encontrado e excluir."

**2. Arquitetura (≈ 1 min 30 s)**
"É uma aplicação cliente-servidor em três camadas. O **frontend React** roda no navegador de cada usuário. Ele conversa por **HTTP**, com mensagens **JSON**, com o **backend Node.js/Express**. O backend acessa o **PostgreSQL**, que é outro processo, e guarda as fotos numa pasta privada do servidor. A API segue o estilo **REST**: o recurso é `/api/perdidos/:id`, e o método HTTP diz a operação — GET para ler, POST para criar, PUT para editar, PATCH para o status e DELETE para excluir."

**3. Banco (≈ 1 min)**
"Uso a tabela `publica_perda`, que já existia. Cada publicação tem uma chave estrangeira `id_usuario_tutor` para a tabela de usuários. Ela não se relaciona com `animal`, porque `animal` é para animais de rua. O telefone não é copiado para a publicação: nos detalhes, faço um `JOIN` com `usuario`. A foto não fica no banco: o banco guarda só o nome do arquivo."

**4. Segurança (≈ 1 min 30 s)**
"Toda rota exige um **token JWT**, enviado no cabeçalho `Authorization`. O middleware `autenticarToken` valida o token e coloca o usuário em `req.usuario`.

Para editar, mudar o status ou excluir, o backend **confere no banco** se o usuário é o autor; se não for, responde **403**. Esconder os botões no frontend é só conforto visual, porque qualquer pessoa pode montar uma requisição HTTP diretamente.

As fotos ficam numa pasta que **não é pública**. Elas só saem por uma rota que exige o token. Como a tag `<img>` não envia o token, o frontend baixa a imagem com `fetch` e a exibe por uma URL temporária `blob:`.

Por fim, todas as consultas são parametrizadas, o que impede SQL injection."

**5. Consistência e concorrência (≈ 1 min)**
"As escritas usam **transações**: `BEGIN`, `COMMIT` e, se algo falhar, `ROLLBACK`. Para evitar que duas pessoas alterem a mesma publicação ao mesmo tempo, uso `SELECT … FOR UPDATE`, que trava a linha.

Banco e disco não participam da mesma transação, então trato isso com ações de compensação. Se o banco falhar depois de eu gravar a foto, apago a foto. Ao trocar uma foto, só apago a antiga depois do `COMMIT`."

**6. Frontend e experiência (≈ 1 min)**
"Cadastro e edição compartilham o mesmo formulário e as mesmas validações. A busca e os filtros funcionam no navegador, sem nova requisição a cada letra. Há compartilhamento do link e contato por WhatsApp. Ações destrutivas pedem confirmação num diálogo acessível. Se a sessão expira, a pessoa faz login e volta para a página onde estava."

**7. Testes e limites (≈ 40 s)**
"Escrevi 23 testes de integração do backend com servidor e banco reais. Cada teste cria e apaga só os próprios dados e confere que nada do que já existia mudou. Também rodei os testes de avistamentos para garantir que nada quebrou.

As limitações: a busca olha só as 200 publicações mais recentes, os testes de interface no navegador ainda são manuais, e as fotos em disco local impedem rodar vários servidores sem um armazenamento compartilhado."

---

## B. Os 10 conceitos mais importantes

| # | Conceito | Explicação simples | Onde está no código |
|---|---|---|---|
| 1 | **Cliente-servidor** | Um lado pede (navegador), o outro responde (servidor) | `src/api.js` ↔ `server/routes/perdaRoutes.js` |
| 2 | **API REST** | URLs representam recursos; métodos HTTP representam ações | 7 rotas em [`perdaRoutes.js:17-23`](../../server/routes/perdaRoutes.js#L17-L23) |
| 3 | **Códigos HTTP** | 200/201 sucesso; 400 dado inválido; 401 não autenticado; 403 sem permissão; 404 não existe; 413 arquivo grande; 500 erro do servidor | `res.status(...)` no controller |
| 4 | **JWT** | "Crachá" assinado pelo servidor; prova quem é o usuário em cada requisição, sem sessão guardada | [`authMiddleware.js`](../../server/middleware/authMiddleware.js) |
| 5 | **Autenticação × autorização** | Autenticação: *quem é você?* (JWT). Autorização: *você pode fazer isto?* (é o autor?) | `autenticarToken` × comparação com `id_usuario_tutor` em `editar/alterarStatus/excluir` |
| 6 | **Consulta parametrizada** | Valores vão separados do SQL (`$1`), evitando SQL injection | todo o `perdaController.js` |
| 7 | **Transação (ACID)** | Várias operações tratadas como uma só: ou tudo é gravado, ou nada | `BEGIN/COMMIT/ROLLBACK` em `criar`, `editar`, `alterarStatus`, `excluir` |
| 8 | **Bloqueio de linha (`FOR UPDATE`)** | Trava a publicação enquanto a transação decide, evitando conflito entre requisições simultâneas | [`perdaController.js:173`](../../server/controllers/perdaController.js#L173) |
| 9 | **Multipart / upload** | Formato que leva campos de texto e arquivo na mesma requisição; o multer o interpreta | `FormData` em `perdidoFormData` + `multer` em `perdaRoutes.js` |
| 10 | **Comunicação assíncrona** | O programa não para esperando a rede/banco; continua e trata a resposta quando chega (`async/await`, Promises) | `api()` no navegador; `await pool.query` no servidor |

---

## C. Perguntas prováveis do professor

**1. Por que o Peludinhos pode ser considerado um sistema distribuído?**
Os componentes rodam em processos diferentes e se comunicam por mensagens na rede. O frontend roda no navegador de cada usuário, o backend no processo Node e o banco no processo do PostgreSQL. Não há, porém, replicação, vários servidores ou balanceamento de carga.

**2. Qual a diferença entre separação lógica e física aqui?**
- Logicamente, são três camadas: interface, regras e dados.
- Fisicamente, o React executa na máquina do cliente, e o Express e o PostgreSQL são processos separados, que no projeto rodam na mesma máquina.
- Em produção, o mesmo processo Node entrega os arquivos do React e a API.

**3. Por que REST e por que métodos diferentes?**
A URL identifica o recurso e o método diz a ação. GET só lê, POST cria, PUT substitui os dados, PATCH muda só o status e DELETE remove. Isso torna a API previsível e independente da interface.

**4. Como o backend sabe quem está fazendo a requisição?**
Pelo JWT no cabeçalho `Authorization: Bearer …`. O `autenticarToken` verifica a assinatura e a validade e coloca os dados em `req.usuario`. O `id_usuario` vem dali, nunca do corpo da requisição.

**5. O que impede um usuário de editar a publicação de outro?**
O backend busca a publicação com `SELECT id_usuario_tutor … FOR UPDATE` e compara com `req.usuario.id_usuario`. Se forem diferentes, responde 403 e desfaz a transação. Os testes cobrem esse caso.

**6. Por que não basta esconder os botões?**
Porque qualquer pessoa pode enviar requisições HTTP diretamente, pelo DevTools ou pelo curl. O frontend é controlado pelo usuário; a regra precisa estar no servidor.

**7. O que é uma transação e onde você usa?**
Um conjunto de operações que é aplicado inteiro ou não é aplicado. No cadastro, por exemplo, faço `BEGIN`, confiro o telefone, faço o `INSERT` e, se tudo der certo, `COMMIT`. Se der erro, `ROLLBACK`, e a foto gravada é apagada.

**8. Como você trata duas pessoas alterando a mesma publicação ao mesmo tempo?**
Com `SELECT … FOR UPDATE`: a segunda transação espera a primeira terminar. Também bloqueio cliques repetidos no frontend (`singleFlight`, `useRef`) para não gerar requisições duplicadas.

**9. Banco e disco são consistentes entre si?**
Eles não compartilham transação, então uso ações de compensação:
- grava a foto e, se o banco falhar, apaga a foto;
- só apaga a foto antiga depois do `COMMIT`.

O único caso que sobra é a falha ao apagar um arquivo depois do `COMMIT`: o arquivo fica órfão, inacessível pela API, e o caso é registrado no log.

**10. Como as fotos ficam privadas?**
- Elas ficam em `server/uploads-perdidos/`, que o Express não publica.
- Só saem por `GET /api/perdidos/:id/foto`, que exige JWT.
- O nome do arquivo vem do banco e precisa seguir o formato que o próprio servidor gera.
- O frontend baixa a imagem com `fetch` (via `apiBlob`) e exibe por uma URL `blob:`.

**11. Como você valida o upload?**
- O multer limita o tamanho (5 MB) e a quantidade (1 arquivo).
- O controller confere os **primeiros bytes** do arquivo (as assinaturas de JPG, PNG e WEBP), em vez de confiar na extensão.
- O nome é gerado pelo servidor (`perda-<uuid>.<ext>`).

**12. Como você evita SQL injection?**
Com consultas parametrizadas: `pool.query('… WHERE id_perda = $1', [id])`. O valor nunca é concatenado no texto do SQL.

**13. O que acontece se a rede cair durante uma operação?**
- O `fetch` falha, e o frontend mostra uma mensagem amigável (`friendlyError`) com a opção de tentar de novo.
- Os dados do formulário continuam na tela.
- No servidor, se a operação não chegou ao `COMMIT`, nada foi gravado.

**14. Por que o telefone não está na tabela `publica_perda`?**
Para não duplicar dados. Ele fica só em `usuario` e é buscado com `JOIN` nos detalhes. Assim, se o tutor muda o telefone no perfil, todas as publicações já mostram o número novo. A listagem não traz o telefone, para expor menos dados.

**15. Quais são as limitações da sua arquitetura?**
- Há um único servidor e um único banco: se um deles cair, o sistema fica fora do ar.
- As fotos ficam em disco local, então escalar para vários servidores exigiria um armazenamento compartilhado. O JWT, por não guardar sessão no servidor, já não seria obstáculo.
- A busca só olha as 200 publicações mais recentes, sem paginação.

---

## D. Ordem para a demonstração prática

1. **Login** e abrir **Perdidos** (lista vazia ou com publicações).
2. **Divulgar Fuga:** mostrar a validação (tentar publicar vazio) e depois publicar com foto. Abre os detalhes automaticamente.
3. **Detalhes:** foto, contato, botão de WhatsApp. No DevTools (aba Network), mostrar a requisição `GET /api/perdidos/:id` com o cabeçalho `Authorization` e a foto vindo de `/api/perdidos/:id/foto`.
4. **Lista:** busca (digitar sem acento) e filtro por status.
5. **Editar:** trocar a foto e salvar.
6. **Marcar como encontrado:** mostrar o diálogo, confirmar e ver o selo mudar.
7. **Outra conta** (janela anônima): abrir a mesma publicação e mostrar que os controles de gerenciamento não aparecem. Abrir `/perdidos/<id>/editar` e mostrar "Edição não permitida".
8. **Segurança, opcional:** abrir a URL da foto sem login ou fora do app e mostrar o 401.
9. **Excluir:** confirmar e voltar à lista com o aviso.
10. **Testes:** rodar `npm run test:perdidos` e mostrar os 23 testes passando e a mensagem de limpeza.

Antes de apresentar: deixe o PostgreSQL ligado, rode `npm start`, abra `http://localhost:3001` e tenha **duas contas com telefone** e uma imagem JPG ou PNG à mão. Não publique avistamentos durante a demonstração, porque eles não podem ser excluídos pela interface.

---

## E. Ordem de estudo

| Ordem | Arquivo | O que estudar | Por quê |
|---|---|---|---|
| 1 | [`server/routes/perdaRoutes.js`](../../server/routes/perdaRoutes.js) | As 7 rotas, `router.use(authenticate)`, `receivePhoto` | Mapa da API em 25 linhas |
| 2 | [`server/middleware/authMiddleware.js`](../../server/middleware/authMiddleware.js) | `autenticarToken` | Como o usuário é identificado |
| 3 | [`server/controllers/perdaController.js`](../../server/controllers/perdaController.js) | `criar` (L97) e `editar` (L151) inteiras; depois `foto` (L268) e `validate` (L42) | Transação, autor, upload e foto privada estão aqui |
| 4 | Tabela `publica_perda` ([`banco_peludinhos.sql:42-64`](../../database/banco_peludinhos.sql#L42-L64) e [`137-141`](../../database/banco_peludinhos.sql#L137-L141)) | Colunas obrigatórias, a chave estrangeira e o status padrão | Base de todas as consultas |
| 5 | [`src/api.js`](../../src/api.js) | `api` e `apiBlob` | Como o frontend envia o token e trata 401 |
| 6 | [`src/components/FotoPerdido.jsx`](../../src/components/FotoPerdido.jsx) | O `useEffect` inteiro | Foto privada no navegador (blob e revogação) |
| 7 | [`src/components/PerdidoForm.jsx`](../../src/components/PerdidoForm.jsx) | `validatePerdido`, `perdidoFormData`, `friendlyError` | Validação e montagem do multipart |
| 8 | [`src/pages/NovoPerdido.jsx`](../../src/pages/NovoPerdido.jsx) | A função `submit` | Fluxo de cadastro do lado do cliente |
| 9 | [`src/components/GerenciarPerdido.jsx`](../../src/components/GerenciarPerdido.jsx) | `updateStatus`, `deletePerdido`, `singleFlight`, `executeAction` | Status e exclusão com proteção contra duplicidade |
| 10 | [`src/pages/DetalhesPerdido.jsx`](../../src/pages/DetalhesPerdido.jsx) | O `useEffect` de carga, `whatsappLink` e o objeto `manage` | Como a tela reage às ações |
| 11 | [`src/App.jsx`](../../src/App.jsx) + [`src/pages/Auth.jsx`](../../src/pages/Auth.jsx#L15-L19) | `Protected` e `safeRedirect` | Rotas protegidas e retorno após o login |
| 12 | [`src/components/buscaPerdidos.js`](../../src/components/buscaPerdidos.js) | `filterPerdidos`, `sharePerdido` | Busca local e compartilhamento |
| 13 | [`tests/perdidos.test.cjs`](../../tests/perdidos.test.cjs) | `before`/`after` e 2 ou 3 testes | Como a correção foi comprovada |

Com os passos 1 a 7 você já consegue explicar a maior parte das perguntas acima.
