const CURRENT_VERSION = 1;

/**
 * 比较两个版本的差异，返回不同的KEY
 * @param ver1
 * @param ver2
 */
const compareVersion = (ver1, ver2) => {
    let diff = [];
    new Set([...Object.keys(ver1), ...Object.keys(ver2)]).forEach(key => {
        if (typeof ver1[key] === 'undefined' || typeof ver2[key] === 'undefined') {
            diff.push(key);
        } else {
            let str1 = JSON.stringify(ver1[key]);
            let str2 = JSON.stringify(ver2[key]);
            if (str1 !== str2) {
                diff.push(key);
            }
        }
    });
    return diff;
};

module.exports = {
    CURRENT_VERSION,
    compareVersion
};
