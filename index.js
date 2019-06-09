const request = require('./framework/request');
const defaultOptions = require('./defaultOptions');
const { CURRENT_VERSION, compareVersion } = require('./framework/version');

const Yuumi = function (options) {
    if (this instanceof Yuumi) {
        return this.create(options);
    }
    return new Yuumi(options);
};

Yuumi.prototype.create = function (options) {
    this._options = Object.assign({}, defaultOptions, options);
    this._version = {};
    this.cacheSvr = undefined;
};

Yuumi.prototype.setCacheSvr = function (cacheSvr = {}) {
    if (typeof cacheSvr.get === 'function' && typeof cacheSvr.set === 'function' && typeof cacheSvr.del === 'function') {
        this.cacheSvr = cacheSvr;
    }
};

Yuumi.prototype.getCacheSvr = function () {
    return this.cacheSvr;
};

Yuumi.prototype.neeko = function (serverUrl) {
    if (typeof serverUrl === 'string') {
        this.config('serverUrl', serverUrl);
    }
    return new Promise((resolve, reject) => {
        if (this._options.serverUrl) {
            request({
                method: 'get',
                url: this._options.serverUrl,
                params: {
                    tree: this._options.neekoTree,
                    token: this._options.neekoToken
                }
            }).then(res => {
                if (res.status === 200 && res.data) {
                    let data = res.data || {};

                    let minVer = data.minVer || 0;
                    if (CURRENT_VERSION < minVer) {
                        reject(new Error('unsupported version.'));
                        return;
                    }

                    let newVer = data.version || {};
                    if (this.cacheSvr && typeof this.cacheSvr.del === 'function') {
                        let diff = compareVersion(this._version, newVer);
                        diff.forEach(key => {
                            this.cacheSvr.del(key);
                        });
                    }
                    this._version = newVer;
                    resolve(this._version);
                } else {
                    reject(res);
                }
            }, e => reject(e));
        } else {
            reject(new Error('serverUrl is undefined.'));
        }
    });
};

Yuumi.prototype.config = function (arg1, arg2) {
    if (arg1 instanceof Object) {
        for (let key in arg1) {
            if (arg1.hasOwnProperty(key)) {
                this.config(key, arg1[key]);
            }
        }
    } else if (typeof arg1 === 'string') {
        if (this._options.hasOwnProperty(arg1)) {
            this._options[arg1] = arg2;
        }
    }
    return this._options;
};

Yuumi.prototype.getOption = function (key) {
    if (typeof key === 'string') {
        return this._options[key];
    }
    return this._options;
};

/**
 * 获取当前的版本
 * @param appName
 * @returns {*}
 */
Yuumi.prototype.getVersion = Yuumi.prototype.yuumi = function (appName) {
    return this._version[appName];
};

module.exports = Yuumi;
