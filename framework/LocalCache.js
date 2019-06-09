class LocalCache {
    constructor() {
        this.localCaches = {};
    }

    get(key) {
        return this.localCaches[key];
    }

    set(key, val) {
        this.localCaches[key] = val;
    }

    del(key) {
        delete this.localCaches[key];
    }

    keys() {
        return Object.keys(this.localCaches);
    }
}

module.exports = LocalCache;
