var AWS = require('aws-sdk');
var Promise = require('bluebird');
var util = require('util');
var path = require('path');
var expect = require('chai').expect;

var Juttle = require('juttle/lib/runtime').Juttle;
var juttle_test_utils = require('juttle/test/runtime/specs/juttle-test-utils');
var check_juttle = juttle_test_utils.check_juttle;

var config = {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2'
};

var client = Promise.promisifyAll(new AWS.S3(config));

var S3Adapter = require('../lib')(config);
Juttle.adapters.register(S3Adapter.name, S3Adapter);
var test_bucket = 's3.adapter.test';

describe('s3 source', function() {
    this.timeout(300000);

    before(function() {
        return client.createBucketAsync({Bucket: test_bucket});
    });

    after(function delete_everything() {
        return client.listObjectsAsync({Bucket: test_bucket})
            .then(function(objects) {
                var keys = objects.Contents.map(function(obj) {
                    return {Key: obj.Key};
                });

                if (keys.length === 0) { return; }

                return client.deleteObjectsAsync({
                    Bucket: test_bucket,
                    Delete: {
                        Objects: keys
                    }
                });
            })
            .then(function() {
                return client.deleteBucketAsync({Bucket: test_bucket});
            });
    });

    it('writes a file to s3 and reads it back', function() {
        var file = path.resolve(__dirname, 'input/simple.json');
        var points = require(file);
        var write_base = 'read file -file "%s" | write s3 -bucket "%s" -key "%s"';
        var write_program = util.format(write_base, file, test_bucket, 'simple.json');

        return check_juttle({
            program: write_program
        })
        .then(function(result) {
            expect(result.errors).deep.equal([]);
            var read_base = 'read s3 -bucket "%s" -key "%s"';
            var read_program = util.format(read_base, test_bucket, 'simple.json');
            return check_juttle({
                program: read_program
            });
        })
        .then(function(result) {
            expect(result.errors).deep.equal([]);
            expect(result.sinks.table).deep.equal(points);
        });
    });
});
