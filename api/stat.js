module.exports = (app) => {
  const Stat = app.mongo.model('Stat', {
    users: String,
    categories: String,
    articles: String,
    createdAt: Date
  })

  const get = (req, res) => {
    Stat.find({}, {}, { sort: { createdAt: -1 } }).then((stat) => {
      const defaultStat = {
        users: 0,
        categories: 0,
        articles: 0
      }
      res.json(stat || defaultStat)
    })
  }

  return { Stat, get }
}
