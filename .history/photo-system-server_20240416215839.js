const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const port = 3000

const directoryPath = path.join(__dirname, './images')

app.use(cors())

app.get('/files', (req, res) => {
	//const directoryPath = path.join(__dirname, 'your_directory'); // Zmień 'your_directory' na ścieżkę do twojego folderu

	fs.readdir(directoryPath, (err, files) => {
		if (err) {
			return res.status(500).send('Wystąpił błąd podczas odczytywania plików')
		}

		let fileUrls = []
		function walkDir(currentPath) {
			const files = fs.readdirSync(currentPath)
			for (const file of files) {
				const curFile = path.join(currentPath, file)
				if (fs.statSync(curFile).isFile()) {
					fileUrls.push(`http://${req.headers.host}/img/${path.relative(directoryPath, curFile)}`)
				} else if (fs.statSync(curFile).isDirectory()) {
					walkDir(curFile)
				}
			}
		}

		walkDir(directoryPath)

		res.send(fileUrls)
	})
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})
