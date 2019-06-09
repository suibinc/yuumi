const request = require('../request');
const { vueRender } = require('../renderer/vue-renderer');

module.exports = function (app, yuumi, cacheSvr) {
    app.context.getVueResources = async function (appName) {
        if (cacheSvr && cacheSvr.get) {
            let result = cacheSvr.get(appName);
            if (result) {
                return result;
            }
        }

        let config = yuumi.getVersion(appName);
        if (!config) {
            throw Error('请正确检查Neeko服务配置');
        }
        let urls = [config.template, config.manifest, config.bundle];
        let data = await request(urls);

        let result = {
            template: data[0] ? data[0].data : '',
            manifest: data[1] ? data[1].data : '',
            bundle: data[2] ? data[2].data : '',
        };
        if (cacheSvr && cacheSvr.set) {
            cacheSvr.set(appName, result);
        }
        return result;
    };
    app.context.vueRenderToString = async function (appName, _context) {
        const ctx = this;
        const context = Object.assign({}, ctx.state, _context);
        const src = await ctx.getVueResources(appName);
        const options = {
            appName,
            context,
            template: src.template,
            manifest: src.manifest,
            bundle: src.bundle,
            cacheBundle: false,
            inject: context.inject !== false,
            shouldPreload: context.shouldPreload,
        };
        let str = await vueRender(options);
        ctx._context = context;
        return str;
    };
    app.context.vueSSR = async function (appName, _context) {
        const ctx = this;
        ctx.body = await ctx.vueRenderToString(appName, _context);
    };
};
