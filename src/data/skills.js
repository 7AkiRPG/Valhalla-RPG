export const SKILL_CATEGORIES = [
  {
    id: 'resistencias',
    name: 'Resistências',
    skills: [
      { id: 'potencia', name: 'Potência', desc: 'Resistência física a dano, venenos, exaustão, força bruta de aguentar.' },
      { id: 'foco', name: 'Foco', desc: 'Resistência mental, concentração sob pressão, manter feitiços, ignorar dor/medo.' },
      { id: 'espirito', name: 'Espírito', desc: 'Resistência da alma/vontade contra efeitos místicos, corrupção.' },
    ],
  },
  {
    id: 'corpo',
    name: 'Corpo',
    skills: [
      { id: 'acrobacia', name: 'Acrobacia', desc: 'Equilíbrio, saltos, quedas, manobras ágeis.' },
      { id: 'atletismo', name: 'Atletismo', desc: 'Correr, nadar, escalar, força física aplicada a esforços contínuos.' },
      { id: 'furtividade', name: 'Furtividade', desc: 'Mover-se sem ser notado, esconder-se.' },
      { id: 'hab_arma', name: 'Hab. c/ Arma', desc: 'Proficiência em usar armas.' },
      { id: 'iniciativa', name: 'Iniciativa', desc: 'Rapidez de reação no início de um combate/conflito.' },
      { id: 'luta', name: 'Luta', desc: 'Combate corpo a corpo desarmado.' },
      { id: 'precisao', name: 'Precisão', desc: 'Mira e acerto em ataques à distância.' },
      { id: 'prestidigitacao', name: 'Prestidigitação', desc: 'Destreza manual fina, truques de mão, furtar, desarmar armadilhas.' },
      { id: 'reflexo', name: 'Reflexo', desc: 'Capacidade de reagir rapidamente para evitar perigos.' },
    ],
  },
  {
    id: 'mente',
    name: 'Mente',
    skills: [
      { id: 'atuacao', name: 'Atuação', desc: 'Performar, enganar através de teatro.' },
      { id: 'conducao', name: 'Condução', desc: 'Conduzir veículos ou montarias.' },
      { id: 'confeccao', name: 'Confecção', desc: 'Criar/fabricar itens, artesanato.' },
      { id: 'bioquimica', name: 'Bioquímica', desc: 'Conhecimento de substâncias, venenos, drogas, composição orgânica.' },
      { id: 'engenharia', name: 'Engenharia', desc: 'Conhecimento científico sobre mecânica, energia, matéria.' },
      { id: 'historiografia', name: 'Historiografia', desc: 'Conhecimento histórico, cultural, de eventos passados.' },
      { id: 'investigacao', name: 'Investigação', desc: 'Analisar pistas, deduzir, resolver mistérios.' },
      { id: 'labia', name: 'Lábia', desc: 'Convencer, negociar, manipular verbalmente.' },
      { id: 'medicina', name: 'Medicina', desc: 'Tratar ferimentos e doenças com conhecimento clínico.' },
      { id: 'primeiros_socorros', name: 'Primeiros Socorros', desc: 'Estabilizar os ferimentos rapidamente em campo.' },
    ],
  },
  {
    id: 'alma',
    name: 'Alma',
    skills: [
      { id: 'arcanismo', name: 'Arcanismo', desc: 'Bônus Arcano.' },
      { id: 'diplomacia', name: 'Diplomacia', desc: 'Usada para negociar, acalmar e resolver conflitos por meios pacíficos.' },
      { id: 'animais', name: 'Lidar c/ Animais', desc: 'Acalmar, treinar, comunicar-se com animais.' },
      { id: 'misticismo', name: 'Misticismo', desc: 'Ponto de Ação Mágica.' },
      { id: 'ocultismo', name: 'Ocultismo', desc: 'DT Arcana.' },
      { id: 'percepcao', name: 'Percepção', desc: 'Notar detalhes, ouvir, ver, sentir o ambiente.' },
    ],
  },
]
