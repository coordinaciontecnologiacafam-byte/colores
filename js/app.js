// =====================================================================
// ELIGE TU COLOR · Lógica de la aplicación
// =====================================================================
(function () {
  'use strict';

  const C = window.CONFIG;
  const D = window.DATOS;
  const $ = (id) => document.getElementById(id);
  const CLAVE_CORREO = 'etc_correo';

  const sinConfigurar = !C.SUPABASE_URL || C.SUPABASE_URL.includes('TU-PROYECTO') || C.SUPABASE_ANON_KEY.includes('PEGA-AQUI');
  const sb = sinConfigurar ? null : window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  const estado = {
    docente: null,       // { nombre, correo, color }
    conteos: [],         // [{ id, nombre, hex, cupo, ocupados }]
    toque: null,         // último color tocado
    elegido: null,       // color disponible seleccionado
    aviso: false,        // el último toque fue un color lleno
    area: null,
    temporizador: null,
    registros: []
  };

  // ---------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------
  function escapar(t) {
    return String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('ver');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('ver'), 3800);
  }

  function infoColor(id) {
    const base = D.colores.find((c) => c.id === id) || D.colores[0];
    const vivo = estado.conteos.find((c) => c.id === id);
    return Object.assign({}, base, vivo ? { cupo: vivo.cupo, ocupados: vivo.ocupados } : { cupo: 4, ocupados: 0 });
  }

  function cargando(boton, si) {
    boton.classList.toggle('cargando', si);
    boton.disabled = si;
  }

  async function rpc(nombre, args) {
    if (!sb) throw new Error('sin_config');
    const { data, error } = await sb.rpc(nombre, args || {});
    if (error) throw error;
    return data;
  }

  function mensajeError(codigo) {
    return D.errores[codigo] || D.errores.red;
  }

  function fecha(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  // ---------------------------------------------------------------
  // Música de fondo (archivo de audio) y sonidos de burbujas
  // ---------------------------------------------------------------
  const CLAVE_SILENCIO = 'etc_silencio';
  const M = window.Musica;
  let silencio = localStorage.getItem(CLAVE_SILENCIO) === '1';
  let musicaIniciada = false;
  let pantallaActual = 'bienvenida';
  if (M) M.usarSfx('burbujas');

  // Reproductor del archivo de audio, con entrada y salida suaves
  const pista = C.MUSICA_ARCHIVO ? new Audio(C.MUSICA_ARCHIVO) : null;
  let pistaOk = !!pista, fundido = null;
  const volPista = Math.min(1, Math.max(0, C.MUSICA_VOLUMEN ?? 0.45));
  if (pista) {
    pista.loop = true;
    pista.preload = 'auto';
    pista.volume = 0;
    pista.addEventListener('error', () => {
      pistaOk = false;
      actualizarMusica();
      console.warn('No se pudo cargar la música:', C.MUSICA_ARCHIVO);
      toast('No encontré la canción en ' + C.MUSICA_ARCHIVO + '. Revisa el nombre y la carpeta.');
    });
  }
  function fundir(destino, alTerminar) {
    clearInterval(fundido);
    fundido = setInterval(() => {
      const v = pista.volume + (destino > pista.volume ? 0.04 : -0.06);
      if ((destino > pista.volume && v >= destino) || (destino <= pista.volume && v <= destino)) {
        pista.volume = destino; clearInterval(fundido); if (alTerminar) alTerminar();
      } else pista.volume = Math.min(1, Math.max(0, v));
    }, 40);
  }
  function sonarPista(si) {
    if (!pista || !pistaOk) return;
    if (si) {
      if (pista.paused) pista.play().catch((e) => console.warn('El navegador bloqueó la música:', e && e.name));
      fundir(volPista);
    } else if (!pista.paused) {
      fundir(0, () => pista.pause());
    }
  }
  // Baja la música mientras suena un efecto
  function agacharPista(ms) {
    if (!pista || pista.paused) return;
    fundir(volPista * 0.35);
    setTimeout(() => { if (musicaDebeSonar()) fundir(volPista); }, ms);
  }

  function musicaDebeSonar() {
    return musicaIniciada && !silencio && !document.hidden && pantallaActual !== 'panel' && pantallaActual !== 'login';
  }
  function actualizarMusica() {
    sonarPista(musicaDebeSonar());
    const b = $('btn-sonido');
    b.hidden = !pistaOk || !musicaIniciada || pantallaActual === 'panel' || pantallaActual === 'login';
    b.setAttribute('aria-pressed', String(silencio));
    b.setAttribute('aria-label', silencio ? 'Activar música' : 'Silenciar música');
  }
  function sonido(tipo) {
    if (!M || silencio) return;
    M.sfx(tipo);
    if (tipo === 'lleno') agacharPista(900);
    if (tipo === 'fanfarria') agacharPista(2000);
  }
  // Los navegadores solo permiten sonido después de que la persona toca algo
  document.addEventListener('pointerdown', (e) => {
    if (musicaIniciada) return;
    if (!e.target.closest('button, a')) return;
    musicaIniciada = true;
    actualizarMusica();
  }, true);
  $('btn-sonido').addEventListener('click', () => {
    silencio = !silencio;
    localStorage.setItem(CLAVE_SILENCIO, silencio ? '1' : '0');
    actualizarMusica();
  });
  document.addEventListener('visibilitychange', actualizarMusica);

  // ---------------------------------------------------------------
  // Navegación entre pantallas
  // ---------------------------------------------------------------
  const LARGO_FONDO = { bienvenida: 240, registro: 110, elegir: 90, confirmacion: 160, login: 200, panel: 110 };

  function ir(nombre) {
    document.querySelectorAll('.pantalla').forEach((s) => { s.hidden = true; });
    const s = $('s-' + nombre);
    s.hidden = false;
    window.scrollTo(0, 0);
    window.__largoFondo = LARGO_FONDO[nombre];
    window.pintarFondo(window.__largoFondo);
    if (nombre !== 'elegir') detenerRefresco();
    if (nombre !== 'confirmacion') $('confeti').innerHTML = '';
    pantallaActual = nombre;
    actualizarMusica();
  }

  document.querySelectorAll('[data-ir]').forEach((b) => {
    b.addEventListener('click', () => {
      const destino = b.dataset.ir;
      if (destino === 'login') return abrirAdmin();
      if (destino === 'registro') prepararRegistro();
      ir(destino);
    });
  });

  // ---------------------------------------------------------------
  // Bienvenida
  // ---------------------------------------------------------------
  $('puntos-bienvenida').innerHTML = D.colores.map((c) =>
    `<span style="background:${c.hex};${['negro', 'vinotinto', 'blanco'].includes(c.id) ? 'box-shadow:inset 0 0 0 2px #8A80C8' : ''}"></span>`).join('');

  // ---------------------------------------------------------------
  // Registro e ingreso del docente
  // ---------------------------------------------------------------
  function pestana(nueva) {
    $('tab-nuevo').setAttribute('aria-selected', String(nueva));
    $('tab-existente').setAttribute('aria-selected', String(!nueva));
    $('f-nuevo').hidden = !nueva;
    $('f-existente').hidden = nueva;
  }
  $('tab-nuevo').addEventListener('click', () => pestana(true));
  $('tab-existente').addEventListener('click', () => pestana(false));

  function pintarChips() {
    $('chips-area').innerHTML = D.areas.map((a, i) => {
      const sel = estado.area === a.nombre;
      const estilo = sel ? `background:${a.tinte};color:${a.oscuro ? '#1E1548' : '#fff'}` : '';
      return `<button type="button" data-i="${i}" aria-pressed="${sel}" style="${estilo}">${a.nombre}</button>`;
    }).join('');
    $('lbl-otra').hidden = estado.area !== 'Otra';
  }
  $('chips-area').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    estado.area = D.areas[Number(b.dataset.i)].nombre;
    sonido('toque');
    pintarChips();
    if (estado.area === 'Otra') $('r-otra').focus();
  });

  function prepararRegistro() {
    const guardado = localStorage.getItem(CLAVE_CORREO);
    if (guardado) { $('e-correo').value = guardado; pestana(false); } else { pestana(true); }
    $('err-nuevo').textContent = '';
    $('err-existente').textContent = '';
    pintarChips();
  }

  function correoValido(correo) {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+$/.test(correo) && correo.endsWith(C.DOMINIO_DOCENTES);
  }

  $('f-nuevo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('err-nuevo');
    const nombre = $('r-nombre').value.trim();
    const correo = $('r-correo').value.trim().toLowerCase();
    const otra = $('r-otra').value.trim();
    err.textContent = '';
    if (nombre.length < 3) return (err.textContent = D.errores.nombre_invalido);
    if (!correoValido(correo)) return (err.textContent = D.errores.correo_invalido);
    if (!estado.area) return (err.textContent = D.errores.area_invalida);
    if (estado.area === 'Otra' && !otra) return (err.textContent = D.errores.area_otra_vacia);

    const boton = e.submitter || e.target.querySelector('button[type=submit]');
    cargando(boton, true);
    try {
      const r = await rpc('registrar_docente', { p_nombre: nombre, p_correo: correo, p_area: estado.area, p_area_otra: otra || null });
      if (!r.ok) {
        err.textContent = mensajeError(r.error);
        if (r.error === 'ya_registrado') { $('e-correo').value = correo; }
        return;
      }
      entrarDocente(r.docente);
    } catch (ex) {
      err.textContent = ex.message === 'sin_config' ? 'La app aún no está conectada a Supabase (revisa js/config.js).' : D.errores.red;
    } finally {
      cargando(boton, false);
    }
  });

  $('f-existente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('err-existente');
    const correo = $('e-correo').value.trim().toLowerCase();
    err.textContent = '';
    if (!correoValido(correo)) return (err.textContent = D.errores.correo_invalido);
    const boton = e.submitter || e.target.querySelector('button[type=submit]');
    cargando(boton, true);
    try {
      const r = await rpc('ingresar_docente', { p_correo: correo });
      if (!r.ok) return (err.textContent = mensajeError(r.error));
      entrarDocente(r.docente);
    } catch (ex) {
      err.textContent = ex.message === 'sin_config' ? 'La app aún no está conectada a Supabase (revisa js/config.js).' : D.errores.red;
    } finally {
      cargando(boton, false);
    }
  });

  function entrarDocente(docente) {
    estado.docente = docente;
    localStorage.setItem(CLAVE_CORREO, docente.correo);
    if (docente.color) {
      mostrarConfirmacion(docente.color, true);
    } else {
      abrirElegir();
    }
  }

  // ---------------------------------------------------------------
  // Elegir color
  // ---------------------------------------------------------------
  async function cargarConteos() {
    try {
      const filas = await rpc('conteo_colores');
      estado.conteos = filas.map((f) => ({ id: f.id, nombre: f.nombre, hex: f.hex, cupo: f.cupo, ocupados: f.ocupados }));
    } catch (ex) {
      if (!estado.conteos.length) estado.conteos = D.colores.map((c) => ({ id: c.id, nombre: c.nombre, hex: c.hex, cupo: 4, ocupados: 0 }));
    }
  }

  function lleno(id) {
    const c = infoColor(id);
    return c.ocupados >= c.cupo;
  }

  function pintarRejilla() {
    $('rejilla-colores').innerHTML = D.colores.map((base) => {
      const c = infoColor(base.id);
      const full = c.ocupados >= c.cupo;
      const tocado = estado.toque === c.id;
      const icono = base.claro ? '#1E1548' : '#FFFFFF';
      let marca = '';
      if (full) marca = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${icono}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
      else if (tocado) marca = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${icono}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
      const etiqueta = c.nombre + (full ? ', lleno' : `, ${c.ocupados} de ${c.cupo}`);
      return `<button class="color${full ? ' lleno' : ''}" data-id="${c.id}" aria-pressed="${tocado}" aria-label="${etiqueta}">
        <span class="bola" style="background:${base.hex}">${marca}</span>
        <span class="nom">${c.nombre}</span>
        <span class="cnt">${full ? 'Lleno' : c.ocupados + '/' + c.cupo}</span>
      </button>`;
    }).join('');
    // borde interior para colores oscuros
    $('rejilla-colores').querySelectorAll('.color').forEach((b) => {
      if (['negro', 'vinotinto', 'marron'].includes(b.dataset.id)) {
        const bola = b.querySelector('.bola');
        bola.style.boxShadow = (b.getAttribute('aria-pressed') === 'true' ? '0 0 0 3px #FFD23F, ' : '0 0 0 3px #2C2166, ') + 'inset 0 0 0 2px #6B5FB0';
      }
    });
  }

  function pintarEscenario() {
    const id = estado.toque;
    const pose = estado.aviso ? 'niega' : 'presenta';
    $('pareja-elegir').innerHTML = window.avatarSVG(id, 'mujer', pose) + window.avatarSVG(id, 'hombre', pose);
    const c = infoColor(id);
    const burbuja = $('burbuja');
    burbuja.classList.toggle('mal', estado.aviso);
    if (estado.aviso) {
      $('burbuja-tit').textContent = '¡Ay, profe!';
      $('burbuja-txt').textContent = `El Equipo ${c.nombre} ya está completo. ¡Busca otro color!`;
    } else if (estado.elegido) {
      const [p1, p2] = D.postres[id];
      $('burbuja-tit').textContent = '¡Hola, profe!';
      $('burbuja-txt').textContent = `Somos del Equipo ${c.nombre}. Te traemos ${p1} y ${p2}.`;
    } else {
      $('burbuja-tit').textContent = '¡Hola, profe!';
      $('burbuja-txt').textContent = 'Toca un color para conocer a su equipo.';
    }
    $('alerta-lleno').hidden = !estado.aviso;
    const btn = $('btn-confirmar');
    if (estado.aviso || !estado.elegido) {
      btn.disabled = true;
      btn.textContent = estado.aviso ? 'Elige un color disponible' : 'Elige un color';
    } else {
      btn.disabled = false;
      btn.textContent = `Unirme al Equipo ${c.nombre}`;
    }
  }

  function tocar(id) {
    estado.toque = id;
    sonido(lleno(id) ? 'lleno' : 'toque');
    if (lleno(id)) {
      estado.aviso = true;
      estado.elegido = null;
    } else {
      estado.aviso = false;
      estado.elegido = id;
    }
    $('err-elegir').textContent = '';
    pintarRejilla();
    pintarEscenario();
  }

  $('rejilla-colores').addEventListener('click', (e) => {
    const b = e.target.closest('button.color');
    if (b) tocar(b.dataset.id);
  });

  async function abrirElegir() {
    estado.toque = null;
    estado.elegido = null;
    estado.aviso = false;
    await cargarConteos();
    const primero = D.colores.find((c) => !lleno(c.id)) || D.colores[0];
    estado.toque = primero.id;
    ir('elegir');
    pintarRejilla();
    pintarEscenario();
    iniciarRefresco();
  }

  function iniciarRefresco() {
    detenerRefresco();
    estado.temporizador = setInterval(async () => {
      if (document.hidden) return;
      const antes = JSON.stringify(estado.conteos);
      await cargarConteos();
      if (JSON.stringify(estado.conteos) === antes) return;
      if (estado.elegido && lleno(estado.elegido)) {
        tocar(estado.elegido);   // se llenó mientras lo miraba: muestra el aviso y suena el "glup"
      } else {
        pintarRejilla();
      }
    }, Math.max(4, C.REFRESCO_SEGUNDOS || 8) * 1000);
  }

  function detenerRefresco() {
    clearInterval(estado.temporizador);
    estado.temporizador = null;
  }

  $('btn-confirmar').addEventListener('click', async () => {
    if (!estado.elegido || !estado.docente) return;
    const boton = $('btn-confirmar');
    const color = estado.elegido;
    cargando(boton, true);
    try {
      const r = await rpc('elegir_color', { p_correo: estado.docente.correo, p_color: color });
      if (r.ok) {
        estado.docente.color = color;
        mostrarConfirmacion(color, false);
      } else if (r.error === 'lleno') {
        await cargarConteos();
        tocar(color);
      } else if (r.error === 'ya_eligio' && r.color) {
        estado.docente.color = r.color;
        toast(D.errores.ya_eligio);
        mostrarConfirmacion(r.color, true);
      } else {
        $('err-elegir').textContent = mensajeError(r.error);
      }
    } catch (ex) {
      $('err-elegir').textContent = D.errores.red;
    } finally {
      boton.classList.remove('cargando');
      if ($('s-elegir').hidden === false) pintarEscenario();
    }
  });

  // ---------------------------------------------------------------
  // Confirmación
  // ---------------------------------------------------------------
  function mostrarConfirmacion(id, yaElegido) {
    const c = infoColor(id);
    const tono = D.tituloEquipo[id] || '#FFFFFF';
    $('pareja-confirmar').innerHTML = window.avatarSVG(id, 'mujer', 'celebra', 'a') + window.avatarSVG(id, 'hombre', 'celebra', 'b');
    $('titulo-equipo').innerHTML = `${yaElegido ? 'Ya eres' : '¡Ya eres'} parte del<br><span style="color:${tono}">Equipo ${escapar(c.nombre)}</span>${yaElegido ? '' : '!'}`;
    // Rayos del color del equipo
    const relleno = id === 'negro' ? '#8C8C8C' : c.hex;
    let rayos = '';
    for (let i = 0; i < 12; i++) rayos += `<path d="M0 0 L-14 -150 L14 -150 Z" transform="rotate(${i * 30})"/>`;
    $('rayos').innerHTML = `<g fill="${relleno}" opacity="0.35">${rayos}</g>`;
    // Confeti
    const tonos = ['#FFD23F', '#8A4FFF', '#22B573', '#FF7EB6', '#2F6BFF', '#FF8A1F', '#FFFFFF', '#E8344E', '#19C3C9'];
    let confeti = '';
    for (let i = 0; i < 18; i++) {
      const redondo = i % 3 === 0;
      confeti += `<span style="left:${(i * 5.6 + Math.random() * 3).toFixed(1)}%;width:${redondo ? 11 : 9}px;height:${redondo ? 11 : 16}px;border-radius:${redondo ? '50%' : '3px'};background:${tonos[i % tonos.length]};animation-delay:${(Math.random() * 3).toFixed(2)}s;animation-duration:${(2.5 + Math.random() * 1.5).toFixed(2)}s"></span>`;
    }
    ir('confirmacion');
    $('confeti').innerHTML = confeti;
    if (!yaElegido) setTimeout(() => sonido('fanfarria'), 250);
  }

  $('btn-salir-docente').addEventListener('click', () => {
    estado.docente = null;
    ir('bienvenida');
  });

  // ---------------------------------------------------------------
  // Administradores
  // ---------------------------------------------------------------
  async function esAdmin() {
    try { return (await rpc('es_admin')) === true; } catch (ex) { return false; }
  }

  async function abrirAdmin() {
    if (sb) {
      const { data } = await sb.auth.getSession();
      if (data.session && await esAdmin()) {
        ir('panel');
        return cargarPanel();
      }
    }
    $('err-login').textContent = '';
    ir('login');
  }

  $('f-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('err-login');
    err.textContent = '';
    let usuario = $('l-usuario').value.trim().toLowerCase();
    const clave = $('l-clave').value;
    if (!usuario || !clave) return (err.textContent = 'Escribe tu usuario y contraseña.');
    if (!sb) return (err.textContent = 'La app aún no está conectada a Supabase (revisa js/config.js).');
    if (!usuario.includes('@')) usuario += C.DOMINIO_ADMIN;
    const boton = e.submitter || e.target.querySelector('button[type=submit]');
    cargando(boton, true);
    try {
      const { error } = await sb.auth.signInWithPassword({ email: usuario, password: clave });
      if (error) return (err.textContent = 'Usuario o contraseña incorrectos.');
      if (!(await esAdmin())) {
        await sb.auth.signOut();
        return (err.textContent = 'Este usuario no tiene permiso de administrador.');
      }
      $('l-clave').value = '';
      ir('panel');
      cargarPanel();
    } catch (ex) {
      err.textContent = D.errores.red;
    } finally {
      cargando(boton, false);
    }
  });

  $('btn-salir-admin').addEventListener('click', async () => {
    if (sb) await sb.auth.signOut();
    ir('bienvenida');
  });
  $('btn-actualizar').addEventListener('click', () => cargarPanel());

  // Filtros
  $('filtro-area').innerHTML += D.areas.map((a) => `<option value="${a.nombre}">${a.nombre === 'Otra' ? 'Otras áreas' : a.nombre}</option>`).join('');
  $('filtro-color').innerHTML += D.colores.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
  ['buscar', 'filtro-area', 'filtro-color'].forEach((id) => $(id).addEventListener('input', pintarTabla));

  async function cargarPanel() {
    try {
      await cargarConteos();
      const { data: user } = await sb.auth.getUser();
      $('panel-sesion').textContent = 'Sesión: ' + (user && user.user ? user.user.email : 'administrador');
      const { data, error } = await sb
        .from('docentes')
        .select('id, nombre, correo, area, area_otra, creado, selecciones(color, creado)')
        .order('creado', { ascending: false });
      if (error) throw error;
      estado.registros = data.map((d) => {
        const s = Array.isArray(d.selecciones) ? d.selecciones[0] : d.selecciones;
        return {
          id: d.id, nombre: d.nombre, correo: d.correo,
          area: d.area, areaTexto: d.area === 'Otra' ? 'Otra: ' + (d.area_otra || '') : d.area,
          creado: d.creado, color: s ? s.color : null, eligio: s ? s.creado : null
        };
      });
      pintarResumen();
      pintarTabla();
    } catch (ex) {
      console.error('Panel:', ex);
      toast('No se pudieron cargar los registros: ' + (ex && ex.message ? ex.message : 'error de conexión'));
    }
  }

  // El panel se actualiza solo cada 15 segundos mientras está abierto
  setInterval(() => {
    if (pantallaActual === 'panel' && !document.hidden) cargarPanel();
  }, 15000);

  function pintarResumen() {
    const total = estado.conteos.reduce((a, c) => a + c.cupo, 0);
    const ocupados = estado.conteos.reduce((a, c) => a + c.ocupados, 0);
    $('k-registrados').textContent = estado.registros.length;
    $('k-libres').textContent = total - ocupados;
    $('k-total').textContent = '/ ' + total;
    $('k-llenos').textContent = estado.conteos.filter((c) => c.ocupados >= c.cupo).length;
    $('k-sincolor').textContent = estado.registros.filter((r) => !r.color).length;
    $('ocupacion').innerHTML = D.colores.map((base) => {
      const c = infoColor(base.id);
      const full = c.ocupados >= c.cupo;
      const borde = ['negro', 'vinotinto', 'marron'].includes(c.id) ? 'box-shadow:inset 0 0 0 2px #6B5FB0' : '';
      let barras = '';
      for (let i = 0; i < c.cupo; i++) barras += `<i style="${i < c.ocupados ? 'background:' + base.hex : ''}"></i>`;
      return `<div class="oc${full ? ' lleno' : ''}"><span class="mu" style="background:${base.hex};${borde}"></span>
        <div class="info"><div class="fila"><span>${c.nombre}</span><span style="color:${full ? '#FF9AAA' : '#FFD23F'}">${c.ocupados}/${c.cupo}</span></div>
        <div class="barras" aria-hidden="true">${barras}</div></div></div>`;
    }).join('');
  }

  function filtrados() {
    const q = $('buscar').value.trim().toLowerCase();
    const area = $('filtro-area').value;
    const color = $('filtro-color').value;
    return estado.registros.filter((r) =>
      (!q || r.nombre.toLowerCase().includes(q) || r.correo.includes(q)) &&
      (!area || r.area === area) &&
      (!color || (color === '-' ? !r.color : r.color === color)));
  }

  function pintarTabla() {
    const filas = filtrados();
    $('tabla-vacia').hidden = filas.length > 0;
    $('tabla-cuerpo').innerHTML = filas.map((r) => {
      const c = r.color ? infoColor(r.color) : null;
      const borde = c && ['negro', 'vinotinto', 'blanco', 'marron'].includes(c.id) ? 'box-shadow:inset 0 0 0 2px #6B5FB0' : '';
      return `<tr>
        <td class="n">${escapar(r.nombre)}</td>
        <td class="c">${escapar(r.correo)}</td>
        <td>${escapar(r.areaTexto)}</td>
        <td>${c ? `<span class="pastilla"><i style="background:${c.hex};${borde}"></i>${c.nombre}</span>` : '<span class="sin">Sin color</span>'}</td>
        <td class="f">${fecha(r.eligio || r.creado)}</td>
        <td style="text-align:right">${c ? `<button class="btn-liberar" data-liberar="${r.id}">Liberar cupo</button>` : ''}</td>
      </tr>`;
    }).join('');
  }

  $('tabla-cuerpo').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-liberar]');
    if (!b) return;
    const r = estado.registros.find((x) => x.id === b.dataset.liberar);
    if (!r || !window.confirm(`¿Liberar el cupo de ${r.nombre}? Podrá escoger color de nuevo.`)) return;
    b.disabled = true;
    try {
      const res = await rpc('liberar_cupo', { p_docente: r.id });
      if (!res.ok) throw new Error(res.error);
      toast('Cupo liberado.');
      cargarPanel();
    } catch (ex) {
      b.disabled = false;
      toast('No se pudo liberar el cupo.');
    }
  });

  $('btn-exportar').addEventListener('click', () => {
    const filas = estado.registros.map((r) => ({
      'Nombre': r.nombre,
      'Correo': r.correo,
      'Área': r.areaTexto,
      'Color': r.color ? infoColor(r.color).nombre : 'Sin color',
      'Fecha de registro': r.creado ? new Date(r.creado).toLocaleString('es-CO') : '',
      'Fecha de elección': r.eligio ? new Date(r.eligio).toLocaleString('es-CO') : ''
    }));
    const resumen = D.colores.map((base) => {
      const c = infoColor(base.id);
      return { 'Color': c.nombre, 'Ocupados': c.ocupados, 'Cupo': c.cupo, 'Libres': c.cupo - c.ocupados };
    });
    const hoy = new Date().toISOString().slice(0, 10);
    if (window.XLSX) {
      const libro = XLSX.utils.book_new();
      const hoja = XLSX.utils.json_to_sheet(filas);
      hoja['!cols'] = [{ wch: 32 }, { wch: 34 }, { wch: 24 }, { wch: 12 }, { wch: 22 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(libro, hoja, 'Registros');
      XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(resumen), 'Resumen');
      XLSX.writeFile(libro, `elige-tu-color-${hoy}.xlsx`);
    } else {
      const cab = Object.keys(filas[0] || { Nombre: '' });
      const csv = [cab.join(';')].concat(filas.map((f) => cab.map((k) => '"' + String(f[k]).replace(/"/g, '""') + '"').join(';'))).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      a.download = `elige-tu-color-${hoy}.csv`;
      a.click();
    }
  });

  // ---------------------------------------------------------------
  // Inicio
  // ---------------------------------------------------------------
  ir('bienvenida');
  if (sinConfigurar) toast('Falta conectar Supabase: completa js/config.js');
})();
