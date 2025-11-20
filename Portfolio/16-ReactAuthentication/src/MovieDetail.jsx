import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchComments, addComment } from './store/moviesSlice'

export default function Detail(){
  const { episode } = useParams()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const comments = useSelector((state) => state.movies.comments[episode] || [])
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch(`/api/movies/${episode}`)
        if(res.ok){
          const data = await res.json()
          setMovie(data)
        }
        dispatch(fetchComments(episode))
      }catch(e){console.error(e)}
      finally{setLoading(false)}
    }
    load()
  },[episode, dispatch])

  if(loading) return <div>Loading...</div>
  if(!movie) return <div>Movie not found — <Link to="/">back</Link></div>

  function renderComments(){
    if(!comments || comments.length===0) return <p className="text-muted">No comments yet.</p>
    return comments.map((c,i)=>(
      <div className="mb-2" key={i}><strong>{c.name}</strong><p className="mb-0">{c.comment}</p></div>
    ))
  }

  async function handleSubmit(e){
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Please login to add comments')
      return
    }

    const name = e.target.name.value
    const comment = e.target.comment.value
    if(!name || !comment) return
    
    try{
      await dispatch(addComment({ movieId: episode, name, comment })).unwrap()
      e.target.reset()
    }catch(err){
      console.error('Failed to add comment:', err)
      alert('Failed to add comment. Please try again.')
    }
  }

  return (
    <div className="row mt-4">
      <div className="col-12">
        <Link to="/" className="btn btn-link mb-3">← Back</Link>
        <div className="card border-0">
          <div className="card-body">
            <div className="row align-items-left">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <img src={`/images/${movie.best_character.image}`} className="img-fluid" alt={movie.best_character.name} />
              </div>
              <div className="col-lg-6 px-xl-10">
                <h3 className="h2 mb-0">{movie.best_character.name}</h3>
                <p className="text-muted">{movie.best_character.affiliation}</p>
                <p>{movie.best_character.bio}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <h5>Comments</h5>
          <div>
            {renderComments()}
          </div>
          
          {!isAuthenticated && (
            <div className="alert alert-info mt-3" role="alert">
              <Link to="/login">Login</Link> or <Link to="/signup">Sign up</Link> to add comments
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="row g-2 mt-2">
            <div className="col-12 col-md-4">
              <input 
                name="name" 
                className="form-control" 
                placeholder="Name" 
                required 
                disabled={!isAuthenticated}
                defaultValue={isAuthenticated ? user?.username : ''}
              />
            </div>
            <div className="col-12 col-md-6">
              <input 
                name="comment" 
                className="form-control" 
                placeholder="Comment" 
                required 
                disabled={!isAuthenticated}
              />
            </div>
            <div className="col-12 col-md-2">
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={!isAuthenticated}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
