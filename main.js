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
// &apiKey=8ad077af14414be291611998efbc6d1b

// https://newsapi.org/v2/top-headlines?q=covid&country=us&category=general&apiKey=8ad077af14414be291611998efbc6d1b

app.get('/search',
  // only used for POST
  // express.urlencoded({ extended: true }),
  // express.json(),


  async (req, res) => {
    const search = req.query
    const searchTerm = req.query['search-term']
    const country = req.query['country']
    const category = req.query['category']
    // console.info('search ------>', search)
    // 'search-term' will be returned in obj and in quote because it is not a proper javascript obj with the hyphen ' - '

    const url = withQuery(NEWS_URL, {
      q: searchTerm,
      country: country,
      category: category,
      apikey: API_KEY // note: this will be visible in browser, see mainTest.js for better solution
    })
    // console.info('url -------> ', url)

    // search NewsAPI, use await
    let result = await fetch(url)
    // console.info(result)
    const returnedNews = await result.json()
    console.info(returnedNews)

    const newsContent = returnedNews.articles
      .map((news) => {
        return { title: news.title, image: news.urlToImage, summary: news.description, time: news.publishedAt, link: news.url }
      })
    // console.info(newsContent)

    res.status(200)
    res.type('text/html')
    res.render('result', {
      newsContent,
      hasContent: newsContent.length > 0
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