const settings = require('./settings.js');

/**
 * UMessage is the basic principle class that contains the channel, author, and author url.
 */
class UMessage {
    constructor(channel)
    {
        this._channel = channel;
        this._authorName = settings.name;
        this._authorAvatarURL = settings.icon; 
    }

    get channel()
    {
        return this._channel;
    }

    set authorName(authorName)
    {
        this._authorName = authorName;
    }
    get authorName()
    {
        return this._authorName;
    }

    set authorAvatarURL(authorAvatarURL)
    {
        return this._authorAvatarURL;
    }
    
    get authorAvatarURL()
    {
        return this._authorAvatarURL;
    }


}

module.exports = UMessage;
 


