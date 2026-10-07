// Pruebas de la validación del formulario (supabase/functions/submit-lead/validation.ts).
// Ejecutar con:  node --test tests/validation.test.mjs
// Requiere Node 23.2+ (module.stripTypeScriptTypes).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import validation from '../scripts/lib/load-validation.mjs';

const {
  validateLead,
  VALID_LEGAL_AREAS,
  SERVICE_AREAS,
  LEGACY_AREAS,
  AREA_LABELS,
  MENSAJES,
  isValidIsoDate,
} = validation;

const base = {
  fullName: "María D'León",
  phone: '+507 6000-0000',
  email: '',
  legalArea: 'residencia_migracion',
  caseSummary: 'Quiero evaluar mi residencia en Panamá.',
  country: 'Colombia',
  deadline: 'no',
};

test('acepta una consulta completa del formulario nuevo', () => {
  const r = validateLead(base);
  assert.equal(r.ok, true);
  assert.equal(r.lead.full_name, "María D'León"); // sin escapar en origen
  assert.equal(r.lead.email, null);
  assert.equal(r.lead.client_country, 'Colombia');
  assert.equal(r.lead.has_deadline, 'no');
  assert.equal(r.lead.deadline_date, null);
});

test('acepta el cuerpo que envía el formulario ANTERIOR (compatibilidad)', () => {
  const r = validateLead({
    fullName: 'Juan Pérez',
    phone: '66000000',
    email: null,
    legalArea: 'derecho_administrativo',
    caseSummary: 'Recibí una multa de una entidad.',
    consent: true,
  });
  assert.equal(r.ok, true);
  assert.equal(r.lead.client_country, null);
  assert.equal(r.lead.has_deadline, null);
});

test('acepta solo correo, sin teléfono', () => {
  const r = validateLead({ ...base, phone: '', email: 'cliente@example.com' });
  assert.equal(r.ok, true);
  assert.equal(r.lead.phone, null);
  assert.equal(r.lead.email, 'cliente@example.com');
});

test('exige al menos un medio de contacto', () => {
  const r = validateLead({ ...base, phone: '  ', email: '' });
  assert.deepEqual(r, { ok: false, code: 'contactRequired' });
});

test('rechaza teléfono o correo mal formados', () => {
  assert.equal(validateLead({ ...base, phone: '123' }).code, 'phoneInvalid');
  assert.equal(validateLead({ ...base, email: 'sin-arroba' }).code, 'emailInvalid');
  assert.equal(validateLead({ ...base, phone: 12345678 }).code, 'phoneInvalid');
});

test('rechaza campos obligatorios ausentes o de tipo incorrecto', () => {
  assert.equal(validateLead(null).code, 'requiredFields');
  assert.equal(validateLead({ ...base, fullName: '' }).code, 'requiredFields');
  assert.equal(validateLead({ ...base, caseSummary: { a: 1 } }).code, 'requiredFields');
  assert.equal(validateLead({ ...base, fullName: 'A' }).code, 'nameTooShort');
  assert.equal(validateLead({ ...base, caseSummary: 'corto' }).code, 'summaryTooShort');
});

test('rechaza servicios desconocidos', () => {
  assert.equal(validateLead({ ...base, legalArea: 'nacionalizacion' }).code, 'areaInvalid');
});

test('valida país y plazo', () => {
  assert.equal(validateLead({ ...base, country: 'X' }).code, 'countryInvalid');
  assert.equal(validateLead({ ...base, deadline: 'mañana' }).code, 'deadlineInvalid');
  const conFecha = validateLead({ ...base, deadline: 'si', deadlineDate: '2026-11-30' });
  assert.equal(conFecha.lead.deadline_date, '2026-11-30');
  assert.equal(validateLead({ ...base, deadline: 'si', deadlineDate: '2026-02-31' }).code, 'deadlineInvalid');
  assert.equal(validateLead({ ...base, deadline: 'si', deadlineDate: '0000-01-01' }).code, 'deadlineInvalid');
});

test('descarta la fecha si no se indicó plazo', () => {
  const r = validateLead({ ...base, deadline: 'no', deadlineDate: '2026-11-30' });
  assert.equal(r.ok, true);
  assert.equal(r.lead.deadline_date, null);
});

test('recorta textos largos al tope', () => {
  const r = validateLead({ ...base, caseSummary: 'x'.repeat(5000), country: 'y'.repeat(300) });
  assert.equal(r.lead.case_summary.length, 2000);
  assert.equal(r.lead.client_country.length, 100);
});

test('el recorte no parte un emoji por la mitad', () => {
  // 99 letras + un emoji de dos unidades UTF-16: con substring() quedaría
  // medio emoji (un surrogate suelto) que Postgres rechaza.
  const r = validateLead({ ...base, country: 'a'.repeat(99) + '😀' + 'b' });
  assert.equal(r.ok, true);
  assert.equal(Array.from(r.lead.client_country).length, 100);
  assert.ok(r.lead.client_country.endsWith('😀'));
  assert.equal(r.lead.client_country.isWellFormed(), true);
});

test('las listas de servicios son coherentes con etiquetas y migración', () => {
  assert.equal(VALID_LEGAL_AREAS.length, SERVICE_AREAS.length + LEGACY_AREAS.length);
  for (const area of VALID_LEGAL_AREAS) assert.ok(AREA_LABELS[area], `sin etiqueta: ${area}`);
});

test('los mensajes existen en los dos idiomas', () => {
  assert.deepEqual(Object.keys(MENSAJES.es).sort(), Object.keys(MENSAJES.en).sort());
});

test('isValidIsoDate', () => {
  assert.equal(isValidIsoDate('2026-10-06'), true);
  assert.equal(isValidIsoDate('06/10/2026'), false);
  assert.equal(isValidIsoDate('2026-13-01'), false);
  assert.equal(isValidIsoDate('0000-01-01'), false);
});
