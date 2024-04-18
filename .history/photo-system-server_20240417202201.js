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
		const relativePath = path.relative(dirPath, file)
		return {
			url: `http://${IpServera}:${port}/img/${relativePath}`,
			subfolder: path.dirname(relativePath),
		}
	})

	return json
}

app.get('/files', (req, res) => {
	res.send(generateJson(directoryPath))
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})
