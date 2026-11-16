// Describe cada módulo: columnas de la tabla y campos del formulario.
// Para agregar un módulo nuevo basta con añadir un bloque aquí.

export const STATUS = [
  ['scheduled', 'Programada'], ['confirmed', 'Confirmada'], ['in_progress', 'En curso'],
  ['completed', 'Completada'], ['cancelled', 'Cancelada'], ['no_show', 'No asistió'],
]
const PAY_LABELS = { pending: 'Pendiente', paid: 'Pagado', refunded: 'Reembolsado' }
const METHOD_LABELS = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', qr: 'QR' }
const METHOD_ICONS = { cash: 'fa-money-bill-wave', card: 'fa-credit-card', transfer: 'fa-building-columns', qr: 'fa-qrcode' }
const PAY_STATUS = [['pending', 'Pendiente'], ['paid', 'Pagado'], ['refunded', 'Reembolsado']]

export const fmt = (d) => (d ? new Date(d).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : null)
const local = (d) => (d ? new Date(new Date(d) - new Date(d).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : '')
const money = (v) => (v == null ? null : Number(v).toFixed(2))
const dentistName = (d) => d?.user?.name || (d ? `Odontólogo #${d.id}` : null)

const col = (label, value, type, extra = {}) => ({ label, value, type, ...extra })
const f = (key, label, extra = {}) => ({ key, label, ...extra })

export const RESOURCES = {
  patients: {
    title: 'Pacientes', icon: 'fa-user-injured', color: '#2563eb',
    cols: [col('Paciente', (r) => r.full_name), col('Documento', (r) => r.document_number), col('Teléfono', (r) => r.phone), col('Edad', (r) => r.age)],
    fields: [
      f('first_name', 'Nombres', { req: 1 }), f('last_name', 'Apellidos', { req: 1 }),
      f('document_number', 'Documento', { req: 1 }), f('birth_date', 'Fecha de nacimiento', { type: 'date' }),
      f('gender', 'Género', { type: 'select', opts: [['male', 'Masculino'], ['female', 'Femenino'], ['other', 'Otro']] }),
      f('phone', 'Teléfono'), f('email', 'Correo', { type: 'email' }), f('address', 'Dirección', { wide: 1 }),
      f('emergency_contact_name', 'Contacto de emergencia'), f('emergency_contact_phone', 'Teléfono de emergencia'),
      f('allergies', 'Alergias', { type: 'area', wide: 1 }), f('medical_history', 'Antecedentes médicos', { type: 'area', wide: 1 }),
      f('notes', 'Notas', { type: 'area', wide: 1 }),
    ],
  },
  appointments: {
    title: 'Citas', icon: 'fa-calendar-check', color: '#7c3aed',
    cols: [col('Fecha', (r) => fmt(r.start_at)), col('Paciente', (r) => r.patient?.full_name), col('Odontólogo', (r) => dentistName(r.dentist)),
      col('Motivo', (r) => r.reason), col('Estado', (r) => r.status, 'status')],
    fields: [
      f('patient_id', 'Paciente', { type: 'remote', src: 'patients', label_fn: (p) => `${p.full_name} · ${p.document_number}`, req: 1, wide: 1 }),
      f('dentist_id', 'Odontólogo', { type: 'remote', src: 'dentists', label_fn: (d) => dentistName(d) + (d.specialty ? ` · ${d.specialty}` : ''), req: 1, wide: 1 }),
      f('start_at', 'Inicio', { type: 'datetime-local', req: 1, get: (r) => local(r.start_at) }),
      f('end_at', 'Fin', { type: 'datetime-local', req: 1, get: (r) => local(r.end_at) }),
      f('treatment_id', 'Tratamiento (opcional)', { type: 'remote', src: 'treatments', label_fn: (t) => `${t.name} · ${t.price}`, wide: 1, get: (r) => r.treatments?.[0]?.id }),
      f('reason', 'Motivo', { wide: 1 }), f('notes', 'Notas', { type: 'area', wide: 1 }),
    ],
    out: (p) => { if (p.treatment_id) p.treatments = [{ treatment_id: +p.treatment_id }]; delete p.treatment_id; return p },
  },
  'clinical-records': {
    title: 'Historias clínicas', icon: 'fa-file-medical', color: '#0891b2',
    cols: [col('Fecha', (r) => fmt(r.created_at)), col('Paciente', (r) => r.patient?.full_name), col('Odontólogo', (r) => dentistName(r.dentist)),
      col('Diagnóstico', (r) => (r.diagnosis || '').slice(0, 70))],
    fields: [
      f('patient_id', 'Paciente', { type: 'remote', src: 'patients', label_fn: (p) => p.full_name, req: 1, wide: 1 }),
      f('dentist_id', 'Odontólogo', { type: 'remote', src: 'dentists', label_fn: dentistName, wide: 1 }),
      f('diagnosis', 'Diagnóstico', { type: 'area', req: 1, wide: 1 }),
      f('procedure_notes', 'Procedimiento', { type: 'area', wide: 1 }), f('prescription', 'Receta', { type: 'area', wide: 1 }),
    ],
  },
  payments: {
    title: 'Pagos', icon: 'fa-credit-card', color: '#059669',
    cols: [col('Fecha', (r) => fmt(r.paid_at || r.created_at)), col('Paciente', (r) => r.patient?.full_name),
      col('Monto', (r) => `${r.currency} ${money(r.amount)}`), col('Método', (r) => r.method, 'method', { labels: METHOD_LABELS, icons: METHOD_ICONS }), col('Estado', (r) => r.status, 'badge', { labels: PAY_LABELS })],
    fields: [
      f('patient_id', 'Paciente', { type: 'remote', src: 'patients', label_fn: (p) => p.full_name, req: 1, wide: 1 }),
      f('amount', 'Monto', { type: 'number', req: 1 }),
      f('method', 'Método', { type: 'select', req: 1, opts: [['cash', 'Efectivo'], ['card', 'Tarjeta'], ['transfer', 'Transferencia'], ['qr', 'QR']] }),
      f('status', 'Estado', { type: 'select', opts: PAY_STATUS }),
      f('paid_at', 'Fecha de pago', { type: 'datetime-local', get: (r) => local(r.paid_at) }),
      f('reference', 'Referencia'), f('notes', 'Notas'),
    ],
  },
  treatments: {
    title: 'Tratamientos', icon: 'fa-tooth', color: '#d97706',
    cols: [col('Código', (r) => r.code), col('Nombre', (r) => r.name), col('Precio', (r) => money(r.price)),
      col('Duración', (r) => `${r.duration_minutes} min`), col('Estado', (r) => !!r.is_active, 'bool')],
    fields: [
      f('code', 'Código', { req: 1 }), f('name', 'Nombre', { req: 1 }),
      f('price', 'Precio', { type: 'number', req: 1 }), f('duration_minutes', 'Duración (min)', { type: 'number' }),
      f('description', 'Descripción', { type: 'area', wide: 1 }), f('is_active', 'Activo', { type: 'check', def: true }),
    ],
  },
  dentists: {
    title: 'Odontólogos', icon: 'fa-user-doctor', color: '#db2777', soft: true,
    cols: [col('Nombre', (r) => r.user?.name), col('Matrícula', (r) => r.license_number), col('Especialidad', (r) => r.specialty),
      col('Teléfono', (r) => r.phone), col('Estado', (r) => !!r.is_active, 'bool')],
    fields: [
      f('name', 'Nombre', { req: 1, get: (r) => r.user?.name }), f('email', 'Correo', { type: 'email', req: 1, get: (r) => r.user?.email }),
      f('password', 'Contraseña (10+, Aa, 1, #)', { type: 'password', req: 1 }), f('phone', 'Teléfono'),
      f('license_number', 'Matrícula', { req: 1 }), f('specialty', 'Especialidad'), f('is_active', 'Activo', { type: 'check', def: true }),
    ],
  },
  users: {
    title: 'Usuarios', icon: 'fa-user-shield', color: '#475569', soft: true,
    cols: [col('Nombre', (r) => r.name), col('Correo', (r) => r.email), col('Rol', (r) => r.roles?.join(', ')),
      col('Estado', (r) => !!r.is_active, 'bool'), col('Último acceso', (r) => fmt(r.last_login_at))],
    fields: [
      f('name', 'Nombre', { req: 1 }), f('email', 'Correo', { type: 'email', req: 1 }),
      f('password', 'Contraseña (10+, Aa, 1, #)', { type: 'password', req: 1 }), f('phone', 'Teléfono'),
      f('role', 'Rol', { type: 'remote', src: 'roles', val: 'name', label_fn: (r) => r.name, req: 1, get: (r) => r.roles?.[0] }),
      f('is_active', 'Activo', { type: 'check', def: true }),
    ],
    out: (p) => { p.roles = [p.role]; delete p.role; return p },
  },
}
