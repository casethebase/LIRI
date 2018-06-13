// Installing dotenv
require("dotenv").config();

// All node packages:
var keys = require("./keys.js")
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var omdbApi = require('omdb-client');
var fs = require("fs");
var chalk = require("chalk");
var date = require("date-and-time");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
var now = new Date();
var timeNow = date.format(now, 'MM/DD/YYYY HH:mm:ss');

// First time using "Let", this essentially just limits the scope of 'node', 'file', liriCommand, and our parameters to process.argv
let [node, file, liriCommand, ...param] = process.argv; 

if (liriCommand != undefined) liriCommand = liriCommand.toLowerCase(); 
// console.log(liriCommand);
console.clear();
console.log(chalk.inverse("You can ask Liri: my-tweets, spotify song-name, movie movie-name, read-file (command.txt or random.txt)"));


// If statement defining the behavior for spotify and movie commands
if ((liriCommand === "spotify" || liriCommand === "movie") && param.length === 0) {
    console.log(chalk.red(`Please search something. ie: ${liriCommand} something`))
    process.exit();
} else {
    var query = param.join("-"); 
}


// PRIMARY CALLBACK
exeCmd(liriCommand, query);

function log(x, y) { 
    if (y == undefined) y = "";
    let mylog = `Command: ${x} ${y}; is created at ${timeNow}\n`
    fs.appendFile('log.txt', mylog, function (err) {
        if (err) return err;
        console.log(chalk.red('Command Saved!'));
    });
}

// Twitter
function tweetCommand(y) {
    console.log(chalk.blue("********* Searching Twitter ***********"))
    var params = { user_id: y };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            for (var i = 0; i < tweets.length; i++) {
                console.log(tweets[i].user.name + ": " + tweets[i].text + "; " + tweets[i].created_at); // Build query
                var log = tweets[i].user.name + ": " + tweets[i].text + "; " + tweets[i].created_at + "\n"; // Write to log file
            }
        } else {
            console.log("Got an error: " + error) 
        }
    });
}

// Spotify
function spotifyCommand(x) {
    spotify.search({ type: 'track', query: x, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + chalk.red(err));
        }


        var tracks = data.tracks.items;
        console.log(chalk.blue("********* Searching Spotify ***********"))
        if (tracks[0].preview_url == null) tracks[0].preview_url = "No preview Available!";

        console.log(`Track: ${tracks[0].name}
Album: ${tracks[0].album.name}
Artist: ${tracks[0].artists[0].name}
Album URL: ${tracks[0].external_urls.spotify}
Track Preview: ${tracks[0].preview_url}`);
    });
}

// IMDB
function movieCommand(x) {
    console.log(chalk.blue("********* Searching IMDB ***********"))
    var params = {
        apiKey: 'bdd0edf1',
        title: x,
        incTomatoes: true
    }
    omdbApi.get(params, function (err, data) {
        if (err) return console.log(chalk.yellow("Movie name is either incorrect or not found!"))
        console.log(`Title: ${data.Title}.
Year: ${data.Year}.
IMDB Rating: ${data.imdbRating}.
Rotten Tomatoes:${data.Ratings[1].Value}.
Country: ${data.Country}.
Language: ${data.Language}.
Plot: ${data.Plot}.
Actors: ${data.Actors}.`);


    });
}

// Text File
function readFile(x) {
    fs.readFile(x, "utf8", function (err, data) {
        console.log(chalk.blue("********* Reading File ***********"))
        console.log(`Your command is: ${data}`)
        var newCommand = data.split(","),
            newCommandName = newCommand[0],
            newCommandQuery = newCommand[1];
        newCommandQuery = newCommandQuery.replace(/"/g, ''); 
        var query = newCommandQuery.replace(/\s+/g, '-')
        exeCmd(newCommandName, query);
    });
}


function exeCmd(x, y) {
    switch (x) {

        case ("my-tweets"):
            tweetCommand(y);
            log(x, y);
            break;

        case ("spotify"):
            spotifyCommand(y);
            log(x, y);
            break;

        case ("movie"):
            movieCommand(y);
            log(x, y);
            break;

        case ("read-file"):
            readFile(y);
            log(x, y);
            break;

        default:
            console.log(`Please enter a correct command!`)
    }

}