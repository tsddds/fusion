const SHEETS = {
  ACTIVITIES: 'Activities', EVENTS: 'Events', SESSIONS: 'Sessions',
  BOOKINGS: 'Bookings', SUBSCRIBERS: 'Subscribers', NOTICES: 'Notices',
};
const ADMIN_PIN_PROPERTY = 'RUYUEN_ADMIN_PIN';
const BOOKING_HEADERS = ['id', 'createdAt', 'eventId', 'sessionId', 'activityId', 'attendee', 'contactType', 'contact', 'partySize', 'locale', 'status', 'checkedInAt'];
const SUBSCRIBER_HEADERS = ['id', 'createdAt', 'name', 'contactType', 'contact', 'locale', 'consent', 'active'];
const SHEET_HEADERS = {
  Activities: ['id', 'active', 'order', 'title_es', 'title_zhHant', 'title_en', 'title_pt', 'summary_es', 'summary_zhHant', 'summary_en', 'summary_pt', 'detail_es', 'detail_zhHant', 'detail_en', 'detail_pt', 'duration_es', 'duration_zhHant', 'duration_en', 'duration_pt', 'audience_es', 'audience_zhHant', 'audience_en', 'audience_pt', 'image'],
  Events: ['id', 'slug', 'status', 'startAt', 'endAt', 'registrationOpen', 'title_es', 'title_zhHant', 'title_en', 'title_pt', 'summary_es', 'summary_zhHant', 'summary_en', 'summary_pt', 'venue_es', 'venue_zhHant', 'venue_en', 'venue_pt', 'address', 'cover'],
  Sessions: ['id', 'eventId', 'activityId', 'startAt', 'endAt', 'capacity', 'status'],
  Bookings: BOOKING_HEADERS,
  Subscribers: SUBSCRIBER_HEADERS,
  Notices: ['id', 'active', 'priority', 'title_es', 'title_zhHant', 'title_en', 'title_pt', 'body_es', 'body_zhHant', 'body_en', 'body_pt'],
};

function setAdminPin() {
  const pin = Browser.inputBox('Ruyuen', 'Crea un PIN privado para el panel de equipo (mínimo 8 caracteres).', Browser.Buttons.OK_CANCEL);
  if (pin === 'cancel') return;
  if (String(pin).length < 8) throw new Error('El PIN debe tener al menos 8 caracteres');
  PropertiesService.getScriptProperties().setProperty(ADMIN_PIN_PROPERTY, String(pin));
}

function setupRuyuen() {
  Object.keys(SHEET_HEADERS).forEach((name) => ensureHeader(getSheet(name), SHEET_HEADERS[name]));
  SpreadsheetApp.getActive().toast('Las seis pestañas de Ruyuen ya están preparadas.', 'Ruyuen');
}

function doPost(event) {
  try {
    const payload = JSON.parse((event && event.postData && event.postData.contents) || '{}');
    if (['getPublicContent', 'content'].includes(payload.action)) return json(getPublicContent());
    if (payload.action === 'subscribe') return json(subscribe(payload.subscriber));
    if (payload.action === 'createBooking') return json(createBooking(payload.booking));
    if (payload.action === 'adminListBookings') {
      requireAdmin(payload.adminPin);
      return json({ bookings: readRows(SHEETS.BOOKINGS) });
    }
    if (payload.action === 'adminUpdateBooking') {
      requireAdmin(payload.adminPin);
      return json(updateBooking(payload.bookingId, payload.status, payload.checkedInAt));
    }
    if (payload.action === 'adminPromoteWaitlist') {
      requireAdmin(payload.adminPin);
      return json(promoteWaitlist(payload.bookingId));
    }
    return json({ error: 'Unknown action' });
  } catch (error) {
    return json({ error: String((error && error.message) || error) });
  }
}

function getPublicContent() {
  return {
    activities: readRows(SHEETS.ACTIVITIES).filter((row) => String(row.active).toLowerCase() !== 'false').sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    events: readRows(SHEETS.EVENTS).filter((row) => ['published', 'archived'].includes(String(row.status))),
    sessions: readRows(SHEETS.SESSIONS).filter((row) => String(row.status || 'open') !== 'draft'),
    notices: readRows(SHEETS.NOTICES).filter((row) => isTrue(row.active)),
  };
}

function subscribe(subscriber) {
  if (!subscriber || !subscriber.contact || !isTrue(subscriber.consent)) throw new Error('Contact and consent are required');
  if (!['email', 'whatsapp'].includes(String(subscriber.contactType))) throw new Error('Invalid contact type');
  const sheet = getSheet(SHEETS.SUBSCRIBERS);
  ensureHeader(sheet, SUBSCRIBER_HEADERS);
  const normalized = String(subscriber.contact).trim().toLowerCase();
  if (readRows(SHEETS.SUBSCRIBERS).some((row) => String(row.contact).trim().toLowerCase() === normalized)) return { ok: true, existing: true };
  sheet.appendRow([`SUB-${Utilities.getUuid().slice(0, 8).toUpperCase()}`, new Date().toISOString(), String(subscriber.name || '').trim(), subscriber.contactType, String(subscriber.contact).trim(), subscriber.locale || 'es', true, true]);
  return { ok: true };
}

function createBooking(input) {
  if (!input || !input.eventId || !input.sessionId || !input.activityId) throw new Error('Missing booking data');
  if (!input.attendee || !input.contact) throw new Error('Name and contact are required');
  const partySize = Number(input.partySize || 1);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 4) throw new Error('Party size must be between 1 and 4');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const eventRow = readRows(SHEETS.EVENTS).find((row) => String(row.id) === String(input.eventId) && String(row.status) === 'published');
    if (!eventRow || !isTrue(eventRow.registrationOpen)) throw new Error('Registration is not open');
    const session = readRows(SHEETS.SESSIONS).find((row) => String(row.id) === String(input.sessionId) && String(row.eventId) === String(input.eventId) && String(row.status || 'open') === 'open');
    if (!session) throw new Error('Session not found');
    const current = readRows(SHEETS.BOOKINGS).filter((row) => String(row.sessionId) === String(input.sessionId) && ['reserved', 'checked-in', 'completed'].includes(String(row.status)));
    const reservedSeats = current.reduce((total, row) => total + Number(row.partySize || 1), 0);
    const status = reservedSeats + partySize <= Number(session.capacity || 0) ? 'reserved' : 'waitlisted';
    const booking = {
      id: `RY-${Utilities.getUuid().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(),
      eventId: String(input.eventId), sessionId: String(input.sessionId), activityId: String(input.activityId),
      attendee: String(input.attendee).trim(), contactType: String(input.contactType), contact: String(input.contact).trim(),
      partySize, locale: String(input.locale || 'es'), status, checkedInAt: '',
    };
    const sheet = getSheet(SHEETS.BOOKINGS);
    ensureHeader(sheet, BOOKING_HEADERS);
    sheet.appendRow(BOOKING_HEADERS.map((header) => booking[header] || ''));
    sendBookingEmail(booking, session, eventRow);
    return { booking };
  } finally {
    lock.releaseLock();
  }
}

function updateBooking(bookingId, status, checkedInAt) {
  const allowed = ['reserved', 'waitlisted', 'checked-in', 'cancelled', 'no-show', 'completed'];
  if (!allowed.includes(String(status))) throw new Error('Invalid status');
  const sheet = getSheet(SHEETS.BOOKINGS);
  ensureHeader(sheet, BOOKING_HEADERS);
  const row = findRowById(sheet, bookingId);
  if (!row) throw new Error('Booking not found');
  setCellByHeader(sheet, row, 'status', status);
  setCellByHeader(sheet, row, 'checkedInAt', checkedInAt || '');
  return { ok: true };
}

function promoteWaitlist(bookingId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const bookings = readRows(SHEETS.BOOKINGS);
    const booking = bookings.find((row) => String(row.id) === String(bookingId));
    if (!booking || String(booking.status) !== 'waitlisted') throw new Error('Waitlisted booking not found');
    const session = readRows(SHEETS.SESSIONS).find((row) => String(row.id) === String(booking.sessionId));
    if (!session) throw new Error('Session not found');
    const reservedSeats = bookings.filter((row) => String(row.sessionId) === String(booking.sessionId) && ['reserved', 'checked-in', 'completed'].includes(String(row.status))).reduce((total, row) => total + Number(row.partySize || 1), 0);
    if (reservedSeats + Number(booking.partySize || 1) > Number(session.capacity || 0)) throw new Error('Not enough capacity for this group');
    updateBooking(bookingId, 'reserved', '');
    const eventRow = readRows(SHEETS.EVENTS).find((row) => String(row.id) === String(booking.eventId));
    sendBookingEmail({ ...booking, status: 'reserved' }, session, eventRow || {});
    return { ok: true, booking: { ...booking, status: 'reserved' } };
  } finally {
    lock.releaseLock();
  }
}

function sendBookingEmail(booking, session, eventRow) {
  if (booking.contactType !== 'email' || !String(booking.contact).includes('@')) return;
  const waitlisted = booking.status === 'waitlisted';
  const qrPayload = JSON.stringify({ type: 'ruyuen-booking', version: 1, bookingId: booking.id, eventId: booking.eventId, sessionId: booking.sessionId });
  const qrUrl = `https://quickchart.io/qr?size=260&text=${encodeURIComponent(qrPayload)}`;
  const message = waitlisted ? 'Tu solicitud quedó en lista de espera. Te contactaremos si se libera espacio para todo tu grupo.' : 'Tu reserva está confirmada. Presenta este código QR al llegar.';
  const subject = waitlisted ? 'Ruyuen · Lista de espera' : 'Ruyuen · Confirmación de reserva';
  const body = `${message}\nCódigo: ${booking.id}\nInicio: ${session.startAt || ''}\nLugar: ${eventRow.venue_es || ''}`;
  const qr = waitlisted ? '' : `<img alt="QR de reserva" src="${qrUrl}" width="260" height="260">`;
  MailApp.sendEmail({ to: booking.contact, subject, body, htmlBody: `<div style="font-family:Arial,sans-serif;color:#172328"><h2 style="color:#071d2a">Ruyuen</h2><p>${message}</p><p><strong>Código:</strong> ${booking.id}</p><p><strong>Inicio:</strong> ${session.startAt || ''}</p>${qr}</div>` });
}

function readRows(sheetName) {
  const sheet = getSheet(sheetName);
  if (sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return [];
  const values = sheet.getDataRange().getValues();
  const header = values.shift().map(String);
  return values.filter((row) => row.some((cell) => cell !== '')).map((row) => header.reduce((record, key, index) => { record[key] = row[index]; return record; }, {}));
}

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.getActive();
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeader(sheet, header) {
  if (sheet.getLastRow() === 0) { sheet.appendRow(header); return; }
  const current = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  if (current.join('|') !== header.join('|')) sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

function findRowById(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const idColumn = values[0].indexOf('id');
  for (let index = 1; index < values.length; index += 1) if (String(values[index][idColumn]) === String(id)) return index + 1;
  return 0;
}

function setCellByHeader(sheet, row, header, value) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const column = headers.indexOf(header);
  if (column < 0) throw new Error(`Missing ${header} column`);
  sheet.getRange(row, column + 1).setValue(value);
}

function requireAdmin(pin) {
  const configuredPin = PropertiesService.getScriptProperties().getProperty(ADMIN_PIN_PROPERTY);
  if (!configuredPin || String(pin) !== configuredPin) throw new Error('Invalid admin PIN');
}
function isTrue(value) { return value === true || String(value).toLowerCase() === 'true' || String(value) === '1'; }
function json(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
