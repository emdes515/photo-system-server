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

async function getImageDimensions(file) {
	const image = sharp(file)
	const metadata = await image.metadata()
	return {
		width: metadata.width,
		height: metadata.height,
	}
}

async function generateJson(dirPath) {
	const files = getFiles(dirPath)

	const json = files.map(async (file) => {
		const relativePath = path.relative(dirPath, file)
		const dimensions = await getImageDimensions(file)
		return {
			url: `http://${IpServera}:${port}/img/${relativePath}`,
			subfolder: path.dirname(relativePath),
			width: dimensions.width,
			height: dimensions.height,
		}
	})

	return {
		a: 'name',
	}
}

app.get('/files', (req, res) => {
	console.log('GET /files')
	res.send(generateJson(directoryPath))
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})
