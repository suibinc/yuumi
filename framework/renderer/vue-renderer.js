const VueServerRenderer = require('vue-server-renderer');
const LRU = require('lru-cache');

const lruSvr = new LRU({
    max: 500,
    maxAge: 1000 * 60,
});
const defaultCache = {
    get: (key, cb) => {
        let str = lruSvr.get(key);
        cb(str)
    },
    set: (key, val) => {
        lruSvr.set(key, val);
    }
};
const _bundleCache = {};
const _rendererCache = {};

const vssCreateRender = option => {
    return VueServerRenderer.createBundleRenderer(option.bundle, {
        template: option.template,
        clientManifest: option.manifest,
        runInNewContext: option.runInNewContext || false,
        inject: option.inject !== false,
        shouldPreload: option.shouldPreload || function () {
            return true;
        },
        cache: option.cache || defaultCache
    })
};

const getRenderer = option => {
    // 无 appName
    if (!option.appName || !option.cacheBundle) {
        return vssCreateRender(option);
    }
    // 有 appName
    if (
        _bundleCache[option.appName] === option.bundle
        && _rendererCache[option.appName]
    ) {
        return _rendererCache[option.appName];
    }
    _bundleCache[option.appName] = option.bundle;
    _rendererCache[option.appName] = vssCreateRender(option);
    return _rendererCache[option.appName]
};

const vueRTS = option => {
    return new Promise(function (resolve, reject) {
        getRenderer(option).renderToString(option.context, function (err, html) {
            if (err) return reject(err);
            return resolve(html);
        })
    })
};

const vueRender = async option => {
    return await vueRTS(option);
};

module.exports = {
    vueRender
};
