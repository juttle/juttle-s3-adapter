'use strict';

var Promise = require('bluebird');
var _ = require('underscore');
var Stream = require('stream');
var AWS = require('aws-sdk');
var parsers = require('juttle/lib/adapters/parsers');
var serializers = require('juttle/lib/adapters/serializers');

var DEFAULT_CONFIG = {
    format: 'json'
};

class S3Client {
    static init(config) {
        _.extend(DEFAULT_CONFIG, config);
    }

    constructor(options) {
        var accessKeyId = options.accessKeyId || DEFAULT_CONFIG.accessKeyId;
        var secretAccessKey = options.secretAccessKey || DEFAULT_CONFIG.secretAccessKey;
        var region = options.region || DEFAULT_CONFIG.region;
        this.format = options.format || DEFAULT_CONFIG.format;

        this.set_or_throw('bucket', options.bucket);
        this.set_or_throw('key', options.key);

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
        var parser = parsers.getParser(this.format);
        return new Promise((resolve, reject) => {
            var points = [];
            var request = this.client.getObject({
                Bucket: this.bucket,
                Key: this.key,
            });

            request.on('httpHeaders', (statusCode, headers, resp) => {
                if (statusCode >= 300) {
                    throw new Error('http status code ' + statusCode);
                }

                var httpStream = resp.httpResponse.createUnbufferedStream();
                parser.parseStream(httpStream, (pts) => {
                    points = points.concat(pts);
                })
                .then(function() {
                    resolve(points.slice(0, limit));
                })
                .catch(reject);
            });

            request.on('error', reject);
            request.send();
        });
    }

    write(points) {
        if (!this.stream) {
            this.stream = new Stream.PassThrough();
            this.serializer = serializers.getSerializer(this.format, this.stream);
            this.promise = this.client.uploadAsync({
                Bucket: this.bucket,
                Key: this.key,
                Body: this.stream
            });
        }

        this.serializer.write(points);
    }

    end_write() {
        this.stream.end();
        return this.promise;
    }
}

module.exports = S3Client;
