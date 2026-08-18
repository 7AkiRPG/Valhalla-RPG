# Valhalla RPG

Sistema web interativo do RPG de mesa "Valhalla" — criação de personagens, biblioteca privada por
jogador e campanhas com código de convite.

## Stack

- **Front-end:** React + Vite
- **Backend/dados:** Supabase (Postgres + Auth anônimo + Edge Function)
- **Identidade:** sessão anônima do Supabase + código de recuperação (sem senha/e-mail)
- **Deploy:** GitHub Actions → GitHub Pages

## Passo a passo para colocar no ar

### 1. Rodar o schema no Supabase

No painel do Supabase, vá em **SQL Editor > New query**, cole o conteúdo inteiro de
`supabase/schema.sql` e clique em **Run**. Isso cria as tabelas, as políticas de segurança (RLS) e
as funções `ensure_player` e `join_campaign_by_code`.

### 2. Publicar a Edge Function de recuperação

A função `recover-access` precisa da chave *service role* (a secreta, nunca exposta no código do
site). Para publicá-la:

```bash
npm install -g supabase
supabase login
supabase link --project-ref ossjcxhyozaulsuhears
supabase functions deploy recover-access
```

Depois do deploy, garanta que as variáveis de ambiente da função estão configuradas (o Supabase já
injeta `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` automaticamente em Edge
Functions — não precisa configurar nada manualmente).

### 3. Subir este projeto para o GitHub

```bash
git init
git add .
git commit -m "Projeto inicial do Valhalla RPG"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/Valhalla-RPG.git
git push -u origin main
```

> O arquivo `.env` (com suas chaves reais) está no `.gitignore` e **não será enviado** ao GitHub —
> isso é proposital, mesmo sendo uma chave pública, é boa prática não versionar.

### 4. Configurar os "Secrets" do GitHub Actions

O build automático (GitHub Actions) precisa das mesmas variáveis do `.env`, mas configuradas como
segredo do repositório:

No GitHub: **Settings > Secrets and variables > Actions > New repository secret**, crie duas:

- `VITE_SUPABASE_URL` → `https://ossjcxhyozaulsuhears.supabase.co`
- `VITE_SUPABASE_ANON_KEY` → `sb_publishable_ujGDPJkNVivHA7t0IxM73A_UnOZaNP8`

### 5. Ativar o GitHub Pages

Em **Settings > Pages**, em "Build and deployment", escolha a fonte **GitHub Actions** (se ainda
não tiver feito isso). A partir do próximo `git push` na branch `main`, o site já builda e publica
sozinho. A URL final fica algo como:

```
https://SEU-USUARIO.github.io/Valhalla-RPG/
```

## Rodando localmente

```bash
npm install
npm run dev
```

O arquivo `.env` já está preenchido com as chaves do seu projeto Supabase — só rodar.

## Estrutura do projeto

```
src/
  data/         # Regras do sistema: linhagens, caminhos, magias, equipamentos
  lib/          # Cliente Supabase, identidade do jogador, cálculo de status, dados
  components/   # Layout e rolador de dados
  pages/        # Cada rota do site
supabase/
  schema.sql               # Tabelas + RLS + funções do banco
  functions/recover-access # Edge Function de recuperação de acesso
```

## O que já funciona

- Identidade sem cadastro (sessão anônima + código de recuperação)
- Criação de personagem em etapas (atributos, conjuração, linhagem, caminho, talento,
  equipamento, magias) com PV/PD/PM calculados automaticamente
- Biblioteca privada de personagens
- Criação de campanha com código de convite, entrada por código, e vínculo de personagens à
  campanha (visíveis para todos os membros)
- Rolador de dados 2d12 com detecção de crítico e falha crítica

## Próximos passos sugeridos

- Preencher os patamares 2–5 dos caminhos (o documento de regras ainda não define todos)
- Edição de personagem após a criação (hoje só existe visualização + criação)
- Progressão de nível (ganhar atributos, caminhos, magias e ascensões automaticamente)
- Tela de combate com PV/PD/PM editáveis em tempo real
