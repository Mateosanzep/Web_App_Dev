import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Comment from './models/Comment.js'
import MovieCount from './models/MovieCount.js'
import User from './models/User.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starwars-movies'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    console.log('Make sure MongoDB is running locally or set MONGODB_URI environment variable')
  })

const MOVIES_MODULE = path.join(__dirname, 'src', 'data', 'data.js')

const { default: movies } = await import(MOVIES_MODULE + '')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const user = new User({ username, email, password })
    await user.save()

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

app.get('/api/movies', (req,res)=>{
  res.json(movies)
})

app.get('/api/movies/:id', (req,res)=>{
  const m = movies.find(x=>x.episode===req.params.id)
  if(!m) return res.status(404).json({error:'not found'})
  res.json(m)
})

app.get('/api/movies/:id/comments', async (req,res)=>{
  try {
    const comments = await Comment.find({ movieId: req.params.id }).sort({ timestamp: 1 })
    const formatted = comments.map(c => ({
      name: c.name,
      comment: c.comment,
      ts: c.timestamp.getTime()
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/movies/:id/comments', authenticateToken, async (req,res)=>{
  const { name, comment } = req.body
  if(!name || !comment) return res.status(400).json({error:'name/comment required'})
  try {
    const newComment = new Comment({
      movieId: req.params.id,
      name,
      comment
    })
    await newComment.save()
    
    const comments = await Comment.find({ movieId: req.params.id }).sort({ timestamp: 1 })
    const formatted = comments.map(c => ({
      name: c.name,
      comment: c.comment,
      ts: c.timestamp.getTime()
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/movies/:id/counts', async (req,res)=>{
  try {
    let counts = await MovieCount.findOne({ movieId: req.params.id })
    if (!counts) {
      counts = new MovieCount({ movieId: req.params.id, likes: 0, dislikes: 0 })
      await counts.save()
    }
    res.json({ likes: counts.likes, dislikes: counts.dislikes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/movies/:id/like', authenticateToken, async (req,res)=>{
  try {
    let counts = await MovieCount.findOne({ movieId: req.params.id })
    if (!counts) {
      counts = new MovieCount({ movieId: req.params.id, likes: 1, dislikes: 0 })
    } else {
      counts.likes += 1
    }
    await counts.save()
    res.json({ likes: counts.likes, dislikes: counts.dislikes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/movies/:id/dislike', authenticateToken, async (req,res)=>{
  try {
    let counts = await MovieCount.findOne({ movieId: req.params.id })
    if (!counts) {
      counts = new MovieCount({ movieId: req.params.id, likes: 0, dislikes: 1 })
    } else {
      counts.dislikes += 1
    }
    await counts.save()
    res.json({ likes: counts.likes, dislikes: counts.dislikes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>console.log(`API server listening on http://localhost:${PORT}`))
