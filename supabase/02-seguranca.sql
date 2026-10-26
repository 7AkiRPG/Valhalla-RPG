-- ============================================================================
-- VALHALLA RPG — Segurança: exclusão com código do site, acesso às fichas por
-- código da ficha (sorteado, único), tirar personagem da campanha e excluir
-- campanha.
--
-- Rode este arquivo INTEIRO no Supabase: SQL Editor > New query > Run.
-- É seguro rodar mais de uma vez.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Funções auxiliares (repetidas aqui pra este arquivo funcionar sozinho)
-- ---------------------------------------------------------------------------
create or replace function member_campaign_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select campaign_id from campaign_members where player_id = current_player_id()
$$;

-- Compara códigos ignorando hífen, espaços e maiúsculas/minúsculas
create or replace function normalize_code(p text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

-- ---------------------------------------------------------------------------
-- Acessos liberados: quem digitou o código do dono de uma ficha na campanha.
-- Ninguém lê nem escreve nesta tabela direto; só as funções abaixo.
-- ---------------------------------------------------------------------------
create table if not exists character_access (
  character_id uuid not null references characters(id) on delete cascade,
  grantee_player_id uuid not null references players(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (character_id, grantee_player_id)
);
alter table character_access enable row level security;

-- Fichas que o jogador atual pode abrir por ter digitado o código.
-- O acesso só vale enquanto a ficha continua na mesma campanha e o jogador
-- continua nela.
create or replace function accessible_character_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select a.character_id
  from character_access a
  join characters c on c.id = a.character_id
  where a.grantee_player_id = current_player_id()
    and c.campaign_id = a.campaign_id
    and a.campaign_id in (select member_campaign_ids())
$$;

-- Quando uma ficha muda de campanha (ou sai dela), os acessos liberados caem.
create or replace function clear_character_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from character_access where character_id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_clear_character_access on characters;
create trigger trg_clear_character_access
  after update of campaign_id on characters
  for each row
  when (old.campaign_id is distinct from new.campaign_id)
  execute function clear_character_access();

-- ---------------------------------------------------------------------------
-- Código da ficha: sorteado, único, sem hífen (8 letras/números, sem os
-- confusos 0, O, 1, I). É o que o dono passa para quem pode abrir a ficha.
-- ---------------------------------------------------------------------------
alter table characters add column if not exists access_code text;

-- Gera um código e confere se já existe; se existir, sorteia outro.
-- O tamanho do alfabeto precisa dividir 256 (32 símbolos) pra o sorteio ser
-- uniforme. security definer: precisa enxergar os códigos de TODAS as fichas,
-- não só os do jogador que está criando. O lock evita que duas criações
-- simultâneas sorteiem o mesmo código.
create or replace function generate_unique_code(
  p_len integer default 8,
  p_alphabet text default 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  usable integer[] := array[0,1,2,3,4,5,9,10,11,12,13,14,15]; -- bytes 6 e 8 do uuid têm bits fixos
  alpha_len integer := length(p_alphabet);
  attempt integer := 0;
  candidate text;
  bytes bytea;
  i integer;
begin
  if p_len < 1 or p_len > array_length(usable, 1) then
    raise exception 'Tamanho de código inválido.';
  end if;

  perform pg_advisory_xact_lock(hashtext('valhalla_character_code'));

  loop
    attempt := attempt + 1;
    if attempt > 200 then
      raise exception 'Não foi possível gerar um código único.';
    end if;

    bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    candidate := '';
    for i in 1..p_len loop
      candidate := candidate || substr(p_alphabet, 1 + (get_byte(bytes, usable[i]) % alpha_len), 1);
    end loop;

    if not exists (select 1 from characters where access_code = candidate) then
      return candidate;
    end if;
  end loop;
end;
$$;

-- Toda ficha nova ganha um código sorteado (qualquer valor vindo do cliente é
-- ignorado — senão dava pra "testar" códigos tentando criar fichas).
create or replace function set_character_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.access_code := generate_unique_code();
  return new;
end;
$$;

drop trigger if exists trg_set_character_code on characters;
create trigger trg_set_character_code
  before insert on characters
  for each row
  execute function set_character_code();

-- O código só muda pela função regenerate_character_code (abaixo).
create or replace function protect_character_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(current_setting('valhalla.allow_code_change', true), '') <> 'on' then
    new.access_code := old.access_code;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_character_code on characters;
create trigger trg_protect_character_code
  before update of access_code on characters
  for each row
  execute function protect_character_code();

-- Fichas que já existiam ganham o código agora.
do $$
begin
  perform set_config('valhalla.allow_code_change', 'on', true);
  update characters set access_code = generate_unique_code() where access_code is null;
  perform set_config('valhalla.allow_code_change', 'off', true);
end;
$$;

create unique index if not exists characters_access_code_key on characters (access_code);
alter table characters alter column access_code set not null;

-- Gerar outro código (só o dono). Quem tinha aberto a ficha perde o acesso.
create or replace function regenerate_character_code(p_character_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := current_player_id();
  new_code text;
begin
  if me is null then
    raise exception 'Jogador não identificado.';
  end if;

  if not exists (select 1 from characters where id = p_character_id and player_id = me) then
    raise exception 'Personagem não encontrado.';
  end if;

  new_code := generate_unique_code();

  perform set_config('valhalla.allow_code_change', 'on', true);
  update characters set access_code = new_code where id = p_character_id and player_id = me;
  perform set_config('valhalla.allow_code_change', 'off', true);

  delete from character_access where character_id = p_character_id;

  return new_code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Regras de leitura/escrita das fichas
--   - ler: dono, ou quem liberou com o código (dentro da campanha)
--   - criar / alterar direto: só o dono
--   - excluir: ninguém direto, só pela função delete_character (com código)
--   - editar por quem liberou: pela função save_character_sheet
-- ---------------------------------------------------------------------------
drop policy if exists "manage own characters" on characters;
drop policy if exists "view campaign characters" on characters;
drop policy if exists "select own or unlocked characters" on characters;
drop policy if exists "insert own characters" on characters;
drop policy if exists "update own characters" on characters;

create policy "select own or unlocked characters" on characters
  for select using (
    player_id = current_player_id()
    or id in (select accessible_character_ids())
  );

create policy "insert own characters" on characters
  for insert with check (player_id = current_player_id());

create policy "update own characters" on characters
  for update using (player_id = current_player_id())
  with check (player_id = current_player_id());

-- ---------------------------------------------------------------------------
-- Excluir personagem: exige o código do site (código de recuperação) do dono
-- ---------------------------------------------------------------------------
create or replace function delete_character(p_character_id uuid, p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := current_player_id();
  my_code text;
begin
  if me is null then
    raise exception 'Jogador não identificado.';
  end if;

  select recovery_code into my_code from players where id = me;

  if length(normalize_code(p_code)) = 0 or normalize_code(p_code) <> normalize_code(my_code) then
    raise exception 'Código incorreto.';
  end if;

  delete from characters where id = p_character_id and player_id = me;
  if not found then
    raise exception 'Personagem não encontrado.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Campanha: listar personagens (só nome/nível/dono, sem a ficha completa)
-- ---------------------------------------------------------------------------
create or replace function list_campaign_characters(p_campaign_id uuid)
returns table (id uuid, name text, player_id uuid, nivel integer, can_open boolean)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if p_campaign_id not in (select member_campaign_ids()) then
    raise exception 'Você não participa dessa campanha.';
  end if;

  return query
    select
      c.id,
      c.name,
      c.player_id,
      case
        when (c.sheet->>'nivelAtual') ~ '^-?[0-9]+$' then (c.sheet->>'nivelAtual')::integer
        when (c.sheet->>'nivel') ~ '^-?[0-9]+$' then (c.sheet->>'nivel')::integer
        else 1
      end,
      (c.player_id = current_player_id() or c.id in (select accessible_character_ids()))
    from characters c
    where c.campaign_id = p_campaign_id
    order by c.created_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- Abrir a ficha de outro jogador na campanha: exige o código da ficha
-- ---------------------------------------------------------------------------
create or replace function unlock_character(p_character_id uuid, p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := current_player_id();
  ch record;
begin
  if me is null then
    raise exception 'Jogador não identificado.';
  end if;

  select c.id, c.player_id, c.campaign_id, c.access_code into ch from characters c where c.id = p_character_id;
  if not found or ch.campaign_id is null then
    raise exception 'Ficha não disponível.';
  end if;

  if ch.campaign_id not in (select member_campaign_ids()) then
    raise exception 'Você não participa dessa campanha.';
  end if;

  if ch.player_id = me then
    return;
  end if;

  if length(normalize_code(p_code)) = 0 or normalize_code(p_code) <> normalize_code(ch.access_code) then
    raise exception 'Código incorreto.';
  end if;

  insert into character_access (character_id, grantee_player_id, campaign_id)
  values (ch.id, me, ch.campaign_id)
  on conflict (character_id, grantee_player_id)
  do update set campaign_id = excluded.campaign_id, granted_at = now();
end;
$$;

-- ---------------------------------------------------------------------------
-- Salvar a ficha: o dono, ou quem liberou com o código
-- ---------------------------------------------------------------------------
create or replace function save_character_sheet(p_character_id uuid, p_name text, p_sheet jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := current_player_id();
begin
  if me is null then
    raise exception 'Jogador não identificado.';
  end if;

  update characters
  set name = coalesce(nullif(btrim(p_name), ''), characters.name),
      sheet = p_sheet,
      updated_at = now()
  where characters.id = p_character_id
    and (characters.player_id = me or characters.id in (select accessible_character_ids()));

  if not found then
    raise exception 'Sem permissão para salvar esta ficha.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tirar personagem da campanha sem apagá-lo: o dono, ou o mestre da campanha
-- ---------------------------------------------------------------------------
create or replace function remove_character_from_campaign(p_character_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := current_player_id();
  ch record;
  gm uuid;
begin
  select c.id, c.player_id, c.campaign_id into ch from characters c where c.id = p_character_id;
  if not found or ch.campaign_id is null then
    raise exception 'Esse personagem não está em uma campanha.';
  end if;

  select gm_player_id into gm from campaigns where id = ch.campaign_id;

  if me is distinct from ch.player_id and me is distinct from gm then
    raise exception 'Sem permissão para tirar este personagem.';
  end if;

  update characters set campaign_id = null where id = ch.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Excluir campanha: só quem criou. Os personagens NÃO são apagados (só ficam
-- sem campanha), e os acessos liberados caem junto.
-- ---------------------------------------------------------------------------
drop policy if exists "gm deletes campaign" on campaigns;
create policy "gm deletes campaign" on campaigns
  for delete using (gm_player_id = current_player_id());
