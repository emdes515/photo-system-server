const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const sharp = require('sharp')
const { log } = require('console')

const app = express()
const port = 3000

//zmień w razie potrzeby
const IpServera = '127.0.0.1'

const directoryPath = path.join(__dirname, './images')

app.use(cors())

app.get('/files', async (req, res) => {
exploreDirectory(directoryPath, directoryPath).then((json) =>
	console.log(JSON.stringify(json, null, 2))
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})
