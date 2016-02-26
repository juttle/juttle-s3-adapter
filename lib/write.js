'use strict';

/* global JuttleAdapterAPI */
var AdapterWrite = JuttleAdapterAPI.AdapterWrite;

var S3Client = require('./s3-client');

class WriteS3 extends AdapterWrite {
    constructor(options, params) {
        super(options, params);
        this.client = new S3Client(options);
    }

    static allowedOptions() {
        return ['bucket', 'key', 'format'];
    }

    static requiredOptions() {
        return ['bucket', 'key'];
    }

    write(points) {
        this.client.write(points);
    }

    eof() {
        return this.client.end_write();
    }
}

module.exports = WriteS3;
