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

  return d.replace(/arc.{1,4}ologie/gi, 'archéologie')
    .replace(/antiquite/gi, 'antiquité')
    .replace(/médiévale/gi, 'médiéval')
    .replace(/outils histoire/gi, 'outils')
    .replace(/decoratif/gi, 'décoratif')
    .replace(/b(?:ea|z)ux[\- ]arts/gi, 'beaux-arts')
    .replace(/.tr?angères?|nationales?|chrétien|r.gionale/gi, '')
    .replace(/autres collections/gi, '')
    .replace(/(peinture|papier|sculpture|civilisation|ancien|photographie|textile)s/gi, '$1')
    .replace(/d imprim/gi, 'd\'imprim')
    .replace(/sciences et technique[^s]/i, 'sciences et techniques')
    .replace(/aphotographie/i, 'photographie')
    .split(/[#;/.]/)
    .map(x => x.split(/[:,(]/)[0])
    .map(x => x.trim())
    .map(a => a.charAt(0).toUpperCase() + a.slice(1).toLowerCase())
    .filter(x => !['-c', ')', 'B', 'H', 'Autres', 'Autre', 'Dufour', 'Moderne'].includes(x))
    .filter(x => !x.match(/(?:\)$)|(?:^[0-9]+$)|(?:ffonds)|(?:^(?:maquette|souvenirs|chapiteaux|Clemenceau|La chaussure|Matériel))/i))
    .filter(String)
}

function description (d) {
  return d.replace(/#/g, '\n\n').trim()
}
