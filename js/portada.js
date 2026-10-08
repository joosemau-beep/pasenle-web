// Datos copiados de ~/mochate/lib/datos/semilla.dart (25-sep-2026): Sal de Mar, Tostadas de atún $190.
// Si cambian allá, se cambian aquí y en los precios escritos en index.html.
const DESC = { 13: 0, 14: 0, 15: 25, 16: 40, 17: 45, 18: 35, 19: 20, 20: 0, 21: 0, 22: 0, 23: 0 };
const PRECIO = 190;
const ESTADO = { 13: 'Comida temprana', 14: 'Todavía tranquilo', 15: 'Los mejores precios del día',
  16: 'Los mejores precios del día', 17: 'Los mejores precios del día', 18: 'Empieza a moverse',
  19: 'Se está llenando', 20: 'Hora pico · sin descuento', 21: 'Hora pico · sin descuento',
  22: 'Casi lleno', 23: 'Última llamada' };
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const precio = (d) => Math.round(PRECIO * (1 - d / 100));
const tramo = (d) => (d > 40 ? 't-guajillo' : d >= 30 ? 't-mango' : 't-petroleo');
const h12 = (h) => `${h > 12 ? h - 12 : h}:00`;
const cae = (el) => { if (quieto) return; el.classList.remove('cae'); void el.offsetWidth; el.classList.add('cae'); };
const unaVez = (el, fn, umbral = .5) => { const o = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { o.disconnect(); fn(); } }, { threshold: umbral }); o.observe(el); };

// Módulos, en el orden de la página. Cada uno se salta solo si su escena no está.
// El JS solo pone clases, variables y textos; lo que se ve está en comensal.css.
{
  const $ = (id) => document.getElementById(id);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── 0. Portada (primera pantalla): la tarde da una vuelta corta (5 → 6 → 4 → 5) y se queda a las 5:00 ──
  // Se mueven la hora de la app, su riel, las dos tarjetas, el vidrio y la sombra del toldo; el teléfono no (reglas de Apple). Solo por horas
  // con descuento: la app titula "Con descuento a las X" y en esa lista no enseña restaurantes sin descuento.
  // Sin JS o con movimiento reducido todo queda a las 5:00, como viene en el HTML.
  (() => {
    const escena = $('escena');
    if (!escena || quieto) return;
    const portada = escena.closest('.portada');
    // rodillo: la cifra vieja sube y entra la nueva (o al revés si la hora retrocede)
    const rueda = (el, txt, sube) => {
      if (el.dataset.v === txt || (!el.dataset.v && el.textContent === txt)) return;
      el.dataset.v = txt;
      if (el._a) el._a.cancel();
      if (!el.animate) { el.textContent = txt; return; }
      const viejo = el.textContent;
      const pila = document.createElement('span');
      pila.className = 'pila';
      pila.innerHTML = sube ? `<span>${viejo}</span><span>${txt}</span>` : `<span>${txt}</span><span>${viejo}</span>`;
      el.replaceChildren(pila);
      el._a = pila.animate([{ transform: `translateY(${sube ? 0 : -50}%)` }, { transform: `translateY(${sube ? -50 : 0}%)` }],
        { duration: 340, easing: 'cubic-bezier(.2,.9,.25,1)' });
      el._a.onfinish = el._a.oncancel = () => { el.textContent = el.dataset.v; el._a = null; };
    };
    const ponSello = (s, d, sube) => {
      s.classList.remove('t-guajillo', 't-mango', 't-petroleo');
      s.classList.add(tramo(d));
      const n = s.querySelector('.n');
      if (n.classList.contains('rueda')) rueda(n, `-${d}`, sube); else n.textContent = `-${d}`;
    };

    let hora = 17;
    const pinta = (h) => {
      const sube = h > hora, i = h - 13;
      hora = h;
      ['hApp', 'tApp', 'hVid'].forEach((id) => rueda($(id), h12(h), sube));
      $('eApp').textContent = ESTADO[h];
      portada.style.setProperty('--sol', h - 17); // a las 6 la sombra del toldo se inclina más, a las 4 menos
      $('aRiel').style.setProperty('--p', ((i + .5) / 11).toFixed(4));
      escena.querySelectorAll('.a-tarjeta').forEach((c) => {
        const d = +c.dataset.desc.split(' ')[i];
        rueda(c.querySelector('.precio'), `$${Math.round(c.dataset.antes * (1 - d / 100))}`, !sube);
        ponSello(c.querySelector('.sello'), d, sube);
      });
      rueda($('pVid'), `$${precio(DESC[h])}`, !sube);
      ponSello($('sVid'), DESC[h], sube);
    };
    // una vuelta: 6, 4 y de regreso a las 5. Termina antes de 5 s y solo corre cuando la portada se ve.
    unaVez(escena, () => [[18, 2300], [16, 3100], [17, 3900]].forEach(([h, ms]) => setTimeout(() => pinta(h), ms)), .4);
  })();

  // ── 1. Pruébalo: la mesa con el riel de horas, el encendido y el recorrido de la tarde ──
  (() => {
    const mesa = $('mesa'), riel = $('riel'), sello = $('sello'), pista = $('pista');
    if (!mesa || !riel) return;
    const ahora = $('ahora'), antes = $('antes');
    // sin JS el riel es un dibujo; con JS se vuelve control (slider con teclado)
    riel.tabIndex = 0;
    riel.setAttribute('role', 'slider');
    riel.setAttribute('aria-label', 'Hora del ejemplo');
    riel.setAttribute('aria-valuemin', 13);
    riel.setAttribute('aria-valuemax', 23);
    riel.setAttribute('aria-valuenow', 17);
    riel.setAttribute('aria-valuetext', `5:00 pm: tostadas a $${precio(DESC[17])} en vez de $${PRECIO}, ${DESC[17]}% de descuento. Ejemplo`);
    let hora = 17;           // el HTML ya viene a las 5:00
    let paseo = null;        // el recorrido automático, mientras corre
    let pausa = null;        // espera de 250 ms antes de poner el sello
    let mio = false;         // alguien ya tocó el riel

    const ponSello = (d) => {
      clearTimeout(pausa);
      if (!d) { sello.hidden = true; return; }
      sello.className = `sello mesa__sello ${tramo(d)}`;
      sello.innerHTML = `-${d}<span class="pct">%</span>`;
      sello.hidden = false;
      void sello.offsetWidth;
      sello.classList.add('golpe');
    };

    // sello: 'no' lo oculta, 'ya' lo pone con golpe; por omisión espera 250 ms quieto.
    const pinta = (h, { sello: modo } = {}) => {
      const cambio = h !== hora;
      hora = h;
      const d = DESC[h];
      $('hora').textContent = h12(h);
      $('estado').textContent = ESTADO[h];
      ahora.textContent = `$${precio(d)}`;
      if (cambio) cae(ahora);
      antes.style.visibility = d ? 'visible' : 'hidden';
      riel.style.setProperty('--p', ((h - 13 + .5) / 11).toFixed(4));
      mesa.style.setProperty('--sol', Math.min(1, Math.max(0, (h - 13) / 4)));
      mesa.style.setProperty('--noche', Math.min(1, Math.max(0, (h - 18) / 3)));
      riel.setAttribute('aria-valuenow', h);
      riel.setAttribute('aria-valuetext', d
        ? `${h12(h)} pm: tostadas a $${precio(d)} en vez de $${PRECIO}, ${d}% de descuento. Ejemplo`
        : `${h12(h)} pm: tostadas a $${PRECIO}, precio de carta. Ejemplo`);
      if (modo === 'ya') return ponSello(d);
      if (!cambio) return;
      clearTimeout(pausa);
      sello.hidden = true; // sin descuento, siempre oculto; con descuento, vuelve al quedarse quieto
      if (modo !== 'no' && d) pausa = setTimeout(() => ponSello(d), 250);
    };

    const quitaPista = () => pista.classList.remove('ve');
    const tomaControl = () => {
      if (mio) return;
      mio = true;
      mesa.classList.add('encendida');
      quitaPista();
      if (paseo) { clearInterval(paseo); paseo = null; if (DESC[hora]) pausa = setTimeout(() => ponSello(DESC[hora]), 250); }
    };

    // Coreografía al llegar a la mesa (solo con movimiento; si el script llega tarde, se queda a las 5:00)
    if (!quieto && performance.now() < 2000) {
      pinta(13, { sello: 'no' });
      const visto = new Promise((r) => unaVez(riel, r, .6));
      visto.then(() => mesa.classList.add('encendida'));
      const letra = Promise.race([document.fonts ? document.fonts.load('46px Anton') : null, espera(800)]);
      Promise.all([visto, letra]).then(() => espera(900)).then(() => {
        if (mio) return;
        // 2:00 → 3:00 → 4:00 → 5:00; el sello sale de golpe al llegar a las 5, nunca antes
        const avanza = () => {
          if (mio) return;
          pinta(hora + 1, { sello: hora + 1 === 17 ? 'ya' : 'no' });
          if (hora < 17) return;
          clearInterval(paseo); paseo = null;
          setTimeout(() => { if (mio) return; pista.classList.add('ve'); setTimeout(quitaPista, 4000); }, 500);
        };
        avanza();
        paseo = setInterval(avanza, 340);
      });
    } else {
      mesa.classList.add('encendida');
    }

    // Tocar, arrastrar y teclado
    const horaEn = (x) => {
      const r = riel.getBoundingClientRect();
      return 13 + Math.min(10, Math.max(0, Math.floor(((x - r.left - 16) / (r.width - 32)) * 11)));
    };
    riel.addEventListener('focus', tomaControl);
    riel.addEventListener('pointerdown', (ev) => {
      tomaControl();
      riel.setPointerCapture(ev.pointerId);
      pinta(horaEn(ev.clientX));
    });
    riel.addEventListener('pointermove', (ev) => {
      if (!riel.hasPointerCapture(ev.pointerId)) return;
      const h = horaEn(ev.clientX);
      if (h !== hora) pinta(h); // sin cambio de hora no se toca el DOM
    });
    riel.addEventListener('keydown', (ev) => {
      const destino = { ArrowRight: hora + 1, ArrowUp: hora + 1, ArrowLeft: hora - 1, ArrowDown: hora - 1,
        PageUp: hora + 3, PageDown: hora - 3, Home: 13, End: 23 }[ev.key];
      if (destino === undefined) return;
      ev.preventDefault();
      tomaControl();
      pinta(Math.min(23, Math.max(13, destino)));
    });
  })();

  // ── 2. Volteo: la hora gigante pasa dígito por dígito (escenas 4 y 7, y el cierre) ──
  // <b data-voltea="desde"><span class="d">hasta</span>:00</b>
  $$('[data-voltea]').forEach((b) => {
    const d = b.querySelector('.d');
    if (!d || quieto) return;
    const hasta = +d.textContent, desde = +b.dataset.voltea;
    if (desde === hasta) return;
    d.textContent = desde;
    unaVez(b, () => {
      let n = desde;
      const paso = hasta > desde ? 1 : -1;
      const t = setInterval(() => {
        n += paso;
        d.textContent = n;
        cae(d);
        if (n === hasta) clearInterval(t);
      }, 90);
    }, .5);
  });

  // ── 3. Clave (escena 4): tablero de salidas, una sola vez ──
  (() => {
    const clave = $('clave');
    if (!clave) return;
    const letras = [...clave.textContent];
    clave.textContent = '';
    const cajas = letras.map((c) => { const s = document.createElement('span'); s.textContent = c; clave.append(s); return s; });
    if (quieto) return;
    const AZAR = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    unaVez(clave, () => {
      // fija el ancho de cada casilla para que el barajeo no mueva el renglón
      cajas.forEach((s) => { s.style.width = `${s.getBoundingClientRect().width}px`; });
      let k = 0;
      cajas.forEach((s, i) => {
        if (letras[i] === '-') return;
        const inicio = 50 * k++;
        for (let j = 0; j < 3; j++) setTimeout(() => { s.textContent = AZAR[Math.floor(Math.random() * AZAR.length)]; }, inicio + j * 120);
        setTimeout(() => { s.textContent = letras[i]; }, inicio + 360);
      });
      // al terminar se sueltan los anchos: si la letra cambia de tamaño (giro de tableta), no se enciman
      setTimeout(() => cajas.forEach((s) => (s.style.width = '')), 50 * k + 400);
    }, .5);
  })();

  // ── 4. Apartas (escena 3): el paso que cruza la mitad de la pantalla manda en el teléfono ──
  (() => {
    const tel = $('tel');
    if (!tel) return;
    const pasos = $$('.apartas__pasos .paso');
    const rayas = $$('.apartas__avance i');
    const ponPaso = (n) => {
      tel.dataset.paso = n;
      pasos.forEach((p) => p.classList.toggle('activo', p.dataset.paso === n));
      rayas.forEach((r, i) => r.classList.toggle('si', i === n - 1));
    };
    // se observan pasos (escritorio) e hitos (celular) y se decide al momento con el ancho
    // de ese instante: sirve al girar la tableta. En el celular los pasos ocultos siguen
    // en la página para el lector de pantalla, así que ahí solo mandan los hitos.
    const ancho = matchMedia('(min-width: 960px)');
    const vigia = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && e.target.matches('.paso') === ancho.matches) ponPaso(e.target.dataset.paso);
    }), { rootMargin: '-50% 0px -50% 0px' });
    [...pasos, ...$$('.apartas__hitos i')].forEach((el) => vigia.observe(el));
  })();

  // ── 5. Fecha: "Hoy, vie 25 de septiembre" en la hoja de confirmar ──
  (() => {
    const dia = $('telDia');
    if (!dia) return;
    const f = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'long' }).format(new Date());
    dia.textContent = `Hoy, ${f.replace(/[.,]/g, '')}`;
  })();

  // ── 6. Mapa (escena 7): tocar un punto enseña su platillo a las 5, solo en pesos ──
  (() => {
    const mapa = document.querySelector('.mapa'), ficha = $('ficha');
    if (!mapa || !ficha) return;
    mapa.addEventListener('click', (ev) => {
      const pin = ev.target.closest('.pin');
      if (!pin) return;
      $$('.mapa .pin').forEach((p) => p.setAttribute('aria-pressed', p === pin ? 'true' : 'false'));
      const { lugar, plato, antes, ahora } = pin.dataset;
      const [b, span, s, strong] = ficha.querySelectorAll('b, span:not(.ejemplo), s, strong');
      b.textContent = lugar; span.textContent = plato; s.textContent = `$${antes}`; strong.textContent = `$${ahora}`;
    });
  })();

  // ── 7. Reloj pegado (espec 7.2): la hora de la escena que cruza la mitad de la pantalla ──
  (() => {
    const reloj = $('reloj');
    if (!reloj) return;
    const horaEl = $('relojHora'), estadoEl = $('relojEstado'), aguja = $('relojAguja');
    // aparece cuando "Pruébalo" ya salió por arriba (antes están la insignia de la primera pantalla
    // y la de Pruébalo); se va cuando llega el cierre, que trae la suya. Se mide en cada scroll y no
    // con IntersectionObserver: un salto (#donde, la barra de scroll) no cruza nada y no avisaría.
    const prueba = document.querySelector('.prueba'), cierre = $('cierre');
    let antes;
    const mide = () => {
      const fuera = !prueba || prueba.getBoundingClientRect().bottom >= 0 || (!!cierre && cierre.getBoundingClientRect().top < innerHeight);
      if (fuera === antes) return;
      antes = fuera;
      reloj.classList.toggle('reloj--fuera', fuera);
      reloj.inert = fuera; // escondido bajo la pantalla, el botón no recibe el foco
    };
    addEventListener('scroll', mide, { passive: true });
    mide();

    const vigiaHora = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const [h, m] = e.target.dataset.hora.split(':').map(Number);
      const texto = `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} PM`;
      if (horaEl.textContent === texto) return;
      horaEl.textContent = texto;
      estadoEl.textContent = ESTADO[h];
      aguja.style.setProperty('--p', ((h - 13 + m / 60 + .5) / 11).toFixed(4));
      cae(horaEl);
    }), { rootMargin: '-50% 0px -50% 0px' });
    $$('[data-hora]').forEach((s) => vigiaHora.observe(s));

    // el fondo que queda justo detrás de la barra decide si va oscura o clara
    const vigiaFondo = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) reloj.classList.toggle('reloj--claro', e.target.dataset.fondo === 'oscuro');
    }), { rootMargin: '-94% 0px -5% 0px' });
    $$('main [data-fondo]').forEach((s) => vigiaFondo.observe(s));
  })();
}
