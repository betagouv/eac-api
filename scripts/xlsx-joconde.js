// This file parses the XLSX provided by "Joconde" via Nicolas Lagreze.
const xlsx = require('xlsx')
const uuidv4 = require('./uuidv4')

const workbook = xlsx.readFile(process.argv[2])
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])

const normalizedRows = rows.map(row => {
  return {
    id: uuidv4(),
    name: row.NOMOFF,
    description: description(`${row.INTERET || ''} ${row.HIST || ''}`),
    dep: row.DPT,
    timetable: row.HORAIRES,
    address: row.ADRL1_M,
    address2: row.LIEU_M,
    city: row.VILLE_M,
    department: row.DPT,
    ownerPhone: row.TEL_ADM,
    contactEmail: row.MEL,
    contactPhone: row.TEL_M,
    postalCode: row.CP_M,
    url: row.URL_M,
    source: 'joconde',
    domains: domains(row.THEMES),
    rawDomains: row.THEMES,
    createdAt: new Date()
  }
})

console.log(JSON.stringify(normalizedRows))

function domains (d) {
  if (!d) {
    return []
  }

  return d.replace(/Archeologie/, 'Archéologie')
    .replace(/.trangères?|nationales?/, '')
    .replace(/Autres collections/, '')
    .replace(/Civilisations /, 'Civilisation ')
    .replace(/d imprim/, 'd\'imprim')
    .replace(/Beaux-Arts/, 'Beaux-arts')
    .split(/[#;/]/)
    .map(x => x.split(/[:,(]/)[0])
    .map(x => x.trim())
}

function description (d) {
  return d.replace(/#/g, '\n\n').trim()
}
