import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './styles.css'
import Detail from './MovieDetail'

export default function App(){
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/api/movies')
        const data = await res.json()
        setMovies(data)
      }catch(e){
        console.error('Failed to fetch movies', e)
      }finally{setLoading(false)}
    }
    load()
  },[])

  if(loading) return <div className="container my-4">Loading...</div>

  return (
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
      </Routes>
    </div>
  )
}

function MovieCard({movie}){
  const [src,setSrc]=useState(`/images/${movie.poster}`)
  const [counts,setCounts]=useState({likes:0,dislikes:0})

  useEffect(()=>{
    async function loadCounts(){
      try{
        const res = await fetch(`/api/movies/${movie.episode}/counts`)
        if(res.ok){
          const data = await res.json()
          setCounts(data)
        }
      }catch(e){console.error(e)}
    }
    loadCounts()
  },[movie])

  const affMap={Jedi:'/images/jedi.png',Sith:'/images/sith.png',Rebellion:'/images/rebel.png',Empire:'/images/empire.png'}
  const good=['Jedi','Rebellion']
  function onEnter(){const logo=affMap[movie.best_character.affiliation];if(logo){setSrc(logo)}}
  function onLeave(){setSrc(`/images/${movie.poster}`)}

  async function like(){
    await fetch(`/api/movies/${movie.episode}/like`,{method:'POST'})
    const res = await fetch(`/api/movies/${movie.episode}/counts`)
    const data = await res.json()
    setCounts(data)
  }
  async function dislike(){
    await fetch(`/api/movies/${movie.episode}/dislike`,{method:'POST'})
    const res = await fetch(`/api/movies/${movie.episode}/counts`)
    const data = await res.json()
    setCounts(data)
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
          <button type="button" className="btn btn-link p-0 me-2" onClick={like}>👍</button>
          <span className="me-3">{counts.likes}</span>
          <button type="button" className="btn btn-link p-0 me-2" onClick={dislike}>👎</button>
          <span>{counts.dislikes}</span>
        </div>
      </div>
    </div>
  )
}
