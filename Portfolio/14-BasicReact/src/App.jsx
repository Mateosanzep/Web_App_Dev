import React, { useState } from 'react'
import sw from './data/data.js'
import './styles.css'

export default function App(){
  const [movies]=useState(sw)
  const [selected,setSelected]=useState(null)

  function getKey(prefix,id){return `${prefix}-${id}`}
  function getCounts(id){const l=sessionStorage.getItem(getKey('likes',id));const d=sessionStorage.getItem(getKey('dislikes',id));return{likes: l?parseInt(l,10):0,dislikes: d?parseInt(d,10):0}}
  function setCounts(id,likes,dislikes){sessionStorage.setItem(getKey('likes',id),String(likes));sessionStorage.setItem(getKey('dislikes',id),String(dislikes))}
  function getComments(id){const c=sessionStorage.getItem(getKey('comments',id));return c?JSON.parse(c):[]}
  function addComment(id,name,comment){const cs=getComments(id);cs.push({name,comment});sessionStorage.setItem(getKey('comments',id),JSON.stringify(cs));}

  return (
    <div className="container my-4">
      <div className="row">
        {movies.map(m=> (
          <div className="col-6 col-md-4 mb-4" key={m.episode}>
            <MovieCard movie={m} onMore={()=>setSelected(m)} getCounts={getCounts} setCounts={setCounts} />
          </div>
        ))}
      </div>
      {selected && <Detail movie={selected} getComments={getComments} addComment={addComment} />}
    </div>
  )
}

function MovieCard({movie,onMore,getCounts,setCounts}){
  const [src,setSrc]=useState(`/images/${movie.poster}`)
  const counts=getCounts(movie.episode)
  const affMap={Jedi:'/images/jedi.png',Sith:'/images/sith.png',Rebellion:'/images/rebel.png',Empire:'/images/empire.png'}
  const good=['Jedi','Rebellion']
  function onEnter(){const logo=affMap[movie.best_character.affiliation];if(logo){setSrc(logo)}}
  function onLeave(){setSrc(`/images/${movie.poster}`)}
  function like(){const c=getCounts(movie.episode);c.likes+=1;setCounts(movie.episode,c.likes,c.dislikes)}
  function dislike(){const c=getCounts(movie.episode);c.dislikes+=1;setCounts(movie.episode,c.likes,c.dislikes)}
  const borderClass = good.includes(movie.best_character.affiliation)?'logo-border-blue':'logo-border-red'

  return (
    <div className="card movie-card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <img src={src} alt={movie.title} className={`card-img-top poster-img ${src.includes('images/')?'' : borderClass}`} />
      <div className="card-body">
        <h5 className="card-title">{movie.title}</h5>
        <h6 className="card-subtitle mb-2 text-body-secondary">{movie.year}</h6>
        <a href="#" className="card-link" onClick={(e)=>{e.preventDefault();onMore()}}>More...</a>
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

function Detail({movie,getComments,addComment}){
  const [comments,setComments]=useState(getComments(movie.episode))
  React.useEffect(()=>{setComments(getComments(movie.episode))},[movie])
  function handleSubmit(e){e.preventDefault();const name=e.target.name.value;const comment=e.target.comment.value;addComment(movie.episode,name,comment);setComments(getComments(movie.episode));e.target.reset()}
  return (
    <div className="row mt-4">
      <div className="col-12">
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
            {comments.map((c,i)=>(
              <div className="mb-2" key={i}><strong>{c.name}</strong><p className="mb-0">{c.comment}</p></div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="row g-2 mt-2">
            <div className="col-12 col-md-4"><input name="name" className="form-control" placeholder="Name" required /></div>
            <div className="col-12 col-md-6"><input name="comment" className="form-control" placeholder="Comment" required /></div>
            <div className="col-12 col-md-2"><button className="btn btn-primary" type="submit">Add</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}
