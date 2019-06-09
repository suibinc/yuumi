const request = require('./framework/request');
const defaultOptions = require('./defaultOptions');

const Yuumi = function (options) {
    if (this instanceof Yuumi) {
        return this.create(options);
    }
    return new Yuumi(options);
};

Yuumi.prototype.create = function (options) {
    this._options = Object.assign({}, defaultOptions, options);
    this._version = {};
};

Yuumi.prototype.register = function (options) {
    this.config(options);
    return new Promise((resolve, reject) => {
        if (this._options.serverUrl) {
            request({
                url: this._options.serverUrl,
                method: 'get'
            }).then(res => {
                if (res.status === 200) {
                    this._version = res.data || {};
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
