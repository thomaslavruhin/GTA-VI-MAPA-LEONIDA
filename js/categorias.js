/*
 * Categorias em português, derivadas das tags do banco de dados gtadb.org.
 * Cada categoria lista as tags de origem ("tags") que a definem.
 * A ordem importa: um local recebe a PRIMEIRA categoria cujas tags ele possui.
 */
window.GRUPOS = [
  {
    id: 'lojas', nome: 'Lojas e serviços',
    categorias: [
      { id: 'esconderijo', nome: 'Esconderijos', icone: 'fa-house-lock', cor: '#4fc3f7', tags: ['#safehouse'] },
      { id: 'armas', nome: 'Lojas de armas', icone: 'fa-gun', cor: '#ef5350', tags: ['#guns'] },
      { id: 'posto', nome: 'Postos de gasolina', icone: 'fa-gas-pump', cor: '#ffb74d', tags: ['#gas'] },
      { id: 'roupas', nome: 'Roupas e calçados', icone: 'fa-shirt', cor: '#f06292', tags: ['#clothes', '#shoes'] },
      { id: 'estetica', nome: 'Barbearias e tatuagens', icone: 'fa-scissors', cor: '#ce93d8', tags: ['#hair', '#tattoos'] },
      { id: 'oficina', nome: 'Oficinas e lava-jatos', icone: 'fa-wrench', cor: '#90a4ae', tags: ['#modshop', "#pay'n'spray", '#carwash'] },
      { id: 'mercado', nome: 'Supermercados', icone: 'fa-cart-shopping', cor: '#81c784', tags: ['#supermarket', 'supermarket'] },
      { id: 'comida', nome: 'Comida e bebida', icone: 'fa-burger', cor: '#ffd54f', tags: ['#food', '#fastfood', '#drinks', '#vendor', 'restaurant'] },
      { id: 'noite', nome: 'Vida noturna', icone: 'fa-martini-glass', cor: '#b388ff', tags: ['#bar', '#nightclub', '#stripclub'] },
      { id: 'eletronicos', nome: 'Eletrônicos', icone: 'fa-mobile-screen', cor: '#4dd0e1', tags: ['#electronics'] },
      { id: 'comercio', nome: 'Comércio', icone: 'fa-store', cor: '#a5d6a7', tags: ['retail'] }
    ]
  },
  {
    id: 'transporte', nome: 'Transporte',
    categorias: [
      { id: 'aeroporto', nome: 'Aeroportos', icone: 'fa-plane', cor: '#64b5f6', tags: ['#airport', '#airbase'] },
      { id: 'trem', nome: 'Trens e metrô', icone: 'fa-train-subway', cor: '#7986cb', tags: ['#train', '#metro', '#metromover'] },
      { id: 'onibus', nome: 'Pontos de ônibus', icone: 'fa-bus', cor: '#9575cd', tags: ['#bus'] },
      { id: 'marina', nome: 'Marinas', icone: 'fa-anchor', cor: '#4db6ac', tags: ['#marina'] },
      { id: 'autodromo', nome: 'Autódromos', icone: 'fa-flag-checkered', cor: '#e57373', tags: ['#racetrack'] },
      { id: 'transporte', nome: 'Transporte (outros)', icone: 'fa-road', cor: '#b0bec5', tags: ['transportation'] }
    ]
  },
  {
    id: 'publico', nome: 'Serviços públicos',
    categorias: [
      { id: 'policia', nome: 'Polícia e prisões', icone: 'fa-shield-halved', cor: '#5c6bc0', tags: ['#police', '#jail'] },
      { id: 'hospital', nome: 'Hospitais', icone: 'fa-hospital', cor: '#e53935', tags: ['#hospital'] },
      { id: 'governo', nome: 'Governo', icone: 'fa-landmark-dome', cor: '#bcaaa4', tags: ['government'] },
      { id: 'publico', nome: 'Espaços públicos', icone: 'fa-people-group', cor: '#a1887f', tags: ['public'] },
      { id: 'infra', nome: 'Infraestrutura', icone: 'fa-bolt', cor: '#fff176', tags: ['utilities'] }
    ]
  },
  {
    id: 'locais', nome: 'Locais',
    categorias: [
      { id: 'turismo', nome: 'Pontos turísticos', icone: 'fa-camera', cor: '#ff8a65', tags: ['landmark', 'point-of-interest', '#ferriswheel', '#blimp'] },
      { id: 'hotel', nome: 'Hotéis', icone: 'fa-hotel', cor: '#4fc3f7', tags: ['hotel'] },
      { id: 'lazer', nome: 'Lazer e esportes', icone: 'fa-umbrella-beach', cor: '#ffcc80', tags: ['leisure', '#tennis', 'events'] },
      { id: 'natureza', nome: 'Natureza', icone: 'fa-tree', cor: '#66bb6a', tags: ['natural', 'agriculture'] },
      { id: 'residencial', nome: 'Residências', icone: 'fa-house', cor: '#80cbc4', tags: ['residential'] },
      { id: 'escritorio', nome: 'Escritórios', icone: 'fa-building', cor: '#90caf9', tags: ['office'] },
      { id: 'industria', nome: 'Indústria', icone: 'fa-industry', cor: '#a1a1a1', tags: ['industrial'] },
      { id: 'obra', nome: 'Em construção', icone: 'fa-helmet-safety', cor: '#ffa726', tags: ['construction'] },
      { id: 'outros', nome: 'Outros locais', icone: 'fa-location-dot', cor: '#e0e0e0', tags: [] }
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
