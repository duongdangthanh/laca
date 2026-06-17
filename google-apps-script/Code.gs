const SHEET_ID = '1dve1dTs_zXiUTh6knHPFrHMzVF7S3WEYFuR-kPFO2wE'
const SHEET_NAME = 'Registrations'

function doGet() {
  return jsonOutput({ ok: true, service: 'laca-registration' })
}

function doPost(e) {
  try {
    const payload = parsePayload_(e)

    if (!payload.player1 || !payload.player2 || !payload.phone) {
      return jsonOutput({ ok: false, error: 'missing_required_fields' })
    }

    const sheet = getOrCreateSheet_()
    ensureHeader_(sheet)

    sheet.appendRow([
      payload.submittedAt || new Date().toISOString(),
      payload.player1,
      payload.player2,
      payload.team || '',
      payload.phone
    ])

    return jsonOutput({ ok: true })
  } catch (_error) {
    return jsonOutput({ ok: false, error: 'internal_error' })
  }
}

function parsePayload_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : ''

  if (!raw) {
    return {
      player1: clean_(param_(e, 'player1')),
      player2: clean_(param_(e, 'player2')),
      team: clean_(param_(e, 'team')),
      phone: clean_(param_(e, 'phone')),
      submittedAt: clean_(param_(e, 'submittedAt'))
    }
  }

  const parsed = JSON.parse(raw)
  return {
    player1: clean_(parsed.player1),
    player2: clean_(parsed.player2),
    team: clean_(parsed.team),
    phone: clean_(parsed.phone),
    submittedAt: clean_(parsed.submittedAt)
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return

  sheet.appendRow([
    'submittedAt',
    'player1',
    'player2',
    'team',
    'phone'
  ])
}

function param_(e, key) {
  if (!e || !e.parameter) return ''
  return e.parameter[key] || ''
}

function clean_(v) {
  return String(v || '').trim()
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}
