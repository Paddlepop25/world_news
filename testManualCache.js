// load .env variables
require('dotenv').config()

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
app.get('/',
  (req, res) => {
    res.status(200)
    res.type('text/html')
    res.render('news')
  })

// https://newsapi.org/v2/top-headlines
// ?q=covid
// &country=us
// &category=general
// &apiKey=xxx

const searchResult = []
const caches = [] // holds array of javascript objects [ { 'search-term': 'trump', country: 'us', category: 'general' } ]

app.get('/search',
  async (req, res) => {
    const search = req.query
    console.info('search ------>', search)
    // search ------> { 'search-term': 'covid', country: 'cn', category: 'science' }
    const searchTerm = req.query['search-term']
    const country = req.query['country']
    const category = req.query['category']

    if (!JSON.stringify(caches).includes(JSON.stringify(req.query))) {
      caches.push(req.query)
      //check if req.query is in caches
      // if not in, put into caches and fetch the url and add data into searchResults array
      console.info('!JSON.stringify(caches) -----> ', !JSON.stringify(caches))
      // !JSON.stringify(caches) ----->  false
      console.info('JSON.stringify(caches) -----> ', JSON.stringify(caches))
      // JSON.stringify(caches) ----->  [{"search-term":"covid","country":"jp","category":"science"},{"search-term":"covid","country":"cn","category":"science"}]
      console.info('JSON.stringify(req.query) -----> ', JSON.stringify(req.query))
      // JSON.stringify(req.query) ----->  {"search-term":"covid","country":"cn","category":"science"}
      console.info('cache ----> ', caches)
      // cache ---->  [
      //   { 'search-term': 'covid', country: 'jp', category: 'science' },
      //   { 'search-term': 'covid', country: 'cn', category: 'science' }
      // ]

      const url = withQuery(NEWS_URL, {
        q: searchTerm,
        country: country,
        category: category,
        // apikey: API_KEY // apikey is set in the headers below
      })
      // console.info('url -------> ', url)

      // how to hide API keys so not visible in browser (use 2nd option in documentation)
      // do this in terminal first: export API_KEY=xxxx
      // const headers = {
      //   'X-Api-Key': API_KEY
      // }

      // we fetch url with headers and set it with the 'X-Api-Key' of our API_KEY(set in terminal)
      // fetch(url, { headers }) // this way if uncomment out above headers variable
      fetch(url, { headers: { 'X-Api-Key': API_KEY } })
        .then(result => result.json())
        .then(result => {
          // console.info('result ----> ', result)
          result.articles.map((news) => {
            searchResult.push({ title: news.title, image: news.urlToImage, summary: news.description, time: news.publishedAt, link: news.url, search: req.query })
          })
          console.info('searchResult ---> ', searchResult)
         
          const newsContent = searchResult
            .filter( //filter out d.search != req.body
              d => {
                return JSON.stringify(d.search) == JSON.stringify(req.query)
              })
            .map(
              d => {
                return { title: d.title, image: d.image, summary: d.summary, time: d.time, link: d.link }
              }
            )
          console.info('newsContent --->', newsContent)

          res.status(200)
          res.type('text/html')
          res.render('result', {
            newsContent,
            hasContent: newsContent.length > 0
          })
        })
        .catch(err => {
          console.error('err -------> ', err)
        })
    }
  }
)

// use static
app.use(express.static(__dirname + '/static'))

app.use((req, res) => {
  res.status(404)
  res.type('text/html')
  res.render('error404')
})

// start server
app.listen(PORT,
  console.info(`Application started on port ${PORT} on ${new Date()}`)
)