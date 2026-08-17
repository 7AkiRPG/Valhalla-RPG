// Equipamentos — extraídos do documento "Valhalla" (Guia Rápido)

export const WEAPONS = [
  { name: 'Adaga', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '12,12', danoCritico: '1x',
    obs: 'Em ataques furtivos ou contra alvo flanqueado, a Margem Crítica passa a ser 10,10.' },
  { name: 'Chicote', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '11,11', danoCritico: '1x',
    obs: 'Alcance de 3m. Pode desarmar (+3 no teste).' },
  { name: 'Cimitarra', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '12,12', danoCritico: '1x', obs: '' },
  { name: 'Clava', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '11,11', danoCritico: '1x',
    obs: 'Acertos críticos causam penalidade crescente de -1 nas reações.' },
  { name: 'Clava Grande', categoria: 'Pesada', dano: '1d6 + Corpo', margemCritica: '11,11', danoCritico: '1x',
    obs: 'Acertos críticos causam penalidade crescente de -2 nas reações.' },
  { name: 'Espada', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '11,11', danoCritico: '2x', obs: '' },
  { name: 'Gládio', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '12,12', danoCritico: '1x',
    obs: 'Com escudo na outra mão: +1 de bloqueio e Dano Crítico passa para 2x.' },
  { name: 'Nunchaku', categoria: 'Leve', dano: '1d4 + Corpo', margemCritica: '12,12', danoCritico: '2x',
    obs: 'Vantagem em teste de aparar.' },
  { name: 'Porrete', categoria: 'Leve', dano: '2x Corpo', margemCritica: '—', danoCritico: '—', obs: 'Não causa crítico.' },
  { name: 'Tridente', categoria: 'Versátil', dano: '(1d4 ou 1d6) + Corpo', margemCritica: '12,12', danoCritico: '3x', obs: '' },
]

export const ARMORS = [
  { name: 'Roupa Reforçada', bonus: '+1 de RD e +2 na Esquiva' },
  { name: 'Cota de Malha', bonus: '+1 de RD físico' },
  { name: 'Armadura Leve', bonus: '+3 de RD físico e -3 na Esquiva' },
  { name: 'Armadura Média', bonus: '+4 de RD físico, -5 na Esquiva e desvantagem em furtividade' },
  { name: 'Armadura Pesada', bonus: '+5 de RD físico, -7 na Esquiva e desvantagem dupla em furtividade' },
  { name: 'Capa Levemente Mágica', bonus: '+2 de RD mágica e vantagem em furtividade' },
  { name: 'Escudo de Madeira', bonus: '+1 de RD' },
]

export const CONJURATION_STYLES = [
  { id: 'mistica', name: 'Mística', desc: 'Faz a magia surgir de forma espontânea.' },
  { id: 'ritualistica', name: 'Ritualística', desc: 'Usa uma série de etapas para usar a magia.' },
  { id: 'artesanistica', name: 'Artesanística', desc: 'Confecciona itens e equipamentos para que a magia possa ser usada.' },
  { id: 'acustica', name: 'Acústica', desc: 'A partir do som é possível conjurar.' },
  { id: 'artistica', name: 'Artística', desc: 'Desenha sob a realidade.' },
]
