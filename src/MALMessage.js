const UMessage = require('./UMessage.js')

const rp = require('request-promise');
const $ = require('cheerio');
const qs = require('querystring');
/**
 * MALMessage containing the properties of anything regarding the anime's links, information, and kissanime link.
 */
class MALMessage extends UMessage {

    /**
     * Creates a MALMessage (MyAnimeList Message) with channel parameter.
     *
     * @constructor
     * @author: kotooriiii
     * @param {TextChannel | GroupDMChannel} channel The text channel that this message will be sent to.
     */
    constructor(channel) {
        super(channel);
    }

    /**
     * Sends the default message for MAL commands help. How to use MyAnimeList bot. 
     */
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
                    icon_url: super.authorAvatarURL,
                    text: "© " + super.authorName
                }
            }
        }).catch(error => console.error(error));
    }

    /**
     * Searches for the anime given a query and sends the information to the channel
     * @param {String} query The name of the anime being searched for. 
     */
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
                    let season = $('span[class="information season"]', animeHTML).find('a')[0];
                    let type = $('#content > table > tbody > tr > td.borderClass > div > div:nth-child(12) > a', animeHTML).text().replace(" ", "");
                    let duration = $('#content > table > tbody > tr > td.borderClass > div > div:nth-child(21)', animeHTML).text();
                    console.log("duration:" + " " + duration);
                    console.log("Season: " + season)

                    if (!duration.includes("Duration:")) {
                        duration = null;
                    } else {
                        duration = duration.replace("Duration:").replace(" ", "").replace("\n", "");
                    }

                    if (season) {
                        season = $('span[class="information season"]', animeHTML).find('a')[0].children[0].data;
                    }

                    let kissAnimeLink = kissAnimeLinkBuilder(name.split(" "), 0);


                    var elements = [synopsis, rating, ranked, popularity, producer, episodes, season, type, duration];

                    validAnimeProperties(elements);

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
                                    value: elements[4],
                                    inline: true
                                },
                                {
                                    name: "Rating",
                                    value: elements[1],
                                    inline: true
                                },
                                {
                                    name: "Season",
                                    value: elements[6],
                                    inline: true
                                },
                                {
                                    name: "Episode(s)",
                                    value: elements[5],
                                    inline: true
                                },
                                {
                                    name: "Ranked",
                                    value: elements[2],
                                    inline: true
                                },
                                {
                                    name: "Popularity",
                                    value: elements[3],
                                    inline: true
                                },
                                {
                                    name: "Type",
                                    value: elements[7],
                                    inline: true
                                },
                                {
                                    name: "Duration",
                                    value: elements[8],
                                    inline: true
                                },
                                {
                                    name: "Synopsis",
                                    value: elements[0],
                                    inline: false
                                },
                                {
                                    name: "Stream Online!",
                                    value: "[KissAnime](" + kissAnimeLink + ")"
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

    /**
     * 
     * Verifies if there is a author name, author url, and a channel associated with this message.
     * @return {boolean} true if channel exists, false if channel is undefined
     */
    validDefaultProperties() {
        if (!super.authorName) {
            console.error("There is no author name associated with this MALMessage. Default name will be set automatically for your concern.");
            super.authorName = "MALDiscord";
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
/**
 * A debugger function to test if there is an HREF link associated with an anime. Essentially, a debugger to find out if results were properly being matched.
 * @param {String} href The anime link to a certain anime
 * @param {String} image The thumbnail of the anime
 * @param {String} name The name of the anime
 * @return void
*/
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

/**
 * Manipulates the entries of the array to "?" if they are undefined/null to prevent discord errors of blank messages.
 * @param {Array[]} elements The array which contains: synopsis, rating, ranking, popularity, producer, episodes, season, type, and duration.
 * @return void
 */
function validAnimeProperties(elements) {
    if (!elements[0]) {
        console.error("There was no synopsis found! Sorry! :(");
        elements[0] = "No synoposis found.";
    }

    if (!elements[1]) {
        console.error("There was no rating found! Sorry! :(");
        elements[1] = "?";
    }

    if (!elements[2]) {
        console.error("There was no ranking found! Sorry! :(");
        elements[2] = "#?";
    }

    if (!elements[3]) {
        console.error("There was no popularity ranking found! Sorry! :(");
        elements[3] = "#?";
    }

    if (!elements[4]) {
        console.error("There was no producer found! Sorry! :(");
        elements[4] = "?";
    }

    if (!elements[5]) {
        console.error("There was no episodes found! Sorry! :(");
        elements[5] = "?";
    }

    if (!elements[6]) {
        console.error("There was no season found! Sorry! :(")
        elements[6] = "?";
    }

    if (!elements[7]) {
        console.error("There was no type found! Sorry! :(")
        elements[7] = "TV Series";
    }

    if (!elements[8]) {
        console.error("There was no duration found! Sorry! :(");
        elements[8] = "?";
        if (elements[7] === "TV" || elements[7] === "TV Series")
            elements[8] = "~24mins"
    }
}
/**
 * Constructs a link to the anime you searched for using KissAnime. 
 * @param {Array[]} array The array of words
 * @param {number} index the index to begin words. For instance, 'search <attack on titan>' (starts on index 1)
 * @return {String} the link to the anime 
 */
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
