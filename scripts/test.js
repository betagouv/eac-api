const request = require('request')
const r2 = require('r2')
const getStream = require('get-stream').array
const csvParse = require('csv-parser')
const csvWriter = require('csv-write-stream')
const fs = require('fs')

async function itemsToCsv(items) {
  const stream = csvWriter()
  items.forEach(item => stream.write(item))
  stream.end()
  return getStream(stream)
}

async function csvToItems(csvContent) {
  const stream = csvParser()
  stream.write(csvContent)
  stream.end()
  return getStream.array(stream)
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


async function parse () {
  const rows = await getStream(
    fs.createReadStream('/Users/raphael/Downloads/liste_acteurs_culturels__2.csv')
      .pipe(csvParse())
  )

  const normalizedRows = rows.map(r => {
    const row = { ...r}
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

  const rowsWithLoc = normalizedRows.filter(x => x.loc)
  let rowsWithoutLoc = normalizedRows
    .filter(x => !x.loc)
    .filter(x => `${x.address},${x.city},${x.postalCode}`.length < 150)
    .splice(0,2)
    .map(async r => {
      console.log('hop')
      let json = await r2(`https://api-adresse.data.gouv.fr/search/?q=${r.address}&postcode=${r.postalCode}&autocomplete=0`).json
      console.log(json)
      // let a = await getStream(request(`https://api-adresse.data.gouv.fr/search/?q=${r.address}&postcode=${r.postalCode}&autocomplete=0`))
    })
    return

      /*
      request(
        `https://api-adresse.data.gouv.fr/search/?q=${r.address}&postcode=${r.postalCode}&autocomplete=0`
      , function(error, response, body) {
        console.log(body)
      })
      */

  const csvContent = (await itemsToCsv(rowsWithoutLoc.map(x => {
    return {
      id: x.id,
      address: x.address, 
      postalCode: x.postalCode, 
      city: x.city
    }
  })))
  
  request.post({
    url:'https://api-adresse.data.gouv.fr/search/csv/', 
    formData: {data: Buffer.from(csvContent)}
  }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    debugger
    console.log('Upload successful!  Server responded with:', body);
  });

/*
  const columns = ['address', 'city', 'postalCode'];
  const req = request.post('https://api-adresse.data.gouv.fr/search/csv/')
  columns.forEach(column => req.field('columns', column))
  req.field('encoding', 'utf-8')
  req.attach('data', Buffer.from(csvContent), 'input.csv', {
    filename: 'input.csv', 
    contentType: 'text/csv'}
  )
  try {
    const response = await req
    console.log(response)
  } catch(e) {
    console.log(e)
  }
  */


  /*
  const csvContent = (await itemsToCsv(rowsWithoutLoc)).slice(0, 2)
  console.log(csvContent.join(''))
  // console.log(rowsWithoutLoc[0])
  
  
  const columns = ['address', 'city', 'postalCode'];
  const req = request.post('https://api-adresse.data.gouv.fr/search/csv/')
  columns.forEach(column => req.field('columns', column))
  console.log(columns)
  req.field('encoding', 'utf-8')
  req.attach('data', Buffer.from(csvContent), 'input.csv', {filename: 'input.csv', contentType: 'text/csv'})
  const response = await req
  rowsWithoutLoc = csvToItems(response.text)

  console.log(rowsWithLoc.length, rowsWithoutLoc.length, normalizedRows.length)
*/
  /*
  const chuncks = normalizedRows.reduce((all,one,i) => {
    const ch = Math.floor(i/perChunk); 
    all[ch] = [].concat((all[ch]||[]),one); 
    return all
  }, [])
  */

  // console.log(JSON.stringify(normalizedRows))
}

function parseDomain (domains) {
  return domains && domains.length &&
  domains.split(',')
    .map(a => a.trim())
    .map(a => a.replace(/�/, 'é'))
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
}

parse()





/*

const request = require('superagent')
const csvParser = require('csv-parser')
const csvWriter = require('csv-write-stream')
const getStream = require('get-stream')

async function itemsToCsv(items) {
  const stream = csvWriter()
  items.forEach(item => stream.write(item))
  stream.end()
  return getStream(stream)
}

async function csvToItems(csvContent) {
  const stream = csvParser()
  stream.write(csvContent)
  stream.end()
  return getStream.array(stream)
}

async function batchGeocode(items, options = {}) {
  const columns = options.columns || Object.keys(items[0])
  const csvContent = await itemsToCsv(items)

  const req = request.post('https://api-adresse.data.gouv.fr/search/csv/')

  // Build multipart
  columns.forEach(column => req.field('columns', column))
  req.field('encoding', 'utf-8')
  req.attach('data', Buffer.from(csvContent), 'input.csv', {filename: 'input.csv', contentType: 'text/csv'})

  // Execute request
  const response = await req

  return csvToItems(response.text)
}

batchGeocode

*/

/*
var fs = require('fs')

fs.readFile('/Users/raphael/Downloads/liste_acteurs_culturels__2.csv', 'utf8', function (err,data) {
  if (err) {
    return console.log(err)
  }
  var result = data.replace(/�/g, 'é')

  fs.writeFile('/Users/raphael/Downloads/liste_acteurs_culturels__4.csv', result, 'utf8', function (err) {
     if (err) return console.log(err)
  })
})

*/