const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const { v4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const app = express();

const port = 3000;

//zmień w razie potrzeby
const IpServera = '127.0.0.1';

const directoryPath = path.join(__dirname, './images');

app.use(cors());

app.get('/files', async (req, res) => {
	res.send(result);
});

app.use('/img', express.static(directoryPath));

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
	console.log(`Ustawiono scieżkę do foldderu na: ${directoryPath}`);
});
