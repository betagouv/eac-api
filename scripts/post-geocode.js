const fs = require('fs')
const getStream = require('get-stream').array
const csvParse = require('csv-parser')

async function parse() {
  let geoRows = await getStream(
    fs.createReadStream('./result.geocoded.csv')
      .pipe(csvParse())
  )

  let rows = require(__dirname + '/../result.json')
  rows = rows.map(row => {
    if (!row.loc || !row.loc.coordinates) {
      const geoRow = geoRows.find(gr => {
        return Object.values(gr)[0] === row.id
      })
      if (geoRow) {
        row.loc = {
          type: 'Point',
          coordinates: [parseFloat(geoRow.latitude), parseFloat(geoRow.longitude)]
        }
      }
      if (row.loc && (!row.loc.coordinates || !row.loc.coordinates[0])) {
        delete row.loc
      }
    }
    return row
  })
  console.log(JSON.stringify(rows))
}

parse()