const queries = require('./queries')

module.exports = (app) => {
  const { existsOrError } = app.api.validator

  const save = async (req, res) => {
    const article = req.body
    const id = req.params.id
    if (id) article.id = id

    try {
      existsOrError(article.name, 'Nome não informado')
      existsOrError(article.description, 'Descrição não informada')
      existsOrError(article.category_id, 'Categoria não informada')
      existsOrError(article.user_id, 'Autor não informado')
      existsOrError(article.content, 'Conteúdo não informado')
    } catch (err) {
      res.status(400).send(err)
    }

    if (article.id) {
      try {
        await app
          .db('articles')
          .update(article)
          .where({ id: article.id })

        res.status(204).send()
      } catch (err) {
        res.status(500).send(err)
      }
    } else {
      try {
        await app.db('articles').insert(article)

        res.status(204).send()
      } catch (err) {
        res.status(500).send(err)
      }
    }
  }

  const remove = async (req, res) => {
    try {
      const id = req.params.id
      const rowsDel = await app.db('articles').del().where({ id })

      try {
        existsOrError(rowsDel, 'Artigo não foi encontrado')
      } catch (err) {
        res.status(500).send(err)
      }

      res.status(204).send()
    } catch (err) {
      res.status(500).send(err)
    }
  }

  const get = async (req, res) => {
    const limit = 10

    try {
      const result = await app.db('articles').count('id').first()
      const count = parseInt(result.count)

      const articles = await app
        .db('articles')
        .select('id', 'name', 'description')

      res.json({ data: articles, count, limit })
    } catch (err) {
      res.status(500).send(err)
    }
  }

  const getById = async (req, res) => {
    const id = req.params.id

    try {
      const article = await app.db('articles').where({ id }).first()
      article.content = article.content.toString()

      res.json(article)
    } catch (err) {
      res.status(500).send(err)
    }
  }

  const getByCategory = async (req, res) => {
    const limit = 10
    const categoryId = req.params.id
    const page = req.query.page || 1
    const categories = await app.db.raw(
      queries.categoryWithChildren,
      categoryId
    )
    const ids = categories.rows.map((category) => category.id)

    try {
      const result = await app
        .db({ a: 'articles', u: 'users' })
        .select('a.id', 'a.name', 'a.description', 'a.image_url', {
          author: 'u.name'
        })
        .limit(limit)
        .offset(page * limit - limit)
        .whereRaw('?? = ??', ['u.id', 'a.user_id'])
        .whereIn('category_id', ids)
        .orderBy('a.id', 'desc')

      res.json(result)
    } catch (err) {
      res.status(500).send(err)
    }
  }

  return { save, remove, get, getById, getByCategory }
}
