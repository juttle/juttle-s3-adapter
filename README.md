# Juttle S3 Adapter

[![Build Status](https://travis-ci.org/juttle/juttle-s3-adapter.svg?branch=master)

The Juttle S3 Adapter enables interaction with [S3](https://github.com/juttle/s3).

## Examples

Write a point with value 1 and name `s3_test` to the S3 bucket `my_bucket` with the name `my_point.json`.

```juttle
emit -limit 1
| put value = 1, name='s3_test'
| write s3 -bucket 'my_bucket' -key 'my_point.json'
```
Read the file `my_point.json` stored in the S3 bucket `my_bucket`.

```juttle
read s3 -bucket 'my_bucket' -key 'my_point.json'
```

## Installation

Like Juttle itself, the adapter is installed as an npm package. Both Juttle and
the adapter need to be installed side-by-side:

```bash
$ npm install juttle
$ npm install juttle-s3-adapter
```

## Configuration

The adapter needs to be registered and configured so that it can be used from
within Juttle. To do so, add the following to your `~/.juttle/config.json` file:

```json
{
    "adapters": {
        "s3": {
            "accessKey": "your AWS access key",
            "secretKey": "your AWS secret key",
            "region": "your AWS region"
        }
    }
}
```

## Usage

### Read options


Name | Type | Required | Description | Default
-----|------|----------|-------------|---------
`bucket` | string | yes | The S3 bucket to read from |
`key` | string | yes | The S3 key to read from |
`accessKey` | string | no | AWS access key ID to use for authentication | the `accessKey` field of the adapter configuration
`secretKey` | string | no | AWS secret key to use for authentication | the `secretKey` field of the adapter configuration
`region` | string | no | AWS region for the bucket being read from | the `region` field of the adapter configuration

### Write options


Name | Type | Required | Description | Default
-----|------|----------|-------------|---------
`bucket` | string | yes | The S3 bucket to write to |
`key` | string | yes | The S3 key to write to |
`accessKey` | string | no | AWS access key ID to use for authentication | the `accessKey` field of the adapter configuration
`secretKey` | string | no | AWS secret key to use for authentication | the `secretKey` field of the adapter configuration
`region` | string | no | AWS region for the bucket being written to | the `region` field of the adapter configuration

## Contributing

Want to contribute? Awesome! Don’t hesitate to file an issue or open a pull
request.
