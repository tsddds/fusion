const SHEETS = {
  BOOKINGS: 'Bookings',
  NOTICES: 'Notices',
};
const ADMIN_PIN_PROPERTY = 'RUYUEN_ADMIN_PIN';

function setAdminPin() {
  PropertiesService.getScriptProperties().setProperty(ADMIN_PIN_PROPERTY, 'change-this-pin');
}

function doPost(event) {
  const payload = JSON.parse(event.postData.contents || '{}');

  try {
    if (payload.action === 'content') {
      return json({ notices: readRows(SHEETS.NOTICES) });
    }

    if (payload.action === 'createBooking') {
      return json(createBooking(payload.booking));
    }

    if (payload.action === 'adminListBookings') {
      requireAdmin(payload.adminPin);
      return json({ bookings: readRows(SHEETS.BOOKINGS) });
    }

    if (payload.action === 'adminUpdateBooking') {
      requireAdmin(payload.adminPin);
      return json(updateBooking(payload.bookingId, payload.status, payload.checkedInAt));
    }

    if (payload.action === 'adminUpsertContent') {
      requireAdmin(payload.adminPin);
      return json(saveNotice(payload.notice));
    }

    return json({ error: 'Unknown action' });
  } catch (error) {
    return json({ error: String(error.message || error) });
  }
}

function createBooking(booking) {
  const sheet = getSheet(SHEETS.BOOKINGS);
  ensureHeader(sheet, [
    'id',
    'createdAt',
    'activityId',
    'activityName',
    'slotLabel',
    'attendee',
    'contact',
    'guests',
    'language',
    'status',
    'checkedInAt',
  ]);

  sheet.appendRow([
    booking.id,
    booking.createdAt,
    booking.activityId,
    booking.activityName,
    booking.slotLabel,
    booking.attendee,
    booking.contact,
    booking.guests,
    booking.language,
    booking.status || 'reserved',
    booking.checkedInAt || '',
  ]);

  return { booking };
}

function updateBooking(bookingId, status, checkedInAt) {
  const sheet = getSheet(SHEETS.BOOKINGS);
  const values = sheet.getDataRange().getValues();
  const header = values[0] || [];
  const idCol = header.indexOf('id');
  const statusCol = header.indexOf('status');
  const checkedInCol = header.indexOf('checkedInAt');

  for (let row = 1; row < values.length; row += 1) {
    if (values[row][idCol] === bookingId) {
      sheet.getRange(row + 1, statusCol + 1).setValue(status);
      if (checkedInCol >= 0) {
        sheet.getRange(row + 1, checkedInCol + 1).setValue(checkedInAt || '');
      }
      return { ok: true };
    }
  }

  return { error: 'Booking not found' };
}

function saveNotice(notice) {
  const sheet = getSheet(SHEETS.NOTICES);
  ensureHeader(sheet, ['id', 'title', 'body', 'priority', 'active']);
  sheet.appendRow([notice.id, notice.title, notice.body, notice.priority, notice.active]);
  return { notice };
}

function readRows(sheetName) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  const header = values.shift() || [];

  return values.map((row) =>
    header.reduce((record, key, index) => {
      record[key] = row[index];
      return record;
    }, {}),
  );
}

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.getActive();
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeader(sheet, header) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    return;
  }

  const current = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  if (current.join('|') !== header.join('|')) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

function requireAdmin(pin) {
  const configuredPin = PropertiesService.getScriptProperties().getProperty(ADMIN_PIN_PROPERTY);
  if (!configuredPin || pin !== configuredPin) {
    throw new Error('Invalid admin PIN');
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
