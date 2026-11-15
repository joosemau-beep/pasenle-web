// Todo lo que dice el nombre, la ciudad, el WhatsApp o las tiendas sale de aquí: si cambia
// el nombre de la marca, se cambia solo en este lugar. Ya no hay zona: el comensal ve lo
// que hay cerca de él o filtra por colonia (docs/modelo-de-negocio.md, sección 2).
const SITIO = {
  nombre: 'Pásenle',
  ciudad: 'Guadalajara',
  whatsapp: '523317636108',
  // Enlace de la app en el App Store. Se pone aquí y lo toman todas las insignias [data-tienda].
  // Vacío, esas insignias no salen; si las dos ligas están vacías, sale "Muy pronto en App Store y Google Play".
  tienda: '',
  // Enlace de la app en Google Play, para las insignias [data-play]. Igual que el de arriba.
  play: '',
  // "Avísame cuando salga": mientras no hay ligas de tiendas, un botón junto a "Muy pronto" que abre WhatsApp con el
  // mensaje listo (aquí no se guarda nada). APAGADO de fábrica: Mau quitó uno parecido el 26-sep para que la primera
  // pantalla fuera solo de descarga. Para verlo sin prenderlo: abrir la página con ?avisame al final.
  avisame: false,
  // data-wa="…" en el enlace elige el mensaje; sin valor, el de restaurante.
  mensajes: {
    aviso: 'Hola, avísame cuando salga Pásenle.',
    restaurante: 'Hola, tengo un restaurante y quiero entrar al piloto de Pásenle.',
    ayuda: 'Hola, necesito ayuda con Pásenle.',
    borrar: 'Hola, quiero borrar mi cuenta de Pásenle. Te escribo desde el celular de mi cuenta.',
    google: 'Hola, necesito ayuda para poner mi liga de Pásenle en Google.',
  },
};

(() => {
  const $$ = (s) => document.querySelectorAll(s);
  $$('[data-nombre]').forEach((el) => (el.textContent = SITIO.nombre));
  $$('[data-ciudad]').forEach((el) => (el.textContent = SITIO.ciudad));
  document.title = document.title.replace('Pásenle', SITIO.nombre);

  // Una insignia sin liga no lleva a ningún lado: se quita. Donde no queda ninguna, "Muy pronto".
  // ponytail: con una sola liga, el reloj del celular enseña solo la de su tienda (comensal.css) y en el otro
  // teléfono queda sin insignia; si alguna vez sale una tienda antes que la otra, enseñar ahí la que sí hay.
  $$('[data-tienda]').forEach((a) => (SITIO.tienda ? (a.href = SITIO.tienda) : a.remove()));
  // Liga de un foodie (?de=ana): Google Play la cuenta como campaña (Play Console > Adquisición). La app
  // solo la ve si se abre con ella ya instalada (lib/datos/ligas.dart).
  const de = (new URLSearchParams(location.search).get('de') || '').trim().toLowerCase();
  const conDe = (liga) => (/^[a-z0-9][a-z0-9-]{1,29}$/.test(de) && liga.includes('play.google.com')
    ? `${liga}${liga.includes('?') ? '&' : '?'}referrer=${encodeURIComponent(`utm_source=foodie&utm_campaign=${de}`)}` : liga);
  $$('[data-play]').forEach((a) => (SITIO.play ? (a.href = conDe(SITIO.play)) : a.remove()));
  $$('.tiendas, #reloj').forEach((caja) => {
    if (caja.querySelector('[data-tienda], [data-play]')) return;
    const pronto = document.createElement('p');
    pronto.className = 'pronto';
    pronto.textContent = 'Muy pronto en App Store y Google Play';
    caja.append(pronto);
    if (caja.id !== 'reloj' && (SITIO.avisame || new URLSearchParams(location.search).has('avisame'))) {
      const aviso = document.createElement('a');
      aviso.className = 'avisame';
      aviso.dataset.wa = 'aviso';
      aviso.textContent = 'Avísame cuando salga';
      caja.append(aviso);
      document.documentElement.classList.add('con-aviso');
    }
    if (caja.id === 'reloj') caja.setAttribute('aria-label', 'Pásenle, muy pronto en App Store y Google Play'.replace('Pásenle', SITIO.nombre));
  });
  $$('a[data-wa]').forEach((a) => {
    const mensaje = (SITIO.mensajes[a.dataset.wa] || SITIO.mensajes.restaurante).replace('Pásenle', SITIO.nombre);
    a.href = `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Aparece al entrar en pantalla.
  const vistos = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visto');
        vistos.unobserve(e.target);
      }
    }),
    // umbral 0: lo alto (el ticket mide 934 px) se revela en cuanto su borde pasa el 88% de la pantalla
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  );
  // Lo que ya está en pantalla al cargar se ve de inmediato; lo demás, al
  // llegar a ello.
  $$('.entra, .mapita, [data-ve]').forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add('visto');
    else vistos.observe(el);
  });
})();
