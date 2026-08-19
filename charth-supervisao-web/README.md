# CHARTH – Supervisão Varejo (rebuild Next.js + Firebase)

Esqueleto inicial para reconstruir o app atualmente em Streamlit + Supabase.
Este projeto **não está completo** — é a base estrutural para você continuar.

## O que já está aqui

```
charth-supervisao-web/
├── app/                        → páginas (Next.js App Router)
│   ├── page.tsx                → login
│   ├── dashboard/page.tsx      → dashboard com indicadores
│   ├── avaliacao/nova/page.tsx → formulário de avaliação (11 seções)
│   ├── historico/page.tsx      → histórico de avaliações
│   ├── planos-de-acao/page.tsx → planos de ação
│   └── bonificacao/page.tsx    → cálculo de bonificação trimestral
├── components/
│   ├── Sidebar.tsx             → menu lateral (varia por perfil)
│   ├── ProtectedRoute.tsx      → bloqueia rota por perfil
│   ├── FormSection.tsx         → componente genérico de seção do formulário
│   └── sections/
│       └── SecaoIdentificacao.tsx → exemplo de 1 das 11 seções
├── lib/
│   ├── firebase.ts             → inicialização do Firebase
│   ├── auth.ts                 → perfil do usuário logado, permissões
│   ├── types.ts                → tipos (Loja, Usuario, Avaliacao, etc.)
│   ├── calculations.ts         → média ponderada + bonificação
│   └── firestore-queries.ts    → leitura/escrita no Firestore
├── firestore.rules             → regras de segurança do Firestore
└── .env.local.example          → variáveis de ambiente do Firebase
```

## Status atual (atualizado após ver src/db.py — quase tudo confirmado)

✅ Firebase (Auth + Firestore) criado e testado — login funcionando
✅ As 8 seções reais do formulário estão portadas fielmente.
✅ Média ponderada, status e bonificação por avaliação confirmados.
✅ Dashboard (aba "Visão geral"), Histórico e Planos de Ação com dados reais.
✅ **Limiar real de pendência corrigido**: `nota < 7` (estrito) — eu
   tinha assumido `≤ 7` antes de ver `db.py`, estava errado.
✅ **Correção de algo que eu disse errado antes**: `ACTION_PLAN_LIBRARY`
   do `config.py` **é sim usada** — populada em `build_action_plan_items()`
   e salva no documento do plano (`problema`/`impacto`/`acaoRecomendada`/
   `criterioValidacao` em `lib/types.ts`). O que é real é mais sutil: o
   app original **salva esses campos mas não os exibe na tela** —
   `action_plans_page()` mostra uma sugestão diferente, calculada de
   novo (`_action_suggestion`, já portada em `lib/actionSuggestions.ts`).
   O rebuild replica as duas (ver `app/planos-de-acao/page.tsx`).
✅ **Bônus real, confirmado**: `forms.py` salva `bonus: {}` vazio ao
   criar avaliação — ou seja, o Histórico do app original hoje mostraria
   a coluna de bônus em branco para avaliações novas. O rebuild calcula
   isso ao vivo na tela (`computeBonus`), o que é mais funcional que o
   comportamento atual do app original — deixei uma nota visível sobre
   essa diferença no Histórico.
✅ Responsável padrão de um plano = gerente da loja (confirmado).

✅ **Identidade visual real portada** (`app/globals.css`, a partir de
   `src/ui.py`): paleta de cores CHARTH (preto, rosé, dourado, bronze),
   tipografia (fallback da fonte licenciada SIMPLO), cards, pill de
   status, hero do formulário. Componentes `Header` e `StatusPill`
   espelham `header()` e `score_badge()` do original.
✅ **Segunda correção de algo que eu disse errado**: `score_status()`
   (calculations.py) **não é código morto** — é usado por
   `score_badge()` em `ui.py`. Ainda não vimos onde `score_badge()` em
   si é chamado no app original, mas a função tem uso real confirmado,
   diferente do que eu tinha concluído antes.

## Arquivos do app original já vistos (núcleo completo)

`config.py`, `forms.py`, `calculations.py`, `dashboard.py`, `db.py`,
`auth.py`, `ui.py` — todos os arquivos principais do app Streamlit já
foram revisados. O que falta é trabalho de infraestrutura/plataforma
(lista abaixo), não mais entendimento do sistema original.

✅ **Bug real corrigido, achado no teste**: "última avaliação por loja"
   não desempatava corretamente quando duas avaliações da mesma loja
   tinham a mesma data (comum em testes, possível em uso real). Ajustado
   com um campo `criadoEm` (timestamp de inserção), replicando o
   desempate por `id` do `dashboard.py` original.
✅ **Dashboard completo — as 4 abas** (`app/dashboard/page.tsx`):
   Visão geral, Lojas (dispersão avaliações × média), Seções (barra +
   mapa de calor loja × seção + pontos de atenção), Evolução (linha do
   tempo com linhas de referência 9/8/7 + comparativo mensal por loja).
✅ **Testado de ponta a ponta** por você: login → formulário completo
   (com o bug do valor padrão das perguntas corrigido) → cálculo real
   → geração automática de planos de ação → histórico → dashboard.

✅ **Upload de fotos implementado** — via base64 comprimido no
   próprio Firestore (não Firebase Storage, que exigiria o plano
   Blaze). `lib/imageCompression.ts` redimensiona e comprime a imagem
   no navegador antes de salvar; há uma verificação de tamanho total
   antes de salvar a avaliação (limite de 1MB por documento no
   Firestore). Fotos aparecem no Histórico junto da observação da
   seção. Isso replica o que o app original já fazia — ele também salva
   base64 direto no Postgres quando usa Supabase.

✅ **Campo `email` e criação de usuários por loja resolvidos** — o
   pacote `charth-migracao-supabase` (separado deste, já entregue) tem
   `criar-usuarios.js`, que cria de uma vez os logins de gestora de
   cada loja + supervisora, já com `email` salvo no documento
   (`lib/types.ts` atualizado; `Usuario.email` agora existe de verdade,
   sem gambiarra de cast).
✅ **Login por usuário resolvido** — a tela de login (`app/page.tsx`)
   agora aceita só o usuário (ex: `admin`), completando
   `@charth.com.br` por baixo dos panos antes de chamar o Firebase Auth.
   A pessoa nunca vê nem digita o domínio — a experiência fica igual à
   do app original, mesmo o Firebase exigindo formato de e-mail
   internamente.
✅ **Migração do Supabase concluída** — o projeto certo foi encontrado
   (banco de produção real, na conta do Guilherme), com 3 avaliações e
   68 planos de ação migrados com sucesso para o Firestore. Bug de
   fuso horário nas datas (encontrado durante o teste da migração)
   corrigido em `lib/dateUtils.ts`.

## O que falta fazer (lista de trabalho)

1. Exportação CSV (dashboard e planos de ação) — hoje só JSON em Configurações.
2. Considerar Cloud Functions (Firebase Admin SDK) se precisar de reset
   de senha direto por admin, como no app original.
3. Deploy no Vercel — ✅ já feito, em produção em
   `charth-supervisao-web-gules.vercel.app`.

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencher com as chaves do Firebase
npm run dev
```
