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
	async function getImageDimensions(file) {
		const image = sharp(file)
		const metadata = await image.metadata()
		return {
			width: metadata.width,
			height: metadata.height,
		}
	}

	function getFilesAndDirectories(dirPath) {
		let files = []
		let directories = []
		const list = fs.readdirSync(dirPath)

		list.forEach(function (item) {
			item = path.join(dirPath, item)
			const stat = fs.statSync(item)

			if (stat && stat.isDirectory()) {
				directories.push(item)
				const result = getFilesAndDirectories(item)
				files = files.concat(result.files)
				directories = directories.concat(result.directories)
			} else {
				files.push(item)
			}
		})

		return { files, directories }
	}

	async function generateJson(dirPath) {
		const { files, directories } = getFilesAndDirectories(dirPath)
		const jsonPromises = files.map(async (file) => {
			const dimensions = await getImageDimensions(file)
			const relativePath = path.relative(dirPath, file)
			return {
				url: `http://${IpServera}:${port}/img/${relativePath}`,
				subfolder: path.dirname(relativePath),
				width: dimensions.width,
				height: dimensions.height,
			}
		})

		const json = await Promise.all(jsonPromises)
		const directoriesJson = directories.map((directory) => {
			return {
				path: path.resolve(directory),
				subfolder: path.dirname(directory).replace(dirPath, ''),
			}
		})
		return { files: json, directories: directoriesJson }
	}

	res.send(await generateJson(directoryPath))
})

app.use('/img', express.static(directoryPath))

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`)
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`)
})
