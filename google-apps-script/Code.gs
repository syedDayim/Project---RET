/**
 * Roommate Expenses – Google Apps Script
 *
 * 1. Create a new Google Sheet.
 * 2. Extensions → Apps Script, paste this file, save.
 * 3. Create two sheets: "Roommates" and "Expenses".
 *
 * Roommates sheet: Row 1 = headers [id, name, addedAt]. Data from row 2.
 * Expenses sheet: Row 1 = headers [id, paidBy, amount, currency, involved, note, createdAt].
 *   involved = comma-separated roommate ids.
 *
 * 4. Deploy → New deployment → Type: Web app.
 *    Execute as: Me, Who has access: Anyone (so your React app can call it).
 * 5. Copy the Web App URL (e.g. https://script.google.com/macros/s/XXX/exec) into your
 *    .env as VITE_APP_SCRIPT_URL (no path—use query param ?path=roommates or ?path=expenses).
 *
 * Routes (query param path=):
 * - GET  ?path=roommates  → list roommates
 * - POST ?path=roommates  → body { name } → add roommate
 * - GET  ?path=expenses   → list expenses
 * - POST ?path=expenses   → body { paidBy, amount, involved[], note? } → add expense
 */

const SHEET_NAME_ROOMMATES = 'Roommates'
const SHEET_NAME_EXPENSES = 'Expenses'
const CURRENCY = 'AED'

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet()
}

function getRoommatesSheet() {
  return getSpreadsheet().getSheetByName(SHEET_NAME_ROOMMATES)
}

function getExpensesSheet() {
  return getSpreadsheet().getSheetByName(SHEET_NAME_EXPENSES)
}

function ensureHeaders() {
  var roommates = getRoommatesSheet()
  if (!roommates) {
    roommates = getSpreadsheet().insertSheet(SHEET_NAME_ROOMMATES)
    roommates.getRange(1, 1, 1, 3).setValues([['id', 'name', 'addedAt']])
  } else if (roommates.getLastRow() === 0) {
    roommates.getRange(1, 1, 1, 3).setValues([['id', 'name', 'addedAt']])
  }

  var expenses = getExpensesSheet()
  if (!expenses) {
    expenses = getSpreadsheet().insertSheet(SHEET_NAME_EXPENSES)
    expenses.getRange(1, 1, 1, 7).setValues([['id', 'paidBy', 'amount', 'currency', 'involved', 'note', 'createdAt']])
  } else if (expenses.getLastRow() === 0) {
    expenses.getRange(1, 1, 1, 7).setValues([['id', 'paidBy', 'amount', 'currency', 'involved', 'note', 'createdAt']])
  }
}

function doGet(e) {
  return handleRequest(e, 'GET')
}

function doPost(e) {
  return handleRequest(e, 'POST')
}

function handleRequest(e, method) {
  ensureHeaders()
  var path = (e && e.parameter && e.parameter.path) ? e.parameter.path : (e && e.pathInfo) ? e.pathInfo : ''
  if (!path && e && e.queryString) {
    var params = e.queryString.split('&')
    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split('=')
      if (pair[0] === 'path') {
        path = decodeURIComponent(pair[1] || '')
        break
      }
    }
  }
  // Vercel/Netlify-style: path can be in query string as "path=/roommates"
  if (!path && e && e.parameter) path = e.parameter.path || ''

  var result
  try {
    var pathNorm = (path || '').replace(/^\//, '')
  if (pathNorm === 'roommates') {
      if (method === 'GET') {
        result = { roommates: listRoommates() }
      } else if (method === 'POST') {
        var body = parseBody(e)
        if (!body || !body.name) throw new Error('Missing name')
        result = { roommate: addRoommate(body.name.trim()) }
      } else {
        throw new Error('Method not allowed')
      }
    } else if (pathNorm === 'expenses') {
      if (method === 'GET') {
        result = { expenses: listExpenses() }
      } else if (method === 'POST') {
        var bodyExp = parseBody(e)
        if (!bodyExp || !bodyExp.paidBy || bodyExp.amount == null || !bodyExp.involved || !Array.isArray(bodyExp.involved)) {
          throw new Error('Missing paidBy, amount, or involved array')
        }
        result = { expense: addExpense(bodyExp) }
      } else {
        throw new Error('Method not allowed')
      }
    } else {
      throw new Error('Not found: ' + path)
    }
  } catch (err) {
    return createJsonResponse({ error: err.message || 'Error' }, 400)
  }
  return createJsonResponse(result)
}

function parseBody(e) {
  try {
    var postData = (e && e.postData && e.postData.contents) ? e.postData.contents : null
    if (postData) return JSON.parse(postData)
  } catch (e) {}
  return null
}

function createJsonResponse(obj, status) {
  var status = status || 200
  var output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
  return output
}

function listRoommates() {
  var sheet = getRoommatesSheet()
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  var data = sheet.getRange(2, 1, lastRow, 3).getValues()
  return data.map(function (row) {
    return { id: String(row[0]), name: String(row[1]), addedAt: String(row[2]) }
  })
}

function addRoommate(name) {
  var sheet = getRoommatesSheet()
  var id = 'r_' + new Date().getTime() + '_' + Math.random().toString(36).slice(2, 9)
  var addedAt = new Date().toISOString()
  sheet.appendRow([id, name, addedAt])
  return { id: id, name: name, addedAt: addedAt }
}

function listExpenses() {
  var sheet = getExpensesSheet()
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  var data = sheet.getRange(2, 1, lastRow, 7).getValues()
  return data.map(function (row) {
    var involved = String(row[4] || '')
    return {
      id: String(row[0]),
      paidBy: String(row[1]),
      amount: Number(row[2]),
      currency: String(row[3] || CURRENCY),
      involved: involved ? involved.split(',').map(function (s) { return s.trim() }) : [],
      note: row[5] ? String(row[5]) : undefined,
      createdAt: String(row[6])
    }
  })
}

function addExpense(body) {
  var sheet = getExpensesSheet()
  var id = 'e_' + new Date().getTime() + '_' + Math.random().toString(36).slice(2, 9)
  var createdAt = new Date().toISOString()
  var involved = Array.isArray(body.involved) ? body.involved.join(',') : ''
  sheet.appendRow([
    id,
    body.paidBy,
    Number(body.amount),
    CURRENCY,
    involved,
    body.note || '',
    createdAt
  ])
  return {
    id: id,
    paidBy: body.paidBy,
    amount: Number(body.amount),
    currency: CURRENCY,
    involved: body.involved,
    note: body.note,
    createdAt: createdAt
  }
}
