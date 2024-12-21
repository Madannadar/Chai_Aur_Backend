// const express = require('express');  // sync kam karta h 
import express from 'express'  // async kam karta h

const app = express()

app.get('/', (req, res) => {
    res.send("sever is ready")
});

// get a list of 5 jokes

app.get('/api/jokes',  (req, res) => {  // api is use for production level 
    const jokes = [
        {
            id:1,
            title:'A joke',
            content: 'This is a joke'
        },
        {
            id:2,
            title:'second joke',
            content: 'This is second joke'
        },
        {
            id:3,
            title:'third joke',
            content: 'This is third joke'
        },
        {
            id:4,
            title:'forth joke',
            content: 'This is forth joke'
        },
        {
            id:5,
            title:'fifth joke',
            content: 'This is fifth joke'
        },
    ];
    res.send(jokes);
});


const port = process.env.PORT || 3000;  // process.env.PORT is done for production level app

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});