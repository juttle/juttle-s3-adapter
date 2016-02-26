var AWS = require('aws-sdk');
var Promise = require('bluebird');
var util = require('util');
var path = require('path');
var expect = require('chai').expect;

var juttle_test_utils = require('juttle/test').utils;
var check_juttle = juttle_test_utils.check_juttle;

var config = {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2',
    path: path.resolve(__dirname, '..')
};

juttle_test_utils.configureAdapter({
    s3: config
});

var client = Promise.promisifyAll(new AWS.S3(config));

var test_bucket = 's3.adapter.test' + Math.random();

juttle_test_utils.withAdapterAPI(function() {
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

    function basic_read_write(format) {
        var file = 'simple.' + format;
        var file_path = path.resolve(__dirname, 'input/' + file);
        var points = [{time: '2016-01-27T08:29:03.173Z', name: 's3_test'}];
        var options = juttle_test_utils.options_from_object({
            bucket: test_bucket,
            key: file,
            format: format
        });

        function write() {
            var write_base = 'read file -file "%s" -format "%s" | write s3 %s';
            var write_program = util.format(write_base, file_path, format, options);
            return check_juttle({
                program: write_program
            });
        }

        function read() {
            var read_program = util.format('read s3 %s', options);
            return check_juttle({
                program: read_program
            });
        }

        return write()
        .then(function(result) {
            expect(result.errors).deep.equal([]);
            return read();
        })
        .then(function(result) {
            expect(result.errors).deep.equal([]);
            expect(result.sinks.table).deep.equal(points);
        });
    }

    describe('json', function() {
        it('basic read/write', function() {
            return basic_read_write('json');
        });
    });

    describe('jsonl', function() {
        it('basic read/write', function() {
            return basic_read_write('jsonl');
        });
    });

    describe('csv', function() {
        it('basic read/write', function() {
            return basic_read_write('csv');
        });
    });

    it('missing bucket', function() {
        return check_juttle({
            program: 'read s3 -bucket "xxx_this_is_not_a_bucket_name_xxx_dave_rules" -key "a"'
        })
        .then(function(result) {
            expect(result.errors).deep.equal(['http status code 404']);
        });
    });
});
