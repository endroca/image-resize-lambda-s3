"use strict";

const AWS = require("aws-sdk");
const sharp = require("sharp");

const S3 = new AWS.S3();

module.exports.handle = async (data) => {
  try {
    await Promise.all(
      data.files.map(async (file) => {
        const { key } = file;

        const image = await S3.getObject({
          Bucket: data.bucket,
          Key: key,
        }).promise();

        // 1280, 720, { fit: "inside", withoutEnlargement: true }
        // "jpeg", { progressive: true, quality: 50 }
        const optimized = await sharp(image.Body)
          .resize(data.resize)
          .toFormat(data.format)
          .toBuffer();

        await S3.putObject({
          Body: optimized,
          Bucket: data.bucket,
          ContentType: "image/jpeg",
          Key: key,
        }).promise();
      })
    );

    return {
      statusCode: 301,
      body: {},
    };
  } catch (err) {
    return err;
  }
};
