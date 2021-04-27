

export default class Local {

    key = 'sixbeeLocalStorage_';

    all() {
        let data = {};
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            let value = this.get(key);
            if (value !== undefined) {
                data[key] = value;
            }
        }
        return data;
    }

    getStorageKey(key) {
        return this.key + key;
    }

    parse(key) {
        key = this.getStorageKey(key);
        let value = localStorage.getItem(key);
        let json;
        try {
            json = JSON.parse(value);
            return json;
        } catch (e) {
        }
        return {};
    }

    get(key) {
        let json = this.parse(key);
        return json ? json.value : undefined;
    }

    set(key, value, expire_time = null) {
        if (value === undefined) {
            this.remove(key);
        } else {
            localStorage.setItem(this.key + key, JSON.stringify({
                value: value,
                expire_time: expire_time
            }));
        }
    }

    remove(key) {
        key = this.getStorageKey(key);
        localStorage.removeItem(key);
    }

    clear() {
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            this.remove(key);
        }
    }

}
