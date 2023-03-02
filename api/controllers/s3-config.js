const aws = require("aws-sdk");

const s3 = new aws.S3({
    signatureVersion: "v4",
    region: process.env.S3_REGION,
  });

module.exports = {
    s3
}