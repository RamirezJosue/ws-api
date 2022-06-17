require('dotenv').config();
const fs = require('fs');

const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { connectionReady, connectionLost } = require('./controller/connection');
const { createClient, checkEnvFile, generateImage } = require('./controller/handle');
const { middlewareClient } = require('./middleware/client');
const { sendMessage, sendMedia } = require('./controller/send');

const app = express();
app.use(cors());
app.use(express.json());
const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true';
const server = require('http').Server(app);

const port = process.env.PORT || 3000
const SESSION_FILE_PATH = './session.json';
var client;
var sessionData;

// app.use('/api', require('./routes/api'));

const listenMessage = () => client.on('message', async msg => {
    const { from, body, hasMedia } = msg;
    console.log('entrando mensaje from', from);
    console.log('entrando mensaje body', body);
    console.log('entrando mensaje hasMedia', hasMedia);

});

/**
 * Revisamos si tenemos credenciales guardadas para inciar sessio
 * este paso evita volver a escanear el QRCODE
 */
const withSession = () => {
    console.log(`Validando session con Whatsapp...`)
    sessionData = require(SESSION_FILE_PATH);
    client = new Client(createClient(sessionData, true));
    client.on('ready', () => {
        connectionReady();
        listenMessage();
    });

    client.on('auth_failure', () => connectionLost())

    client.initialize();
}


/**
 * Generamos un QRCODE para iniciar sesion
 */

const withOutSession = () => {
    console.log('No tenemos session guardada');
    console.log([
        '🙌 El core de whatsapp se esta actualizando',
        '🙌 para proximamente dar paso al multi-device',
        '🙌 falta poco si quieres estar al pendiente unete',
        '🙌 celular 51973550077',
        '🙌 Si estas usando el modo multi-device se generan 2 QR Code escanealos',
        '🙌 Ten paciencia se esta generando el QR CODE',
        '________________________',
    ].join('\n'));

    client = new Client(createClient());
    // middlewareClient(client);
    client.on('qr', qr => generateImage(qr, () => {
        qrcode.generate(qr, { small: true });
        console.log(`Ver QR http://localhost:${port}/qr`)
        socketEvents.sendQR(qr)
    }))

    client.on('ready', (a) => {
        connectionReady()
        listenMessage()
        // socketEvents.sendStatus(client)
    });

    client.on('auth_failure', (e) => {
        // console.log(e)
        // connectionLost()
    });

    client.on('authenticated', (session) => {
        sessionData = session;
        if (sessionData) {
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
                if (err) {
                    console.log(`Ocurrio un error con el archivo: `, err);
                }
            });
        }
    });

    client.initialize();
}


app.post('/api/send', async (req, res, next) => {
    try {
        if (!client.info) {
            return res.status(405).json({message: 'Por favor autenticarse con qr'})
        }
        const { number, message,  fileName} = req.body; // Get the body
        const archivo = await sendMedia(client, number, fileName);
        if (!archivo) {
            return res.status(405).json({message: 'No existe un archivo con ese nombre'});
        };
        await sendMessage(client, number, message);
        res.json({
            message: 'Mensaje enviado!'
        });
    } catch (error) {
        res.send({error})
    }
});


(fs.existsSync(SESSION_FILE_PATH) && MULTI_DEVICE === 'false') ? withSession() : withOutSession();

server.listen(port, () => {
    console.log(`El server esta listo por el puerto ${port}`);
});


checkEnvFile();