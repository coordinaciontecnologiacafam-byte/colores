// =====================================================================
// DATOS FIJOS · colores, postres de cada pareja y áreas
// =====================================================================
window.DATOS = {
  // Respaldo visual si la base de datos aún no responde
  colores: [
    { id: 'azul',      nombre: 'Azul',      hex: '#2F6BFF', claro: false },
    { id: 'rojo',      nombre: 'Rojo',      hex: '#E8344E', claro: false },
    { id: 'verde',     nombre: 'Verde',     hex: '#22B573', claro: true  },
    { id: 'negro',     nombre: 'Negro',     hex: '#1A1A1A', claro: false },
    { id: 'blanco',    nombre: 'Blanco',    hex: '#FFFFFF', claro: true  },
    { id: 'marron',    nombre: 'Marrón',    hex: '#8B5A2B', claro: false },
    { id: 'rosado',    nombre: 'Rosado',    hex: '#FF7EB6', claro: true  },
    { id: 'morado',    nombre: 'Morado',    hex: '#8A4FFF', claro: false },
    { id: 'naranja',   nombre: 'Naranja',   hex: '#FF8A1F', claro: true  },
    { id: 'vinotinto', nombre: 'Vinotinto', hex: '#7A1F3D', claro: false }
  ],

  // Postre de la capitana y del capitán de cada equipo
  postres: {
    azul:      ['un cupcake de arándanos', 'una dona de arándanos'],
    rojo:      ['una porción de red velvet', 'un cupcake de fresa'],
    verde:     ['un helado de pistacho', 'un macaron de limón'],
    negro:     ['una torta de chocolate negro', 'un cupcake de chocolate'],
    blanco:    ['un cupcake de vainilla', 'una porción de tres leches'],
    marron:    ['una dona de chocolate', 'un helado de café'],
    rosado:    ['una dona de fresa', 'un macaron de frambuesa'],
    morado:    ['un helado de mora', 'un cupcake de mora'],
    naranja:   ['un macaron de mandarina', 'una dona de naranja'],
    vinotinto: ['un cupcake de frutos rojos', 'una porción de torta de cereza']
  },

  // Color del texto del título en la confirmación (legible sobre fondo oscuro)
  tituloEquipo: {
    azul: '#7FA8FF', rojo: '#FF7A8C', verde: '#4CE09A', negro: '#C9C2EE', blanco: '#FFFFFF',
    marron: '#D9A36B', rosado: '#FF9CC8', morado: '#B795FF', naranja: '#FFA54D', vinotinto: '#E07A9E'
  },

  areas: [
    { nombre: 'Inglés',             tinte: '#2F6BFF', oscuro: false },
    { nombre: 'Matemáticas',        tinte: '#FF8A1F', oscuro: true  },
    { nombre: 'Ciencias naturales', tinte: '#22B573', oscuro: true  },
    { nombre: 'Humanidades',        tinte: '#7B3FF2', oscuro: false },
    { nombre: 'Sociales',           tinte: '#D42A44', oscuro: false },
    { nombre: 'Educación física',   tinte: '#FF7EB6', oscuro: true  },
    { nombre: 'Castellano',         tinte: '#2F6BFF', oscuro: false },
    { nombre: 'Artes',              tinte: '#FF8A1F', oscuro: true  },
    { nombre: 'Otra',               tinte: '#FFD23F', oscuro: true  }
  ],

  // Mensajes de error que devuelve la base de datos
  errores: {
    nombre_invalido: 'Escribe tu nombre completo.',
    correo_invalido: 'Usa tu correo institucional (termina en @colegio.cafam.edu.co).',
    area_invalida: 'Selecciona tu área.',
    area_otra_vacia: 'Escribe el nombre de tu área.',
    no_autorizado: 'Este correo no está en la lista de docentes. Consulta con coordinación.',
    ya_registrado: 'Este correo ya está registrado. Entra por la pestaña “Ya me registré”.',
    no_encontrado: 'No encontramos ese correo. Si es tu primera vez, usa “Soy nuevo”.',
    lleno: 'Profe, este color se llenó, selecciona otro.',
    ya_eligio: 'Ya habías elegido tu color.',
    color_invalido: 'Ese color no existe.',
    red: 'No pudimos conectar. Revisa tu internet e inténtalo de nuevo.'
  }
};
