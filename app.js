const express = require('express');
const app = express();
const fs = require('fs');

//sends back home page when accessing app
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/video', (req, res) => {
    const range = req.headers.range;
    if(!range) {
        res.status(400).send('requires range header');
    }
    const videoPath = 'pills.mp4';
    
    //gets the size of the video using file system module
    const videoSize =  fs.statSync('pills.mp4').size;

    //Parse Range
    //Example: bytes=32324-
    //request header is the video starting at x bytes until the end
    //but we'll only send back partions at a time, until the video is fully sent

    //this is the amount of bytes we'll be sending back
    const CHUNK_SIZE = 10**6 // 1MB 1million bytes
    const start = Number(range.replace(/\D/g, "")); //extracts starting byte from range header
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1); //calculates the end byte we're sending

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    }

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, {
        start,
        end
    });

    videoStream.pipe(res);


});

app.listen(3000, () => {
    console.log('listening on port 3000');
});

