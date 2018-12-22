// applicaiton: sentiment-analysis
// description: This application retrieves data from Twitter and performs sentiment analysis to provide with a general score over a certain topic
// url: https://github.com/srmrox/sentiment-analysis.git
// author: Shahrukh Malik

// Methods for comparison:
//  1. sentiment: AFINN-based sentiment analysis
      /*
      AFINN is a list of words rated for valence with an integer between minus five (negative) and plus five (positive).
      Sentiment analysis is performed by cross-checking the string tokens(words, emojis) with the AFINN list and getting
      their respective scores. The comparative score is simply: sum of each token / number of tokens
      */
//  2.     

console.log("Starting...");

var Sentiment = require('sentiment');
var Twit = require('twit');
const express = require('express');
const bodyParser = require('body-parser');



var config = require('./config.js');

var twitter = new Twit(config);
var sentiment = new Sentiment();

const app = express();
var port = process.env.PORT || 8081;

app.set('view engine', 'ejs');      // use ejs template engine to render HTML
app.use(bodyParser.urlencoded({ extended: true })); // setup bodyparser

app.get("/",function(req, res) {    // the initial get route
  var arTweets = [];
  var arSenti = [];
  res.render('index', {tweetText: arTweets, tweetSenti: arSenti});
});

app.post('/', function (req, res) { // the post route from request
  let keyword = req.body.keyword;
  let dateSince = req.body.dateSince;
  let count = req.body.count;

  console.log("Request received: " + keyword + ", since: " + dateSince + ", count: " + count);

  var params = {
    q: keyword + ' since:' + dateSince,
    count: count
  }
  
  var arTweets = [];
  var arSenti = [];

  twitter.get('search/tweets', params, processData);

  function processData(err, data, response){
    console.log("Processing request...");
    var tweets = data.statuses;
  
    for (var i = 0; i < tweets.length; i++){
      arTweets[i] = tweets[i].text;
      arSenti[i] = Math.round(sentiment.analyze(arTweets[i]).comparative*10000)/100;
    }
    
    console.log("Processing compelte. Rendering page.");

    res.render('index', {tweetText: arTweets, tweetSenti: arSenti});
    console.log("Request complete!");
  }
});

app.listen(port);

console.log('Server running at http://127.0.0.1:' + port);