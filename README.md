# Yuumi Server Lib.

Running the examples:
```bash
npm install yuumi-server -S
```


``` javascript
const Koa = require('koa');
const Yuumi = require('yuumi-server');
const Interceptors = require('yuumi-server/framework/Interceptors');
const { localCacheSvr } = require('yuumi-server/common');

const yuumi = new Yuumi({ serverUrl: '' });
const routes = require('./routes');
const port = 3000;

yuumi.register().then(() => {
    const app = new Koa();
    
    /**
     * localCacheSvr：此处的localCacheSvr仅仅是用来缓存资源文件（template、manifest、bundle）
     * localCacheSvr仅需实现get、set两个接口即可！
     * 如果传localCacheSvr则会在配置更新后才会拉取文件（推荐）
     * 不传localCacheSvr则不会缓存，这样每次渲染都会重新拉取资源文件
     *
     * 因此injectNeekoKoa、injectVueSSR、injectEjsSSR中如果需要缓存，则localCacheSvr必须一致，否则会出现配置更新了，但是页面没有同步更新的异常
     */
    Interceptors.injectNeekoKoa(app, yuumi, localCacheSvr);
    Interceptors.injectVueSSR(app, yuumi, localCacheSvr); // 可省略
    
    app.use(routes.routes());
    app.use(routes.allowedMethods());
    app.listen(port);
}, () => {
    // 注册服务失败
    console.error('注册服务失败', e);
});
```

