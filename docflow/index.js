const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const pdfPoppler = require('pdf-poppler');
const path = require('path');
const app = express();

app.use(express.static('docFlow/public'));
app.use(express.json());

app.post('/upload/', (req, res) => {
	if (!(req.files))
		return;
    var file = req.files.file;
	var Fname = req.body.text;
	var filename = file.name;
	
    file.mv("docFlow/uploads/" + filename, function (err) {
    if (err) {
    } else {
    	res.send("<body style='background-color: grey;'><p>Ur file " + Fname + " is uploaded! ;D</p><a href=\"../file?name=" + filename + "\">../file?name=" + filename + "</a></body>");
    	}
    });
});

module.exports = app;
