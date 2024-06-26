const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const exifParser = require('exif-parser');
const iptcParser = require('node-iptc');
const xmpReader = require('xmp-reader');
const crypto = require('crypto');

const app = express();
const port = 3000;

//zmień w razie potrzeby
const IpServera = '127.0.0.1';

const directoryPath = path.join(__dirname, './images');

app.use(cors());

function getFolderId(folderPath) {
	const hash = crypto.createHash('sha256');
	hash.update(folderPath);
	return hash.digest('hex');
}

async function getFileData(file, dirPath, rootPath, serverAddress, serverPort) {
	const relativePath = path.relative(rootPath, file);

	const url = `http://${IpServera}:${port}/img/${relativePath}`;
	let width = null;
	let height = null;
	let metadata = null;
	let exif = null;

	if (file.endsWith('.jpg') || file.endsWith('.png')) {
		const image = sharp(file);
		const metadata = await image.metadata();
		width = metadata.width;
		height = metadata.height;

		const buffer = fs.readFileSync(file);
		exif = exifParser.create(buffer).parse().tags;
	}
	return {
		name: path.basename(file),
		path: relativePath,
		url,
		width,
		height,
		metadata: exif,
		isInCart: false,
	};
}

function getAncestors(dirPath, rootPath) {
	const ancestors = [];
	let currentPath = dirPath;

	while (currentPath !== rootPath) {
		const parentPath = path.dirname(currentPath);
		ancestors.push(path.basename(currentPath));
		currentPath = parentPath;
	}

	return ancestors.reverse();
}

async function exploreDirectory(dirPath, rootPath) {
	const result = {
		id: getFolderId(dirPath),
		files: [],
		directories: {},
		ancestors: getAncestors(dirPath, rootPath),
		path: path.relative(rootPath, dirPath),
	};

	const items = fs.readdirSync(dirPath);

	for (const item of items) {
		const fullPath = path.join(dirPath, item);
		const stat = fs.statSync(fullPath);

		if (stat && stat.isDirectory()) {
			result.directories[item] = await exploreDirectory(fullPath, rootPath, IpServera, port);
		} else {
			const fileData = await getFileData(fullPath, dirPath, rootPath);
			result.files.push(fileData);
		}
	}

	return result;
}

app.get('/files', async (req, res) => {
	const result = await exploreDirectory(directoryPath, directoryPath);

	res.send(result);
});

app.use('/img', express.static(directoryPath));

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`);
});
