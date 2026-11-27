// =====================================================================
// MÚSICA ORIGINAL generada en el navegador (Web Audio API)
// Sin archivos, sin anuncios, sin derechos de terceros.
//   Musica.tocar('synthwave' | 'reggaeton' | 'house' | 'dub' | 'epica')
//   Musica.detener()        Musica.volumen(0..1)
//   Musica.sfx('toque' | 'lleno' | 'fanfarria')   Musica.usarSfx('burbujas' | 'monedas' | 'tropical' | 'magia' | 'caricatura')
// =====================================================================
window.Musica = (function () {
  let ctx = null, salida = null, musicaBus = null, ruido = null, eco = null;
  let reloj = null, siguiente = 0, paso = 0, actual = null;
  let vol = 0.55;

  const nota = (n) => 440 * Math.pow(2, (n - 69) / 12);
  // Nombres -> número MIDI (C4 = 60)
  const N = (() => {
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    return (s) => {
      const m = /^([A-G])(#|b)?(\d)$/.exec(s);
      return 12 * (Number(m[3]) + 1) + base[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    };
  })();

  function iniciar() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    salida = ctx.createGain(); salida.gain.value = vol;
    musicaBus = ctx.createGain(); musicaBus.gain.value = 1;
    musicaBus.connect(salida); salida.connect(comp); comp.connect(ctx.destination);
    eco = ctx.createDelay(1); eco.delayTime.value = 0.27;
    const realim = ctx.createGain(); realim.gain.value = 0.33;
    const humedo = ctx.createGain(); humedo.gain.value = 0.28;
    eco.connect(realim); realim.connect(eco); eco.connect(humedo); humedo.connect(musicaBus);
    ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  // ---------------- Instrumentos ----------------
  function env(g, t, v, a, r) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + r);
  }

  function bombo(t, v = 1, dest = musicaBus) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    env(g, t, 0.9 * v, 0.003, 0.32);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.4);
  }

  function ruidoFiltrado(t, v, tipo, freq, dur, dest = musicaBus, q = 1) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; f.type = tipo; f.frequency.value = freq; f.Q.value = q;
    env(g, t, v, 0.002, dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  function caja(t, v = 1) {
    ruidoFiltrado(t, 0.45 * v, 'highpass', 1400, 0.16);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
    env(g, t, 0.3 * v, 0.002, 0.09); o.connect(g); g.connect(musicaBus); o.start(t); o.stop(t + 0.15);
  }
  const palmas = (t, v = 1) => { [0, 0.012, 0.025].forEach((d) => ruidoFiltrado(t + d, 0.35 * v, 'bandpass', 1600, 0.06, musicaBus, 1.5)); ruidoFiltrado(t + 0.03, 0.25 * v, 'bandpass', 1600, 0.16, musicaBus, 1.5); };
  const platillo = (t, v = 1, abierto = false) => ruidoFiltrado(t, 0.16 * v, 'highpass', 7500, abierto ? 0.22 : 0.035);
  const guacharaca = (t, v = 1) => ruidoFiltrado(t, 0.2 * v, 'bandpass', 5200, 0.05, musicaBus, 2);
  const llamador = (t, v = 1) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(220, t + 0.1); env(g, t, 0.45 * v, 0.002, 0.14); o.connect(g); g.connect(musicaBus); o.start(t); o.stop(t + 0.2); };

  // Sintetizador general
  function sinte(t, midi, dur, o = {}) {
    const dest = o.dest || musicaBus;
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(o.corte || 2400, t);
    if (o.barrido) f.frequency.exponentialRampToValueAtTime(Math.max(120, (o.corte || 2400) * o.barrido), t + dur);
    f.Q.value = o.q || 1;
    const osc = [];
    (o.desafine ? [-o.desafine, o.desafine] : [0]).forEach((cents) => {
      const x = ctx.createOscillator();
      x.type = o.onda || 'square';
      x.frequency.value = nota(midi);
      x.detune.value = cents;
      if (o.vibrato) {
        const l = ctx.createOscillator(), lg = ctx.createGain();
        l.frequency.value = 5.5; lg.gain.value = o.vibrato;
        l.connect(lg); lg.connect(x.detune); l.start(t); l.stop(t + dur + (o.suelta || 0.08) + 0.1);
      }
      x.connect(f); osc.push(x);
    });
    const v = (o.v || 0.2) / osc.length;
    const a = o.ataque || 0.005, s = o.suelta || 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.setValueAtTime(v * (o.sostiene ?? 0.8), t + Math.max(a, dur - 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + s);
    f.connect(g); g.connect(dest);
    if (o.eco) g.connect(eco);
    osc.forEach((x) => { x.start(t); x.stop(t + dur + s + 0.05); });
  }
  const acorde = (t, notas, dur, o) => notas.forEach((n) => sinte(t, n, dur, o));

  // ---------------- Estilos ----------------
  // Cada estilo: bpm, swing (0..0.3), pasos del ciclo (16 por compás) y una función por paso
  const ESTILOS = {
    synthwave: {
      nombre: 'Synthwave retro', bpm: 116, swing: 0, pasos: 64,
      tocar(p, t, dp) {
        const compas = Math.floor(p / 16), s = p % 16;
        const raices = [N('A2'), N('F2'), N('C3'), N('G2')];
        const tipos = [[0, 3, 7, 12], [0, 4, 7, 12], [0, 4, 7, 12], [0, 4, 7, 12]];
        const r = raices[compas];
        if (s % 4 === 0) bombo(t, 0.95);
        if (s === 4 || s === 12) { caja(t, 0.8); ruidoFiltrado(t, 0.12, 'bandpass', 2500, 0.5); }
        if (s % 2 === 1) platillo(t, 0.5);
        if (s % 2 === 0) sinte(t, r + (s % 4 === 2 ? 12 : 0), dp * 1.7, { onda: 'sawtooth', v: 0.16, corte: 800, barrido: 0.5, q: 4 });
        if (s === 0) acorde(t, tipos[compas].map((x) => r + 12 + x), dp * 15.5, { onda: 'sawtooth', v: 0.035, corte: 1600, desafine: 12, ataque: 0.35, suelta: 0.5 });
        sinte(t, r + 24 + tipos[compas][s % 4], dp * 0.7, { onda: 'square', v: 0.03, corte: 2800, eco: true });
        const lead = { 0: 'E5', 4: 'A5', 6: 'G5', 8: 'E5', 12: 'D5', 16: 'C5', 20: 'F5', 22: 'E5', 24: 'C5', 28: 'A4', 32: 'G4', 36: 'C5', 38: 'E5', 40: 'G5', 44: 'E5', 48: 'D5', 52: 'B4', 54: 'D5', 56: 'G5', 60: 'F#5' };
        if (lead[p]) sinte(t, N(lead[p]), dp * 3.6, { onda: 'sawtooth', v: 0.08, corte: 3000, desafine: 7, vibrato: 16, ataque: 0.03, eco: true });
      }
    },

    reggaeton: {
      nombre: 'Reggaetón alegre', bpm: 95, swing: 0, pasos: 64,
      tocar(p, t, dp) {
        const compas = Math.floor(p / 16), s = p % 16;
        const raices = [N('A2'), N('F2'), N('C3'), N('G2')];
        const tipos = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]];
        const r = raices[compas];
        if (s % 4 === 0) bombo(t, 1);
        if ([3, 6, 11, 14].includes(s)) caja(t, 0.75);
        if (s % 2 === 0) platillo(t, 0.45);
        if ([0, 3, 8, 11].includes(s)) sinte(t, r - 12 + 12, dp * 2.2, { onda: 'sine', v: 0.38, corte: 400 });
        if ([0, 3, 6, 10, 12].includes(s)) acorde(t, tipos[compas].map((x) => r + 24 + x), dp * 0.9, { onda: 'triangle', v: 0.05, corte: 3000, sostiene: 0.3 });
        const marimba = { 2: 'E5', 4: 'A5', 7: 'C6', 10: 'B5', 12: 'A5', 18: 'C5', 20: 'F5', 23: 'A5', 26: 'G5', 28: 'F5', 34: 'E5', 36: 'G5', 39: 'C6', 42: 'B5', 44: 'G5', 50: 'D5', 52: 'G5', 55: 'B5', 58: 'A5', 60: 'G5' };
        if (marimba[p]) sinte(t, N(marimba[p]), dp * 1.4, { onda: 'sine', v: 0.16, corte: 4000, sostiene: 0.2, suelta: 0.15 });
      }
    },

    house: {
      nombre: 'House de fiesta', bpm: 124, swing: 0, pasos: 64,
      tocar(p, t, dp) {
        const compas = Math.floor(p / 16), s = p % 16;
        const ac = [['F4', 'A4', 'C5'], ['E4', 'G4', 'C5'], ['D4', 'F4', 'A4'], ['D4', 'F4', 'Bb4']][compas].map(N);
        const bajos = [N('F2'), N('C2'), N('D2'), N('Bb1')];
        if (s % 4 === 0) bombo(t, 1);
        if (s === 4 || s === 12) palmas(t, 0.9);
        if (s % 4 === 2) platillo(t, 0.8, true); else platillo(t, 0.3);
        if (s % 4 === 2) sinte(t, bajos[compas] + 12, dp * 1.6, { onda: 'sawtooth', v: 0.22, corte: 700, barrido: 0.4, q: 5 });
        if ([0, 3, 6, 10, 12].includes(s)) acorde(t, ac, dp * 0.9, { onda: 'square', v: 0.045, corte: 2600, barrido: 0.6, sostiene: 0.3 });
        const chop = { 14: 'C6', 15: 'A5', 30: 'C6', 31: 'G5', 46: 'A5', 47: 'F5', 60: 'D6', 62: 'C6' };
        if (chop[p]) sinte(t, N(chop[p]), dp * 0.8, { onda: 'triangle', v: 0.14, corte: 4000, eco: true });
      }
    },

    dub: {
      nombre: 'Hip hop con melódica', bpm: 86, swing: 0.1, pasos: 64,
      tocar(p, t, dp) {
        const compas = Math.floor(p / 16), s = p % 16;
        const raices = [N('E2'), N('E2'), N('C2'), N('D2')];
        const r = raices[compas];
        if ([0, 7, 10].includes(s)) bombo(t, 1);
        if (s === 4 || s === 12) caja(t, 0.85);
        if (s % 2 === 0) platillo(t, s % 4 === 2 ? 0.6 : 0.35);
        const bajo = { 0: 0, 3: 0, 7: 7, 10: 5, 12: 3 };
        if (bajo[s] !== undefined) sinte(t, r + bajo[s], dp * 2, { onda: 'sine', v: 0.36, corte: 500 });
        if (s % 4 === 2) {
          const tipo = compas < 2 ? [7, 10, 15] : [7, 12, 16];
          acorde(t, tipo.map((x) => r + 12 + x), dp * 0.6, { onda: 'square', v: 0.035, corte: 1500, eco: true });
        }
        const melodica = { 0: 'B4', 3: 'G4', 4: 'A4', 6: 'B4', 8: 'D5', 12: 'B4', 16: 'A4', 19: 'G4', 20: 'E4', 24: 'G4', 28: 'F#4', 32: 'G4', 35: 'E4', 36: 'G4', 38: 'C5', 40: 'B4', 44: 'G4', 48: 'A4', 51: 'F#4', 52: 'D4', 56: 'F#4', 60: 'A4' };
        if (melodica[p]) sinte(t, N(melodica[p]), dp * 3.2, { onda: 'square', v: 0.075, corte: 2200, desafine: 6, vibrato: 22, ataque: 0.06, eco: true });
      }
    },

    epica: {
      nombre: 'Aventura épica', bpm: 100, swing: 0, pasos: 64,
      tocar(p, t, dp) {
        const compas = Math.floor(p / 16), s = p % 16;
        const ac = [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']][compas].map(N);
        const raices = [N('C2'), N('A1'), N('F1'), N('G1')];
        if (s === 0) acorde(t, ac, dp * 15.5, { onda: 'sawtooth', v: 0.04, corte: 1400, desafine: 10, ataque: 0.3, suelta: 0.6 });
        if (s === 0 || s === 6 || s === 8 || s === 11) sinte(t, raices[compas] + 12, dp * 1.5, { onda: 'sine', v: 0.35, corte: 300 });
        if (s === 0 || s === 8) bombo(t, 0.9);
        if (compas === 3 && s >= 12) bombo(t, 0.4 + (s - 12) * 0.15);
        if (s === 4 || s === 12) caja(t, 0.6);
        if (s % 2 === 0) sinte(t, ac[s % 3] + 12, dp * 0.9, { onda: 'triangle', v: 0.05, corte: 3000 });
        if ([0, 3, 6].includes(s)) acorde(t, ac.map((x) => x + 12), dp * 1.2, { onda: 'sawtooth', v: 0.035, corte: 2000, barrido: 0.5 });
        const heroe = { 0: 'G4', 2: 'C5', 4: 'E5', 8: 'G5', 12: 'E5', 16: 'A4', 18: 'C5', 20: 'E5', 24: 'A5', 28: 'G5', 32: 'F5', 34: 'E5', 36: 'C5', 40: 'A4', 44: 'C5', 48: 'B4', 50: 'D5', 52: 'G5', 56: 'F5', 58: 'D5', 60: 'B4' };
        if (heroe[p]) sinte(t, N(heroe[p]), dp * 2.6, { onda: 'sawtooth', v: 0.07, corte: 2600, desafine: 5, vibrato: 10, ataque: 0.02 });
        if (p === 0) ruidoFiltrado(t, 0.08, 'highpass', 6000, 1.2);
      }
    }
  };

  // ---------------- Reproductor ----------------
  function programar() {
    const e = ESTILOS[actual];
    const dp = 60 / e.bpm / 4;
    while (siguiente < ctx.currentTime + 0.15) {
      e.tocar(paso % e.pasos, siguiente, dp);
      siguiente += dp * (paso % 2 === 0 ? 1 + e.swing : 1 - e.swing);
      paso++;
    }
  }

  function tocar(nombre) {
    iniciar();
    if (!ESTILOS[nombre]) return;
    if (actual === nombre && reloj) return;
    detener();
    actual = nombre; paso = 0; siguiente = ctx.currentTime + 0.08;
    reloj = setInterval(programar, 25);
    programar();
  }

  function detener() {
    clearInterval(reloj); reloj = null; actual = null;
  }

  function volumen(v) {
    vol = v;
    if (salida) salida.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  // Baja la música un momento para que se oiga un efecto
  function agachar(seg) {
    const g = musicaBus.gain, t = ctx.currentTime;
    g.cancelScheduledValues(t); g.setTargetAtTime(0.25, t, 0.03); g.setTargetAtTime(1, t + seg, 0.25);
  }

  // ---------------- Efectos de sonido ----------------
  // Tono que se desliza de una frecuencia a otra
  function desliz(t, f1, f2, dur, o = {}) {
    const x = ctx.createOscillator(), g = ctx.createGain();
    x.type = o.onda || 'sine';
    x.frequency.setValueAtTime(f1, t);
    if (o.lineal) x.frequency.linearRampToValueAtTime(f2, t + dur);
    else x.frequency.exponentialRampToValueAtTime(f2, t + dur);
    if (o.vibrato) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = o.vibratoVel || 12; lg.gain.value = o.vibrato;
      l.connect(lg); lg.connect(x.frequency); l.start(t); l.stop(t + dur + 0.1);
    }
    env(g, t, o.v || 0.2, o.ataque || 0.005, dur);
    x.connect(g); g.connect(o.dest || salida); x.start(t); x.stop(t + dur + 0.1);
  }
  // Campana: fundamental más armónicos que se apagan
  function campana(t, midi, dur, v = 0.12) {
    [[1, 1], [2.76, 0.4], [5.4, 0.2]].forEach(([m, a]) => {
      const x = ctx.createOscillator(), g = ctx.createGain();
      x.type = 'sine'; x.frequency.value = nota(midi) * m;
      env(g, t, v * a, 0.002, dur / m);
      x.connect(g); g.connect(salida); x.start(t); x.stop(t + dur + 0.1);
    });
  }
  // Barrido de ruido (soplido)
  function soplido(t, f1, f2, dur, v = 0.2) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; f.type = 'bandpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(salida); s.start(t); s.stop(t + dur + 0.05);
  }
  // Bloque de madera / clave
  function madera(t, freq, v = 0.4) {
    const x = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    x.type = 'triangle'; x.frequency.setValueAtTime(freq, t);
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 8;
    env(g, t, v, 0.001, 0.07);
    x.connect(f); f.connect(g); g.connect(salida); x.start(t); x.stop(t + 0.12);
  }
  // Tambor metálico (steel drum)
  function steel(t, midi, dur, v = 0.14) {
    [[1, 1], [2, 0.5], [3.01, 0.25]].forEach(([m, a]) => {
      const x = ctx.createOscillator(), g = ctx.createGain();
      x.type = 'sine'; x.frequency.value = nota(midi) * m;
      env(g, t, v * a, 0.004, dur);
      x.connect(g); g.connect(salida); x.start(t); x.stop(t + dur + 0.05);
    });
  }
  // Corneta de fiesta (air horn)
  function corneta(t, dur, v = 0.12) {
    [N('A#4'), N('F5'), N('A#5')].forEach((n) => {
      const x = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      x.type = 'sawtooth';
      x.frequency.setValueAtTime(nota(n) * 0.94, t); x.frequency.exponentialRampToValueAtTime(nota(n), t + 0.06);
      f.type = 'lowpass'; f.frequency.value = 3200;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v / 3, t + 0.03);
      g.gain.setValueAtTime(v / 3, t + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      x.connect(f); f.connect(g); g.connect(salida); x.start(t); x.stop(t + dur + 0.05);
    });
  }
  // Aplausos
  function aplausos(t, dur, v = 0.18) {
    for (let i = 0; i < dur * 40; i++) ruidoFiltrado(t + Math.random() * dur, v * (0.5 + Math.random() * 0.5) * (1 - i / (dur * 50)), 'bandpass', 1200 + Math.random() * 1500, 0.04, salida, 1.2);
  }

  const SFX = {
    burbujas: {
      nombre: 'Burbujas',
      toque(t) { desliz(t, 300, 1200, 0.09, { v: 0.25 }); desliz(t + 0.07, 500, 1600, 0.07, { v: 0.12 }); },
      lleno(t) { desliz(t, 260, 120, 0.18, { v: 0.3 }); desliz(t + 0.2, 220, 70, 0.35, { v: 0.28, vibrato: 30, vibratoVel: 18 }); },
      fanfarria(t) {
        ['C6', 'E6', 'G6', 'C7', 'E7'].forEach((n, i) => desliz(t + i * 0.08, nota(N(n)) * 0.5, nota(N(n)), 0.1, { v: 0.16 }));
        ['C5', 'E5', 'G5'].forEach((n) => campana(t + 0.45, N(n), 1.4, 0.1));
      }
    },
    monedas: {
      nombre: 'Monedas de videojuego',
      toque(t) { sinte(t, N('B5'), 0.06, { onda: 'square', v: 0.11, corte: 6000, dest: salida, sostiene: 1, suelta: 0.01 }); sinte(t + 0.065, N('E6'), 0.25, { onda: 'square', v: 0.11, corte: 6000, dest: salida, sostiene: 0.6, suelta: 0.15 }); },
      lleno(t) { [0, 0.16].forEach((d) => sinte(t + d, N('C3'), 0.12, { onda: 'square', v: 0.16, corte: 900, dest: salida, sostiene: 1, suelta: 0.02 })); },
      fanfarria(t) {
        ['G4', 'C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => sinte(t + i * 0.07, N(n), 0.07, { onda: 'square', v: 0.1, corte: 6000, dest: salida, suelta: 0.02 }));
        acorde(t + 0.45, ['C5', 'E5', 'G5', 'C6'].map(N), 0.6, { onda: 'square', v: 0.07, corte: 5000, vibrato: 25, dest: salida, suelta: 0.3 });
      }
    },
    tropical: {
      nombre: 'Tropical de fiesta',
      toque(t) { madera(t, 1250, 0.45); madera(t + 0.07, 1650, 0.3); },
      lleno(t) { soplido(t, 4000, 1500, 0.3, 0.18); steel(t + 0.05, N('E5'), 0.3); steel(t + 0.25, N('C5'), 0.5); },
      fanfarria(t) {
        ['A4', 'C5', 'E5', 'A5', 'G5', 'A5'].forEach((n, i) => steel(t + i * 0.1, N(n), 0.35));
        corneta(t + 0.65, 0.35); corneta(t + 1.05, 0.55);
      }
    },
    magia: {
      nombre: 'Magia y brillos',
      toque(t) { campana(t, N('E7'), 0.5, 0.09); campana(t + 0.05, N('B7'), 0.4, 0.06); },
      lleno(t) { soplido(t, 3000, 300, 0.4, 0.22); desliz(t + 0.3, 120, 50, 0.3, { v: 0.4 }); },
      fanfarria(t) {
        ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'C7'].forEach((n, i) => campana(t + i * 0.045, N(n), 0.8, 0.07));
        ['C5', 'E5', 'G5', 'C6'].forEach((n) => campana(t + 0.55, N(n), 2, 0.09));
        soplido(t + 0.5, 6000, 9000, 1.2, 0.06);
      }
    },
    caricatura: {
      nombre: 'Caricatura',
      toque(t) { desliz(t, 180, 520, 0.22, { v: 0.25, vibrato: 40, vibratoVel: 22 }); },
      lleno(t) { desliz(t, 1400, 250, 0.55, { v: 0.18, lineal: true, onda: 'sine' }); },
      fanfarria(t) {
        sinte(t, N('G4'), 0.14, { onda: 'sawtooth', v: 0.12, corte: 1800, vibrato: 30, dest: salida, sostiene: 1 });
        sinte(t + 0.17, N('C5'), 0.6, { onda: 'sawtooth', v: 0.12, corte: 1800, vibrato: 30, dest: salida, sostiene: 1, suelta: 0.2 });
        aplausos(t + 0.3, 1.6);
      }
    }
  };

  let juegoSfx = 'tropical';
  function sfx(tipo, juego) {
    iniciar();
    const j = SFX[juego || juegoSfx];
    if (!j || !j[tipo]) return;
    if (tipo !== 'toque') agachar(tipo === 'fanfarria' ? 2 : 0.8);
    j[tipo](ctx.currentTime + 0.01);
  }
  function usarSfx(juego) { if (SFX[juego]) juegoSfx = juego; }

  return {
    tocar, detener, volumen, sfx, usarSfx,
    juegosSfx: () => Object.keys(SFX).map((k) => ({ id: k, nombre: SFX[k].nombre })),
    sonando: () => actual,
    estilos: () => Object.keys(ESTILOS).map((k) => ({ id: k, nombre: ESTILOS[k].nombre, bpm: ESTILOS[k].bpm }))
  };
})();
