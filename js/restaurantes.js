// Página de restaurantes: lo que se mueve dentro de las pantallas (una sola vez), el teléfono fijo del panel en
// escritorio, el botón de WhatsApp pegado abajo en el celular y el nombre del restaurante en el mensaje.
// Sin este archivo la página se ve completa: cada pantalla en su estado final y cada escena con su teléfono.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mueve = document.documentElement.classList.contains('recorre');

  // ── pantallas: pasan de su primer estado al final una sola vez (el CSS pinta los dos) ──
  const cuenta = (el) => {
    const fin = +el.dataset.cuenta;
    const t0 = performance.now();
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(fin * (1 - (1 - p) ** 3));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  const anima = (pantalla, espera) => {
    if (!mueve || pantalla.dataset.va) return;
    pantalla.dataset.va = '1';
    setTimeout(() => {
      pantalla.classList.add('listo');
      $$('[data-cuenta]', pantalla).forEach(cuenta);
    }, espera);
  };
  if (mueve) $$('[data-cuenta]').forEach((el) => (el.textContent = '0'));

  // la portada: de las 4 a las 5, cuando ya se leyó el título
  const heroe = $('#pantalla-heroe');
  if (heroe) anima(heroe, 1500);

  // en celular, cada pantalla cuando ya se ve casi entera
  const alVer = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    anima(e.target, 450);
    alVer.unobserve(e.target);
  }), { threshold: .6 });
  $$('.escena-r__tel .rt[data-anima]').forEach((p) => alVer.observe(p));

  // ── escritorio: un solo teléfono quieto; su pantalla es la de la escena que cruza el centro de la ventana ──
  const panel = $('.panel');
  const hueco = $('.panel__fijo .pantalla-r');
  if (panel && hueco) {
    const escenas = $$('.escena-r', panel);
    const copias = escenas.map((esc) => {
      const c = $(esc.dataset.pantalla).cloneNode(true);
      c.removeAttribute('id');
      c.classList.remove('listo');
      delete c.dataset.va;
      hueco.append(c);
      return c;
    });
    panel.classList.add('panel--fijo');
    copias[0].classList.add('activa');
    const pon = (i) => {
      copias.forEach((c, j) => c.classList.toggle('activa', j === i));
      escenas.forEach((e, j) => e.classList.toggle('activa', j === i));
      anima(copias[i], 500);
    };
    const centro = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && pon(escenas.indexOf(e.target))),
      { rootMargin: '-50% 0px -50% 0px' });
    escenas.forEach((e) => centro.observe(e));
  }

  // ── celular y tableta: el botón pegado abajo sale cuando el de la portada se va y se esconde junto a los otros botones ──
  const fija = $('.r-fija');
  const ctas = $$('[data-cta]');
  if (fija && ctas.length) {
    const vistos = new Set();
    const mira = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? vistos.add(e.target) : vistos.delete(e.target)));
      const paso = ctas[0].getBoundingClientRect().bottom < 0;
      fija.classList.toggle('ve', paso && vistos.size === 0);
    });
    ctas.forEach((c) => mira.observe(c));
  }

  // ── escritorio: la barra se queda arriba, en vidrio, en cuanto la portada salió entera (el CSS solo la pinta desde 960 px) ──
  const barra = $('.r-barra');
  const portada = $('.r-portada');
  if (barra && portada) {
    new IntersectionObserver(([e]) => barra.classList.toggle('baja', !e.isIntersecting && e.boundingClientRect.top < 0))
      .observe(portada);
  }

  // en celular las dudas empiezan cerradas: la página ya es larga
  if (matchMedia('(max-width: 959px)').matches) $$('.dudas details[open]').forEach((d) => (d.open = false));

  // ── el nombre del restaurante, si lo escriben, va en el mensaje de WhatsApp. No se guarda en ningún lado ──
  const campo = $('#nombre-resto');
  if (campo && typeof SITIO !== 'undefined') {
    campo.addEventListener('input', () => {
      const nombre = campo.value.replace(/\s+/g, ' ').trim().slice(0, 80);
      const texto = nombre
        ? `Hola, tengo un restaurante, se llama ${nombre}, y quiero entrar al piloto de ${SITIO.nombre}.`
        : SITIO.mensajes.restaurante.replace('Pásenle', SITIO.nombre);
      $$('a[data-wa=""]').forEach((a) => (a.href = `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(texto)}`));
    });
  }
})();
