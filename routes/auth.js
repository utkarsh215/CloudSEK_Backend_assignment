import User from '../models/users.js'
import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new User(username, email, hashedPassword)
    const result = await user.save()

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const payload = { user: { id: user._id.toString() } }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables')
      return res.status(500).json({ message: 'Server configuration error' })
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing failed:', err)
          return res.status(500).json({ message: 'Token generation failed' })
        }

        res.status(200).json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          }
        })
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
