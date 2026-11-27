// =====================================================================
// FONDO · pintura que gotea desde arriba, con gotas que caen y charcos
// pintarFondo(largoMax) vuelve a dibujarlo (se usa como transición)
// =====================================================================
(function () {
  const COLORES = ['#2F6BFF', '#E8344E', '#22B573', '#FFD23F', '#FF7EB6', '#8A4FFF', '#FF8A1F', '#19C3C9', '#FFFFFF'];
  const azar = (a, b) => a + Math.random() * (b - a);
  const entero = (a, b) => Math.floor(azar(a, b + 1));

  window.pintarFondo = function (largoMax) {
    const capa = document.getElementById('fondo');
    if (!capa) return;
    const W = Math.max(window.innerWidth, 320);
    const H = Math.max(window.innerHeight, 560);
    const ancho = 39;
    const max = largoMax || 150;
    const inicio = entero(0, COLORES.length - 1);
    const partes = [];

    for (let k = 0; k < Math.ceil(W / ancho); k++) {
      const c = COLORES[(k + inicio) % COLORES.length];
      const x = k * ancho;
      partes.push(`<rect x="${x - 1}" y="-10" width="${ancho + 2}" height="${entero(34, 52)}" fill="${c}"/>`);
      const chorros = entero(1, 2);
      for (let j = 0; j < chorros; j++) {
        const gx = x + entero(4, 24), gw = entero(9, 14), gl = entero(50, max), dl = azar(0, 0.8);
        partes.push(`<rect class="chorro" x="${gx}" y="26" width="${gw}" height="${gl}" rx="${Math.floor(gw / 2)}" fill="${c}" style="animation-delay:${dl.toFixed(2)}s,${(dl + 1.2).toFixed(2)}s"/>`);
        partes.push(`<circle class="gota" cx="${gx + gw / 2}" cy="${26 + gl}" r="${Math.floor(gw / 2) + 1}" fill="${c}" style="--caida:${Math.max(120, H - 60 - gl)}px;animation-delay:${(dl + azar(1, 3)).toFixed(2)}s"/>`);
      }
    }
    for (let k = 0; k < Math.ceil(W / 80); k++) {
      partes.push(`<ellipse class="charco" cx="${40 + k * 80}" cy="${H - 2}" rx="${entero(36, 52)}" ry="14" fill="${COLORES[(k * 3 + inicio) % COLORES.length]}" style="animation-delay:${(k * 0.3).toFixed(1)}s"/>`);
    }
    capa.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="100%">${partes.join('')}</svg>`;
  };

  let espera;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => window.pintarFondo(window.__largoFondo), 300);
  });
})();
