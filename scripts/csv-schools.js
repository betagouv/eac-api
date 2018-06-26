// Installation:
// > npm install get-stream csv-parser proj4 iconv-lite request
//
// Usage:
// > node csv-schools.js > result.json
// > mongoimport --uri=mongodb://localhost:27017/eac -c schools2 --jsonArray --file result.json
const getStream = require('get-stream').array
const csvParse = require('csv-parser')
const proj4 = require('proj4')
const fs = require('fs')
const iconv = require('iconv-lite')
const request = require('request')

const unproj = proj4(
  require('epsg-index/s/2154.json').proj4, // Lambert-93
  require('epsg-index/s/4326.json').proj4 // WGS-84
)

const url = 'https://www.data.gouv.fr/s/resources/adresse-et-geolocalisation-des-etablissements-denseignement-du-premier-et-second-degres/20160526-143453/DEPP-etab-1D2D.csv'

async function parse() {
  // Sorry for the callback: so 2015, much async. 
  request(url).pipe(fs.createWriteStream('./input.csv')).on('finish', async () => {
    const rows = await getStream(
      fs.createReadStream('./input.csv')
      .pipe(iconv.decodeStream('ISO-8859-1'))
      .pipe(iconv.encodeStream('utf8'))
      .pipe(csvParse({
        separator: ';'
      }))
    )

    const normalizedRows = rows.map(r => {
      const row = { ...r
      }
      if (r.coordonnee_x && r.coordonnee_y) {
        const x = parseFloat(r.coordonnee_x.replace(/,/g, '.'))
        const y = parseFloat(r.coordonnee_y.replace(/,/g, '.'))
        return {
          name: row.appellation_officielle,
          postalCode: row.code_postal_uai,
          city: row.localite_acheminement_uai,
          position: {
            type: 'Point',
            coordinates: unproj.forward([x, y])
          }
        }
      }
    }).filter(x => x)

    console.log(JSON.stringify(normalizedRows))
  })
}

parse()