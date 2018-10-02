const actorParams = {
  address: '1 rue de la paix',
  city: 'Paris',
  postalCode: '75000',
  loc: {
    type: 'Point',
    coordinates: [1, 2]
  },
  name: 'Cirque',
  contactPhone: '0123456789',
  contactName: 'Jane Doo',
  contactEmail: 'test@example.org',
  description: 'Lorem ispum',
  domains: ['cirque']
}

const actorWithActionsParams = {
  ...actorParams,
  actions: [
    {
      name: 'découverte',
      description: 'd§'
    },
    {
      name: 'spectacle',
      description: 's§'
    }
  ]
}

module.exports = {
  actorParams,
  actorWithActionsParams
}
