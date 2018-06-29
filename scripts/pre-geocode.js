const getStream = require('get-stream').array
const csvWriter = require('csv-write-stream')

async function itemsToCsv (items) {
  const stream = csvWriter()
  items.forEach(item => stream.write(item))
  stream.end()
  return getStream(stream)
}

async function parse () {
  let rows = require(`${__dirname}/../actors.json`)
  rows = rows.filter(x => !x.loc)
    .filter(x => `${x.address},${x.city},${x.postalCode}`.length < 190)
    .map(x => {
      return {
        id: x.id,
        address: x.address,
        postalCode: x.postalCode,
        city: x.city
      }
    })
  const res = await itemsToCsv(rows)
  console.log(res.join(''))
}

parse()
