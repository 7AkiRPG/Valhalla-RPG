// Grimório — extraído do documento "Valhalla" (Guia Rápido)

export const CANTRIPS = [
  { name: 'Lábia Encantada', nivelConjuracao: 1, custo: '', tempo: '', desc: 'Recebe 0 (+Bônus Arcano) em testes que envolvam diálogo.' },
  { name: 'Luz', nivelConjuracao: 1, custo: '', tempo: '1PA', desc: 'Cria um orbe de luz sem calor em uma área com 0m de raio (+Bônus Arcano). O objeto pode ser guardado para interromper a luz.' },
  { name: 'Ricochete', nivelConjuracao: 1, custo: '1PM', tempo: '', desc: 'Ignora cobertura parcial/completa se puder ser redirecionada por uma superfície. Exige teste de ataque.' },
]

export const SPELLS = [
  { name: 'Arma Mágica', nivel: 1, nivelConjuracao: 2, custo: '1PM p/ Rod.', tempo: '1PA', desc: 'Molda um constructo de mana em forma de arma já usada por você; funciona como uma arma normal.' },
  { name: 'Barreira', nivel: 1, nivelConjuracao: 1, custo: 'x', tempo: '2PA', desc: 'Cria uma parede com PVs igual a 0 + mana gasta (+Bônus Arcano), num raio de 0m. Reação: ganha RD igual a 0 + mana gasta.' },
  { name: 'Curar', nivel: 1, nivelConjuracao: 1, custo: '2PM', tempo: '2PA', desc: 'Recupera 0 (+Bônus Arcano) PVs.' },
  { name: 'Disparo', nivel: 1, nivelConjuracao: 1, custo: '1PM', tempo: '2PA', desc: 'Condensa mana e dispara em um alvo a 5m, causando 1d4 de dano mágico.' },
  { name: 'Domínio Básico', nivel: 1, nivelConjuracao: 1, custo: '2PM', tempo: '2PA', desc: 'Onda de mana que atinge todos num raio de 3m, causando 1d4 de qualquer dano que você possa causar.' },
  { name: 'Fortificação', nivel: 1, nivelConjuracao: 1, custo: '1PM ou x', tempo: '1PA', desc: 'Usa mana para potencializar seu ser. Ofensiva: +0 no ataque. Defensiva: +0 em RD. Corpórea/Mental: mana gasta no próximo teste de Corpo/Mente.' },
  { name: 'Linguagem Perversa', nivel: 1, nivelConjuracao: 1, custo: '1PM', tempo: '1PA', desc: 'Exige Acústica 1 / Lábia Encantada. Profere uma ofensa; alvo sofre 1d2 de dano psíquico.' },
  { name: 'Visão Mágica', nivel: 1, nivelConjuracao: 1, custo: '2PM', tempo: '1PA', desc: 'Concentra mana nos olhos: enxerga no escuro e vê coisas mágicas/sobrenaturais. +3 em percepção.' },
  { name: 'Ocultar Alma', nivel: 1, nivelConjuracao: 1, custo: '2PM', tempo: '1PA', desc: 'Mantém a mana retida e silenciosa. +5 de Furtividade para ocultar presença mágica.' },
  { name: 'Carapaça', nivel: 2, nivelConjuracao: 2, custo: '2PM / Rodada', tempo: '1PA / Rodada', desc: 'Exige Barreira. Ganha 1 de RD enquanto sustentar a magia.' },
  { name: 'Mísseis Mágicos', nivel: 2, nivelConjuracao: 2, custo: '3PM', tempo: '2PA', desc: 'Exige Disparo. Três projéteis que sempre atingem o alvo (impossível esquivar). Cada um causa 1d4 de dano energético.' },
  { name: 'Polarização', nivel: 2, nivelConjuracao: 2, custo: '3PM', tempo: '1PA / Rodada', desc: 'Imita um campo eletromagnético; move até 9kg por 3m.' },
  { name: 'Revitalizar', nivel: 2, nivelConjuracao: 2, custo: '3PM', tempo: '1PA / Rodada', desc: 'Exige Curar. Feixe de mana num raio de 3m; enquanto sustentada, alvo e conjurador recuperam 1d2 PVs por rodada.' },
  { name: 'Domínio Intermediário', nivel: 3, nivelConjuracao: 3, custo: '4PM', tempo: '2PA', desc: '(Efeito a definir — evolução do Domínio Básico.)' },
  { name: 'Santuário', nivel: 3, nivelConjuracao: 3, custo: '4PM', tempo: '2PA', desc: 'Não pode ser alvo de um ataque até o início do seu próximo turno.' },
]
