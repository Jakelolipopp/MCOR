const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const PDFImage = require("pdf-image").PDFImage;
const app = express();

const USERS = JSON.parse(fs.readFileSync('users')); // In-memory user store for simplicity

app.use(express.static('public'));
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

// Simple authentication middleware
function authMiddleware(req, res, next) {
    if (req.session.user) {
        console.log(`User authenticated: ${req.session.user}`);
        next();
    } else {
        console.log('User not authenticated');
        res.redirect('/login');
    }
}

// Serve the main page
app.get('/', authMiddleware, (req, res) => {
    console.log('Serving main page');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the view page
app.get('/view', authMiddleware, (req, res) => {
    console.log('Serving view page');
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
}); 

// Login endpoint
app.get('/login', (req, res) => {
    console.log('Serving login page');
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);
    if (USERS[username] && USERS[username].password === password) {
        req.session.user = username;
        console.log(`User ${username} logged in successfully`);
        res.redirect('/');
    } else {
        console.log(`Login failed for user: ${username}`);
        res.redirect('/login');
    }
});

// Register endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log(`Register attempt for user: ${username}`);
    if (!USERS[username]) {
        USERS[username] = { password, files: [] };
        console.log(`User ${username} registered successfully`);
        fs.writeFile('users', JSON.stringify(USERS), (err) => {});
        res.redirect('/login');
    } else {
        console.log(`Registration failed for user: ${username} (already exists)`);
        res.send('User already exists');
    }
});

// Upload endpoint
app.post('/upload', authMiddleware, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded.');
        return res.status(400).send('No files were uploaded.');
    }

    const pdfFile = req.files.pdf;
    const userDir = path.join(__dirname, 'upload', req.session.user);
    const uploadPath = path.join(userDir, pdfFile.name);

    if (!fs.existsSync(userDir)) {
        console.log(`Creating user directory: ${userDir}`);
        fs.mkdirSync(userDir, { recursive: true });
    }

    pdfFile.mv(uploadPath, async (err) => {
        if (err) {
            console.log(`Error moving file: ${err}`);
            return res.status(500).send(err);
        }

        const imgDir = path.join(userDir, path.parse(pdfFile.name).name);
        if (!fs.existsSync(imgDir)) {
            console.log(`Creating image directory: ${imgDir}`);
            fs.mkdirSync(imgDir);
        }

        try {
            const pdfImage = new PDFImage(uploadPath, {
                outputDirectory: imgDir,
                convertOptions: {
                    "-quality": "100",
                    "-resize": "800x600"
                }
            });
            await pdfImage.convertFile();

            USERS[req.session.user].files.push({ user: req.session.user, pdf: pdfFile.name, images: imgDir });
            fs.writeFile('users', JSON.stringify(USERS), (err) => {});
            console.log(`File uploaded and converted: ${pdfFile.name}`);
            res.send('File uploaded and converted!');
        } catch (err) {
            console.log(`Error converting file: ${err}`);
            res.status(500).send(err);
        }
    });
});

// View PDFs endpoint
app.get('/files', authMiddleware, (req, res) => {
    console.log(`Fetching files for user: ${req.session.user}`);
    const userFiles = USERS[req.session.user].files;
    res.json(userFiles);
});

// Serve images and PDFs
app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.get('/upload/:user/:file', authMiddleware, (req, res) => {
    const user = req.params.user;
    const file = req.params.file;
    const filePath = path.join(__dirname, 'upload', user, file);

    console.log(`Serving file for user: ${user}, file: ${file}`);
    if (fs.existsSync(filePath)) {
        console.log(`File found: ${filePath}`);
        res.sendFile(filePath);
    } else {
        console.log(`File not found: ${filePath}`);
        res.status(404).send('File not found');
    }
});

// Endpoint to get images for viewing
app.get('/images', authMiddleware, (req, res) => {
    const user = req.query.user;
    const file = req.query.file;
    const imgDir = path.join(__dirname, 'upload', user, path.parse(file).name);
    console.log(`Fetching images for user: ${user}, file: ${file}`);

    if (fs.existsSync(imgDir)) {
        const images = fs.readdirSync(imgDir).map(img => `/upload/${user}/${path.parse(file).name}/${img}`);
        res.json(images);
    } else {
        console.log(`Image directory not found: ${imgDir}`);
        res.status(404).send('Images not found');
    }
});

// Logout endpoint
app.get('/logout', (req, res) => {
    console.log(`User logged out: ${req.session.user}`);
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});
