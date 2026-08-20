# Migração Supabase → Firestore

Duas partes: **(1) exportar** os dados do Supabase — isso só o Guilherme
pode fazer, mas não exige dar acesso a ninguém — e **(2) importar** os
arquivos exportados para o Firestore, que você faz aqui, sozinho.

---

## Parte 1 — O que pedir ao Guilherme (sem precisar de acesso)

Ele precisa exportar **4 tabelas** como CSV, direto do painel do
Supabase, e te mandar os 4 arquivos (por e-mail, Drive, WhatsApp — como
preferirem). Passo a passo pra ele:

1. Entra no [painel do Supabase](https://supabase.com/dashboard) → o
   projeto do `charth-supervisao-varejo`
2. Menu lateral → **Table Editor**
3. Pra cada uma destas tabelas: **`evaluations`**, **`action_plans`**,
   **`users`**, **`stores`**
   - Seleciona a tabela na lista à esquerda
   - Clica no botão de exportar (ícone de seta pra baixo / "Export
     data", geralmente perto do canto superior direito da tabela)
   - Escolhe **"Export table as CSV"**
   - Salva com o nome exato: `evaluations.csv`, `action_plans.csv`,
     `users.csv`, `stores.csv`

Se ele preferir usar o **SQL Editor** em vez do Table Editor, o
equivalente é rodar `SELECT * FROM evaluations;` (e o mesmo pras outras
3 tabelas) e clicar em "Download CSV" no resultado.

**Opcional, só se houver fotos de Visual Merchandising salvas no
Supabase**: pedir também a tabela `uploaded_files` (ela guarda o
conteúdo da foto em base64). Sem isso, a migração funciona perfeitamente
— só as fotos antigas não vêm, o que já é uma perda pequena.

---

## Parte 2 — Importar os CSVs para o Firestore (você faz sozinho)

### Pré-requisitos

1. **Node.js** instalado (você já tem, por causa do projeto Next.js)
2. Uma **chave de conta de serviço** do Firebase:
   - Firebase Console → ⚙️ **Configurações do projeto** → aba
     **Contas de serviço** → **Gerar nova chave privada**
   - Isso baixa um arquivo `.json` — salva ele nesta pasta
     (`charth-migracao-supabase/`) com o nome `serviceAccountKey.json`
   - ⚠️ **Esse arquivo dá acesso total de administrador ao seu banco.**
     Nunca suba ele para o GitHub (o `.gitignore` desta pasta já está
     configurado pra ignorá-lo, mas confirme antes de fazer commit).

### Passos

1. Coloca os 4 (ou 5, se incluir fotos) arquivos CSV do Guilherme dentro
   desta mesma pasta (`charth-migracao-supabase/`)
2. Instala as dependências:
   ```
   npm install
   ```
3. Roda a importação:
   ```
   node importar.js
   ```
4. O script mostra no terminal quantas avaliações e planos de ação
   foram importados, e avisa se algum registro foi pulado (por exemplo,
   um plano de ação cujo `evaluation_id` não foi encontrado).
5. Confere no Firestore Console (coleções `avaliacoes` e
   `planosDeAcao`) se os documentos novos apareceram.

### O que a migração faz (e o que não faz)

✅ Migra: data, supervisora, gerente, loja, todas as notas por seção,
   observações, perguntas estratégicas, falta grave disciplinar, média
   ponderada, status, bônus (se já tinha sido calculado na época).

⚠️ **Atenção ao campo `supervisoraUid`**: no Supabase, quem criou a
   avaliação é identificado por um **username** (ex: `supervisora`),
   não por um UID do Firebase Auth — porque o sistema de login era
   diferente. A migração salva esse username como texto no campo
   `supervisoraUid`, só para referência histórica; ele **não** vai
   corresponder a nenhum usuário real do Firebase Auth.

❌ Não migra automaticamente: fotos (a não ser que você rode o passo
   opcional com `uploaded_files.csv` — ver `importar-fotos.js`).

❌ Não recria usuários/senhas no Firebase Auth — a tabela `users.csv`
   exportada serve só de referência (quem existia, qual perfil, qual
   loja); criar os logins de verdade no Firebase Auth continua sendo um
   passo manual (Authentication → Add user), como fizemos com o seu.

---

## Parte 3 — Criar os logins das lojas de uma vez (`criar-usuarios.js`)

Em vez de criar cada gestora manualmente pelo console do Firebase
(Authentication → Add user, depois o documento em `usuarios` no
Firestore, repetindo pra cada loja), este script faz tudo de uma vez.

1. Abre `criar-usuarios.js` e edita a lista `USUARIOS`:
   - Confirma o domínio de e-mail real da Charth
   - Troca as senhas placeholder por senhas fortes e diferentes
   - Ajusta os nomes, se quiser usar o nome da pessoa em vez de
     "Gestora <Loja>"
2. Roda:
   ```
   node criar-usuarios.js
   ```
3. O script cria, para cada usuário da lista: o login no Firebase
   Authentication **e** o documento correspondente na coleção
   `usuarios` do Firestore (com `nome`, `perfil`, `lojaVinculada` e
   agora também `email` — necessário para o botão "Enviar e-mail de
   redefinição" funcionar, na tela de Configurações do app).
4. Se um e-mail já existir, o script pula ele (não sobrescreve) e avisa.

**Depois de rodar**, anote as senhas usadas em um gerenciador de senhas
e avise cada gestora/supervisora do e-mail e senha temporária — a
recomendação é pedir que troquem a senha no primeiro acesso, pela
própria tela de Configurações do app.
