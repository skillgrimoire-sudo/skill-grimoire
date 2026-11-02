/**
 * Founder's Grant Challenge 2027 — registration backend
 * Skill Grimoire Private Limited
 *
 * Paste this whole file into Extensions → Apps Script of the
 * "FGC 2027 Registrations" Google Sheet, owned by the
 * foundersgrant@skillgrimoire.com Google account.
 *
 * What it does on every registration:
 *   1. Checks the registration window and every field again (never trust the browser)
 *   2. Gives the team a Registration ID (FGC27-00001, FGC27-00002, …)
 *   3. Saves the proposal PDF into Drive → "Founder's Grant Challenge 2027 - Registrations" → <sector folder>
 *   4. Writes one row to the "Registrations" sheet, with a link to the PDF
 *   5. Flags any member email that already appears in an earlier team
 *   6. Emails a confirmation to the team lead (while the daily email limit allows)
 *
 * Every morning at 9 am IST it sends any confirmations that were held back by the
 * daily limit, then emails foundersgrant@skillgrimoire.com a summary by sector.
 *
 * First time: run setup() once from the editor (choose "setup" → Run) and allow access.
 */

/* ========================= SETTINGS ========================= */
const CONFIG = {
  // true while you test: accepts entries any time, IDs start with TEST-, Status = TEST.
  // Set to false before 8 Nov 2026, then Deploy → Manage deployments → Edit → New version.
  TEST_MODE: true,

  OPENS_AT:  '2026-11-08T00:00:00+05:30',
  CLOSES_AT: '2027-01-31T23:59:59+05:30',
  GRACE_MINUTES: 10,           // accepts uploads that started just before the deadline

  ADMIN_EMAIL: 'foundersgrant@skillgrimoire.com',
  SEND_CONFIRMATION_EMAIL: true,
  EMAIL_QUOTA_RESERVE: 3,      // keep a few daily emails spare for the digest

  MAX_PDF_MB: 10,
  ID_PREFIX: 'FGC27-',
  SHEET_NAME: 'Registrations',
  ROOT_FOLDER_NAME: "Founder's Grant Challenge 2027 - Registrations",
  TZ: 'Asia/Kolkata'
};

const SECTORS = [
  'Agriculture and rural development',
  'Manufacturing and Make in India',
  'Information technology and digital services',
  'Education and skill development',
  'Healthcare and wellness',
  'Finance and financial inclusion',
  'Management, commerce and retail',
  'Governance, public services and social inclusion',
  'Sustainability, environment and clean energy',
  'Other emerging areas of national importance'
];

const MEMBER_FIELDS = ['Name', 'Email', 'Mobile', 'Programme', 'Level', 'Year'];
const HEADERS = []
  .concat(['Registration ID', 'Submitted (IST)', 'Status', 'Team name', 'Sector', 'Members', 'College', 'University', 'City', 'State'])
  .concat(...[1, 2, 3, 4].map(n => MEMBER_FIELDS.map(f => (n === 1 ? 'Lead' : 'Member ' + n) + ' ' + f)))
  .concat(['Mentor name', 'Mentor designation', 'Mentor department', 'Mentor email', 'Mentor mobile',
           'Idea title', 'Problem', 'Solution', 'Government sources', 'Proposal PDF', 'Video link',
           'Heard via', 'Confirmation email', 'Duplicate check', 'Notes']);
const COL = name => HEADERS.indexOf(name) + 1;

/* ========================= ONE-TIME SETUP ========================= */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(CONFIG.TZ);

  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME, 0);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
      .setFontWeight('bold').setBackground('#15120F').setFontColor('#F2D48E').setWrap(true);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(1);
    sh.getRange('B:B').setNumberFormat('dd mmm yyyy, hh:mm am/pm');
    sh.getRange(2, 1, sh.getMaxRows() - 1, HEADERS.length).setWrap(false);
  }

  const props = PropertiesService.getScriptProperties();
  let root;
  const rootId = props.getProperty('ROOT_FOLDER_ID');
  if (rootId) root = DriveApp.getFolderById(rootId);
  else {
    const it = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
    root = it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
  }
  props.setProperty('ROOT_FOLDER_ID', root.getId());

  const map = {};
  SECTORS.forEach((s, i) => {
    const name = String(i + 1).padStart(2, '0') + ' - ' + s;
    const it = root.getFoldersByName(name);
    map[s] = (it.hasNext() ? it.next() : root.createFolder(name)).getId();
  });
  const testIt = root.getFoldersByName('00 - TEST entries');
  map.__TEST__ = (testIt.hasNext() ? testIt.next() : root.createFolder('00 - TEST entries')).getId();
  props.setProperty('SECTOR_FOLDERS', JSON.stringify(map));
  if (!props.getProperty('COUNTER')) props.setProperty('COUNTER', '0');
  if (!props.getProperty('TEST_COUNTER')) props.setProperty('TEST_COUNTER', '0');

  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dailyDigest')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(9).inTimezone(CONFIG.TZ).create();

  Logger.log('Setup complete. Drive folder: ' + root.getUrl());
}

/* ========================= WEB APP ========================= */
function doGet() {
  return json_({ ok: true, service: "Founder's Grant Challenge 2027 registrations", open: isOpen_(), testMode: CONFIG.TEST_MODE });
}

function doPost(e) {
  let out;
  try {
    const data = JSON.parse(e.postData.contents);
    out = register_(data);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    out = { ok: false, error: 'server', message: 'Something went wrong on our side. Please wait a minute and press Submit again. If it keeps happening, email ' + CONFIG.ADMIN_EMAIL + '.' };
  }
  return json_(out);
}

function register_(d) {
  if (d.hp) return { ok: true, id: CONFIG.ID_PREFIX + '00000', emailStatus: 'Off' }; // bot trap

  if (!CONFIG.TEST_MODE) {
    const now = Date.now();
    if (now < new Date(CONFIG.OPENS_AT).getTime()) return fail_('not_open', 'Registration opens on 8 November 2026.');
    if (now > new Date(CONFIG.CLOSES_AT).getTime() + CONFIG.GRACE_MINUTES * 60000) return fail_('closed', 'Registration closed on 31 January 2027 at 11:59 pm IST.');
  }

  /* ----- clean and check every field ----- */
  const t = d.team || {}, m = d.mentor || {}, idea = d.idea || {}, decl = d.declarations || {};
  const errs = [];
  const team = {
    name: line_(t.name, 60), sector: line_(t.sector, 100), college: line_(t.college, 150),
    university: line_(t.university, 150), city: line_(t.city, 60), state: line_(t.state, 60),
    heardVia: line_(t.heardVia, 40)
  };
  if (!team.name) errs.push('Team name is missing.');
  if (SECTORS.indexOf(team.sector) < 0) errs.push('Please choose a sector.');
  if (!team.college || !team.university || !team.city || !team.state) errs.push('Institution details are incomplete.');

  const rawMembers = Array.isArray(d.members) ? d.members : [];
  if (rawMembers.length < 2 || rawMembers.length > 4) errs.push('A team must have 2 to 4 members.');
  const members = rawMembers.slice(0, 4).map((x, i) => {
    const mm = {
      name: line_(x.name, 80), email: email_(x.email), mobile: mobile_(x.mobile),
      programme: line_(x.programme, 100), level: line_(x.level, 5), year: line_(x.year, 12)
    };
    const who = i === 0 ? 'Team lead' : 'Member ' + (i + 1);
    if (!mm.name) errs.push(who + ': name is missing.');
    if (!mm.email) errs.push(who + ': email is not valid.');
    if (!mm.mobile) errs.push(who + ': mobile number is not valid.');
    if (!mm.programme || ['UG', 'PG'].indexOf(mm.level) < 0 || !mm.year) errs.push(who + ': study details are incomplete.');
    return mm;
  });
  const emails = members.map(x => x.email).filter(String);
  if (new Set(emails).size !== emails.length) errs.push('Each member needs their own email address.');

  const mentor = {
    name: line_(m.name, 80), designation: line_(m.designation, 80), department: line_(m.department, 100),
    email: email_(m.email), mobile: mobile_(m.mobile)
  };
  if (!mentor.name || !mentor.designation || !mentor.department || !mentor.email || !mentor.mobile || m.agreed !== true) errs.push('Faculty mentor details are incomplete.');

  const ideaC = {
    title: line_(idea.title, 100), problem: text_(idea.problem, 1200), solution: text_(idea.solution, 1200),
    sources: text_(idea.sources, 1500), videoLink: line_(idea.videoLink, 300)
  };
  if (!ideaC.title) errs.push('Idea title is missing.');
  if (ideaC.problem.length < 80) errs.push('Please describe the problem in at least 80 characters.');
  if (ideaC.solution.length < 80) errs.push('Please describe your solution in at least 80 characters.');
  if (ideaC.videoLink && !/^https?:\/\/\S+\.\S+/i.test(ideaC.videoLink)) errs.push('The video link must start with https://');
  if (!(decl.eligible === true && decl.original === true && decl.data === true && decl.rules === true)) errs.push('Please tick all four declarations.');

  /* ----- the PDF ----- */
  const f = d.file || {};
  let bytes = null;
  if (!f.data) errs.push('Please attach your idea proposal as a PDF.');
  else {
    try { bytes = Utilities.base64Decode(String(f.data)); } catch (x) { errs.push('The PDF could not be read. Please attach it again.'); }
    if (bytes) {
      if (bytes.length > CONFIG.MAX_PDF_MB * 1024 * 1024) errs.push('The PDF is larger than ' + CONFIG.MAX_PDF_MB + ' MB. Please compress it.');
      else if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) errs.push('The attached file is not a valid PDF.');
    }
  }
  if (errs.length) return fail_('validation', errs.join(' '));

  /* ----- Registration ID (locked so two teams never get the same number) ----- */
  const props = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let id;
  try {
    const key = CONFIG.TEST_MODE ? 'TEST_COUNTER' : 'COUNTER';
    const n = Number(props.getProperty(key) || '0') + 1;
    props.setProperty(key, String(n));
    id = (CONFIG.TEST_MODE ? 'TEST-' : CONFIG.ID_PREFIX) + String(n).padStart(5, '0');
  } finally {
    lock.releaseLock();
  }

  /* ----- save the PDF to the sector folder ----- */
  const folders = JSON.parse(props.getProperty('SECTOR_FOLDERS') || '{}');
  const folderId = CONFIG.TEST_MODE ? folders.__TEST__ : folders[team.sector];
  if (!folderId) throw new Error('Folders missing — run setup() first.');
  const fname = (id + ' - ' + team.name.slice(0, 50) + ' - ' + ideaC.title.slice(0, 70) + '.pdf').replace(/[\\/:*?"<>|]/g, '-');
  const file = DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes, 'application/pdf', fname));
  file.setDescription(id + ' | ' + team.name + ' | ' + team.sector + ' | ' + team.college);

  /* ----- write the row ----- */
  const sh = sheet_();
  const dup = duplicates_(sh, emails);
  const memberCells = [];
  for (let i = 0; i < 4; i++) {
    const x = members[i];
    memberCells.push.apply(memberCells, x ? [x.name, x.email, x.mobile, x.programme, x.level, x.year] : ['', '', '', '', '', '']);
  }
  const row = [id, new Date(), CONFIG.TEST_MODE ? 'TEST' : 'Registered', team.name, team.sector, members.length,
    team.college, team.university, team.city, team.state]
    .concat(memberCells)
    .concat([mentor.name, mentor.designation, mentor.department, mentor.email, mentor.mobile,
      ideaC.title, ideaC.problem, ideaC.solution, ideaC.sources, file.getUrl(), ideaC.videoLink,
      team.heardVia, 'Pending', dup, '']);
  sh.appendRow(row.map(safe_));
  const rowNum = sh.getLastRow();

  /* ----- confirmation email ----- */
  const status = sendConfirmation_({ id: id, team: team, members: members, idea: ideaC });
  if (sh.getRange(rowNum, 1).getValue() === id) sh.getRange(rowNum, COL('Confirmation email')).setValue(status);
  else updateById_(sh, id, 'Confirmation email', status);

  return { ok: true, id: id, emailStatus: status };
}

/* ========================= EMAILS ========================= */
function sendConfirmation_(r) {
  if (!CONFIG.SEND_CONFIRMATION_EMAIL) return 'Off';
  try {
    if (MailApp.getRemainingDailyQuota() <= CONFIG.EMAIL_QUOTA_RESERVE) return 'Pending';
    const lead = r.members[0];
    const names = r.members.map(x => x.name).join(', ');
    MailApp.sendEmail({
      to: lead.email,
      replyTo: CONFIG.ADMIN_EMAIL,
      name: "Founder's Grant Challenge 2027",
      subject: 'Registration confirmed — ' + r.id + " — Founder's Grant Challenge 2027",
      body:
        'Dear ' + lead.name + ',\n\n' +
        "Your team is registered for the Founder's Grant Challenge 2027.\n\n" +
        'Registration ID: ' + r.id + '\nTeam: ' + r.team.name + '\nSector: ' + r.team.sector +
        '\nIdea: ' + r.idea.title + '\nMembers: ' + names + '\n\n' +
        'Keep this ID safe and quote it in every message to us. Preliminary screening begins after registration closes on 31 January 2027, and we will contact you at this email address.\n\n' +
        'To correct any detail, reply to this email before 31 January 2027.\n\n' +
        "Skilled Youth, Stronger India.\nFounder's Grant Challenge 2027\nSkill Grimoire Private Limited\n" +
        CONFIG.ADMIN_EMAIL + ' · +91 63006 90221 · www.skillgrimoire.com',
      htmlBody: confirmationHtml_(r, names)
    });
    return 'Sent';
  } catch (err) {
    console.error(err);
    return 'Failed';
  }
}

function confirmationHtml_(r, names) {
  const row = (k, v) => '<tr><td style="padding:6px 16px 6px 0;color:#7A6D60;white-space:nowrap;vertical-align:top">' + k +
    '</td><td style="padding:6px 0;color:#1D1813;font-weight:600">' + esc_(v) + '</td></tr>';
  return '' +
    '<div style="background:#F4ECDF;padding:28px 12px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto;background:#FFFDF9;border-radius:16px;overflow:hidden;border:1px solid #E6D8C1">' +
    '<div style="background:#15120F;padding:26px 28px;text-align:center">' +
    '<div style="color:#B5A792;font-size:11px;letter-spacing:3px">SKILL GRIMOIRE PRESENTS</div>' +
    '<div style="color:#F2D48E;font-family:Georgia,serif;font-size:26px;font-weight:bold;margin-top:8px">Founder&rsquo;s Grant Challenge 2027</div>' +
    '<div style="color:#EDE3D3;font-family:Georgia,serif;font-style:italic;font-size:15px;margin-top:6px">Skilled Youth, Stronger India.</div></div>' +
    '<div style="padding:28px">' +
    '<p style="margin:0 0 14px;color:#1D1813;font-size:15px">Dear ' + esc_(r.members[0].name) + ',</p>' +
    '<p style="margin:0 0 18px;color:#4B4137;font-size:15px;line-height:1.6">Your team is registered. Here are your details.</p>' +
    '<div style="text-align:center;margin:0 0 20px"><span style="display:inline-block;background:#15120F;color:#F2D48E;font-family:Georgia,serif;font-size:26px;font-weight:bold;letter-spacing:2px;padding:12px 22px;border-radius:12px">' + esc_(r.id) + '</span></div>' +
    '<table style="border-collapse:collapse;font-size:14px;margin:0 auto 18px">' +
    row('Team', r.team.name) + row('Sector', r.team.sector) + row('Idea', r.idea.title) + row('Members', names) + row('Institution', r.team.college) +
    '</table>' +
    '<p style="margin:0 0 12px;color:#4B4137;font-size:14px;line-height:1.6">Keep this ID safe and quote it in every message to us. Preliminary screening begins after registration closes on <b>31 January 2027</b>, and we will contact you at this email address.</p>' +
    '<p style="margin:0;color:#4B4137;font-size:14px;line-height:1.6">To correct any detail, simply reply to this email before 31 January 2027.</p>' +
    '</div>' +
    '<div style="border-top:1px solid #E6D8C1;padding:16px 28px;color:#7A6D60;font-size:12px;line-height:1.6;text-align:center">' +
    'Skill Grimoire Private Limited · ' + CONFIG.ADMIN_EMAIL + ' · +91 63006 90221<br>www.skillgrimoire.com</div>' +
    '</div></div>';
}

/** Runs every morning: sends held-back confirmations, then mails the admin a summary. */
function dailyDigest() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return;
  const values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const c = name => COL(name) - 1;

  // 1. Confirmations held back by the daily limit
  let sent = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v[c('Confirmation email')] !== 'Pending') continue;
    if (MailApp.getRemainingDailyQuota() <= CONFIG.EMAIL_QUOTA_RESERVE) break;
    const members = [];
    for (let n = 1; n <= 4; n++) {
      const p = n === 1 ? 'Lead ' : 'Member ' + n + ' ';
      if (v[c(p + 'Name')]) members.push({ name: v[c(p + 'Name')], email: v[c(p + 'Email')] });
    }
    const status = sendConfirmation_({
      id: v[c('Registration ID')],
      team: { name: v[c('Team name')], sector: v[c('Sector')], college: v[c('College')] },
      members: members,
      idea: { title: v[c('Idea title')] }
    });
    sh.getRange(i + 2, COL('Confirmation email')).setValue(status);
    if (status === 'Sent') sent++;
  }

  // 2. Summary for the last 24 hours
  const since = Date.now() - 24 * 3600 * 1000;
  const recent = values.filter(v => v[c('Status')] !== 'TEST' && v[c('Submitted (IST)')] instanceof Date && v[c('Submitted (IST)')].getTime() >= since);
  const total = values.filter(v => v[c('Status')] !== 'TEST').length;
  const bySector = SECTORS.map((s, i) => (i + 1) + '. ' + s + ': ' + recent.filter(v => v[c('Sector')] === s).length + ' new / ' +
    values.filter(v => v[c('Status')] !== 'TEST' && v[c('Sector')] === s).length + ' total').join('\n');
  const pending = values.filter(v => v[c('Confirmation email')] === 'Pending').length - sent;
  const dups = recent.filter(v => v[c('Duplicate check')]).length;

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: "FGC 2027 daily summary — " + recent.length + ' new, ' + total + ' total',
    body:
      "Founder's Grant Challenge 2027 — last 24 hours\n\n" +
      'New registrations: ' + recent.length + '\nTotal registrations: ' + total +
      '\nConfirmations sent this morning: ' + sent + '\nConfirmations still waiting: ' + Math.max(0, pending) +
      '\nNew entries flagged as possible duplicates: ' + dups + '\n\nBy sector:\n' + bySector +
      '\n\nSheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}

/* ========================= HELPERS ========================= */
function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) throw new Error('Sheet missing — run setup() first.');
  return sh;
}

function duplicates_(sh, emails) {
  const last = sh.getLastRow();
  if (last < 2 || !emails.length) return '';
  const cols = [1, 2, 3, 4].map(n => COL((n === 1 ? 'Lead' : 'Member ' + n) + ' Email'));
  const range = sh.getRange(2, 1, last - 1, HEADERS.length);
  const hits = [];
  emails.forEach(em => {
    range.createTextFinder(em).matchEntireCell(true).matchCase(false).findAll().forEach(cell => {
      if (cols.indexOf(cell.getColumn()) > -1) hits.push(em + ' is also in ' + sh.getRange(cell.getRow(), 1).getDisplayValue());
    });
  });
  return Array.from(new Set(hits)).join('; ');
}

function updateById_(sh, id, header, value) {
  const hit = sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 1).createTextFinder(id).matchEntireCell(true).findNext();
  if (hit) sh.getRange(hit.getRow(), COL(header)).setValue(value);
}

function isOpen_() {
  const n = Date.now();
  return n >= new Date(CONFIG.OPENS_AT).getTime() && n <= new Date(CONFIG.CLOSES_AT).getTime();
}

function line_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function text_(v, max) { return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max); }
function email_(v) { const s = line_(v, 120).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : ''; }
function mobile_(v) {
  let d = String(v == null ? '' : v).replace(/\D/g, '');
  if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
  if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}
// Stops values like "=IMPORTRANGE(...)" being treated as formulas in the Sheet
function safe_(v) { return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
function fail_(code, message) { return { ok: false, error: code, message: message }; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
