'use strict';

var AdapterRead = require('juttle/lib/runtime/adapter-read');
var S3Client = require('./s3-client');
var JuttleMoment = require('juttle/lib/moment').JuttleMoment;

class ReadS3 extends AdapterRead {
    static get timeRequired() { return false; }

    constructor(options, params) {
        super(options, params);
        this.client = new S3Client(options);
    }

    defaultTimeRange() {
        return {
            from: new JuttleMoment(0),
            to: new JuttleMoment(Infinity)
        };
    }

    read(from, to, limit, state) {
        return this.client.read(limit)
            .then(function(points) {
                return {
                    points: points,
                    readEnd: to
                };
            });
    }
}

module.exports = ReadS3;
