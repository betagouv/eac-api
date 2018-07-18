// This file parses the XLSX provided by "Joconde" via Nicolas Lagreze.
const xlsx = require('xlsx')
const uuidv4 = require('./uuidv4')

const workbook = xlsx.readFile('/Users/raphael/Downloads/JMR_MUSEO_20180111.xlsx')
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])

const normalizedRows = rows.map(row => {
  return {
    id: uuidv4(),
    name: row.NOMOFF,
    description: `${row.INTERET || ''} ${row.HIST || ''}`.trim(),
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
    domains: parseDomain(row.THEMES),
  }
})

console.log(normalizedRows[0], normalizedRows[239], normalizedRows[999])

function parseDomain(d) {
  return d ? d.split(';').map(x => x.split(' :')[0]).map(x => x.trim()) : []
}
