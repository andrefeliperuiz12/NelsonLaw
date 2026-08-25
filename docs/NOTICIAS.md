# Sección de noticias jurídicas — EN DESARROLLO

> **Estado: no implementado. Nada de esto está en el sitio.**
> No hay página, no hay enlace en la navegación, no hay workflow. Este documento
> recoge el diseño acordado para que no se pierda, y sobre todo **por qué la
> idea original hay que reformularla antes de construirla**.
>
> Última revisión: 25 de agosto de 2026.

## La idea

Una sección de noticias en la navegación que recoja novedades legales de Panamá
relevantes para las áreas del despacho: extranjeros en Panamá, nacionales, y
normativa general que toque derecho administrativo, tributario o penal.
Actualización casi automática, con formato acorde al resto del sitio.

---

## Por qué NO se puede hacer raspando y republicando

La propuesta inicial era raspar noticias y publicarlas. Hay dos razones para no
hacerlo, y la segunda invalida el objetivo mismo de la sección.

### 1. Republicar texto ajeno infringe derechos de autor

Un artículo de prensa es obra protegida. Copiarlo, aunque se cite la fuente, es
reproducción no autorizada. En el sitio de un bufete el problema no es sólo
jurídico sino reputacional: es exactamente el tipo de conducta por la que un
competidor manda un requerimiento, y no es una posición defendible para quien
vende asesoría legal.

Lo que sí está amparado es **citar el titular y enlazar a la fuente**.

### 2. Google penaliza el contenido raspado

Las políticas de spam de Google Search listan explícitamente el *scraped
content* como práctica sancionable. Publicar texto copiado de otros medios
**haría bajar** el posicionamiento que se está construyendo con las páginas de
área, no subirlo. La sección conseguiría lo contrario de lo que busca.

---

## El formato que sí funciona

Para cada noticia:

1. **Titular** — citado, con enlace a la fuente original.
2. **Fuente y fecha** — visibles.
3. **Dos o tres frases de análisis propio**, escritas por el despacho.

El análisis es la pieza que importa. No repite la noticia: la traduce a
consecuencias para el lector.

> **Titular:** *Nueva resolución de la DGI sobre X*
>
> **Análisis:** *Qué significa esto si usted tiene una sociedad panameña y
> reside fuera del país.*

Ese segundo párrafo es contenido original y único: es lo que posiciona, y es lo
que convierte a un lector en consulta. La noticia copiada no hace ninguna de las
dos cosas.

---

## Arquitectura propuesta

Todo dentro de los planes gratuitos ya en uso. Sin servicios nuevos.

```
GitHub Actions (cron)
        │
        ├─ lee fuentes oficiales y RSS
        ├─ descarta lo ya publicado
        ├─ genera noticias.html
        ├─ commit al repositorio
        │
        └─ Netlify redespliega automáticamente
```

Sin servidor, sin base de datos adicional, sin coste de ejecución. El sitio
sigue siendo estático.

### Efecto colateral valioso

GitHub **desactiva los workflows programados tras 60 días sin actividad en el
repositorio**, y las ejecuciones programadas no cuentan como actividad. Ese
riesgo está documentado en [KEEP-ALIVE.md](KEEP-ALIVE.md) y afecta al latido
secundario.

Cada publicación de noticias es un commit, y **los commits sí cuentan como
actividad**. La sección de noticias resolvería de paso ese problema.

### Fuentes: RSS y oficiales antes que raspado de HTML

Preferir, por este orden:

1. **Fuentes oficiales** — Gaceta Oficial, MEF, DGI, Órgano Judicial, ANTAI.
   Son las que dan autoridad al análisis y no plantean problemas de derechos
   sobre el hecho normativo.
2. **RSS de medios** — estructurado, estable, pensado para ser consumido.
3. **Raspado de HTML** — último recurso. Se rompe cada vez que el sitio de
   origen cambia el maquetado, y el fallo es silencioso.

---

## Decisión pendiente

**¿Quién escribe el análisis de cada noticia?**

| Opción | A favor | En contra |
|---|---|---|
| **Nelson escribe** | Coste cero. Voz auténtica del despacho. Es su criterio profesional lo que da valor. | ~10 minutos por semana de su tiempo. |
| **IA genera, Nelson aprueba** | Más rápido cuando el volumen crece. | Coste de API. Sigue necesitando revisión: contenido legal firmado por un abogado no se publica sin leerlo. |

**Recomendación: empezar con Nelson escribiendo.** Si el ritmo se vuelve un
problema, automatizar la redacción después. Al revés no funciona: una sección
que arranca automatizada y sin criterio profesional no se distingue de un
agregador cualquiera.

---

## Lo que falta definir antes de construir

- [ ] Quién redacta el análisis (ver arriba).
- [ ] Lista concreta de fuentes, comprobando cuáles ofrecen RSS.
- [ ] Frecuencia de publicación (semanal parece razonable para un despacho).
- [ ] Circuito de revisión: ¿el workflow abre un *pull request* para que Nelson
      apruebe, o publica directo? **Para contenido legal, PR.**
- [ ] Retención: ¿se archivan las noticias antiguas o se mantienen indefinidamente?
- [ ] Marcado `NewsArticle` o `BlogPosting` en JSON-LD, siguiendo el patrón de
      las páginas de área.
- [ ] Entrada en la navegación y en el sitemap. **Sólo al final**, cuando haya
      contenido real: una sección vacía enlazada desde la navegación perjudica
      más que ayuda.
