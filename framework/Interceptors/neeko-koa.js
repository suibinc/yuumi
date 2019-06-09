const Router = require('koa-router');

module.exports = function (app, yuumi, cacheSvr) {
    const route = new Router();
    route.get('yuumi-push', '/yuumi/server/push', async ctx => {
        // todo
        cacheSvr.del('test');
        ctx.body = 'ok.';
    });
    app.use(route.routes());
    app.use(route.allowedMethods());
};
