import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const loadToken = () => {
  try {
    const token = localStorage.getItem('token')
    return token || null
  } catch {
    return null
  }
}

const loadUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.error)
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.error)
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) {
        return rejectWithValue('No token found')
      }
      
      const response = await fetch('/api/auth/verify', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        return rejectWithValue('Token verification failed')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUser(),
    token: loadToken(),
    isAuthenticated: !!loadToken(),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload.user
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
