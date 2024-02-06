import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

// Google Cloud Storage names must be unique
const rawVideoBucketName = "pr-raw-videos";
const proccedVideoBucketName = "pr-processed-videos";

const localRawVids = "./raw-videos";
const localProcessedVids = './processed-videos';

const scale = process.env.SCALE || '-1:360';

/*
 * Creates local directories for raw / processed videos
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/*
 * CONVERTS VID
 * @param rawVidName - name of the file to convert
 * @param processedVidName - name of the file to convert
 * @returns A promise that resolves when the video has been converted
 */
export function convertVideo(rawVidName: string, processedVidName: string) {
    return new Promise<void>((res, reject) => {
        ffmpeg(`${localRawVids}/${rawVidName}`)
            .outputOptions('-vf', `scale=${scale}}`)
            .on('end', () => {
                console.log("Processing finished successfully.");
            })
            .on('error', (err) => {
                console.log(`An error occured: ${err.message}`);
            })
            .save(`${localProcessedVids}/${processedVidName}`);
    })
}

/**
 * @param fileName - The name of the file to download from the 
 * rawVideoBucketName bucket into the localRawVideoPath folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    const bucket = storage.bucket(proccedVideoBucketName);

    await storage.bucket(proccedVideoBucketName)
        .upload(`${localProcessedVids}/${fileName}`, {
            destination: fileName,
        });
    console.log(`${localProcessedVids}/${fileName} Uploaded to gs://${proccedVideoBucketName}/${fileName}`);

    await bucket.file(fileName).makePublic();
}

/* 
 * Deletes the video once we are done with it
 * 
 */
export function deleteLocalVideo(fileName: string) {
    return deleteFile(`${localRawVids}/${fileName}`);
}

/*
 *  Deletes the video once we are done with it
 *
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVids}/${fileName}`)
}

function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            });
        } else {
            console.log(`File not found at ${filePath}, skipping delete.`);
            resolve();
        }
    });
}
