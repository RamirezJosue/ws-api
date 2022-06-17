const { LegacySessionAuth } = require("whatsapp-web.js");
const fs = require('fs');
const qr = require('qr-image');

const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true';

const cleanNumber = (number) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`;
    return number
}


const checkEnvFile = () => {
    const pathEnv = `${__dirname}/../.env`;
    const isExist = fs.existsSync(pathEnv);
    if(!isExist){
        console.log(`🆗 ATENCION! 🆗 te falta crear tu archivo .env de lo contrario no funcionara`)
    }
}

const generateImage = (base64, cb = () => {}) => {
    let qr_svg = qr.image(base64, { type: 'svg', margin: 4 });
    qr_svg.pipe(require('fs').createWriteStream('./mediaSend/qr-code.svg'));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
    cb()
}


const createClient =  (session = {}, login = false) => {
    console.log(`Mode: ${(MULTI_DEVICE === 'false') ? 'No Multi-device' : 'Si Multi-device'} `)
    const objectLegacy = (login) ? {
        authStrategy: new LegacySessionAuth({
            session
        })
    } : {session};

    if(MULTI_DEVICE == 'false') {
       return {...objectLegacy,
        restartOnAuthFail: true,
        puppeteer: {
            args: [
                '--no-sandbox'
            ],
        }
    }
    }else{
        return {
            puppeteer: { 
                headless: true, 
                args: ['--no-sandbox'] 
            }, 
            clientId: 'client-one' 
        }
    }
}

module.exports = {cleanNumber,createClient, generateImage, checkEnvFile}