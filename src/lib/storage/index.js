
import Session from './session';
import Local from './local';

class Storage {

    drivers = {
        session: new Session(),
        local: new Local()
    };

    driver = (name) => {
        return this.drivers[name];
    };

    session = (...args) => {
        let session = this.driver('session');
        switch (args.length) {
            case 0:
                return session;
            case 1:
                return session.get(...args);
            case 2:
            case 3:
                session.set(...args);
                break;
        }
    };

    local = (...args) => {
        let local = this.driver('local');
        switch (args.length) {
            case 0:
                return local;
            case 1:
                return local.get(...args);
            case 2:
            case 3:
                local.set(...args);
                break;
        }
    };

    /**
     * 设置服务器时间
     * @param time
     */
    setServerTime(time) {
        let localTime = parseInt(new Date().getTime() / 1000);
        this.session('server_time', {
            value: time,
            localTime: localTime
        });
    }

    /**
     * 获取服务器时间
     * @returns {Number}
     */
    getServerTime() {
        let newTime = parseInt(new Date().getTime() / 1000);
        let serverTime = this.session('server_time');
        return serverTime ? (serverTime.value + (newTime - serverTime.localTime)) : newTime;
    }

}

Storage = new Storage();
let session = Storage.session;
let local = Storage.local;
export default Storage;
export {Storage, session, local};