import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import './styles.css'
import Detail from './MovieDetail'
import Login from './Login'
import Signup from './Signup'
import { logout } from './store/authSlice'
import { fetchMovies, fetchMovieCounts, likeMovie, dislikeMovie } from './store/moviesSlice'

export default function App(){
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { list: movies, counts, loading } = useSelector((state) => state.movies)

  useEffect(()=>{
    dispatch(fetchMovies())
  },[dispatch])

  const handleLogout = () => {
    dispatch(logout())
  }

  if(loading) return <div className="container my-4">Loading...</div>

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Star Wars Movies</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-light">
                      Welcome, {user?.username}!
                    </span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/signup">Sign Up</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        <Routes>
          <Route path="/" element={
            <div className="row">
              {movies.map(m=> (
                <div className="col-6 col-md-4 mb-4" key={m.episode}>
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          } />
          <Route path="/movie/:episode" element={<Detail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  )
}

function MovieCard({movie}){
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const counts = useSelector((state) => state.movies.counts[movie.episode] || { likes: 0, dislikes: 0 })
  const [src,setSrc]=useState(`/images/${movie.poster}`)

  useEffect(()=>{
    dispatch(fetchMovieCounts(movie.episode))
  },[movie.episode, dispatch])

  const affMap={Jedi:'/images/jedi.png',Sith:'/images/sith.png',Rebellion:'/images/rebel.png',Empire:'/images/empire.png'}
  const good=['Jedi','Rebellion']
  function onEnter(){const logo=affMap[movie.best_character.affiliation];if(logo){setSrc(logo)}}
  function onLeave(){setSrc(`/images/${movie.poster}`)}

  function handleLike(){
    if (!isAuthenticated) {
      alert('Please login to like movies')
      return
    }
    dispatch(likeMovie(movie.episode))
  }

  function handleDislike(){
    if (!isAuthenticated) {
      alert('Please login to dislike movies')
      return
    }
    dispatch(dislikeMovie(movie.episode))
  }

  const borderClass = good.includes(movie.best_character.affiliation)?'logo-border-blue':'logo-border-red'

  return (
    <div className="card movie-card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <img src={src} alt={movie.title} className={`card-img-top poster-img ${src.includes('images/')?'' : borderClass}`} />
      <div className="card-body">
        <h5 className="card-title">{movie.title}</h5>
        <h6 className="card-subtitle mb-2 text-body-secondary">{movie.year}</h6>
        <Link to={`/movie/${movie.episode}`} className="card-link">More...</Link>
        <div className="mt-2">
          <button 
            type="button" 
            className="btn btn-link p-0 me-2" 
            onClick={handleLike}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? 'Login to like' : 'Like'}
          >
            👍
          </button>
          <span className="me-3">{counts.likes || 0}</span>
          <button 
            type="button" 
            className="btn btn-link p-0 me-2" 
            onClick={handleDislike}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? 'Login to dislike' : 'Dislike'}
          >
            👎
          </button>
          <span>{counts.dislikes || 0}</span>
        </div>
      </div>
    </div>
  )
}
