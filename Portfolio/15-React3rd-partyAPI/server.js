import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import Comment from './models/Comment.js'
import MovieCount from './models/MovieCount.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/starwars-movies'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    console.log('Make sure MongoDB is running locally or set MONGODB_URI environment variable')
  })

const MOVIES_MODULE = path.join(__dirname, 'src', 'data', 'data.js')

const { default: movies } = await import(MOVIES_MODULE + '')

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

app.post('/api/movies/:id/comments', async (req,res)=>{
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

app.post('/api/movies/:id/like', async (req,res)=>{
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

app.post('/api/movies/:id/dislike', async (req,res)=>{
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
