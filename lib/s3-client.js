'use strict';

var Promise = require('bluebird');
var Stream = require('stream');
var AWS = require('aws-sdk');
var parsers = require('juttle/lib/adapters/parsers');

var DEFAULT_CONFIG = {};

class S3Client {
    static init(config) {
        DEFAULT_CONFIG = config;
    }

    constructor(options) {
        var accessKeyId = options.accessKeyId || DEFAULT_CONFIG.accessKeyId;
        var secretAccessKey = options.secretAccessKey || DEFAULT_CONFIG.secretAccessKey;
        var region = options.region || DEFAULT_CONFIG.region;

        this.set_or_throw('bucket', options.bucket);
        this.set_or_throw('key', options.key);

        this.parser = parsers.getParser('json');
        this.client = Promise.promisifyAll(new AWS.S3({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region
        }));
    }

    set_or_throw(option, value) {
        if (!value) {
            throw new Error('S3Client missing required option ' + option);
        }

        this[option] = value;
    }

    read(limit) {
        return new Promise((resolve, reject) => {
            var points = [];
            var request = this.client.getObject({
                Bucket: this.bucket,
                Key: this.key,
            });

            request.on('httpHeaders', (statusCode, headers, resp) => {
                if (statusCode >= 300) {
                    throw (new Error("http status code " + statusCode));
                }

                var httpStream = resp.httpResponse.createUnbufferedStream();
                this.parser.parseStream(httpStream, (pts) => {
                    points = points.concat(pts);
                })
                .then(function() {
                    resolve(points.slice(0, limit));
                });
            });

            request.on('error', reject);
            request.send();
        });
    }

    write(points) {
        var data = JSON.stringify(points);
        var stream = new Stream.Readable();
        stream.push(data);
        stream.push(null);
        stream.length = data.length;

        return this.client.putObjectAsync({
            Bucket: this.bucket,
            Key: this.key,
            Body: stream
        });
    }
}

module.exports = S3Client;
