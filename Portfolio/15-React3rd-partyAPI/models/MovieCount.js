import mongoose from 'mongoose'

const movieCountSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
})

export default mongoose.model('MovieCount', movieCountSchema)
