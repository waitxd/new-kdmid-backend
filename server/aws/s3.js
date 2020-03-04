const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');

const S3_BUCKET = 'assets.new-kdmid';
// configure the keys for accessing AWS
AWS.config.update({
  accessKeyId: 'AKIATVMGUWYGVF3CCXWJ',
  secretAccessKey: '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',
});

const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const upload = (buffer, key) => {
  const type = fileType(buffer);
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: S3_BUCKET,
    ContentType: type.mime,
    Key: key,
  };
  return s3.upload(params).promise();
};

const uploadPDF = (buffer, name) => {
  upload(buffer, `PDF/${name}`);
};

const downloadFile = (filePath, key) => new Promise((resolve, reject) => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key
  };
  s3.getObject(params, (err, data) => {
    if (err) reject(err);
    fs.writeFileSync(filePath, data.Body);
    resolve('successed to download file');
  });
});

// console.log('for testing')
// downloadFile('customer.jpeg', 'images/1568645360766-lg.jpg').then((res) => console.log(res)).catch(err => console.log(err))

exports.downloadFile = downloadFile;
exports.uploadPDF = uploadPDF;
