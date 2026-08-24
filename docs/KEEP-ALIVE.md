# Latido de Supabase — configuración operativa

**Problema que resuelve.** En el plan gratuito, Supabase **pausa el proyecto tras 7 días sin actividad**. Con el proyecto pausado no funciona el formulario, ni el panel de administración, ni ninguna tarea programada dentro de Postgres. Ya ocurrió una vez.

**Por qué el latido tiene que venir de fuera.** Un `pg_cron` dentro del propio Postgres no puede impedir su propia pausa: cuando el proyecto se detiene, el cron se detiene con él. El impulso tiene que originarse en un sistema independiente.

## Arquitectura: dos latidos redundantes

| | Primario | Secundario |
|---|---|---|
| **Dónde** | cron-job.org | GitHub Actions |
| **Archivo** | (configuración en su panel) | `.github/workflows/keep-alive.yml` |
| **Frecuencia** | Diaria, 09:00 Panamá | Lun/Mié/Vie, 02:23 Panamá |
| **Depende del repositorio** | No | **Sí — y ahí está su límite** |

**Por qué cron-job.org es el primario y no GitHub Actions:** GitHub **desactiva automáticamente los workflows programados tras 60 días sin actividad en el repositorio**, y las ejecuciones programadas **no cuentan como actividad** — solo cuentan commits, pushes y ejecuciones manuales. Un repositorio que queda quieto dos meses apaga su propio latido y reproduce el fallo original, solo que más tarde y de forma más silenciosa.

Se mantienen los dos porque se cubren mutuamente: cron-job.org no depende del repositorio, y GitHub Actions sigue funcionando si cron-job.org tiene una caída.

---

## 0. Antes de empezar — requisitos

### 0.1 El workflow tiene que estar en GitHub

**Esto bloquea todo el latido secundario.** GitHub Actions solo puede ejecutar workflows que existan en el repositorio **remoto**. El archivo `.github/workflows/keep-alive.yml` existe en local pero puede no estar subido todavía.

Compruébalo:

```powershell
git ls-files .github/
```

- **Si no imprime nada**, el archivo está sin trackear: `git add`, commit y push. Hasta entonces, el workflow **no aparecerá** en la pestaña Actions y el latido secundario no existe.
- **Si imprime la ruta**, ya está subido y puedes continuar.

El latido primario (cron-job.org) **no depende de esto** y puede configurarse desde ya.

### 0.2 Saber si el repositorio es público o privado

En la página del repositorio, junto al nombre, hay una etiqueta gris que dice `Public` o `Private`.

| | Público | Privado |
|---|---|---|
| Minutos de Actions | Ilimitados | 2 000/mes (este job consume segundos) |
| Quién lee el historial de commits | **Cualquiera** | Solo colaboradores |

Si es **público**, ten presente que el historial de commits es legible por cualquiera, incluidos archivos borrados en commits posteriores. No afecta al latido, pero conviene saberlo antes de pegar valores en ningún sitio.

### 0.3 Localizar la clave publicable

Se usa en **los dos** latidos, así que consíguela una vez y tenla a mano.

1. <https://supabase.com/dashboard> → proyecto **Nelson_Law**
2. Menú izquierdo, abajo → **Project Settings** (icono de engranaje)
3. **API Keys**
4. Copia la clave que empieza por `sb_publishable_...`

> ### ⚠️ Nunca la `service_role`
>
> En esa misma pantalla hay una clave `service_role`. **Ignora RLS por completo**: quien la tenga puede leer, modificar y borrar todos los leads del bufete. La clave publicable es pública por diseño —ya viaja en el HTML del panel— y para esta consulta basta y sobra.
>
> Si alguna vez pegas la `service_role` en un servicio de terceros o en un repositorio, hay que **rotarla inmediatamente**.

---

## Latido primario — cron-job.org

Servicio gratuito, sin tarjeta. Registro en <https://cron-job.org>.

### Paso a paso

1. **Crear la cuenta.** <https://cron-job.org> → **Sign up**. Pide confirmación por correo: hay que abrir el enlace antes de poder crear trabajos.
2. **Entrar** y, en el menú superior, ir a **Cronjobs**.
3. Botón **CREATE CRONJOB** (arriba a la derecha).
4. Rellenar **Title** y **URL** con los valores de la tabla de abajo.
5. En **Schedule**, elegir la opción **Every day** y fijar la hora en `14:00`.
   > cron-job.org interpreta la hora según la zona horaria configurada en tu perfil (*Settings → Timezone*). Si la tienes en UTC, `14:00` son las 09:00 de Panamá. Si la tienes en hora de Panamá, pon directamente `09:00`. **Comprueba tu zona antes**, es el error más común.
6. **Las cabeceras están escondidas.** Despliega la sección **Advanced** — solo ahí aparece la pestaña **Headers**. Es donde más gente se atasca.
7. Añadir las dos cabeceras (ver más abajo). Cada una se introduce en **dos campos separados**: nombre y valor. **El nombre va sin los dos puntos.**
8. **TEST RUN** antes de guardar. Debe devolver **200** en el momento. Si no, corrige antes de continuar.
9. **CREATE** para guardar.

### Configuración exacta

| Campo | Valor |
|---|---|
| **Title** | `Supabase keep-alive — Juriscorp` |
| **URL** | `https://azraryuqcqibppexuiwi.supabase.co/rest/v1/leads?select=id&limit=1` |
| **Request method** | `GET` |
| **Schedule** | Every day at `14:00` UTC (09:00 Panamá) |
| **Enabled** | Sí |
| **Save responses in job history** | Sí — útil para diagnosticar |
| **Notify on failure** | **Sí** — es la alerta de que el proyecto está caído |

### Cabeceras (dentro de *Advanced* → *Headers*)

| Nombre del campo | Valor del campo |
|---|---|
| `apikey` | la clave publicable |
| `Authorization` | `Bearer ` + la clave publicable |

PostgREST exige la cabecera `apikey`; `Authorization` acompaña por convención del SDK. Ambas llevan **el mismo valor**, salvo que `Authorization` lleva delante la palabra `Bearer` y un espacio.

### Respuesta esperada

**HTTP 200** con cuerpo `[]`.

La lista vuelve vacía porque RLS no concede `SELECT` sobre `leads` al rol anónimo — y eso está bien. **La consulta se ejecuta igualmente contra Postgres, que es lo que cuenta como actividad.** No hace falta que devuelva datos; hace falta que llegue.

Cualquier código distinto de 200 significa que algo va mal:

| Código | Significado probable |
|---|---|
| `200` | Correcto |
| `401` / `403` | La clave fue rotada y no se actualizó aquí, o se revocaron los permisos del rol `anon` sobre la tabla |
| `404` | La tabla `leads` ya no existe o cambió de nombre |
| `503` / timeout | **Proyecto pausado o caído** |

---

## Latido secundario — GitHub Actions

Ya versionado en `.github/workflows/keep-alive.yml`. Requiere el paso 0.1.

### Crear los secrets, clic a clic

Si nunca has usado GitHub Secrets: son valores cifrados que el workflow lee en ejecución sin que aparezcan en el código ni en los logs.

1. Abre <https://github.com/andrefeliperuiz12/NelsonLaw>
2. Pestaña **Settings**. Está en la barra superior del repositorio, la última a la derecha, con un icono de engranaje.
   > **Cuidado:** no es el *Settings* que sale al pulsar tu foto de perfil arriba del todo. Ése es el de tu cuenta. Tiene que ser el de la barra del repositorio, la fila donde también están *Code*, *Issues* y *Actions*.
3. En el menú de la izquierda, busca **Secrets and variables** y pulsa para desplegarlo.
4. Dentro, elige **Actions**.
5. Asegúrate de estar en la pestaña **Secrets**, no en *Variables*.
   > Un **secret** se cifra y no se puede volver a leer, solo sustituir. Una **variable** se guarda en claro y cualquiera con acceso al repositorio la ve. La clave va como secret.
6. Botón verde **New repository secret**, arriba a la derecha.
7. Rellena y pulsa **Add secret**:
   - **Name:** `SUPABASE_URL`
   - **Secret:** `https://azraryuqcqibppexuiwi.supabase.co`
8. Repite el paso 6 para el segundo:
   - **Name:** `SUPABASE_PUBLISHABLE_KEY`
   - **Secret:** la clave publicable del paso 0.3

Al terminar deben aparecer los dos en la lista *Repository secrets*, con la fecha de creación. **El valor ya no se puede ver**: si te equivocaste, se pulsa **Update** y se pega de nuevo.

### De dónde sale cada valor

| Secret | Dónde encontrarlo | Cuidado |
|---|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → **Data API** → *Project URL* | Sin barra al final |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → **API Keys** → `sb_publishable_...` | **Jamás la `service_role`** (ver aviso del paso 0.3) |

> **Los nombres distinguen mayúsculas** y deben coincidir exactamente con los del workflow (`.github/workflows/keep-alive.yml`, líneas 67-68). Un `SUPABASE_Url` no funciona.
>
> **Al pegar la clave, cuidado con el salto de línea final.** Si se cuela, la petición falla con 401 y el valor *parece* correcto. Pega sin pulsar Enter.

### Prueba inicial

1. Pestaña **Actions** del repositorio.
2. En la lista de la izquierda, **Keep Supabase Alive**.
   > Si no aparece, vuelve al paso 0.1: el workflow no está en el remoto.
3. Botón **Run workflow** a la derecha → confirma **Run workflow**.
4. Refresca. Debe salir una ejecución que termina **en verde**, y en su log la línea `HTTP 200` seguida de `Proyecto activo.`

### Si GitHub lo desactiva a los 60 días

Llega un email de aviso. Actions → *Keep Supabase Alive* → **Enable workflow**. Cualquier commit al repositorio reinicia el contador.

---

## Resolución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El workflow no aparece en Actions | No está en el remoto | Paso 0.1: commit y push |
| Ejecución en rojo: `Faltan los secrets...` | Nombre mal escrito o secret no creado | Revisar mayúsculas exactas |
| Ejecución en rojo con `HTTP 401` | Clave rotada, mal pegada, o con salto de línea | Volver a pegar con **Update** |
| Ejecución en rojo con `HTTP 000` | Timeout de red del runner | **No** es el proyecto caído. Reintentar |
| `HTTP 503` en ambos latidos | Proyecto pausado o caído | Entrar al panel de Supabase y reactivarlo |
| cron-job.org en verde pero el proyecto se pausó igual | La URL apunta a otro proyecto | Verificar la referencia en la URL |

---

## Verificación de que el latido funciona

1. Supabase → Reports → API. Debe verse un pico diario de peticiones a la hora del cron.
2. cron-job.org → historial del job: todas las ejecuciones en verde con 200.
3. **La prueba real es el tiempo**: si el proyecto sigue activo tras 10 días sin que nadie lo toque, funciona.

## Mantenimiento

- **Al rotar la clave publicable**, actualizarla en los dos sitios: cabeceras de cron-job.org y secret de GitHub. Si no, ambos latidos empiezan a devolver 401 y el proyecto se pausa igual.
- **Si se renombra o elimina la tabla `leads`**, actualizar la URL en ambos.
- **Revisar cada pocos meses** que ambos siguen activos. El fallo de este sistema es silencioso por naturaleza: nadie nota que un latido se detuvo hasta que el proyecto se pausa.
