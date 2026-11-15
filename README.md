# Valhalla RPG

Sistema web interativo do RPG de mesa "Valhalla" — criação de personagens, biblioteca privada por
jogador e campanhas com código de convite.

## Stack

- **Front-end:** React + Vite
- **Backend/dados:** Supabase (Postgres + Auth anônimo + Edge Function)
- **Identidade:** sessão anônima do Supabase + código de recuperação (sem senha/e-mail)
- **Deploy:** GitHub Actions → GitHub Pages

## Rodando localmente

```bash
npm install
npm run dev
```

Crie um arquivo `.env` baseado no `.env.example` com suas chaves do Supabase.
