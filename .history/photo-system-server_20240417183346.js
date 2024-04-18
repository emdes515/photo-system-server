const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const port = 3000

const directoryPath = path.join(__dirname, './images')

app.use(cors())

app.get('/files', (req, res) => {
	//const directoryPath = path.join(__dirname, 'your_directory'); // Zmień 'your_directory' na ścieżkę do twojego folder
	function getFiles(dirPath) {
		let results = []
		const list = fs.readdirSync(dirPath)

		list.forEach(function (file) {
			file = path.join(dirPath, file)
			const stat = fs.statSync(file)

			if (stat && stat.isDirectory()) {
				results = results.concat(getFiles(file))
			} else {
				results.push(file)
			}
		})

		return results
	}

	function generateJson(dirPath) {
		const files = getFiles(dirPath)
		const json = files.map((file) => {
			return {
				path: file,
				subfolder: path.dirname(file).replace(dirPath, ''),
			}
		})

		return JSON.stringify(json, null, 2)
	}

	res.send(g)
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})
