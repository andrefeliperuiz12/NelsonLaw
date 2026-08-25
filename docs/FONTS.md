# Tipografías auto-alojadas

## Por qué no usamos Google Fonts

Enlazar `fonts.googleapis.com` hace que **el navegador de cada visitante contacte con
servidores de Google y le entregue su dirección IP** antes de que la persona haya podido
consentir nada. No es una suposición: es cómo funciona un `<link>` a un dominio externo.

El **Landgericht München I** (sentencia 3 O 17493/20, 20 de enero de 2022) declaró que esa
práctica vulnera el RGPD y condenó al titular de un sitio web a indemnizar al demandante.
La resolución desencadenó una oleada de reclamaciones en Alemania.

Para el sitio de un bufete que atiende clientes internacionales y que declara no ceder datos
a terceros, era una contradicción directa entre lo que la página dice y lo que hace.

**Beneficios colaterales de auto-alojarlas:**

- Una petición DNS y una conexión TLS menos en la ruta crítica de renderizado.
- La CSP pierde dos orígenes externos (`fonts.googleapis.com` y `fonts.gstatic.com`).
- Las fuentes se cachean un año con `immutable`, en vez de depender de la caché de Google.
- El sitio deja de romperse visualmente si Google Fonts sufre una caída.

---

## Qué hay instalado

| | |
|---|---|
| **Familias** | Cormorant Garamond (serif) y Outfit (sans) |
| **Ficheros** | 20 `.woff2` en `assets/fonts/` |
| **Peso total** | ~656 KB en disco |
| **Subsets** | `latin` y `latin-ext` únicamente |
| **Declaraciones** | `css/fonts.css` — 20 bloques `@font-face` |
| **Licencia** | SIL Open Font License 1.1 — ver `assets/fonts/OFL.txt` |

### Pesos incluidos

- **Cormorant Garamond:** 300, 400, 600, 700 en redonda; 300 y 400 en cursiva.
- **Outfit:** 300, 400, 500, 600.

### Por qué sólo latin y latin-ext

Google sirve además `cyrillic`, `cyrillic-ext` y `vietnamese` — 18 ficheros que se
descartaron. El bufete atiende en español e inglés. `latin-ext` **sí** se conserva: cubre
apellidos centroeuropeos (Š, Ł, Ő…) de clientes internacionales.

El navegador **descarga sólo el subset que la página necesita**, gracias a `unicode-range`.
Una página en español no llega a pedir los ficheros `latin-ext`.

---

## Reglas de mantenimiento

> ### ⚠️ No vuelvas a enlazar Google Fonts
>
> La CSP de `_headers` ya no incluye `fonts.googleapis.com` ni `fonts.gstatic.com`. Si
> alguien añade el `<link>` otra vez, la hoja de estilos será bloqueada y el sitio se
> quedará sin tipografías. Mientras la CSP siga en `Report-Only` el fallo será **silencioso**:
> se verá en la consola del navegador, no en la página.

> ### ⚠️ Si regeneras las fuentes, renómbralas
>
> `_headers` sirve `/assets/fonts/*` con `max-age=31536000, immutable`. Los nombres **no
> llevan hash de contenido**. Si sustituyes un fichero conservando su nombre, los navegadores
> que ya lo tengan cacheado seguirán usando la versión vieja **durante un año**.
>
> Para cambiar una fuente: usa un nombre nuevo (por ejemplo añadiendo `-v2`) y actualiza
> `css/fonts.css`.

### Al añadir un peso o estilo nuevo

Si el diseño empieza a usar un peso que no está en la lista de arriba, el navegador lo
**sintetizará** (falso negrita, falsa cursiva) y se verá peor. Hay que descargar el fichero
real siguiendo el procedimiento de abajo.

---

## Cómo regenerar

Requiere `node` y `curl`. Desde la raíz del repositorio:

### 1. Descargar el CSS de Google con un User-Agent moderno

El User-Agent importa: sin él, Google devuelve `.ttf` en vez de `.woff2`.

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

curl -s -A "$UA" \
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap" \
  -o /tmp/gf.css
```

### 2. Extraer los bloques de los subsets que queremos

Google antepone un comentario con el nombre del subset a cada `@font-face`
(`/* latin */`). Ese comentario es lo que permite filtrarlos.

```bash
node -e '
const fs = require("fs");
const css = fs.readFileSync("/tmp/gf.css", "utf8");
const re = /\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
const KEEP = new Set(["latin", "latin-ext"]);
const out = [];
let m;
while ((m = re.exec(css)) !== null) {
  const [, subset, block] = m;
  if (!KEEP.has(subset)) continue;
  const family = /font-family:\s*.([^.]+)./.exec(block)[1];
  const style  = /font-style:\s*(\w+)/.exec(block)[1];
  const weight = /font-weight:\s*(\d+)/.exec(block)[1];
  const url    = /url\((https:[^)]+\.woff2)\)/.exec(block)[1];
  const range  = /unicode-range:\s*([^;]+);/.exec(block)[1];
  const slug = family.toLowerCase().replace(/\s+/g, "-");
  const file = slug + "-" + weight + (style === "italic" ? "-italic" : "") + "-" + subset + ".woff2";
  out.push({ subset, family, style, weight, url, file, range });
}
fs.writeFileSync("/tmp/manifest.json", JSON.stringify(out, null, 2));
console.log("Bloques conservados: " + out.length);
'
```

### 3. Descargar los `.woff2`

```bash
node -e 'require("/tmp/manifest.json").forEach(f => console.log(f.url + " " + f.file));' > /tmp/dl.txt

while read -r url file; do
  curl -s -o "assets/fonts/$file" "$url"
done < /tmp/dl.txt
```

### 4. Verificar la integridad

Todo `.woff2` válido empieza por la firma `wOF2`. Si algún fichero no la tiene, la descarga
devolvió un error HTML en lugar de la fuente:

```bash
for f in assets/fonts/*.woff2; do
  [ "$(head -c 4 "$f")" != "wOF2" ] && echo "CORRUPTO: $f"
done
```

### 5. Regenerar `css/fonts.css`

Reconstruye los `@font-face` apuntando a `/assets/fonts/`, conservando el `unicode-range`
de cada bloque. **Mantén el comentario de cabecera del fichero**: explica por qué las
fuentes están auto-alojadas y evita que alguien lo revierta por desconocimiento.

### 6. Comprobar que nada quedó roto

```bash
# No debe quedar ningún enlace a Google Fonts (salvo dentro de comentarios).
grep -rn "fonts.googleapis\|fonts.gstatic" *.html admin/*.html css/*.css

# Toda fuente referida en el CSS debe existir en disco.
node -e '
const fs = require("fs");
const enCss = [...fs.readFileSync("css/fonts.css", "utf8")
  .matchAll(/\/assets\/fonts\/([^\x27]+\.woff2)/g)].map(m => m[1]);
const enDisco = fs.readdirSync("assets/fonts").filter(f => f.endsWith(".woff2"));
console.log("Referidas sin fichero:", enCss.filter(f => !enDisco.includes(f)));
console.log("Ficheros sin referencia:", enDisco.filter(f => !enCss.includes(f)));
'
```

---

## Dónde se usan

| Fichero | Uso |
|---|---|
| `css/fonts.css` | Las 20 declaraciones `@font-face` |
| `index.html` | Enlaza `fonts.css` + `preload` de las 2 fuentes críticas |
| `privacidad.html` | Enlaza `fonts.css` |
| `admin/index.html` | Enlaza `fonts.css` |
| `admin/dashboard.html` | Enlaza `fonts.css` |
| `_headers` | Caché de un año para `/assets/fonts/*` |
| `css/main.css` | `--font-serif` y `--font-sans` |

### Sobre el `preload` de `index.html`

Sólo se precargan dos ficheros, los que decide el primer renderizado:

- `cormorant-garamond-300-latin.woff2` — el título del hero (`.hero-title`, peso 300).
- `outfit-400-latin.woff2` — el texto corrido.

**Si cambias la tipografía del hero, actualiza el `preload`.** Un `preload` que apunta a una
fuente que la página no acaba usando desperdicia ancho de banda en la ruta crítica y Chrome
lo avisa por consola.
