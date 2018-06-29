const getStream = require('get-stream').array
const csvParse = require('csv-parse')
const fs = require('fs')

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function parse () {
  const rows = await getStream(
    fs.createReadStream(process.argv[2])
      .pipe(csvParse({skip_lines_with_error: true, columns: true}))
  )

  const normalizedRows = rows.map(r => {
    const row = {...r}
    return {
      id: uuidv4(),
      name: row.name,
      description: row.description,
      dep: row.dep,
      timetable: row.timetable,
      address: row.adresse,
      address2: row.Compl_adresse,
      city: row.commune,
      department: row.dep,
      ownerName: row.direction,
      ownerEmail: row.dir_mail,
      ownerPhone: row.dir_tel,
      contactName: row.Contact,
      contactEmail: row.Cont_mail,
      contactPhone: row.Cont_tel,
      postalCode: row.code_postal,
      inseeCode: row.code_Insee,
      domains: parseDomain(row.Domaine),
      loc: row.coordonnees_finales && row.coordonnees_finales.split && {
        type: 'Point',
        coordinates: row.coordonnees_finales.split(',').map(v => Number(v.trim()))
      }
    }
  }).filter(x => x)

  console.log(JSON.stringify(normalizedRows))
}

function parseDomain (domains) {
  return domains && domains.length &&
  domains.split(',')
    .map(a => a.trim())
    .map(a => a.replace(/�/, 'é'))
    .map(a => a.replace(/^[Tt]h..tre$/, 'Théâtre'))
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
}

parse()
