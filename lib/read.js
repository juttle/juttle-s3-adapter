'use strict';

/* global JuttleAdapterAPI */
var AdapterRead = JuttleAdapterAPI.AdapterRead;
var JuttleMoment = JuttleAdapterAPI.types.JuttleMoment;

var S3Client = require('./s3-client');

class ReadS3 extends AdapterRead {
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

    defaultTimeOptions() {
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
                    eof: true
                };
            });
    }
}

module.exports = ReadS3;
