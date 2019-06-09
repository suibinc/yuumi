const Router = require('koa-router');

module.exports = function (app, yuumi) {
    const route = new Router();
    route.get('yuumi-push', '/yuumi/server/push', async ctx => {
        // todo
        let cacheSvr = yuumi.getCacheSvr();
        cacheSvr.del('test');
        ctx.body = 'ok.';
    });
    route.get('yuumi-pull', '/yuumi/client/pull', async ctx => {
        yuumi.neeko().then(data => {
            ctx.body = JSON.stringify(data);
        }, () => {
            ctx.body = 'err.';
        });
    });
    app.use(route.routes());
    app.use(route.allowedMethods());
};
