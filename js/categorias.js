/*
 * Categorias em português, organizadas nos mesmos grupos do MapGenie
 * (mapgenie.io/grand-theft-auto-6/maps/leonida), mantendo apenas as
 * categorias que têm dados no banco aberto do gtadb.org.
 *
 * "tags" lista as tags do gtadb que definem cada categoria.
 * A ordem importa: um local recebe a PRIMEIRA categoria cujas tags ele possui.
 * Locais sem nenhuma dessas tags não aparecem no mapa.
 * O ícone de cada categoria fica em icones/<id>.svg.
 */
window.GRUPOS = [
  {
    id: 'interesse', nome: 'Pontos de interesse',
    categorias: [
      { id: 'academia', nome: 'Academias', singular: 'Academia', cor: '#90caf9', tags: ['#gym'] },
      { id: 'clube', nome: 'Clubes', singular: 'Clube', cor: '#b388ff', tags: ['#nightclub', '#stripclub'] },
      { id: 'armas', nome: 'Ammu-Nation', singular: 'Ammu-Nation', cor: '#ef5350', tags: ['#guns'] }
    ]
  },
  {
    id: 'roubos', nome: 'Roubos',
    categorias: [
      { id: 'joalheria', nome: 'Joalherias', singular: 'Joalheria', cor: '#4dd0e1', tags: ['#jewelry'] },
      { id: 'conveniencia', nome: 'Lojas de conveniência', singular: 'Loja de conveniência', cor: '#81c784', tags: ['#supermarket', 'supermarket'] },
      { id: 'fastfood', nome: 'Fast food', singular: 'Fast food', cor: '#ffd54f', tags: ['#fastfood'] },
      { id: 'bebidas', nome: 'Lojas de bebidas', singular: 'Loja de bebidas', cor: '#ce93d8', tags: ['#liquor'] }
    ]
  },
  {
    id: 'veiculos', nome: 'Veículos',
    categorias: [
      { id: 'paynspray', nome: "Pay 'N' Spray", singular: "Pay 'N' Spray", cor: '#4fc3f7', tags: ["#pay'n'spray"] },
      { id: 'modshop', nome: 'Oficinas de personalização', singular: 'Oficina', cor: '#90a4ae', tags: ['#modshop'] },
      { id: 'posto', nome: 'Postos de gasolina', singular: 'Posto de gasolina', cor: '#ffb74d', tags: ['#gas'] },
      { id: 'lavajato', nome: 'Lava-jatos', singular: 'Lava-jato', cor: '#4dd0e1', tags: ['#carwash'] },
      { id: 'onibus', nome: 'Pontos de ônibus', singular: 'Ponto de ônibus', cor: '#9575cd', tags: ['#bus'] },
      { id: 'trem', nome: 'Estações de trem', singular: 'Estação', cor: '#7986cb', tags: ['#train', '#metro', '#metromover'] }
    ]
  },
  {
    id: 'estilo', nome: 'Estilo',
    categorias: [
      { id: 'roupas', nome: 'Roupas', singular: 'Loja de roupas', cor: '#f06292', tags: ['#clothes'] },
      { id: 'calcados', nome: 'Calçados', singular: 'Loja de calçados', cor: '#ff8a65', tags: ['#shoes'] },
      { id: 'cabelo', nome: 'Cabelo e beleza', singular: 'Cabelo e beleza', cor: '#ce93d8', tags: ['#hair'] },
      { id: 'tatuagem', nome: 'Tatuagens', singular: 'Estúdio de tatuagem', cor: '#a1887f', tags: ['#tattoos'] },
      { id: 'eletronicos', nome: 'Eletrônicos', singular: 'Loja de eletrônicos', cor: '#64b5f6', tags: ['#electronics'] }
    ]
  },
  {
    id: 'comida', nome: 'Comida e bebida',
    categorias: [
      { id: 'cafes', nome: 'Cafés e lanches', singular: 'Café / lanchonete', cor: '#ffcc80', tags: ['#food', '#drinks', 'restaurant'] },
      { id: 'bar', nome: 'Bares', singular: 'Bar', cor: '#ffa726', tags: ['#bar'] },
      { id: 'comidarua', nome: 'Comida de rua', singular: 'Comida de rua', cor: '#e57373', tags: ['#vendor'] }
    ]
  },
  {
    id: 'wainK', nome: 'Locais WAiNK',
    categorias: [
      { id: 'turismo', nome: 'Pontos turísticos', singular: 'Ponto turístico', cor: '#80cbc4', tags: ['landmark', 'point-of-interest', '#ferriswheel', '#blimp'] }
    ]
  },
  {
    id: 'esportes', nome: 'Esportes',
    categorias: [
      { id: 'golfe', nome: 'Campos de golfe', singular: 'Campo de golfe', cor: '#a5d6a7', tags: ['#golf'] }
    ]
  },
  {
    id: 'corridas', nome: 'Corridas',
    categorias: [
      { id: 'autodromo', nome: 'Autódromos', singular: 'Autódromo', cor: '#e0e0e0', tags: ['#racetrack'] }
    ]
  }
];

/* Tradução das demais tags exibidas no popup de cada local. */
window.TAGS_PT = {
  enterable: 'Com interior acessível',
  unconfirmed: 'Não confirmado',
  demolished: 'Demolido na vida real',
  closed: 'Fechado na vida real',
  reused: 'Modelo reutilizado',
  mirrored: 'Espelhado',
  residential: 'Residencial', retail: 'Comércio', transportation: 'Transporte',
  natural: 'Natureza', industrial: 'Industrial', hotel: 'Hotel', leisure: 'Lazer',
  government: 'Governo', events: 'Eventos', utilities: 'Infraestrutura',
  landmark: 'Ponto turístico', public: 'Público', restaurant: 'Restaurante',
  construction: 'Em construção', office: 'Escritório', agriculture: 'Agricultura',
  service: 'Serviço', supermarket: 'Supermercado', 'point-of-interest': 'Ponto de interesse'
};
