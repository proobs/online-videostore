import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express()
app.use(express.json());

const port = process.env.PORT || 3000;
const scale = process.env.SCALE || '-1:360';

app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || outputFilePath) {
        res.status(400).send("Error: Missing file path");
    }

    ffmpeg(inputFilePath).outputOptions('-vf', `scale=${scale}}`)
        .on('end', () => {
            res.status(200).send("Processing finished successfully.");
        })
        .on('error', (err) => {
            console.log(`An error occured: ${err.message}`);
            res.status(500).send(`Internal server error: ${err.message}`);
        })
        .save(outputFilePath);

})

app.listen(port, () => {
    console.log(`Video processing listening @ http://localhost:${port}`);
});