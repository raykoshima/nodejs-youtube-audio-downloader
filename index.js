const { exec } = require('child_process');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());


function validateBearerToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== 'raykoTH.007') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    next();
}

app.post('/download', validateBearerToken, (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const params = url.split('&')[0];

    // const command = `yt-dlp -f best -o "${outputTemplate}" --get-url "${url}" --cookies cookies.txt`;
    const filename = uuidv4();
    const output = `downloads/${filename}.mp3`;
    const command = `yt-dlp -x --audio-format mp3 -o "${output}" --get-url "${params}" --cookies cookies.txt`;
    // const command = `yt-dlp -o "${output}" --get-url "${params}" --cookies cookies.txt`; // video

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }

        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }

        const downloadableUrl = stdout.trim(); // url return by yt-dlp
        console.log(`Downloadable URL: ${downloadableUrl}`);
        res.json({ message: 'Downloadable URL retrieved', url: downloadableUrl });
    });
});

const PORT = 6789;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
