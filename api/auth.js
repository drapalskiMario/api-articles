const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = (app) => {
  const signin = async (req, res) => {
    const emailReq = req.body.email
    const passwordReq = req.body.password
    if (!emailReq || !passwordReq) {
      return res.status(400).send('Informe usuário e senha')
    }

    const { id, name, email, admin, password } = await app
      .db('users')
      .where({ email: emailReq })
      .first()

    if (!id) return res.status(400).send('Usuário não encontrado')

    const isMatch = bcrypt.compareSync(passwordReq, password)
    if (!isMatch) return res.status(400).send('Email/Senha inválidos!')

    const iat = Math.floor(Date.now() / 1000)
    const exp = 60 * 60 * 24 + iat
    const payload = {
      id,
      name,
      email,
      admin,
      iat,
      exp
    }

    res.json({
      ...payload,
      token: jwt.encode(payload, authSecret)
    })
  }

  const validateToken = async (req, res) => {
    const userData = req.body || null
    try {
      if (userData) {
        const token = jwt.decode(userData.token, authSecret)
        if (new Date(token.exp * 1000 > new Date.Now())) {
          return res.send(true)
        }
      }
    } catch (err) {
      res.send(false)
    }
  }

  return { signin, validateToken }
}
