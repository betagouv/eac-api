// This file parses the XLSX "Actions / Acteurs (manuel)" created by @vinyll
const xlsx = require('xlsx')
const uuidv4 = require('./uuidv4')

const workbook = xlsx.readFile(process.argv[2])
const trimAll = x => Object.assign(...Object.entries(x).map(([k, v]) => ({[k]: v && v.trim()})))

const actions = xlsx.utils.sheet_to_json(workbook.Sheets['actions'])
const actors = xlsx.utils.sheet_to_json(workbook.Sheets['acteurs']).filter(v => v['name*']).map(trimAll).map(actor => {
  return {
    id: uuidv4(),
    name: actor['name*'],
    image: actor.image,
    loc: {
      type: 'Point',
      coordinates: actor['location*'].split(',').map(v => parseFloat(v.trim())).reverse()
    },
    description: actor.description,
    address: actor.address,
    postalCode: actor['postalCode*'],
    city: actor['city*'],
    timetable: actor.timetable,
    contactName: actor.contactName,
    contactEmail: actor.contactEmail,
    contactPhone: actor.contactPhone,
    mainPhone: actor.mainPhone,
    domains: actor.domains && actor.domains.split(',').map(v => v.trim()),
    source: 'acteurs_actions_manuel',
    url: actor.website,
    labels: actor.labels && actor.labels.split(',').map(v => v.trim()),
    department: String(actor['postalCode*']).slice(0,2), // department
    actions: actions.filter(r => r['(actorId)'] === actor['(id)']).map(trimAll).map(action => {
      return {
        id: uuidv4(),
        name: action['name*'],
        description: action['description*'],
        location: action.location && {
          type: 'Point',
          coordinates: action.location.split(',').map(v => parseFloat(v.trim())).reverse()
        },
        medias: action.medias && action.medias.split(',').map(v => v.trim()),
        dateRange: action.dateRange && action.dateRange.split(',').map(v => v.trim()),
        duration: action.duration,
        schoolLevels: action.schoolLevels.split(',').map(v => v.trim()),
        topics: action.topics && action.topics.split(',').map(v => v.trim()),
        website: action.website,
        capacity: action.capacity,
        status: action.status,
        school: action.school,
        cost: action.cost,
        source: 'acteurs_actions_manuel',
      }
    }),
    createdAt: new Date()
  }
})

console.log(JSON.stringify(actors))
