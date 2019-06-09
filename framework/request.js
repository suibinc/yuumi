const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const { URL } = require('url');
const querystring = require('querystring');

class UserAbortError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'UserAbortError';
    }
}

const fixContentType = s => {
    return s.split(';').reduce((p, c) => {
        const posE = c.indexOf('=');
        if (posE !== -1) {
            p[c.slice(0, posE).trim()] = c.slice(posE + 1, c.length);
        } else {
            p[c.trim()] = true;
        }
        return p;
    }, {});
};

const _request = options => {
    const u = new URL(options.url);
    const _options = Object.assign({}, {
        registerCancel: function () {
        },
        method: 'get',
        headers: {},
        timeout: undefined,
        data: undefined,
        query: undefined,
        params: undefined,
    }, options);

    return new Promise((resolve, reject) => {
        let postData = '';
        const isPost = _options.method.toLowerCase() === 'post';
        if (isPost) {
            postData = querystring.stringify(_options.params || _options.data);
            _options.headers = Object.assign({}, options.headers, {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            });
        }

        let reqFn = u.protocol === 'http:' ? http.request : https.request;
        if (!isPost) {
            u.search = _options.query ? querystring.stringify(_options.query) : u.search;
        }
        _options.url = _options.url + u.search;

        const params = {
            protocol: u.protocol,
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: _options.method,
            headers: JSON.parse(JSON.stringify(_options.headers)) // FIX Object has undefined key
        };
        if (_options.timeout) {
            params.timeout = _options.timeout;
        }
        const req = reqFn(params, res => {
            const contentTypes = fixContentType(res.headers['content-type'] || ''); // FIX default response content-type
            const decoder = new StringDecoder(contentTypes.charset || 'utf-8');
            let chunks = '';
            res.on('data', chunk => {
                chunks += decoder.write(chunk);
            });
            res.on('end', () => {
                const newRes = Object.assign({}, res, {
                    config: _options,
                    data: chunks,
                    status: res.statusCode
                });
                resolve(newRes);
            });
        });
        if (_options.registerCancel) {
            _options.registerCancel(req);
        }
        if (isPost) {
            req.write(postData);
        }
        req.on('socket', socket => {
            if (_options.registerCancel) {
                _options.registerCancel(socket.destroy);
            }
            if (_options.timeout) {
                socket.setTimeout(_options.timeout, () => {
                    socket.destroy(new UserAbortError(`Request: ${u.pathname}, Timeout: ${_options.timeout}ms`))
                })
            }
        });
        req.on('error', e => {
            e.config = _options;
            reject(e)
        });
        req.end();
    }).then(res => {
        try {
            res.data = JSON.parse(res.data);
            return res;
        } catch (e) {
            return res;
        }
    })
};

module.exports = options => {
    if (Array.isArray(options)) {
        return Promise.all(options.map(ops => {
            return _request(ops);
        }))
    } else {
        return _request(options);
    }
};
