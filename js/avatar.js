// =====================================================================
// AVATARES chibi manga · una capitana y un capitán por cada color
// avatarSVG(equipo, genero, pose) -> HTML con el SVG animado
//   equipo: azul | rojo | verde | negro | blanco | marron | rosado | morado | naranja | vinotinto
//   genero: mujer | hombre      pose: presenta | niega | celebra
// =====================================================================
(function () {
  function valores(p) {
    const E = {
      azul:      ['Azul', '#2F6BFF', '#1C45B8', '#9CBBFF'],
      rojo:      ['Rojo', '#E8344E', '#A81E33', '#FF9AAA'],
      verde:     ['Verde', '#22B573', '#13804F', '#9BE8C4'],
      negro:     ['Negro', '#2B2B2B', '#0F0F0F', '#8C8C8C'],
      blanco:    ['Blanco', '#FFFFFF', '#C9C2EE', '#E9E4FF'],
      marron:    ['Marrón', '#8B5A2B', '#5C3A1A', '#D2A679'],
      rosado:    ['Rosado', '#FF7EB6', '#D94C8C', '#FFC2DD'],
      morado:    ['Morado', '#8A4FFF', '#5A2BC0', '#B795FF'],
      naranja:   ['Naranja', '#FF8A1F', '#C75F00', '#FFC48A'],
      vinotinto: ['Vinotinto', '#7A1F3D', '#4E1026', '#C46A8A']
    };
    const OJOS = { cafe: ['#2B1408', '#7A4A22', '#D9A56E'], miel: ['#4A2A00', '#C27C0E', '#FFD27A'], verde: ['#0E3B22', '#2E9E5B', '#A8E8B8'], azul: ['#0E2560', '#3F78E0', '#B8D4FF'], violeta: ['#2E145F', '#7B3FF2', '#E0CCFF'] };
    const P = {
      azul:      { mujer: ['#F2C6A0', '#3B2416', 'coletas', 'cupcake', '#5B8CFF', 'azul', 'un cupcake de arándanos'], hombre: ['#C68642', '#1A1110', 'puntas', 'dona', '#5B8CFF', 'cafe', 'una dona de arándanos'] },
      rojo:      { mujer: ['#8D5524', '#1A1110', 'largo', 'torta', '#C62839', 'cafe', 'una porción de red velvet'], hombre: ['#F2C6A0', '#8A3A14', 'lateral', 'cupcake', '#E8344E', 'verde', 'un cupcake de fresa'] },
      verde:     { mujer: ['#E8B48A', '#8A5A2B', 'mono', 'helado', '#8EDB6A', 'verde', 'un helado de pistacho'], hombre: ['#6B4226', '#120B08', 'rizado', 'macaron', '#8EDB6A', 'miel', 'un macaron de limón'] },
      negro:     { mujer: ['#C68642', '#141414', 'largo', 'torta', '#3A2420', 'miel', 'una torta de chocolate negro'], hombre: ['#F7D7C4', '#2A1A12', 'puntas', 'cupcake', '#3A2420', 'azul', 'un cupcake de chocolate'] },
      blanco:    { mujer: ['#F7D7C4', '#E3B04B', 'coletas', 'cupcake', '#FFFFFF', 'azul', 'un cupcake de vainilla'], hombre: ['#8D5524', '#1A1110', 'rizado', 'torta', '#FFFFFF', 'cafe', 'una porción de tres leches'] },
      marron:    { mujer: ['#A0663F', '#2A1A12', 'mono', 'dona', '#6B3E1F', 'miel', 'una dona de chocolate'], hombre: ['#E0AC69', '#5A3825', 'lateral', 'helado', '#A0703F', 'cafe', 'un helado de café'] },
      rosado:    { mujer: ['#FFDBC4', '#5A3825', 'coletas', 'dona', '#FF9CC8', 'violeta', 'una dona de fresa'], hombre: ['#A0663F', '#120B08', 'puntas', 'macaron', '#FF9CC8', 'cafe', 'un macaron de frambuesa'] },
      morado:    { mujer: ['#6B4226', '#120B08', 'largo', 'helado', '#9E6BFF', 'violeta', 'un helado de mora'], hombre: ['#F2C6A0', '#2A1838', 'lateral', 'cupcake', '#9E6BFF', 'violeta', 'un cupcake de mora'] },
      naranja:   { mujer: ['#E0AC69', '#8A3A14', 'mono', 'macaron', '#FFA54D', 'verde', 'un macaron de mandarina'], hombre: ['#C68642', '#1A1110', 'rizado', 'dona', '#FFA54D', 'miel', 'una dona de naranja'] },
      vinotinto: { mujer: ['#D9A07A', '#2B1810', 'largo', 'cupcake', '#9C2A50', 'cafe', 'un cupcake de frutos rojos'], hombre: ['#FFDBC4', '#3B2416', 'puntas', 'torta', '#9C2A50', 'azul', 'una porción de torta de cereza'] }
    };
    const id = E[p.equipo] ? p.equipo : 'morado';
    const genero = p.genero === 'hombre' ? 'hombre' : 'mujer';
    const [nombre, color, sombra, claro] = E[id];
    const [piel, cabello, peinado, tipo, postre, ojos, dulce] = P[id][genero];
    const pose = p.pose ?? 'presenta';
    const k = p.k ?? 'a';
    const on = (b) => (b ? 'inline' : 'none');
    const cel = pose === 'celebra', neg = pose === 'niega', pre = !cel && !neg;
    const muj = genero === 'mujer';
    const o = OJOS[ojos];
    const brazoI = cel ? 'M92 186 Q74 160 70 132' : (neg ? 'M92 186 Q82 210 104 220' : 'M92 186 Q80 210 108 222');
    const manoI = cel ? [70, 128] : (neg ? [106, 220] : [110, 222]);
    const manoD = cel ? [170, 128] : (neg ? [168, 134] : [130, 222]);
    return {
      alt: (muj ? 'Capitana' : 'Capitán') + ' del Equipo ' + nombre + ' con ' + dulce,
      irisId: 'iris-' + id + '-' + genero,
      iris1: o[0], iris2: o[1], iris3: o[2],
      color, sombra, claro, piel, cabello, postre,
      manga: muj ? piel : color,
      ribete: id === 'blanco' ? '#8A80C8' : '#FFFFFF',
      franja: id === 'blanco' ? '#8A80C8' : color,
      papel: id === 'blanco' ? '#C9C2EE' : sombra,
      popCls: 'av-pop-' + k,
      bobCls: cel ? '' : 'av-bob',
      cuerpoCls: cel ? 'av-salta' : '',
      cabezaCls: neg ? 'av-niega-cabeza' : '',
      brazoDCls: neg ? 'av-niega-brazo' : (cel ? 'av-festeja' : ''),
      dMujer: on(muj), dHombre: on(!muj),
      dColetas: on(peinado === 'coletas'), dLargo: on(peinado === 'largo'), dMono: on(peinado === 'mono'),
      dPuntas: on(peinado === 'puntas'), dRizado: on(peinado === 'rizado'),
      dFlequilloM: on(muj), dFlequilloH: on(peinado === 'puntas'), dLateral: on(peinado === 'lateral'), dRizadoFrente: on(peinado === 'rizado'),
      dLazo: on(peinado === 'largo'),
      dAbiertos: on(!cel), dFeliz: on(cel), dDedo: on(neg), dDosManos: on(false),
      pestanas: 'M81 110 Q97 96 115 106 L118 103 M159 110 Q143 96 125 106 L122 103',
      grosor: muj ? 4.5 : 3.2,
      cejas: neg ? 'M84 96 L110 102 M156 96 L130 102' : (muj ? 'M86 96 Q97 91 108 95 M132 95 Q143 91 154 96' : 'M84 95 Q97 89 110 94 M130 94 Q143 89 156 95'),
      cejaGrosor: muj ? 2.2 : 3.6,
      boca: cel ? 'M110 144 Q120 162 130 144 Z' : (neg ? 'M112 150 Q116 146 120 150 Q124 154 128 150' : 'M113 146 Q120 155 127 146 Q120 149 113 146 Z'),
      bocaFill: neg ? 'none' : '#C2185B',
      brazoI, brazoD: cel ? 'M148 186 Q166 160 170 132' : (neg ? 'M148 186 Q170 170 168 140' : 'M148 186 Q160 210 132 222'),
      manoIx: manoI[0], manoIy: manoI[1], manoDx: manoD[0], manoDy: manoD[1],
      postreT: cel ? 'translate(70 106)' : (neg ? 'translate(104 200)' : 'translate(120 202)'),
      pCupcake: on(tipo === 'cupcake'), pDona: on(tipo === 'dona'), pHelado: on(tipo === 'helado'),
      pTorta: on(tipo === 'torta'), pMacaron: on(tipo === 'macaron')
    };
  }

  window.avatarSVG = function (equipo, genero, pose, k) {
    const v = valores({ equipo, genero, pose, k: k || 'a' });
    return `<div class="${v.popCls}"><div class="${v.bobCls}"><svg viewBox="0 0 240 300" role="img" aria-label="${v.alt}">
  <defs>
    <linearGradient id="${v.irisId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v.iris1}"></stop><stop offset="0.55" stop-color="${v.iris2}"></stop><stop offset="1" stop-color="${v.iris3}"></stop></linearGradient>
  </defs>
  <ellipse cx="120" cy="290" rx="60" ry="8" fill="#000000" opacity="0.2"></ellipse>
  <g class="${v.cuerpoCls}" style="transform-origin: 120px 288px">
    <g stroke="#2A1838" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
      <g display="${v.dColetas}" fill="${v.cabello}">
        <path d="M70 96 Q38 130 46 196 Q52 214 64 200 Q58 150 84 118 Z"></path>
        <path d="M170 96 Q202 130 194 196 Q188 214 176 200 Q182 150 156 118 Z"></path>
        <path d="M66 98 L54 92 L58 108 Z M66 98 L74 84 L78 100 Z M174 98 L186 92 L182 108 Z M174 98 L166 84 L162 100 Z" fill="${v.color}"></path>
      </g>
      <path display="${v.dLargo}" d="M68 96 Q56 170 72 214 L168 214 Q184 170 172 96 Z" fill="${v.cabello}"></path>
      <g display="${v.dMujer}">
        <rect x="104" y="248" width="13" height="32" rx="6" fill="${v.piel}"></rect>
        <rect x="123" y="248" width="13" height="32" rx="6" fill="${v.piel}"></rect>
      </g>
      <g display="${v.dHombre}">
        <path d="M100 238 L118 238 L117 282 L102 282 Z M122 238 L140 238 L138 282 L123 282 Z" fill="#2E2A48"></path>
      </g>
      <path d="M100 280 Q100 272 112 274 L118 280 Q118 288 106 288 Q100 288 100 280 Z" fill="${v.sombra}"></path>
      <path d="M122 280 L128 274 Q140 272 140 280 Q140 288 134 288 Q122 288 122 280 Z" fill="${v.sombra}"></path>
      <g display="${v.dMujer}">
        <path d="M90 174 Q120 164 150 174 L172 256 Q120 270 68 256 Z" fill="${v.color}"></path>
        <path d="M138 171 L150 174 L172 256 Q160 260 146 262 Z" fill="${v.sombra}" stroke="none" opacity="0.6"></path>
        <path d="M84 244 Q120 254 156 244" fill="none" stroke="${v.ribete}" stroke-width="3"></path>
        <rect x="112" y="160" width="16" height="16" fill="${v.piel}"></rect>
        <path d="M92 176 L120 204 L148 176 L154 188 L120 218 L86 188 Z" fill="#FFFFFF"></path>
        <path d="M92 182 L120 208 L148 182" fill="none" stroke="${v.franja}" stroke-width="2.5"></path>
        <path d="M120 206 L108 200 L110 214 Z M120 206 L132 200 L130 214 Z" fill="${v.claro}"></path>
      </g>
      <g display="${v.dHombre}">
        <path d="M88 174 Q120 165 152 174 L160 244 L80 244 Z" fill="${v.color}"></path>
        <path d="M140 171 L152 174 L160 244 L146 244 Z" fill="${v.sombra}" stroke="none" opacity="0.6"></path>
        <rect x="112" y="160" width="16" height="16" fill="${v.piel}"></rect>
        <path d="M104 172 L120 200 L136 172 Z" fill="#FFFFFF"></path>
        <path d="M116 182 L124 182 L127 214 L120 222 L113 214 Z" fill="${v.claro}"></path>
        <path d="M120 200 L120 244" fill="none" stroke="${v.sombra}" stroke-width="2"></path>
        <circle cx="126" cy="228" r="2.5" fill="${v.ribete}"></circle><circle cx="126" cy="238" r="2.5" fill="${v.ribete}"></circle>
      </g>
      <path d="${v.brazoI}" fill="none" stroke="#2A1838" stroke-width="13"></path>
      <path d="${v.brazoI}" fill="none" stroke="${v.manga}" stroke-width="8.5"></path>
      <g transform="${v.postreT}">
        <g display="${v.pHelado}">
          <path d="M-12 6 L12 6 L0 36 Z" fill="#E0A458"></path>
          <path d="M-8 12 L6 20 M-4 26 L4 10" fill="none" stroke="#B87A35" stroke-width="1.5"></path>
          <circle cx="-8" cy="0" r="11" fill="${v.postre}"></circle><circle cx="8" cy="0" r="11" fill="${v.postre}"></circle><circle cx="0" cy="-13" r="10" fill="${v.postre}"></circle>
          <circle cx="0" cy="-24" r="3.5" fill="#E8344E"></circle>
        </g>
        <g display="${v.pCupcake}">
          <path d="M-15 4 L15 4 L11 28 L-11 28 Z" fill="${v.papel}"></path>
          <path d="M-7 6 L-5 27 M0 6 L0 27 M7 6 L5 27" fill="none" stroke="#2A1838" stroke-width="1.2" opacity="0.5"></path>
          <path d="M-18 6 Q-20 -8 -8 -10 Q-6 -22 4 -19 Q16 -17 13 -8 Q22 -6 18 6 Z" fill="${v.postre}"></path>
          <circle cx="1" cy="-22" r="4.5" fill="#E8344E"></circle>
        </g>
        <g display="${v.pDona}">
          <circle cx="0" cy="4" r="19" fill="#D9A066"></circle>
          <path d="M-17 0 Q-16 -13 0 -13 Q17 -13 17 2 Q18 10 10 9 Q4 14 -3 10 Q-14 13 -17 0 Z" fill="${v.postre}"></path>
          <circle cx="0" cy="3" r="6" fill="#F7E7C6"></circle>
          <path d="M-10 -5 l3 -2 M7 -7 l3 2 M11 2 l2 3 M-13 4 l2 -3 M-2 -9 l3 0" fill="none" stroke="#FFFFFF" stroke-width="2.5"></path>
        </g>
        <g display="${v.pTorta}">
          <ellipse cx="0" cy="24" rx="24" ry="5" fill="#FFFFFF"></ellipse>
          <rect x="-19" y="-2" width="38" height="24" rx="3" fill="${v.postre}"></rect>
          <rect x="-19" y="8" width="38" height="4" fill="#FFF5E1" stroke="none"></rect>
          <path d="M-19 -2 Q-10 -11 0 -4 Q10 -11 19 -2 Z" fill="#FFF5E1"></path>
          <circle cx="0" cy="-11" r="4.5" fill="#E8344E"></circle>
        </g>
        <g display="${v.pMacaron}">
          <ellipse cx="0" cy="-6" rx="19" ry="9" fill="${v.postre}"></ellipse>
          <rect x="-17" y="0" width="34" height="6" rx="2" fill="#FFF5E1"></rect>
          <ellipse cx="0" cy="12" rx="19" ry="9" fill="${v.postre}"></ellipse>
        </g>
      </g>
      <g class="${v.brazoDCls}" style="transform-origin: 148px 186px">
        <path d="${v.brazoD}" fill="none" stroke="#2A1838" stroke-width="13"></path>
        <path d="${v.brazoD}" fill="none" stroke="${v.manga}" stroke-width="8.5"></path>
        <rect display="${v.dDedo}" x="165" y="112" width="7" height="18" rx="3.5" fill="${v.piel}" stroke-width="2"></rect>
        <ellipse cx="${v.manoDx}" cy="${v.manoDy}" rx="7" ry="6.5" fill="${v.piel}"></ellipse>
      </g>
      <ellipse cx="${v.manoIx}" cy="${v.manoIy}" rx="7" ry="6.5" fill="${v.piel}"></ellipse>
      <ellipse display="${v.dDosManos}" cx="130" cy="222" rx="7" ry="6.5" fill="${v.piel}"></ellipse>
    </g>
    <g class="${v.cabezaCls}" style="transform-origin: 120px 166px">
      <g stroke="#2A1838" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
        <path display="${v.dPuntas}" d="M72 74 L62 46 L88 58 L92 28 L110 48 L122 20 L134 48 L150 28 L154 58 L178 46 L168 74 Z" fill="${v.cabello}"></path>
        <g display="${v.dRizado}" fill="${v.cabello}">
          <circle cx="72" cy="84" r="15"></circle><circle cx="78" cy="60" r="15"></circle><circle cx="96" cy="46" r="15"></circle><circle cx="120" cy="40" r="15"></circle>
          <circle cx="144" cy="46" r="15"></circle><circle cx="162" cy="60" r="15"></circle><circle cx="168" cy="84" r="15"></circle>
        </g>
        <circle display="${v.dMono}" cx="120" cy="38" r="19" fill="${v.cabello}"></circle>
        <path d="M64 100 Q64 158 120 168 Q176 158 176 100 Q176 44 120 44 Q64 44 64 100 Z" fill="${v.piel}"></path>
      </g>
      <path d="M70 100 Q90 112 120 108 Q150 112 170 100 L170 112 Q120 124 70 112 Z" fill="#000000" opacity="0.08"></path>
      <g display="${v.dAbiertos}">
        <g class="parpadea">
          <ellipse cx="98" cy="120" rx="15" ry="18" fill="#FFFFFF"></ellipse><ellipse cx="142" cy="120" rx="15" ry="18" fill="#FFFFFF"></ellipse>
          <ellipse cx="99" cy="122" rx="12" ry="16" fill="url(#${v.irisId})"></ellipse><ellipse cx="141" cy="122" rx="12" ry="16" fill="url(#${v.irisId})"></ellipse>
          <ellipse cx="99" cy="120" rx="5.5" ry="8" fill="#1E0F33"></ellipse><ellipse cx="141" cy="120" rx="5.5" ry="8" fill="#1E0F33"></ellipse>
          <ellipse cx="93" cy="112" rx="5" ry="6" fill="#FFFFFF"></ellipse><ellipse cx="135" cy="112" rx="5" ry="6" fill="#FFFFFF"></ellipse>
          <circle cx="105" cy="130" r="2.5" fill="#FFFFFF"></circle><circle cx="147" cy="130" r="2.5" fill="#FFFFFF"></circle>
          <path d="${v.pestanas}" fill="none" stroke="#2A1838" stroke-width="${v.grosor}" stroke-linecap="round"></path>
          <path display="${v.dMujer}" d="M81 110 L76 104 M159 110 L164 104" stroke="#2A1838" stroke-width="3" stroke-linecap="round"></path>
          <path d="M90 138 Q98 141 106 138 M134 138 Q142 141 150 138" fill="none" stroke="#2A1838" stroke-width="1.6" stroke-linecap="round"></path>
        </g>
      </g>
      <path display="${v.dFeliz}" d="M84 124 Q98 106 112 124 M128 124 Q142 106 156 124" fill="none" stroke="#2A1838" stroke-width="4.5" stroke-linecap="round"></path>
      <path d="${v.cejas}" fill="none" stroke="#2A1838" stroke-width="${v.cejaGrosor}" stroke-linecap="round"></path>
      <ellipse cx="84" cy="142" rx="10" ry="5" fill="#FF6F91" opacity="0.45"></ellipse><ellipse cx="156" cy="142" rx="10" ry="5" fill="#FF6F91" opacity="0.45"></ellipse>
      <path d="M78 144 l4 -5 M84 144 l4 -5 M90 144 l4 -5 M150 144 l4 -5 M156 144 l4 -5 M162 144 l4 -5" stroke="#E8506F" stroke-width="1.4" stroke-linecap="round"></path>
      <path d="M120 133 l1 3" stroke="#000000" stroke-width="1.6" stroke-linecap="round" opacity="0.25"></path>
      <path d="${v.boca}" fill="${v.bocaFill}" stroke="#2A1838" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></path>
      <g stroke="#2A1838" stroke-width="2.2" stroke-linejoin="round">
        <path display="${v.dFlequilloM}" d="M62 106 Q58 48 120 40 Q182 48 178 106 L170 84 L162 104 L152 72 L140 100 L128 66 L116 100 L104 68 L92 102 L82 76 L72 104 Z" fill="${v.cabello}"></path>
        <path display="${v.dFlequilloM}" d="M64 100 Q58 140 70 164 L78 118 Z M176 100 Q182 140 170 164 L162 118 Z" fill="${v.cabello}"></path>
        <path display="${v.dFlequilloH}" d="M62 104 Q58 46 120 40 Q182 46 178 104 L172 90 L166 102 L158 80 L148 98 L138 76 L128 96 L118 74 L108 96 L98 76 L90 98 L80 82 L72 100 Z" fill="${v.cabello}"></path>
        <path display="${v.dLateral}" d="M62 106 Q56 44 124 38 Q184 46 178 106 L172 88 Q156 70 104 100 L96 88 L86 104 L78 92 Z" fill="${v.cabello}"></path>
        <path display="${v.dRizadoFrente}" d="M66 96 Q70 70 90 66 Q100 58 112 64 Q124 56 136 64 Q150 60 158 70 Q174 76 174 96 Q160 84 148 88 Q136 80 124 86 Q112 78 100 86 Q86 80 66 96 Z" fill="${v.cabello}"></path>
        <path d="M120 42 Q126 18 142 22 Q128 26 124 42 Z" fill="${v.cabello}"></path>
        <path display="${v.dMono}" d="M138 30 L152 22 L150 38 Z M138 30 L126 22 L128 38 Z" fill="${v.color}"></path>
        <path display="${v.dLazo}" d="M150 62 L166 54 L164 72 Z M150 62 L138 54 L140 72 Z" fill="${v.color}"></path>
      </g>
      <path d="M86 64 Q120 50 154 64 L148 70 Q120 58 92 70 Z" fill="#FFFFFF" opacity="0.28"></path>
    </g>
  </g>
</svg></div></div>`;
  };
})();
