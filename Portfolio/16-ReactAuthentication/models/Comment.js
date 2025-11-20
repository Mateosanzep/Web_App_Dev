import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Comment', commentSchema)
