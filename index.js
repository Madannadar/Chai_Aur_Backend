require('dotenv').config()
const express = require('express')
const app = express()
const port = 4000  //.env pe raka h 

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/github', (req, res) => {
    res.send('madannadar')

})
app.get('/login', (req, res) => {  //Cannot GET /login // ans is re run the server
    res.send('<h1>Welcome!</h1>')    
})

app.get('/youtube', (req, res) => {
  res.send('<h1>Welcome to Youtube!</h1>')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})
