const axios = require("axios");
const AWS = require("aws-sdk");
const S3UploadStream = require("s3-upload-stream");

const transfer_recording = async (context, download_url, upload_stream) => {
  const res = await axios({
    method: "GET",
    url: download_url,
    responseType: "stream",
    auth: {
      username: context.ACCOUNT_SID,
      password: context.AUTH_TOKEN,
    },
  });
  res.data.pipe(upload_stream);
  return new Promise((resolve, reject) => {
    upload_stream.on("uploaded", resolve);
    upload_stream.on("error", (error) => reject(error));
  });
};

exports.handler = async function (context, event, callback) {
  try {
    if (event.RecordingStatus !== "completed") {
      throw new Error("Not completed.");
    }

    const download_url = `${event.RecordingUrl}.mp3`;
    const upload_path = `${context.AWS_S3_PREFIX}/${event.CallSid}_${event.RecordingSid}.mp3`;

    // Initialize AWS configure
    AWS.config.update({
      region: context.AWS_REGION,
      credentials: new AWS.Credentials(
        context.AWS_ACCESS_KEY,
        context.AWS_SECRET_ACCESS_KEY
      ),
    });

    let s3Stream = S3UploadStream(new AWS.S3());

    let upload_stream = s3Stream.upload({
      Bucket: context.AWS_S3_BUCKET,
      Key: upload_path,
      ContentType: "audio/mpeg",
    });

    console.log(`Transferring ${event.CallSid} to ${upload_path}`);
    await transfer_recording(context, download_url, upload_stream);

    const client = context.getTwilioClient();
    await client.recordings(event.RecordingSid).remove();

    callback(null, "Transfer completed.");
  } catch (err) {
    callback(err);
  }
};
