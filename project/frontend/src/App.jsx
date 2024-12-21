import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes , setJokes] = useState([])

  useEffect(() =>{
    axios.get('/api/jokes')  
    .then((response) =>{
      setJokes(response.data)
    })
    .catch((error) =>{
      console.log(error.message);
    })
  })

  return (
    <>
      <h1>Chai aur full stack</h1>
      <p>Jokes: {jokes.length}</p>

      {
        jokes.map((joke,index) => (   
          <div key={joke.id}>
            <p>{joke.title}</p>
            <p>{joke.content}</p>
          </div>
        ))
      }
    </>
  )
}

export default App
