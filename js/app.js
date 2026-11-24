/*
 * Mapa Interativo de Leonida (GTA VI)
 * Dados, fotos e tiles: gtadb.org e colaboradores — CC BY 4.0
 * https://github.com/rolux/gtadb.org
 */
(function () {
  'use strict';

  /* ================= Configuração ================= */
  const CONFIG = {
    dados: 'data/landmarks.json',
    // Mapa base "yanis,18": reconstrução da comunidade (GTA VI Mapping Project), via gtadb.org
    tiles: 'tiles/yanis18/{z}/{z},{y},{x}.jpg',
    // Fotos carregadas sob demanda direto do repositório de origem
    fotos: 'https://raw.githubusercontent.com/rolux/gtadb.org/main/map/photos/6/',
    // Faixa de tiles existentes por zoom: [[xMin, yMin], [xMax, yMax]] (de gtadb.org/maps/maps.js)
    faixas: {
      0: [[0, 0], [3, 3]], 1: [[1, 1], [6, 6]], 2: [[2, 2], [12, 12]],
      3: [[5, 5], [25, 24]], 4: [[10, 10], [51, 49]], 5: [[21, 21], [103, 99]]
    },
    corMar: '#2c67a4', // cor de fundo do yanis,18 (gtadb maps/tiles.py)
    mascaras: [[4000, -16384, 16384, 16384]], // [x0, y0, x1, y1] em coordenadas do jogo
    zoomNativoMax: 5,
    zoomMax: 7,
    zoomMin: -1,
    inicio: { x: -4000, y: 2000, z: 1 }, // mesma vista inicial do gtadb.org
    zoomLonge: 2 // abaixo disso, marcadores viram pontos
  };

  /* ================= Utilidades ================= */
  const PFX = 'mapaLeonida:';
  const store = {
    get(k, padrao) {
      try { const v = localStorage.getItem(PFX + k); return v == null ? padrao : JSON.parse(v); }
      catch (e) { return padrao; }
    },
    set(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  };
  const $ = (s) => document.querySelector(s);
  function el(tag, attrs, ...filhos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    filhos.flat(Infinity).forEach((f) => { if (f != null && f !== false) e.append(f.nodeType ? f : document.createTextNode(f)); });
    return e;
  }
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Ícones de game-icons.net (CC BY 3.0), um SVG por categoria em icones/<id>.svg
  // (máscara inline: url() dentro de variável CSS seria resolvida a partir de css/)
  const giHtml = (nome) => `<i class="gi" style="-webkit-mask-image:url('icones/${nome}.svg');mask-image:url('icones/${nome}.svg')"></i>`;
  const icoHtml = (cat) => giHtml(cat.id);
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('visivel');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('visivel'), 2200);
  }
  const ehMobile = () => window.matchMedia('(max-width: 760px)').matches;

  /* ================= Estado ================= */
  const estado = {
    encontrados: new Set(store.get('encontrados', [])),
    ocultas: new Set(store.get('ocultas', [])),
    gruposFechados: new Set(store.get('gruposFechados', [])),
    ocultarEncontrados: store.get('ocultarEncontrados', false),
    notas: store.get('notas', []),
    selecionado: null,
    modoNota: false
  };
  function salvar() {
    store.set('encontrados', [...estado.encontrados]);
    store.set('ocultas', [...estado.ocultas]);
    store.set('gruposFechados', [...estado.gruposFechados]);
    store.set('ocultarEncontrados', estado.ocultarEncontrados);
    store.set('notas', estado.notas);
  }

  /* ================= Categorias ================= */
  const CATS = {};
  const ORDEM = [];
  window.GRUPOS.forEach((g) => g.categorias.forEach((c) => { CATS[c.id] = c; ORDEM.push(c); }));
  // Locais sem nenhuma tag das categorias retornam null e ficam fora do mapa
  function categoriaDe(tags) {
    for (const c of ORDEM) if (c.tags.some((t) => tags.includes(t))) return c;
    return null;
  }

  /* ================= Mapa ================= */
  // Coordenadas do jogo: x e y de -16384 a 16384 (y para o norte).
  // No zoom 0 o mundo inteiro ocupa 1024 px (4×4 tiles de 256 px), como no gtadb.org.
  const CRS = L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1 / 32, 512, -1 / 32, 512)
  });
  const ll = (x, y) => L.latLng(y, x);
  const xy = (latlng) => ({ x: Math.round(latlng.lng), y: Math.round(latlng.lat) });

  const mapa = L.map('mapa', {
    crs: CRS,
    minZoom: CONFIG.zoomMin,
    maxZoom: CONFIG.zoomMax,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 100,
    zoomControl: false,
    attributionControl: true,
    maxBounds: L.latLngBounds(ll(-16384, -16384), ll(16384, 16384)),
    maxBoundsViscosity: 0.7,
    preferCanvas: false
  });
  mapa.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  L.control.zoom({ position: 'bottomright', zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' }).addTo(mapa);

  const VAZIO = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const CamadaLeonida = L.TileLayer.extend({
    getTileUrl(c) {
      const f = CONFIG.faixas[c.z];
      if (!f || c.x < f[0][0] || c.x > f[1][0] || c.y < f[0][1] || c.y > f[1][1]) return VAZIO;
      return CONFIG.tiles.replace(/\{z\}/g, c.z).replace('{x}', c.x).replace('{y}', c.y);
    }
  });
  new CamadaLeonida('', {
    minZoom: CONFIG.zoomMin,
    maxZoom: CONFIG.zoomMax,
    minNativeZoom: 0,
    maxNativeZoom: CONFIG.zoomNativoMax,
    tileSize: 256,
    noWrap: true,
    keepBuffer: 4,
    errorTileUrl: VAZIO,
    className: 'tiles-leonida',
    attribution: 'Mapa e dados: <a href="https://map.gtadb.org" target="_blank" rel="noopener">gtadb.org</a> (<a href="https://creativecommons.org/licenses/by/4.0/deed.pt_BR" target="_blank" rel="noopener">CC BY 4.0</a>)'
  }).addTo(mapa);

  // A imagem original do mapa "yanis,18" é um pôster com legenda e créditos à direita.
  // Cobrimos essa área (só oceano no jogo) com a cor do mar do próprio mapa.
  const painelMascara = mapa.createPane('mascara');
  painelMascara.style.zIndex = 250;
  painelMascara.style.pointerEvents = 'none';
  CONFIG.mascaras.forEach(([x0, y0, x1, y1]) => L.rectangle([ll(x0, y0), ll(x1, y1)], {
    pane: 'mascara', stroke: false, fillColor: CONFIG.corMar, fillOpacity: 1, interactive: false
  }).addTo(mapa));

  /* ================= Locais ================= */
  let LOCAIS = [];           // lista de locais normalizados
  const PORID = new Map();   // id -> local
  const camada = L.layerGroup().addTo(mapa);

  function normalizarLocal(id, v) {
    // Formato gtadb: [endereçoJogo, [x,y], tamFotoJogo, endereçoReal, [lat,lng], tamFotoReal, tags, cor, editado]
    const partes = String(v[0] || '').split(', ');
    const tags = (v[6] || []).filter((t) => !t.startsWith('//') && !/^l\d$/.test(t));
    const cat = categoriaDe(tags);
    if (!cat) return null;
    const semNome = !partes[0] || partes[0] === '?';
    const titulo = semNome ? (cat.singular || cat.nome) : partes[0];
    const sub = partes.slice(1).join(', ');
    return {
      id, titulo, semNome, sub, cat,
      x: v[1][0], y: v[1][1],
      real: v[3] || '',
      fotoJogo: v[2] && v[2].length ? `${CONFIG.fotos}${id},ig.jpg?v=${(v[8] || [])[1] || 0}` : null,
      fotoReal: v[5] && v[5].length ? `${CONFIG.fotos}${id},rl.jpg?v=${(v[8] || [])[2] || 0}` : null,
      tags,
      busca: norm([v[0], v[3], cat.nome, tags.map((t) => window.TAGS_PT[t] || t).join(' ')].join(' ')),
      marcador: null
    };
  }

  function icone(loc) {
    const achado = estado.encontrados.has(loc.id);
    const sel = estado.selecionado === loc.id;
    return L.divIcon({
      className: 'pin' + (achado ? ' achado' : '') + (sel ? ' selecionado' : ''),
      html: `<span class="pin-c" style="--c:${loc.cat.cor}">${icoHtml(loc.cat)}${achado ? '<b class="pin-ok"><i class="fa-solid fa-check"></i></b>' : ''}</span>`,
      iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12]
    });
  }

  function marcadorDe(loc) {
    if (loc.marcador) return loc.marcador;
    const m = L.marker(ll(loc.x, loc.y), { icon: icone(loc), title: loc.titulo, riseOnHover: true, keyboard: false });
    m.bindPopup(() => popupLocal(loc), { maxWidth: 320, minWidth: 260, autoPanPaddingTopLeft: [20, 80], autoPanPaddingBottomRight: [20, 40] });
    m.on('popupopen', () => { estado.selecionado = loc.id; m.setIcon(icone(loc)); atualizarHash(); });
    m.on('popupclose', () => {
      if (estado.selecionado === loc.id) estado.selecionado = null;
      m.setIcon(icone(loc)); atualizarHash();
    });
    loc.marcador = m;
    return m;
  }

  function visivel(loc) {
    if (estado.ocultas.has(loc.cat.id)) return false;
    if (estado.ocultarEncontrados && estado.encontrados.has(loc.id)) return false;
    return true;
  }

  // Renderiza apenas os marcadores na área visível (desempenho com milhares de locais)
  function atualizarMarcadores() {
    const area = mapa.getBounds().pad(0.3);
    for (const loc of LOCAIS) {
      const deve = (visivel(loc) && area.contains([loc.y, loc.x])) || estado.selecionado === loc.id;
      const m = loc.marcador;
      if (deve) { const mk = marcadorDe(loc); if (!camada.hasLayer(mk)) camada.addLayer(mk); }
      else if (m && camada.hasLayer(m)) camada.removeLayer(m);
    }
    const z = mapa.getZoom();
    mapa.getContainer().classList.toggle('zoom-longe', z < CONFIG.zoomLonge);
    mapa.getContainer().classList.toggle('zoom-medio', z >= CONFIG.zoomLonge && z < CONFIG.zoomLonge + 1.5);
    mapa.getContainer().classList.toggle('zoom-perto', z >= 4);
  }

  /* ================= Nomes de regiões e bairros ================= */
  // Posição = mediana dos locais que citam cada região/bairro no endereço (gtadb).
  // Acima dos marcadores (600) e abaixo dos popups (700); não bloqueia cliques
  const painelRotulos = mapa.createPane('rotulos');
  painelRotulos.style.zIndex = 650;
  painelRotulos.style.pointerEvents = 'none';
  function criarRotulos(dados) {
    const grupos = { regiao: new Map(), bairro: new Map() };
    const add = (tipo, nome, x, y) => {
      if (!nome || nome === '?' || nome === 'Leonida') return;
      if (!grupos[tipo].has(nome)) grupos[tipo].set(nome, []);
      grupos[tipo].get(nome).push([x, y]);
    };
    Object.values(dados).forEach((v) => {
      if (!Array.isArray(v[1]) || v[1].length !== 2) return;
      const p = String(v[0] || '').split(', ');
      if (p.length >= 2) add('regiao', p[p.length - 1], v[1][0], v[1][1]);
      if (p.length >= 3) add('bairro', p[p.length - 2], v[1][0], v[1][1]);
    });
    const mediana = (a) => { const s = a.slice().sort((m, n) => m - n); return s[Math.floor(s.length / 2)]; };
    const nomesRegiao = new Set(grupos.regiao.keys());
    const camadaRotulos = L.layerGroup().addTo(mapa);
    ['regiao', 'bairro'].forEach((tipo) => grupos[tipo].forEach((pts, nome) => {
      if (pts.length < (tipo === 'regiao' ? 5 : 3)) return;
      if (tipo === 'bairro' && nomesRegiao.has(nome)) return;
      const x = mediana(pts.map((q) => q[0])), y = mediana(pts.map((q) => q[1]));
      L.marker(ll(x, y), {
        pane: 'rotulos', interactive: false, keyboard: false,
        icon: L.divIcon({ className: `rotulo rotulo-${tipo}`, html: `<span>${nome.replace(/</g, '&lt;')}</span>`, iconSize: [0, 0] })
      }).addTo(camadaRotulos);
    }));
  }
  const chkRotulos = $('#chk-rotulos');
  chkRotulos.checked = store.get('rotulos', true);
  mapa.getContainer().classList.toggle('sem-rotulos', !chkRotulos.checked);
  chkRotulos.addEventListener('change', () => {
    store.set('rotulos', chkRotulos.checked);
    mapa.getContainer().classList.toggle('sem-rotulos', !chkRotulos.checked);
  });

  /* ================= Popup ================= */
  function popupLocal(loc) {
    const achado = estado.encontrados.has(loc.id);
    let fotoAtual = loc.fotoJogo || loc.fotoReal;
    const tagsVisiveis = loc.tags.filter((t) => !t.startsWith('#') && !t.startsWith('@'));

    const img = fotoAtual ? el('img', { src: fotoAtual, alt: `Foto de ${loc.titulo}`, loading: 'lazy', onclick: () => abrirFoto(img.src) }) : null;
    const abas = (loc.fotoJogo && loc.fotoReal) ? el('div', { class: 'pp-foto-abas' },
      el('button', { class: 'ativo', onclick: (e) => trocarFoto(e, loc.fotoJogo) }, 'No jogo'),
      el('button', { onclick: (e) => trocarFoto(e, loc.fotoReal) }, 'Vida real')
    ) : null;
    function trocarFoto(e, src) {
      img.src = src;
      e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('ativo', b === e.currentTarget));
    }

    const btnAchado = el('button', {
      class: 'btn btn-achado' + (achado ? ' ativo' : ''),
      onclick: () => {
        alternarEncontrado(loc.id);
        const agora = estado.encontrados.has(loc.id);
        btnAchado.classList.toggle('ativo', agora);
        btnAchado.innerHTML = agora ? '<i class="fa-solid fa-circle-check"></i> Encontrado' : '<i class="fa-regular fa-circle"></i> Marcar como encontrado';
      },
      html: achado ? '<i class="fa-solid fa-circle-check"></i> Encontrado' : '<i class="fa-regular fa-circle"></i> Marcar como encontrado'
    });

    return el('div', { class: 'pp' },
      el('div', { class: 'pp-cab' },
        el('span', { class: 'pp-ico', style: `--c:${loc.cat.cor}`, html: icoHtml(loc.cat) }),
        el('div', {},
          el('h3', {}, loc.titulo),
          loc.sub ? el('span', { class: 'pp-sub' }, loc.sub) : null,
          el('span', { class: 'pp-cat', style: `--c:${loc.cat.cor}` }, loc.cat.nome)
        )
      ),
      img ? el('div', { class: 'pp-foto' }, img, abas) : null,
      el('div', { class: 'pp-corpo' },
        loc.real ? el('p', {}, el('b', {}, 'Na vida real: '), loc.real) : null,
        tagsVisiveis.length ? el('div', { class: 'pp-tags' }, tagsVisiveis.map((t) =>
          el('span', { class: 'pp-tag' + (['unconfirmed', 'demolished', 'closed'].includes(t) ? ' alerta' : '') }, window.TAGS_PT[t] || t)
        )) : null
      ),
      el('div', { class: 'pp-acoes' },
        btnAchado,
        el('button', { class: 'btn', title: 'Copiar link', 'aria-label': 'Copiar link', style: 'flex:0 0 40px', onclick: () => copiarLink(loc.id), html: '<i class="fa-solid fa-link"></i>' })
      ),
      el('div', { class: 'pp-rodape' },
        el('span', {}, `X ${Math.round(loc.x)} · Y ${Math.round(loc.y)}`),
        el('a', { href: `https://map.gtadb.org/#${loc.id}`, target: '_blank', rel: 'noopener', title: 'Ver na fonte (gtadb.org)' }, `Fonte: gtadb.org · ${loc.id}`)
      )
    );
  }

  function abrirFoto(src) {
    const lb = el('div', { class: 'lightbox', onclick: () => lb.remove() }, el('img', { src, alt: '' }));
    document.body.append(lb);
  }

  function copiarLink(id) {
    const url = location.href.split('#')[0] + '#loc=' + encodeURIComponent(id);
    const ok = () => toast('Link copiado!');
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, () => prompt('Copie o link:', url));
    else prompt('Copie o link:', url);
  }

  function alternarEncontrado(id) {
    if (estado.encontrados.has(id)) estado.encontrados.delete(id); else estado.encontrados.add(id);
    salvar();
    const loc = PORID.get(id);
    if (loc && loc.marcador) loc.marcador.setIcon(icone(loc));
    renderContagens();
    if (estado.ocultarEncontrados) atualizarMarcadores();
  }

  /* ================= Painel ================= */
  const contagem = {};
  function renderCategorias() {
    const box = $('#categorias');
    box.innerHTML = '';
    window.GRUPOS.forEach((g) => {
      const fechado = estado.gruposFechados.has(g.id);
      const sec = el('section', { class: 'grupo' + (fechado ? ' fechado' : '') },
        el('header', { class: 'grupo-cab' },
          el('button', {
            class: 'grupo-tit', 'aria-expanded': String(!fechado),
            onclick: () => {
              if (estado.gruposFechados.has(g.id)) estado.gruposFechados.delete(g.id); else estado.gruposFechados.add(g.id);
              salvar(); renderCategorias();
            }
          }, el('i', { class: 'fa-solid fa-chevron-down' }), g.nome),
          el('button', {
            class: 'link',
            onclick: () => {
              const ids = g.categorias.map((c) => c.id);
              const todasVisiveis = ids.every((id) => !estado.ocultas.has(id));
              ids.forEach((id) => todasVisiveis ? estado.ocultas.add(id) : estado.ocultas.delete(id));
              salvar(); renderCategorias(); atualizarMarcadores();
            }
          }, g.categorias.every((c) => !estado.ocultas.has(c.id)) ? 'Ocultar' : 'Mostrar')
        ),
        el('div', { class: 'grupo-lista' }, g.categorias.map((c) =>
          el('button', {
            class: 'cat' + (estado.ocultas.has(c.id) ? ' oculta' : '') + (contagem[c.id] ? '' : ' vazia'),
            'data-cat': c.id, title: c.nome,
            onclick: () => {
              if (estado.ocultas.has(c.id)) estado.ocultas.delete(c.id); else estado.ocultas.add(c.id);
              salvar(); renderCategorias(); atualizarMarcadores();
            }
          },
          el('span', { class: 'cat-ico', style: `--c:${c.cor}`, html: icoHtml(c) }),
          el('span', { class: 'cat-nome' }, c.nome),
          el('span', { class: 'cat-num' }, '0'))
        ))
      );
      box.append(sec);
    });
    renderContagens();
  }

  function renderContagens() {
    const achados = {};
    LOCAIS.forEach((l) => { if (estado.encontrados.has(l.id)) achados[l.cat.id] = (achados[l.cat.id] || 0) + 1; });
    document.querySelectorAll('.cat').forEach((b) => {
      const id = b.dataset.cat;
      b.querySelector('.cat-num').textContent = `${achados[id] || 0}/${contagem[id] || 0}`;
    });
    const total = LOCAIS.length;
    const feitos = LOCAIS.reduce((n, l) => n + (estado.encontrados.has(l.id) ? 1 : 0), 0);
    $('#progresso-txt').textContent = `${feitos.toLocaleString('pt-BR')} / ${total.toLocaleString('pt-BR')}`;
    $('#progresso-barra').style.width = total ? (feitos / total * 100).toFixed(2) + '%' : '0';
  }

  /* ---------- Busca ---------- */
  function renderBusca(q) {
    const res = $('#resultados');
    const termos = norm(q).trim().split(/\s+/).filter(Boolean);
    if (!termos.length) { res.hidden = true; $('#categorias').hidden = false; return; }
    const achados = LOCAIS.filter((l) => termos.every((t) => l.busca.includes(t)));
    res.innerHTML = '';
    res.append(el('p', { class: 'resultados-info' },
      achados.length ? `${achados.length.toLocaleString('pt-BR')} resultado(s)${achados.length > 100 ? ' — mostrando 100' : ''}` : 'Nenhum local encontrado.'));
    achados.slice(0, 100).forEach((l) => res.append(
      el('button', { class: 'res', onclick: () => irPara(l.id) },
        el('span', { class: 'res-ico', style: `--c:${l.cat.cor}`, html: icoHtml(l.cat) }),
        el('span', { class: 'res-txt' }, el('b', {}, l.titulo), el('small', {}, l.sub || l.cat.nome)),
        estado.encontrados.has(l.id) ? el('i', { class: 'fa-solid fa-circle-check' }) : null
      )
    ));
    res.hidden = false; $('#categorias').hidden = true;
  }

  function irPara(id, animar = true) {
    const loc = PORID.get(id);
    if (!loc) { toast('Local não encontrado.'); return; }
    if (estado.ocultas.has(loc.cat.id)) { estado.ocultas.delete(loc.cat.id); salvar(); renderCategorias(); }
    estado.selecionado = id;
    const z = Math.max(mapa.getZoom(), 4);
    const abrir = () => { atualizarMarcadores(); marcadorDe(loc).openPopup(); };
    if (animar) { mapa.once('moveend', abrir); mapa.flyTo(ll(loc.x, loc.y), z, { duration: 0.8 }); }
    else { mapa.setView(ll(loc.x, loc.y), z, { animate: false }); abrir(); }
    if (ehMobile()) document.body.classList.remove('painel-aberto-mobile');
  }

  /* ================= Notas pessoais ================= */
  const camadaNotas = L.layerGroup().addTo(mapa);
  const marcadoresNota = new Map();
  const iconeNota = L.divIcon({
    className: 'pin pin-nota', html: `<span class="pin-c" style="--c:var(--acento-2)">${giHtml('nota')}</span>`,
    iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24]
  });

  function renderNotas() {
    camadaNotas.clearLayers(); marcadoresNota.clear();
    estado.notas.forEach((n) => {
      const m = L.marker(ll(n.x, n.y), { icon: iconeNota, draggable: true, title: n.titulo || 'Nota' });
      m.bindPopup(() => popupNota(n), { minWidth: 260 });
      m.on('dragend', () => { const p = xy(m.getLatLng()); n.x = p.x; n.y = p.y; salvar(); });
      camadaNotas.addLayer(m); marcadoresNota.set(n.id, m);
    });
    $('#num-notas').textContent = estado.notas.length;
    const lista = $('#lista-notas'); lista.innerHTML = '';
    estado.notas.forEach((n) => lista.append(el('button', {
      class: 'nota-item', onclick: () => {
        mapa.flyTo(ll(n.x, n.y), Math.max(mapa.getZoom(), 4), { duration: 0.6 });
        mapa.once('moveend', () => marcadoresNota.get(n.id).openPopup());
        if (ehMobile()) document.body.classList.remove('painel-aberto-mobile');
      }
    }, el('i', { class: 'fa-solid fa-note-sticky' }), el('span', {}, n.titulo || 'Nota sem título'))));
  }

  function popupNota(n) {
    const tit = el('input', { type: 'text', value: n.titulo || '', placeholder: 'Título', maxlength: 80 });
    const txt = el('textarea', { rows: 3, placeholder: 'Escreva sua nota…', maxlength: 1000 });
    txt.value = n.texto || '';
    setTimeout(() => (n.titulo ? txt : tit).focus(), 50);
    return el('div', { class: 'pp-form' },
      el('h3', {}, el('i', { class: 'fa-solid fa-note-sticky', style: 'color:var(--acento-2)' }), ' Nota pessoal'),
      tit, txt,
      el('div', { class: 'linha' },
        el('button', {
          class: 'btn btn-primario', onclick: () => {
            n.titulo = tit.value.trim(); n.texto = txt.value.trim(); salvar(); mapa.closePopup(); renderNotas(); toast('Nota salva.');
          }
        }, el('i', { class: 'fa-solid fa-floppy-disk' }), ' Salvar'),
        el('button', {
          class: 'btn btn-perigo', onclick: () => {
            estado.notas = estado.notas.filter((x) => x.id !== n.id); salvar(); mapa.closePopup(); renderNotas(); toast('Nota excluída.');
          }
        }, el('i', { class: 'fa-solid fa-trash' }), ' Excluir')
      ),
      el('small', { style: 'color:var(--texto-3)' }, 'Arraste o marcador para movê-lo. Notas ficam salvas só neste navegador.')
    );
  }

  function criarNota(p) {
    const n = { id: 'n' + Date.now().toString(36), x: p.x, y: p.y, titulo: '', texto: '' };
    estado.notas.push(n); salvar(); renderNotas();
    marcadoresNota.get(n.id).openPopup();
  }
  function setModoNota(on) {
    estado.modoNota = on;
    $('#aviso-nota').hidden = !on;
    mapa.getContainer().style.cursor = on ? 'crosshair' : '';
  }

  /* ================= URL (link compartilhável) ================= */
  let hashT;
  function atualizarHash() {
    clearTimeout(hashT);
    hashT = setTimeout(() => {
      const c = xy(mapa.getCenter());
      let h = `x=${c.x}&y=${c.y}&z=${+mapa.getZoom().toFixed(2)}`;
      if (estado.selecionado) h = `loc=${encodeURIComponent(estado.selecionado)}&` + h;
      history.replaceState(null, '', '#' + h);
    }, 200);
  }
  function lerHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    return { loc: p.get('loc'), x: parseFloat(p.get('x')), y: parseFloat(p.get('y')), z: parseFloat(p.get('z')) };
  }

  /* ================= Eventos ================= */
  function alternarPainel() {
    if (ehMobile()) document.body.classList.toggle('painel-aberto-mobile');
    else {
      document.body.classList.toggle('painel-fechado');
      store.set('painelFechado', document.body.classList.contains('painel-fechado'));
    }
    setTimeout(() => mapa.invalidateSize(), 280);
  }
  if (store.get('painelFechado', false)) document.body.classList.add('painel-fechado');

  $('#btn-menu').addEventListener('click', alternarPainel);
  $('#btn-sobre').addEventListener('click', () => $('#dlg-sobre').showModal());
  $('#btn-mostrar-tudo').addEventListener('click', () => { estado.ocultas.clear(); salvar(); renderCategorias(); atualizarMarcadores(); });
  $('#btn-ocultar-tudo').addEventListener('click', () => { ORDEM.forEach((c) => estado.ocultas.add(c.id)); salvar(); renderCategorias(); atualizarMarcadores(); });
  const chk = $('#chk-ocultar-encontrados');
  chk.checked = estado.ocultarEncontrados;
  chk.addEventListener('change', () => { estado.ocultarEncontrados = chk.checked; salvar(); atualizarMarcadores(); });
  $('#btn-zerar').addEventListener('click', () => {
    if (!confirm('Zerar todo o progresso de locais encontrados? Esta ação não pode ser desfeita.')) return;
    estado.encontrados.clear(); salvar(); renderContagens();
    LOCAIS.forEach((l) => l.marcador && l.marcador.setIcon(icone(l)));
    atualizarMarcadores(); toast('Progresso zerado.');
  });
  $('#btn-nova-nota').addEventListener('click', () => { setModoNota(true); if (ehMobile()) document.body.classList.remove('painel-aberto-mobile'); });
  $('#cancelar-nota').addEventListener('click', () => setModoNota(false));

  let buscaT;
  $('#busca').addEventListener('input', (e) => { clearTimeout(buscaT); buscaT = setTimeout(() => renderBusca(e.target.value), 120); });
  $('#busca').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(buscaT); renderBusca(e.target.value);
      const b = document.querySelector('.res'); if (b) b.click();
    }
  });

  document.addEventListener('keydown', (e) => {
    const digitando = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (e.key === '/' && !digitando) { e.preventDefault(); if (ehMobile()) document.body.classList.add('painel-aberto-mobile'); $('#busca').focus(); }
    else if (e.key === 'Escape') {
      const lb = document.querySelector('.lightbox');
      if (lb) lb.remove();
      else if (estado.modoNota) setModoNota(false);
      else if (digitando) document.activeElement.blur();
      else mapa.closePopup();
    } else if ((e.key === 'm' || e.key === 'M') && !digitando && !e.ctrlKey && !e.metaKey) alternarPainel();
  });

  mapa.on('click', (e) => { if (estado.modoNota) { setModoNota(false); criarNota(xy(e.latlng)); } });
  mapa.on('contextmenu', (e) => criarNota(xy(e.latlng)));
  mapa.on('mousemove', (e) => { const p = xy(e.latlng); $('#coords').textContent = `X ${p.x} · Y ${p.y}`; });
  mapa.on('moveend zoomend', () => { atualizarMarcadores(); atualizarHash(); });
  window.addEventListener('resize', () => mapa.invalidateSize());

  /* ================= Inicialização ================= */
  const h = lerHash();
  if (!isNaN(h.x) && !isNaN(h.y)) mapa.setView(ll(h.x, h.y), isNaN(h.z) ? 3 : h.z, { animate: false });
  else mapa.setView(ll(CONFIG.inicio.x, CONFIG.inicio.y), CONFIG.inicio.z, { animate: false });
  renderNotas();

  fetch(CONFIG.dados)
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((dados) => {
      LOCAIS = Object.entries(dados)
        .filter(([, v]) => Array.isArray(v[1]) && v[1].length === 2)
        .map(([id, v]) => normalizarLocal(id, v))
        .filter(Boolean);
      LOCAIS.forEach((l) => { PORID.set(l.id, l); contagem[l.cat.id] = (contagem[l.cat.id] || 0) + 1; });
      renderCategorias();
      criarRotulos(dados);
      if (h.loc && PORID.has(h.loc)) irPara(h.loc, false);
      atualizarMarcadores();
    })
    .catch((err) => {
      console.error(err);
      toast('Não foi possível carregar os locais. Abra o site por um servidor (veja o README).');
    })
    .finally(() => $('#carregando').classList.add('oculto'));
})();
