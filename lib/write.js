'use strict';

var AdapterWrite = require('juttle/lib/runtime/adapter-write');
var S3Client = require('./s3-client');

class WriteS3 extends AdapterWrite {
    constructor(options, params) {
        super(options, params);
        this.client = new S3Client(options);
    }

    write(points) {
        this.client.write(points);
    }

    eof() {
        return this.client.end_write();
    }
}

module.exports = WriteS3;
