const bcrypt = require('bcrypt-nodejs')

module.exports = (app) => {
  const { existsOrError, notExistsOrError, equalsOrError } = app.api.validator

  const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  }

  const save = async (req, res) => {
    const user = { ...req.body }
    if (req.params.id) user.id = req.params.id

    if (!req.originalUrl.startsWith('/users')) user.admin = false
    if (!req.user || req.user.admin) user.admin = false

    try {
      existsOrError(user.name, 'Nome não informado')
      existsOrError(user.email, 'E-mail não informado')
      existsOrError(user.password, 'Senha não informada')
      equalsOrError(
        user.password,
        user.confirmPassword,
        'Senhas não conferem'
      )
      const userFromDb = await app.db
        .select()
        .from('users')
        .where({ email: user.email })
        .first()
      if (!user.id) {
        notExistsOrError(userFromDb, 'Usuário já cadastrado')
      }
    } catch (error) {
      return res.status(400).send(error)
    }

    user.password = encryptPassword(user.password)
    delete user.confirmPassword

    if (user.id) {
      app.db('users')
        .update(user)
        .where({ id: user.id })
        .whereNull('deleted_at')
        .then(() => {
          res.status(204).send()
        })
        .catch((err) => res.status(500).send(err))
    } else {
      app.db('users')
        .insert(user)
        .then(() => {
          res.status(204).send()
        })
        .catch((err) => res.status(500).send(err))
    }
  }

  const get = (req, res) => {
    app.db
      .select('id', 'name', 'email', 'admin')
      .whereNull('deleted_at')
      .from('users')
      .then((users) => res.json(users))
      .catch((err) => res.status(500).send(err))
  }

  const remove = async (req, res) => {
    try {
      const articles = await app
        .db('articles')
        .where({ user_id: req.param.id })
      notExistsOrError(articles, 'Usuário possui artigos')

      const rowsUpdate = await app
        .db('users')
        .update({ deleted_at: new Date() })
        .where({ id: req.params.id })
      existsOrError(rowsUpdate, 'Usuário não encontrado')

      res.status(204).send()
    } catch (err) {
      res.status(500).send(err)
    }
  }

  return { save, get, remove }
}
