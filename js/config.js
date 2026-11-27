// =====================================================================
// CONFIGURACIÓN · Edita solo este archivo antes de subir al repositorio
// =====================================================================
window.CONFIG = {
  // Supabase > Project Settings > API Keys (clave publicable: es segura en el navegador)
  SUPABASE_URL: 'https://cdrvyghsxsahyqwrmjfk.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_SPQ4R2ctCXUNWwayL9f4tg_fa_2qjuL',

  // Dominio de los correos de los docentes (debe coincidir con el SQL)
  DOMINIO_DOCENTES: '@colegio.cafam.edu.co',

  // Si el administrador escribe solo su usuario (ej. "admin1"),
  // la app le agrega este dominio: admin1@eligetucolor.app
  DOMINIO_ADMIN: '@eligetucolor.app',

  // Música de fondo: ruta del archivo de audio dentro del repositorio.
  // Descárgalo (por ejemplo de Pixabay Music) y guárdalo en la carpeta audio/.
  // Si lo dejas vacío (''), la app no pone música; los sonidos de los clics siguen funcionando.
  MUSICA_ARCHIVO: 'audio/musica.mp3',
  MUSICA_VOLUMEN: 0.45,

  // Cada cuántos segundos se actualizan los cupos en la pantalla de colores
  REFRESCO_SEGUNDOS: 8
};
