import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express()
app.use(express.json());

const port = process.env.PORT || 3000;


app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || outputFilePath) {
        res.status(400).send("Error: Missing file path");
    }


})

app.listen(port, () => {
    console.log(`Video processing listening @ http://localhost:${port}`);
});