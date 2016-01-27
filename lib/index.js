var S3Client = require('./s3-client');

function S3Adapter(config) {
    S3Client.init(config);

    return {
        name: 's3',
        read: require('./read'),
        write: require('./write')
    };
}

module.exports = S3Adapter;
