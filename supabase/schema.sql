-- ============================================================================
-- VALHALLA RPG — Schema do banco de dados
-- Cole este arquivo inteiro no Supabase: SQL Editor > New query > Run
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tabela: players
-- Representa uma "pessoa" no sistema, independente do dispositivo/sessão.
-- ---------------------------------------------------------------------------
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  recovery_code text unique not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabela: player_auth_links
-- Liga uma sessão anônima do Supabase Auth (auth.uid()) a um player.
-- Um player pode ter vários auth_id ao longo do tempo (um por dispositivo
-- que "recuperou o acesso" com o código).
-- ---------------------------------------------------------------------------
create table if not exists player_auth_links (
  auth_id uuid primary key references auth.users(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabela: campaigns
-- ---------------------------------------------------------------------------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  gm_player_id uuid not null references players(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabela: campaign_members
-- ---------------------------------------------------------------------------
create table if not exists campaign_members (
  campaign_id uuid not null references campaigns(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (campaign_id, player_id)
);

-- ---------------------------------------------------------------------------
-- Tabela: characters
-- A ficha inteira fica em "sheet" (jsonb) pra facilitar evolução das regras
-- sem precisar migrar o schema toda hora.
-- ---------------------------------------------------------------------------
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  name text not null default 'Campeão sem nome',
  sheet jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Função auxiliar: resolve o player_id do usuário autenticado atual
-- ---------------------------------------------------------------------------
create or replace function current_player_id()
returns uuid
language sql
security definer
stable
as $$
  select player_id from player_auth_links where auth_id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table players enable row level security;
alter table player_auth_links enable row level security;
alter table campaigns enable row level security;
alter table campaign_members enable row level security;
alter table characters enable row level security;

-- players: só enxerga/edita o próprio registro
create policy "own player row" on players
  for select using (id = current_player_id());
create policy "update own player row" on players
  for update using (id = current_player_id());

-- player_auth_links: só enxerga o próprio vínculo
create policy "own auth link" on player_auth_links
  for select using (auth_id = auth.uid());

-- characters: dono sempre tem acesso total
create policy "manage own characters" on characters
  for all using (player_id = current_player_id())
  with check (player_id = current_player_id());

-- characters: membros da mesma campanha podem VER (não editar) personagens
-- que estão naquela campanha
create policy "view campaign characters" on characters
  for select using (
    campaign_id is not null
    and campaign_id in (
      select campaign_id from campaign_members where player_id = current_player_id()
    )
  );

-- campaigns: quem é membro (inclui o mestre) pode ver a campanha
create policy "view own campaigns" on campaigns
  for select using (
    gm_player_id = current_player_id()
    or id in (select campaign_id from campaign_members where player_id = current_player_id())
  );
create policy "create campaign" on campaigns
  for insert with check (gm_player_id = current_player_id());

-- campaign_members: membros de uma campanha podem ver quem mais está nela
create policy "view campaign members" on campaign_members
  for select using (
    campaign_id in (select campaign_id from campaign_members where player_id = current_player_id())
  );
create policy "join campaign" on campaign_members
  for insert with check (player_id = current_player_id());

-- ---------------------------------------------------------------------------
-- RPC: garante que a sessão anônima atual tem um player vinculado.
-- Se já existir, apenas retorna. Se não, cria o player + código de
-- recuperação + vínculo, tudo em uma vez. Chamado automaticamente pelo
-- app assim que uma sessão anônima é criada.
-- ---------------------------------------------------------------------------
create or replace function ensure_player()
returns table (player_id uuid, recovery_code text, is_new boolean)
language plpgsql
security definer
as $$
declare
  existing_id uuid;
  new_id uuid;
  new_code text;
begin
  select p.id, p.recovery_code into existing_id, new_code
  from player_auth_links l
  join players p on p.id = l.player_id
  where l.auth_id = auth.uid();

  if existing_id is not null then
    return query select existing_id, new_code, false;
    return;
  end if;

  new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' ||
              upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));

  insert into players (recovery_code) values (new_code) returning id into new_id;
  insert into player_auth_links (auth_id, player_id) values (auth.uid(), new_id);

  return query select new_id, new_code, true;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: entrar em uma campanha usando o código de convite
-- (evita expor a tabela "campaigns" inteira só pra achar o código)
-- ---------------------------------------------------------------------------
create or replace function join_campaign_by_code(invite_code text)
returns uuid
language plpgsql
security definer
as $$
declare
  target_campaign_id uuid;
  me uuid := current_player_id();
begin
  if me is null then
    raise exception 'Jogador não identificado';
  end if;

  select id into target_campaign_id from campaigns where code = invite_code;

  if target_campaign_id is null then
    raise exception 'Código de campanha inválido';
  end if;

  insert into campaign_members (campaign_id, player_id)
  values (target_campaign_id, me)
  on conflict do nothing;

  return target_campaign_id;
end;
$$;
