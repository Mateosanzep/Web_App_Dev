import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const getAuthHeader = (getState) => {
  const token = getState().auth.token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/movies')
      if (!response.ok) {
        return rejectWithValue('Failed to fetch movies')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchMovieCounts = createAsyncThunk(
  'movies/fetchCounts',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/counts`)
      if (!response.ok) {
        return rejectWithValue('Failed to fetch counts')
      }
      const data = await response.json()
      return { movieId, counts: data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const likeMovie = createAsyncThunk(
  'movies/like',
  async (movieId, { rejectWithValue, getState }) => {
    try {
      const headers = {
        ...getAuthHeader(getState),
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/movies/${movieId}/like`, {
        method: 'POST',
        headers
      })
      
      if (!response.ok) {
        const data = await response.json()
        return rejectWithValue(data.error || 'Failed to like movie')
      }
      
      const data = await response.json()
      return { movieId, counts: data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const dislikeMovie = createAsyncThunk(
  'movies/dislike',
  async (movieId, { rejectWithValue, getState }) => {
    try {
      const headers = {
        ...getAuthHeader(getState),
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/movies/${movieId}/dislike`, {
        method: 'POST',
        headers
      })
      
      if (!response.ok) {
        const data = await response.json()
        return rejectWithValue(data.error || 'Failed to dislike movie')
      }
      
      const data = await response.json()
      return { movieId, counts: data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchComments = createAsyncThunk(
  'movies/fetchComments',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/comments`)
      if (!response.ok) {
        return rejectWithValue('Failed to fetch comments')
      }
      const data = await response.json()
      return { movieId, comments: data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addComment = createAsyncThunk(
  'movies/addComment',
  async ({ movieId, name, comment }, { rejectWithValue, getState }) => {
    try {
      const headers = {
        ...getAuthHeader(getState),
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/movies/${movieId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, comment })
      })
      
      if (!response.ok) {
        const data = await response.json()
        return rejectWithValue(data.error || 'Failed to add comment')
      }
      
      const data = await response.json()
      return { movieId, comments: data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    list: [],
    counts: {},
    comments: {},
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMovieCounts.fulfilled, (state, action) => {
        state.counts[action.payload.movieId] = action.payload.counts
      })
      .addCase(likeMovie.fulfilled, (state, action) => {
        state.counts[action.payload.movieId] = action.payload.counts
      })
      .addCase(likeMovie.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(dislikeMovie.fulfilled, (state, action) => {
        state.counts[action.payload.movieId] = action.payload.counts
      })
      .addCase(dislikeMovie.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.movieId] = action.payload.comments
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments[action.payload.movieId] = action.payload.comments
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const { clearError } = moviesSlice.actions
export default moviesSlice.reducer
