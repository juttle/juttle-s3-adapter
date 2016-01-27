'use strict';

var AdapterWrite = require('juttle/lib/runtime/adapter-write');
var S3Client = require('./s3-client');

class WriteS3 extends AdapterWrite {
    constructor(options, params) {
        super(options, params);
        this.client = new S3Client(options);
        this.points = [];
    }

    write(points) {
        this.points = this.points.concat(points);
    }

    eof() {
        return this.client.write(this.points);
    }
}

module.exports = WriteS3;
