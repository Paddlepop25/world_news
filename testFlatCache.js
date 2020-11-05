// load .env variables
require('dotenv').config()

// load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const flatCache = require('flat-cache')

// create instance of express
const app = express()

// configure environment variables
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const API_KEY = process.env.API_KEY || ""
const NEWS_URL = 'https://newsapi.org/v2/top-headlines'

// load new cache
let cache = flatCache.load('newsCache');
// _pathToFile: 'file:///users/Linda/Downloads/NUS-ISS/Server%20Side%20Foundation/chuk/05%2030Oct/world_news/node_modules/flat-cache/.cache/newsCache'

// optionally, you can go ahead and pass the directory you want your
// cache to be loaded from by using this
// let cache = flatCache.load('productsCache', path.resolve('./path/to/folder')

// create flat cache routes
let flatCacheMiddleware = (req, res, next) => {
  let key = '__express__' + req.originalUrl || req.url
  console.info('key --->', key)
  let cacheContent = cache.getKey(key);
  if (cacheContent) {
    console.info('------------------------IT EXISTS------------------------')
    console.info('cacheContent ------->', cacheContent) // will show html content
    res.send(cacheContent); //send to where? body?
  } else {
    res.sendResponse = res.send
    res.send = (body) => {
      cache.setKey(key, body);
      cache.save( true /* noPrune */);
      res.sendResponse(body)
    }
    next()
  }
};

// findings:
// each new valid search will have a number ID generated.
// no result (cat pic) will be given a number ID and subsequent no result (cat pic) will be given the same number ID
// if search for previous valid result again, no new ID or cache result be added/created. it will be send the (cacheContent) HTML content directly to body

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

app.get('/search', flatCacheMiddleware,
  (req, res) => {
    // const search = req.query
    const searchTerm = req.query['search-term']
    const country = req.query['country']
    const category = req.query['category']
    // console.info('search ------>', search)
    // 'search-term' will be returned in obj and in quote because it is not a proper javascript obj with the hyphen ' - '

    const url = withQuery(NEWS_URL, {
      q: searchTerm,
      country: country,
      category: category,
      // apikey: API_KEY // apikey is set in the headers below
    })
    console.info('url -------> ', url)

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
        console.info('result ----> ', result)
        const newsContent = result.articles
          .map((news) => {
            return { title: news.title, image: news.urlToImage, summary: news.description, time: news.publishedAt, link: news.url }
          })
        console.info(newsContent)
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