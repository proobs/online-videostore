import express from 'express';
import {
    setupDirectories,
    deleteLocalVideo,
    deleteProcessedVideo,
    convertVideo,
    downloadRawVideo,
    uploadProcessedVideo,
} from "./storage";

setupDirectories();
const app = express()
app.use(express.json());

const port = process.env.PORT || 3000;


app.post("/process-video", async (req, res) => {
    let data;

    try {
        const msg = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(msg);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send("Bad request: Missing filename");
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    await downloadRawVideo(inputFileName);
    // process the video
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (error) {
        // if theres an error delete the videos
        await Promise.all([
            deleteLocalVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        return res.status(500).send("processing failed")
    }

    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteLocalVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send("Sucessfully processed the video");
})

app.listen(port, () => {
    console.log(`Video processing listening @ http://localhost:${port}`);
});