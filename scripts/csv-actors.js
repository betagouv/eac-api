const getStream = require('get-stream').array
const csvParse = require('csv-parser')
const fs = require('fs')

async function parse () {
  const rows = await getStream(
    fs.createReadStream('/Users/raphael/Downloads/liste_acteurs_culturels__2.csv')
      .pipe(csvParse())
  )

  const normalizedRows = rows.map(r => {
    const row = { ...r}
    return {
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
      banLatLng: row.geo_ban,
      inseeLatLng: row.geo_insee,
      inseeCode: row.code_Insee,
      domain: parseDomain(row.Domaine),
      loc: row.coordonnees_finales && row.coordonnees_finales.split && {
        type: 'Point',
        coordinates: row.coordonnees_finales.split(',').map(v => Number(v.trim()))
      }
    }
  }).filter(x => x)

  console.log(JSON.stringify(normalizedRows.filter(x => x.loc)))
}

function parseDomain (domains) {
  return domains && domains.length &&
  domains.split(',')
    .map(a => a.trim())
    .map(a => a.replace(/�/, 'é'))
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
}

parse()