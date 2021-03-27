const schedule = require('node-schedule')

module.exports = (app) => {
  schedule.scheduleJob('*/1 * * * *', async function () {
    const usersCount = await app.db('users').count('id').first()
    const categoriesCount = await app.db('categories').count('id').first()
    const articlesCount = await app.db('articles').count('id').first()

    const { count: users } = usersCount
    const { count: categories } = categoriesCount
    const { count: articles } = articlesCount

    console.log(app.db('users').count('id').first().toString())

    const { Stat } = app.api.stat
    const lastStat = await Stat.findOne({}, {}, { sort: { createdAt: -1 } })

    const stat = new Stat({
      users,
      categories,
      articles,
      createdAt: new Date()
    })

    const changeUsers = !lastStat || stat.users !== lastStat.users
    const changeCategories =
            !lastStat || stat.categories !== lastStat.categories
    const changeArticles = !lastStat || stat.articles !== lastStat.articles

    if (changeArticles || changeCategories || changeUsers) {
      stat.save().then(() =>
        console.log('[Stats] Estatísticas Atualizadas')
      )
    }
  })
}
