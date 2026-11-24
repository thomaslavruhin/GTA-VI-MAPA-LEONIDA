# Mapa Interativo de Leonida (GTA VI) — em português

Mapa interativo e não oficial do estado de Leonida (GTA VI), feito para rodar no **GitHub Pages**: um site estático, sem servidor e sem build.

## Funcionalidades

- Mapa com zoom e arraste (Leaflet), com os tiles do mapa da comunidade gtadb.org
- Cerca de 3.600 locais em 31 categorias traduzidas, organizadas em 4 grupos
- Mostrar ou ocultar por categoria, por grupo ou tudo de uma vez
- Busca por nome, bairro, cidade, endereço real ou categoria (atalho `/`)
- Popup com foto no jogo e na vida real, endereço real correspondente e tags
- "Marcar como encontrado", com progresso total e por categoria e a opção "Ocultar encontrados"
- Notas pessoais: clique com o botão direito (ou toque e segure) no mapa
- Link compartilhável: a URL guarda a posição e o local aberto
- Layout responsivo para celular

O progresso e as notas ficam salvos no navegador de cada pessoa (`localStorage`).

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Em cerca de um minuto o site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

Os tiles somam cerca de 45 MB (7.840 arquivos), bem abaixo do limite do GitHub Pages.

## Testar no computador

Abrir o `index.html` direto (via `file://`) não carrega os locais, porque o navegador bloqueia o `fetch`. Use um servidor local:

```powershell
python -m http.server 8000
```

Depois abra http://localhost:8000.

## Atualizar os dados

O gtadb.org é atualizado com frequência. Para trazer a versão mais recente dos locais e do mapa:

```powershell
.\atualizar-dados.ps1
```

## Estrutura

```
index.html            página
css/estilo.css        visual
js/categorias.js      categorias em PT-BR (mapeamento das tags do gtadb)
js/app.js             lógica do mapa
data/landmarks.json   locais (cópia de gtadb.org/map/data/6/landmarks.json)
tiles/day/{z}/…       tiles do mapa (cópia de gtadb.org/maps/tiles/6/day)
```

As fotos não estão no repositório. Elas são carregadas sob demanda direto de `raw.githubusercontent.com/rolux/gtadb.org`.

## Créditos e licenças

- **Locais, fotos e tiles do mapa:** [gtadb.org e colaboradores](https://github.com/rolux/gtadb.org), sob licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt_BR) (GTA VI Landmarks Data e GTA VI Map Tiles, https://map.gtadb.org). **Alterações feitas:** as tags foram reagrupadas em categorias e traduzidas para o português, e apenas os zooms 0–5 do conjunto "day" foram incluídos.
- **Leaflet:** BSD-2-Clause.
- **Font Awesome Free:** ícones CC BY 4.0, fontes SIL OFL 1.1.

Grand Theft Auto, GTA VI e Leonida são marcas da Rockstar Games / Take-Two Interactive. Este é um projeto de fãs, sem afiliação. O mapa é uma reconstrução da comunidade e pode conter imprecisões.
