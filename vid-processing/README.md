# Video-Processing

This project provides a video processing service that leverages Docker for deployment. For environments where Docker is not available, the following dependencies must be installed to ensure the service operates correctly:

## Dependencies Without Docker

To run the service without Docker, ensure you have the following installed:

- **FFmpeg**: Required for processing videos on the command line. FFmpeg is a complete, cross-platform solution to record, convert and stream audio and video.
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine. It's necessary for running the service's backend.
- **Google Cloud Storage SDK**: To upload and download videos to and from Google Cloud Storage, the Google Cloud Storage SDK for Node.js is required.

## General Flow of the Service

1. **Upload Trigger**: A user uploads a video to Google Cloud Storage.
2. **Notification**: The video processing service is notified of the upload via Cloud Pub/Sub.
3. **Download Video**: The video processing service downloads the video from Google Cloud Storage.
4. **Process Video**: Using FFmpeg, the video is processed according to the specified requirements (e.g., format conversion, resizing, etc.).
5. **Upload Processed Video**: The processed video is uploaded back to Google Cloud Storage.

## Setting Up the Environment

### Installing FFmpeg

- **Linux**: Use your distribution's package manager (e.g., `apt-get install ffmpeg` on Ubuntu).
- **macOS**: Use Homebrew with `brew install ffmpeg`.
- **Windows**: Download and extract the binaries from the FFmpeg website and add the bin folder to your system's PATH.

### Installing Node.js

Download and install Node.js from its [official website](https://nodejs.org/). Ensure that `npm`, Node.js's package manager, is also installed.

### Configuring Google Cloud Storage SDK

1. Install the Google Cloud Storage SDK for Node.js by running `npm install @google-cloud/storage`.
2. Set up authentication by creating a service account with the necessary permissions to access Google Cloud Storage. Download the JSON key file for this account.
3. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON key file. This allows your application to authenticate with Google Cloud services.

## Running the Service

Ensure all environment variables and dependencies are correctly set up before starting the service. If using Docker, build the Docker image and run it with the appropriate environment variables. For non-Docker environments, start the service using Node.js:

```bash
node app.js
