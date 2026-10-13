// ============================================================
// Juriscorp S.C. — Barra de navegación (todas las páginas)
// ============================================================
// Antes vivía en js/main.js, que sólo cargan las dos portadas: las páginas de
// servicio, la política y las 404 no tenían menú hamburguesa y metían los
// enlaces en línea, que en móvil y tableta se partían y se salían de la
// pantalla. Ahora todas las páginas usan el mismo menú.
//
// Por debajo de 1100 px (css/main.css) los enlaces se esconden en un panel que
// abre el botón #navToggle. Este script:
//   - abre y cierra el panel y mantiene aria-expanded al día;
//   - lo cierra al elegir un enlace, al pulsar Escape o al tocar fuera;
//   - marca la barra como "scrolled" para compactarla al desplazarse.
// Sin JavaScript la barra sigue siendo usable: el logo lleva a la portada y el
// pie enlaza todas las páginas.
// ============================================================

(function () {
  'use strict';

  function init() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    var toggle = document.getElementById('navToggle');
    var links = navbar.querySelector('.nav-links');

    function setOpen(open) {
      if (!toggle || !links) return;
      links.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        setOpen(!links.classList.contains('open'));
      });

      links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          setOpen(false);
        });
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && links.classList.contains('open')) {
          setOpen(false);
          toggle.focus();
        }
      });

      document.addEventListener('click', function (event) {
        if (links.classList.contains('open') && !navbar.contains(event.target)) {
          setOpen(false);
        }
      });
    }

    function onScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
