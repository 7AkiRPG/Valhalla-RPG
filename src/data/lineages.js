// Linhagens — extraídas do documento "Valhalla" (Guia Rápido)
// hpFormula é avaliada com { nivel, corpo }

export const LINEAGES = [
  {
    id: 'humano',
    name: 'Humano',
    hpBase: 7,
    abilities: [
      {
        name: 'Determinação Humana',
        desc: 'Uma vez por cena, quando falhar em um teste, pode escolher ter sucesso.',
      },
      {
        name: 'Versatilidade Imperial',
        desc: 'Recebe 1 ponto de atributo e 1 caminho.',
      },
    ],
  },
  {
    id: 'dornak',
    name: 'Dornak',
    hpBase: 7,
    abilities: [
      {
        name: 'Sede de Sangue',
        desc: 'Contra alvos com metade ou menos de seus PV máximos, sua margem de crítico aumenta em 1.',
      },
      {
        name: 'Corvos',
        desc: 'Como reação (1PA), pode gastar 2PD para cada corvo que se transformar, com um limite de nível corvos. Recebe 1d4 de esquiva por corvo.',
      },
    ],
  },
  {
    id: 'drakonato',
    name: 'Drakonato',
    hpBase: 10,
    abilities: [
      {
        name: 'Herança Divina',
        desc: 'Escolha um tipo de dano ao criar o personagem. Recebe resistência a esse tipo de dano, e ataques desarmados podem causar 1d2 adicional desse tipo.',
      },
      {
        name: 'Arma de Sopro',
        desc: 'Como ação (2PA), expele energia elemental em linha de 9m ou cone de 5m. Causa 1d4 base + 1d2 por PD gasto.',
      },
    ],
  },
  {
    id: 'durin',
    name: 'Durin',
    hpBase: 9,
    abilities: [
      {
        name: 'Pele de Pedra',
        desc: 'Sua resistência natural reduz o dano físico recebido em Nível (mínimo 1). Dobra contra o primeiro ataque de cada combate.',
      },
      {
        name: 'Firmeza das Montanhas',
        desc: 'Ao bloquear, soma sua vantagem de Corpo ao resultado.',
      },
    ],
  },
  {
    id: 'elarin',
    name: 'Elarin',
    hpBase: 9,
    abilities: [
      {
        name: 'Arcanista Nato',
        desc: 'Começa com o caminho arcano "Pergaminhos Arcanos" como caminho extra na criação.',
      },
      {
        name: 'Corpo de Mana',
        desc: 'Reduz o dano mágico recebido em Nível (mínimo 1). Recebe metade dos pontos de Alma em pontos de Corpo.',
      },
    ],
  },
  {
    id: 'fadas',
    name: 'Fadas',
    hpBase: 7,
    abilities: [
      {
        name: 'Véu Ilusório',
        desc: 'Como ação (1PA), 2PD e 1PM, cria uma ilusão sobre si (regra completa a definir).',
      },
    ],
  },
  {
    id: 'goblin',
    name: 'Goblin',
    hpBase: 7,
    abilities: [],
  },
  {
    id: 'gorgonas',
    name: 'Gorgonas',
    hpBase: 7,
    abilities: [
      {
        name: 'Olhar Pétreo',
        desc: 'Como ação (2PA), foca o olhar em um alvo, que testa Alma contra a sua. Falha: Paralisado até o fim do seu próximo turno. Falha por 10+: Petrificado por 3 minutos.',
      },
      {
        name: 'Cabelos Serpentinos',
        desc: 'Ataques corpo-a-corpo causam Veneno 1. Vantagem em testes de percepção.',
      },
    ],
  },
  {
    id: 'lupgar',
    name: 'Lupgar',
    hpBase: 7,
    abilities: [
      {
        name: 'Licantropia',
        desc: 'Como ação (1PA), assume forma de lobo ou híbrida. Lobo: rastreio e olfato aguçado. Híbrida: ataques desarmados causam dado de dano maior.',
      },
      {
        name: 'Uivo da Alcateia',
        desc: 'Como ação (1PA), concede vantagem no próximo teste a um aliado que ouça. Uma vez por turno.',
      },
    ],
  },
  {
    id: 'nykari',
    name: 'Nykari',
    hpBase: 7,
    abilities: [
      {
        name: 'Reflexos Felinos',
        desc: 'Ao ser alvo de um ataque, pode gastar 2PD e 1PA como reação pra se mover até 2m antes de ser atingido, podendo fazer o ataque errar.',
      },
    ],
  },
  {
    id: 'sauryk',
    name: 'Sauryk',
    hpBase: 7,
    abilities: [
      {
        name: 'Mordida Venenosa',
        desc: 'Após um ataque corpo a corpo, gaste 1PD para tentar morder (Luta). Se acertar, aplica Veneno 1.',
      },
      {
        name: 'Sangue Réptil',
        desc: 'Vantagem em testes para resistir a efeitos ao longo do tempo. Sua peçonha pode criar antídoto pra maioria dos venenos.',
      },
    ],
  },
  {
    id: 'sylvarin',
    name: 'Sylvarin',
    hpBase: 7,
    abilities: [
      {
        name: 'Raízes Profundas',
        desc: 'Em contato com terra natural, gaste 1PD (ação livre) pra se enraizar: imóvel, regenera 1d2 PV/turno, ataques +1d2. Sair custa 1PA.',
      },
      {
        name: 'Casca Viva',
        desc: 'Reduz dano de armas cortantes/perfurantes em Nível (mín. 1). Em interlúdio na terra natural, regenera PV/PD/PM igual ao Nível.',
      },
    ],
  },
  {
    id: 'tharkay',
    name: "Thar'kay",
    hpBase: 10,
    abilities: [
      {
        name: 'Passo Dimensional',
        desc: 'Ação livre, gaste 3PD para viajar à dimensão de origem (retornar custa +3PD). Lá, é inalcançável por meios convencionais.',
      },
    ],
  },
  {
    id: 'titaniag',
    name: 'Titaniag',
    hpBase: 7,
    abilities: [
      {
        name: 'Pulso da Terra',
        desc: 'Sente vibrações pelo solo; não pode ser surpreendido por criaturas tocando o mesmo chão. Gaste 1PD pra identificar nº de criaturas num raio de 30m.',
      },
    ],
  },
  {
    id: 'tortles',
    name: 'Tortles',
    hpBase: 9,
    abilities: [
      {
        name: 'Carapaça Fortalecida',
        desc: 'Ao bloquear, soma o Atributo Corpo ao resultado.',
      },
      {
        name: 'Resistência Anciã',
        desc: 'Vantagem contra medo, encantamento e condições mentais. Uma vez por combate, ignora completamente um efeito de condição.',
      },
    ],
  },
]

export function computeMaxHp(lineageId, nivel, corpo) {
  const lineage = LINEAGES.find((l) => l.id === lineageId)
  const base = lineage ? lineage.hpBase : 7
  return base + nivel + corpo * nivel
}
