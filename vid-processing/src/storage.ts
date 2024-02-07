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

/**
 * Creates local directories for raw / processed videos
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVids);
    ensureDirectoryExistence(localProcessedVids);
}

/**
 * Converts video
 * @param rawVidName - name of the file to convert
 * @param processedVidName - name of the file to convert
 * @returns A promise that resolves when the video has been converted
 */
export function convertVideo(rawVidName: string, processedVidName: string) {
    // promise to check for error on runtime
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
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({
            destination: `${localRawVids}/${fileName}`
        })
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVids}/${fileName}`);
}

/**
 * @param fileName - The name of the file to upload into the bucket
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(proccedVideoBucketName);

    await storage.bucket(proccedVideoBucketName)
        .upload(`${localProcessedVids}/${fileName}`, {
            destination: fileName,
        });
    console.log(`${localProcessedVids}/${fileName} Uploaded to gs://${proccedVideoBucketName}/${fileName}`);

    await bucket.file(fileName).makePublic();
}

/**
 * Deletes the video once we are done with it
 * @param fileName file to delete
 */
export function deleteLocalVideo(fileName: string) {
    return deleteFile(`${localRawVids}/${fileName}`);
}

/**
 *  Deletes the video once we are done with it
 *  @param fileName file to delete
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVids}/${fileName}`)
}

/** 
 * Deletes the video once we are done with it
 * @param fileName file to delete
 */
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

/**
 * checks if dir is existent, if not creates new directory
 * @param path to check
 */
function ensureDirectoryExistence(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true }); // recursive: true enables creating nested directories
        console.log(`Directory created at ${path}`);
    }
}