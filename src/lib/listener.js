
export default class Listener {

    events = {};

    /**
     * 订阅
     * @param eventKey
     * @param fn
     * @returns {string}
     */
    subscribe(eventKey, fn) {
        const subKey = new Date().getTime() + "_" + parseInt(Math.random() * 9000 + 1000);
        if(!this.events[eventKey]) {
            this.events[eventKey] = {};
        }
        this.events[eventKey][subKey] = fn;
        return eventKey + "." + subKey;
    }

    /**
     * 取消订阅
     * @param token
     */
    unsubscribe(token) {
        const [eventKey, subKey] = token.split(".");
        if(_.get(this.events, token))
            delete this.events[eventKey][subKey];
    }

    unsubscribeAll() {
        this.events = {};
    }

    /**
     * 发布
     * @param eventKey
     * @param data
     */
    publish(eventKey, data) {
        if(this.events[eventKey]) {
            const events = Object.values(this.events[eventKey]);
            if(events.length > 0) {
                events.forEach(fn => {
                    fn(data);
                });
            }
        }
    }

    publishAll(data) {
        const eventKeys = Object.keys(this.events);
        eventKeys.forEach(eventKey => {
            this.publish(eventKey, data);
        });
    }
}