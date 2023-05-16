import { Router } from 'express'
import { isValidPassword, generateJWToken, createHash } from '../util.js'
//Service import
import StudentService from '../services/db/students.service.js'
import studentsModel from '../services/db/models/students.js'

const router = Router()
const studentService = new StudentService()

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await studentService.findByUsername(email)
    console.log('Usuario encontrado para login:')
    console.log(user)
    if (!user) {
      console.warn("User doesn't exists with username: " + email)
      return res.status(400).send({
        error: 'Not found',
        message: 'Usuario no encontrado con username: ' + email,
      })
    }
    if (!isValidPassword(user, password)) {
      console.warn('Invalid credentials for user: ' + email)
      return res.status(401).send({
        status: 'error',
        error: 'El usuario y la contraseña no coinciden!',
      })
    }
    const tokenUser = {
      name: `${user.name} ${user.lastName}`,
      email: user.email,
      age: user.age,
      role: user.role,
    }
    const access_token = generateJWToken(tokenUser)
    console.log(access_token)
    //Con Cookie
    res.cookie('jwtCookieToken', access_token, {
      maxAge: 60000,
      httpOnly: true,
    })
    res.send({ message: 'Login successful!' })
    //const access_token = generateJWToken(tokenUser); //-->Con access_token
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .send({ status: 'error', error: 'Error interno de la applicacion.' })
  }
})

//TODO: agregar metodo de registrar estudiante:
router.post('/register', async (req, res) => {
  const { name, lastName, email, password, age } = req.body

  try {
    const exists = await studentService.findByUsername(email)
    if (exists) {
      console.log('El usuario ya existe.')
      return res
        .status(400)
        .send({ status: 'error', message: 'El usuario ya existe.' })
    }

    console.log(req.body)
    const user = await studentsModel.create({
      name,
      lastName,
      email,
      age,
      password: createHash(password),
    })

    res.status(201).send({
      status: 'success',
      message: 'Usuario creado con éxito.',
      user,
    })
  } catch (error) {
    console.error('Error registrando el usuario: ', error)
    res
      .status(500)
      .send({ status: 'error', message: 'Error registrando el usuario.' })
  }
})

export default router
