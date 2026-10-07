// Carga los módulos de validación de las Edge Functions desde Node.
//
// El repo declara "type": "commonjs", así que Node trata un .ts como CommonJS
// y no acepta su `export`. Cambiar la extensión o el package.json afectaría a
// lo que se despliega en Supabase; en su lugar se eliminan los tipos con la
// API de Node y se importa el resultado como módulo ES. Lo usan las pruebas,
// el simulador local y el verificador del sitio.
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

async function loadTs(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const js = stripTypeScriptTypes(source, { mode: 'strip' });
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

// Formulario de consulta (submit-lead).
export default await loadTs('../../supabase/functions/submit-lead/validation.ts');

// Contador anónimo de contactos (track-event).
export const trackValidation = await loadTs('../../supabase/functions/track-event/validation.ts');
