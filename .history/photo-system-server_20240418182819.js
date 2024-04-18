const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const { log } = require('console');

const app = express();
const port = 3000;

//zmień w razie potrzeby
const IpServera = '127.0.0.1';

const directoryPath = path.join(__dirname, './images');

app.use(cors());

app.get('/files', async (req, res) => {
	const fs = require('fs');
	const path = require('path');
	const sharp = require('sharp');

	async function getFileData(file, dirPath, serverAddress, serverPort) {
		const relativePath = path.relative(dirPath, file);
		const url = `http://${IpServera}:${port}/img/${relativePath}`;
		let width = null;
		let height = null;

		if (file.endsWith('.jpg') || file.endsWith('.png')) {
			const image = sharp(file);
			const metadata = await image.metadata();
			width = metadata.width;
			height = metadata.height;
		}

		const stats = fs.statSync(file);

		return {
			name: path.basename(file),
			path: relativePath,
			url,
			width,
			height,
			metadata: stats,
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

	function exploreDirectory(dirPath, rootPath, serverAddress, serverPort) {
		const result = {
			files: [],
			directories: {},
			ancestors: getAncestors(dirPath, rootPath),
			path: path.relative(rootPath, dirPath),
		};

		const items = fs.readdirSync(dirPath);

		const filePromises = items.map(async (item) => {
			const fullPath = path.join(dirPath, item);
			const stat = fs.statSync(fullPath);

			if (stat && stat.isDirectory()) {
				result.directories[item] = exploreDirectory(fullPath, rootPath, serverAddress, serverPort);
			} else {
				const fileData = await getFileData(fullPath, dirPath, serverAddress, serverPort);
				result.files.push(fileData);
			}
		});

		return Promise.all(filePromises).then(() => result);
	}

	const result = await exploreDirectory(directoryPath, directoryPath);

	res.send(result);
});

app.use('/img', express.static(directoryPath));

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`);
});
