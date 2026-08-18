// Caminhos — extraídos do documento "Valhalla" (Guia Rápido)
// Cada caminho tem patamares (1º a 5º); nem todos os patamares têm
// habilidades definidas nas regras ainda — ficam como placeholder.

export const PATHS = [
  {
    id: 'arcano',
    name: 'Arcano',
    patamares: {
      1: [
        { name: 'Ás na Manga', desc: 'Recebe um espaço de truque para cada atributo de conjuração que você tenha.' },
        { name: 'Expansão de Conhecimento', desc: 'Sempre que desbloquear um nível de magia, ganha mais um espaço para magias.' },
        { name: 'Mana Ampliada', desc: '+3 de mana máxima, e +2 para cada caminho Arcano.' },
      ],
      2: [{ name: 'Fonte de Mana', desc: 'Regenera 1PM por rodada.' }],
      3: [],
      4: [{ name: 'Dom Arcano', desc: '(a definir)' }],
      5: [],
    },
  },
  {
    id: 'dor',
    name: 'Dor',
    patamares: {
      1: [
        {
          name: 'Determinação Resistente',
          desc: 'Sempre que fizer um bloqueio recebe 1PD; caso não sofra dano, recebe +2.',
        },
        {
          name: 'Fúria',
          desc: 'No início de todas as rodadas sofre 3 de dano verdadeiro em PVs. Enquanto ativo, todos os ataques são críticos comuns.',
        },
        { name: 'Sangue de Ferro', desc: 'Adquire Resistência Volátil 5 a dano físico.' },
      ],
      2: [],
      3: [
        {
          name: 'Frenesi',
          desc: '(Exigência: Fúria) Sofre 5 de dano verdadeiro em PVs e PDs. Enquanto ativo, todos os ataques são críticos de margem.',
        },
      ],
      4: [],
      5: [
        {
          name: 'Ódio Incontrolável',
          desc: '(Exigência: Frenesi) Sofre 10 de dano verdadeiro em PVs, PDs e PMs. Ataques são críticos de margem, causam dano máximo e dobram o dano.',
        },
      ],
    },
  },
  {
    id: 'guerra',
    name: 'Guerra',
    patamares: {
      1: [
        {
          name: 'Estilo de Combate',
          desc: 'Pode ser pego duas vezes (habilidades diferentes): Armas Leves, Armas Pesadas, Artista Marcial, Atirador ou Desarmado — cada um com bônus próprio.',
        },
        {
          name: 'Estandarte',
          desc: 'Gasta 1PD e 1PA para cravar uma bandeira de guerra; aliados em raio de 5m usam os status defensivos mais altos do grupo.',
        },
        {
          name: 'Grito de Guerra',
          desc: 'Antes de cada combate, um discurso motivador dá vantagem aos aliados que entendam a mensagem, até receberem dano.',
        },
      ],
      2: [],
      3: [],
      4: [],
      5: [],
    },
  },
  {
    id: 'natureza',
    name: 'Natureza',
    patamares: {
      1: [
        { name: 'Fala Animal', desc: 'Capaz de se comunicar com animais e sentir as plantas.' },
        { name: 'Herbalista', desc: 'Pode coletar plantas e preparar remédios, antídotos ou substâncias especiais.' },
        {
          name: 'Rastreador',
          desc: 'Identifica e segue pegadas/marcas/cheiros. Pode fazer duas perguntas sobre a passagem de uma criatura.',
        },
      ],
      2: [],
      3: [],
      4: [],
      5: [],
    },
  },
  {
    id: 'trapaca',
    name: 'Trapaça',
    patamares: {
      1: [
        {
          name: 'Charme',
          desc: 'Gaste 2PD para o alvo testar Mente contra sua DT Arcana. Falha: gasta ações pra se aproximar e não ataca até passar no teste.',
        },
        {
          name: 'Distorcer Aparência',
          desc: 'Por 1PM e 1PD, toma a forma de um humanoide já visto. +1 em testes para enganar disfarçado.',
        },
        {
          name: 'Roubo de Sorte',
          desc: 'Quando alguém tira um bom resultado, pode roubar esse valor pra si (o alvo tem falha automática). Uma vez por cena.',
        },
      ],
      2: [],
      3: [],
      4: [],
      5: [],
    },
  },
]
