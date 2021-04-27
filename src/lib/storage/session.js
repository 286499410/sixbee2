

export default class Session {

    key = 'sixbeeSessionStorage_';

    all() {
        let data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            let key = sessionStorage.key(i);
            let value = this.get(key);
            if (value !== undefined) {
                data[key] = value;
            }
        }
        return data;
    }

    parse(key) {
        key = this.getStorageKey(key);
        let value = sessionStorage.getItem(key);
        let json;
        try {
            json = JSON.parse(value);
            return json;
        } catch (e) {
        }
        return {};
    }

    getStorageKey(key) {
        return this.key + key;
    }

    get(key) {
        let json = this.parse(key);
        return json ? json.value : undefined;
    }

    set(key, value) {
        if (value === undefined) {
            this.remove(key);
        } else {
            sessionStorage.setItem(this.key + key, JSON.stringify({value: value}));
        }
    }

    remove(key) {
        key = this.getStorageKey(key);
        sessionStorage.removeItem(key);
    }

    clear() {
        for (let i = 0; i < sessionStorage.length; i++) {
            let key = sessionStorage.key(i);
            this.remove(key);
        }
    }

}