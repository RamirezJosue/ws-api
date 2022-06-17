const { MessageMedia } = require("whatsapp-web.js");
const { cleanNumber } = require("./handle");
const fs = require('fs');

const DELAY_TIME = 170; //ms
const DIR_MEDIA = `${__dirname}/../mediaSend`;

const sendMedia = async (client, number, fileName) => {
    number = cleanNumber(number)
    const file = `${DIR_MEDIA}/${fileName}`;
    if (!fs.existsSync(file)) return false;
    setTimeout(async () => {
        const media = MessageMedia.fromFilePath(file);
        await client.sendMessage(number, media, { sendAudioAsVoice: true });
    }, DELAY_TIME)
    return true;
}


const sendMessage = async (client, number = null, message = null) => {
    number = cleanNumber(number);
    setTimeout(async () => {
        const msg = await client.sendMessage(number, message);
        return msg;
    }, DELAY_TIME);
    return true;
}

module.exports = { sendMessage, sendMedia }