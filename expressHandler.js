const express = require('express')
const http = require('http');
//const https = require('https')
const server = require('./server/main')

module.exports = {
    init: function () {
        /*var credentials = {
            secureProtocol: 'SSLv23_method',
            secureOptions: require('constants').SSL_OP_NO_SSLv3,
            key: process.env.SERVER_KEY.replace(/\\n/g, '\n'),
            cert: process.env.SERVER_CRT.replace(/\\n/g, '\n')
        }*/
        const app = express()
        var httpServer = http.createServer(app)
        //var httpsServer = https.createServer(credentials, app)

        // body parsing
        app.use(express.urlencoded({
            extended: true
        }))
        app.use(express.json())

        // application serving
        app.use('/', express.static('webapp/index.html'))
        app.use('/index.html', express.static('webapp/index.html'))
        app.use('/webapp', express.static('webapp'))
        
        // server requests of the app
        app.post('/myranorbot/validateuser', function (req, res) {
            server.validateUsertoken(req, res)
        })
        app.post('/myranorbot/check/attribute', function (req, res) {
            server.checkAttribute(req, res)
        })
        app.post('/myranorbot/check/skill', function (req, res) {
            server.checkSkill(req, res)
        })
        app.post('/myranorbot/check/spell', function (req, res) {
            server.checkSpell(req, res)
        })
        app.get('/myranorbot/character', function (req, res) {
            server.getCharacter(req, res)
        })

        const PORT = process.env.PORT;

        /*httpsServer.listen(process.env.PORT, function(){
            console.log(`HTTPS: express server running at port ${process.env.PORT}`)
        })*/
        
        httpServer.listen(PORT, function(){
            console.log(`HTTP: express server running at port ${PORT}`)
        })
    }
}
