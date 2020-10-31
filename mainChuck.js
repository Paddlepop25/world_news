// load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// create instance of express
const app = express()

// configure environment variables
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const API_KEY = process.env.API_KEY || ""
const NEWS_URL = 'https://newsapi.org/v2/top-headlines'

// configure handlebars
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs' }))
app.set('view engine', 'hbs')

// configure app
const headers = {
  'X-Api-Key': API_KEY
}

fetch(url, { headers })
  .then(result => result.json())
  .then(result => {
    console.info('result ----> ', result)
  })
  .catch(err => {
    console.error('err -------> ', err)
  })

// https://newsapi.org/v2/top-headlines
// ?q=covid
// &country=us
// &category=general
// &apiKey=8ad077af14414be291611998efbc6d1b

// https://newsapi.org/v2/top-headlines?q=covid&country=us&category=general&apiKey=8ad077af14414be291611998efbc6d1b

// use static
app.use(express.static(__dirname + '/static'))

// start server
app.listen(PORT,
  console.info(`Application started on port ${PORT} on ${new Date()}`)
)