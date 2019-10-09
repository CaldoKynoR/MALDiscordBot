const settings = require('./settings.js')

const Discord = require('discord.js');
const bot = new Discord.Client();

const MALMessage = require('./MALMessage.js');

bot.on("message", function (message) {

    if (message.type == "text" && !validGuild(message.guild.id))
        return;

    if (message.content.startsWith(settings.prefix)) {
        let args = message.content.split(" ");
        let malmessage = new MALMessage(message.channel);

        if (args.length <= 1) {
            malmessage.sendDefault();
        } else {
            args.splice(0, 1);
            if (args[0] === "search") {

                let query = stringBuilder(args, 1);
                if (query.length <= 3) {
                    message.channel.send("Your search query must be higher than 3 characters.");
                } else {
                    console.log("searching for " + query);
                    malmessage.search(query);
                }


            } else {
                message.channel.send("Invalid arguments.")
            }
        }

        message.delete();
    }
});

function validGuild(guildSnowflake) {
    if (settings.guilds.includes(guildSnowflake)) {
        return true;
    }
    return false;
}

function stringBuilder(array, index) {
    let string = "";

    for (let i = index; i < array.length; i++) {
        if (i === array.length - 1) {
            string += array[i];
            break;
        }
        string += array[i] + "%20";
    }
    return string;
}



bot.login(settings.token);