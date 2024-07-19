import { promises as fs } from 'node:fs';
import { pdf } from 'pdf-to-img';
import express from 'express';
import fileUpload from 'express-fileupload';

const app = express();

async function convertPDF(pdfPath, storagePath, nameFunction, scale = 2) {
    let counter = 0;
    const document = await pdf(pdfPath, { scale: 3 });
    for await (const image of document) {
        await fs.writeFile(`${storagePath}/${nameFunction(counter)}.png`, image);
        counter++;
    }
}

app.use(express.static('public'));
app.use(fileUpload());


app.post('/upload', async (req, res) => {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    uploadPath = sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
        return res.status(500).send(err);
        res.send('File uploaded!');
    });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
