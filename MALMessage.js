const UMessage = require('./UMessage.js')

const rp = require('request-promise');
const $ = require('cheerio');
const qs = require('querystring');

class MALMessage extends UMessage {

    constructor(channel) {
        super(channel);
    }

    sendDefault() {

        this.validDefaultProperties();
        super.channel.send({
            embed: {
                color: 12632256,
                title: "MAL Commands",
                timestamp: new Date(),
                thumbnail: {
                    url: "https://i.imgur.com/6xJANfa.png"
                },
                fields: [{
                    name: "Search",
                    value: "!mal search <name>",
                    inline: true
                }],
                footer: {
                    icon_url:  super.authorAvatarURL,
                    text: "© " + super.authorName
                }
            }
        }).catch(error => console.error(error));
    }

    search(query) {

        let channel = super.channel;
        let authorName = super.authorName;
        let authorAvatarURL = super.authorAvatarURL;
        
        if (query.length <= 3) {
            channel.send("Your search query must be higher than 3 characters.");
                    
        } else {

            rp("https://myanimelist.net/search/all?q=" + qs.escape(query)).then(function (html) {

                let href = $('div[class="list di-t w100"]', html).find('div > a')[0].attribs.href;
                let image = $('div[class="list di-t w100"]', html).find('div > a > img')[0].attribs.src;
                let name = $('div[class="information di-tc va-t pt4 pl8"]', html).find('a')[0].children[0].data;


                rp(href).then(function (animeHTML) {
                    let synopsis = $('span[itemprop="description"]', animeHTML).get(0).children[0].data;
                    let rating = $('div[class="fl-l score"]', animeHTML).contents()[0].data.replace(" ", "");
                    let ranked = $('span[class="numbers ranked"]', animeHTML).find('strong')[0].children[0].data;
                    let popularity = $('span[class="numbers popularity"]', animeHTML).find('strong')[0].children[0].data;
                    let producer = $('span[class="information studio author"]', animeHTML).find('a')[0].children[0].data;
                    let episodes = $('div[class="spaceit"]', animeHTML).find("span")[0].next.data.replace(" ", "").replace("\n", "");
                    let season = $('span[class="information season"]', animeHTML).find('a')[0].children[0].data;
                    
                    let kissAnimeLink = kissAnimeLinkBuilder(name.split(" "), 0);

                    channel.send({
                        embed: {
                            color: 12632256,
                            description: "[" + name + "](" + href + ")",
                            timestamp: new Date(),
                            thumbnail: {
                                url: image
                            },
                            fields: [
                                {
                                    name: "Producer",
                                    value: producer,
                                    inline: true
                                },
                                {
                                    name: "Rating",
                                    value: rating,
                                    inline: true
                                },
                                {
                                    name: "Season",
                                    value: season,
                                    inline: true
                                },
                                {
                                    name: "Episode(s)",
                                    value: episodes,
                                    inline: true
                                },
                                {
                                    name: "Ranked",
                                    value: ranked,
                                    inline: true
                                },
                                {
                                    name: "Popularity",
                                    value: popularity,
                                    inline: true
                                },
                                {
                                    name: "Synopsis",
                                    value: synopsis,
                                    inline: false                        
                                },
                                {
                                    name: "Stream Online!",
                                    value: "[KissAnime](" + kissAnimeLink +")"
                                }

                            ],
                            footer: {
                                icon_url: authorAvatarURL,
                                text: "© " + authorName
                            }
                        }
                    }).catch(error => console.error("\nMESSAGE SEARCH QUERY ERROR:\n" + error));


                }).catch(err => console.error("No results found for: " + query + ". More information: " + err));
            }).catch(err => "Could not find a valid MyAnimeList source link to find results.");
        }
    }

    
    validDefaultProperties() {
        if (!super.authorName) {
            console.error("There is no author name associated with this MALMessage. Default name will be set automatically for your concern.");
            super.authorName = "MyAnimeList Bot";
        }

        if (!super.authorAvatarURL) {
            console.error("There is no author avatar URL associated with this MALMessage. Default image will be set automatically for your concern.");
            super.authorAvatarURL = "https://i.imgur.com/Z5GIkoj.png";
        }

        if (!super.channel) {
            console.error("There is no channel defined for the MALMessage object.");
            super.channel = "Channel is undefined.";
            return false;
        }

        return true;
    }
}
    function validResultsProperties(href, image, name) {

        if (!href) {
            console.error('CRITICAL: No HREF link found for: ' + query + '.');
            return false;
        }

        if (image) {
            console.error('No anime thumbnail found for: ' + query + '. A default image will be used.');
            image = "https://i.imgur.com/Z5GIkoj.png";
        }

        if (name) {
            console.error('No anime name found for: ' + query + '. A default name will be used.')
            name = query;
        }

        return true;

    }


function validAnimeProperties(synopsis, rating, ranked, popularity, producer, episodes, season) {
    if (synopsis) {
        console.error("There was no synopsis found! Sorry! :(");
        synopsis = "No synoposis found.";
    }

    if (rating) {
        console.error("There was no rating found! Sorry! :(");
        rating = "?";
    }

    if (ranked) {
        console.error("There was no ranking found! Sorry! :(");
        ranked = "#?";
    }

    if (popularity) {
        console.error("There was no popularity ranking found! Sorry! :(");
        popularity = "#?";
    }

    if (producer) {
        console.error("There was no producer found! Sorry! :(");
        producer = "?";
    }

    if (episodes) {
        console.error("There was no episodes found! Sorry! :(");
        episodes = "?";
    }

    if (season) {
        console.error("There was no season found! Sorry! :(")
        season = "?";
    }

    return true;
}

function kissAnimeLinkBuilder(array, index) {
    let string = "";

    for (let i = index; i < array.length; i++) {
        if (i === array.length - 1) {
            string += array[i];
            break;
        }
        string += array[i] + "-";
    }
    return "https://kissanime.ru/anime/" + string.replace(":", "-");
}

module.exports = MALMessage;
