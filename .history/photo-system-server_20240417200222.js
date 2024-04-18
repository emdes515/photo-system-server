const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const port = 3000

//zmień w razie potrzeby
const IpServera = '127.0.0.1'

const directoryPath = path.join(__dirname, './images')

app.use(cors())

app.get('/files', (req, res) => {
	//const directoryPath = path.join(__dirname, 'your_directory'); // Zmień 'your_directory' na ścieżkę do twojego folder


	function generateJson(dirPath) {
		const files = getFiles(dirPath)
		const json = files.map((file) => {
			const relativePath = path.relative(dirPath, file)
			return {
				url: `http://${IpServera}:${port}/img/${relativePath}`,
				subfolder: path.dirname(relativePath),
			}
		})

		return json
	}

	res.send(generateJson(directoryPath))
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})