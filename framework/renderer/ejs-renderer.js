const { compile } = require('ejs');

const ejsMachine = (content, data) => {
    let tplFn = compile(content);
    if (data) return tplFn(data);
    return content;
};

function insertStatic(content, option) {
    let headArr = content.split('</head>');
    let cssLink = '<link href="{{path}}" rel="stylesheet"/>';
    let jsLink = '<script type="text/javascript" src="{{path}}"></script>';
    if (headArr.length > 0 && option.manifest) {
        content = headArr[0];
        let cssPath = option.manifest['css'];
        if (cssPath) {
            content = content + cssLink.replace('{{path}}', cssPath);
        }
        content = content + '</head>';
        let bodyArr = headArr[1].split('</body>');
        if (bodyArr.length > 0) {
            content = content + bodyArr[0];
            if (option.manifest['manifest']) {
                let manifestPath = option.manifest['manifest'];
                content = content + jsLink.replace('{{path}}', manifestPath)
            }
            if (option.manifest['vendor']) {
                let vendorPath = option.manifest['vendor'];
                content = content + jsLink.replace('{{path}}', vendorPath)
            }
            let jsPath = option.manifest['js'];
            content = content + jsLink.replace('{{path}}', jsPath);
            content = content + '</body>' + bodyArr[1];
        }
    }
    return content;
}

const ejsRender = async option => {
    let content = option.template;
    if (!content) return '';
    content = await insertStatic(content, option); //插入静态资源
    return await ejsMachine(content, option.context);
};

module.exports = {
    ejsMachine,
    ejsRender
};
