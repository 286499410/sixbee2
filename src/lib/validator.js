import _ from 'lodash';
import {isEmail, isEmpty, isInteger, isIp, isNumber, isUrl} from "./tool";

export default class Validator {

    rule = {};
    message = {};
    scene = {};
    label = {};

    state = {
        scene: false,
        errorMsg: {}
    };

    defaultMsg = {
        required: '[label]不能为空',
        integer: '[label]必须是整数',
        number: '[label]必须是数字',
        length: '[label]长度必须是[extend]位',
        min: '[label]长度至少[extend]位',
        max: '[label]长度不能超过[extend]位',
        between: '[label]必须在[extend]之间',
        email: '[label]必须是邮箱',
        url: '[label]必须是网址',
        confirm: '[label]不一致',
        ip: '[label]必须是IP地址',
        '>': '[label]必须大于[extend]',
        '>=': '[label]必须大于等于[extend]',
        '<': '[label]必须小于[extend]',
        '<=': '[label]必须小于等于[extend]',
        '==': '[label]必须等于[extend]',
        '!=': '[label]不能等于[extend]',
        'regex': '[label]正则匹配错误'
    };

    constructor(config = {}) {
        this.config(config);
    }

    config(config) {
        for(let [key, value] of Object.entries(config)) {
            this[key] = value;
        }
    }

    setScene(scene) {
        this.state.scene = scene;
    }

    getScene() {
        return this.state.scene;
    }

    /**
     * 解析规则
     * @param config
     * @returns {{}}
     */
    parseRule(ruleStr) {
        let configs = ruleStr.toString().split('|');
        let validates = [];
        configs.map((config) => {
            let type, extend;
            if (_.isObject(config)) {
                type = Object.keys(config)[0];
                extend = config[type];
            } else {
                [type, extend] = config.split(':');
            }
            validates.push({type: type, extend: extend});
        });
        return validates;
    }

    /**
     * 验证数据
     * @param data  验证数据
     * @param scene 场景
     * @returns {boolean}
     */
    check = (data, scene) => {
        let errorFlag = false;
        if (scene === undefined) {
            scene = this.state.scene;
        }
        if (_.isString(scene)) {
            scene = this.scene[scene] || [];
        }
        this.state.errorMsg = {};
        if (_.isArray(scene)) {
            scene.map((key) => {
                let validates = this.parseRule(this.rule[key]);
                let label = this.label[key] || '';
                let ret = this.validates(data, key, validates, label);
                if (ret !== true) {
                    this.setErrorMsg(key, ret);
                    errorFlag = true;
                }
            });
        }
        return !errorFlag;
    };

    /**
     * 校验单个值多个规则
     * @param data
     * @param key
     * @param validates
     * @param label
     * @returns {*}
     */
    validates = (data, key, validates, label) => {
        for (let validate of validates) {
            let ret = this.validate(data, key, validate, label);
            if (ret !== true) {
                return ret;
            }
        }
        return true;
    };

    /**
     * 校验单个值单个规则
     * @param data
     * @param key
     * @param validate
     * @returns {*}
     */
    validate = (data, key, validate, label) => {
        let value = _.get(data, key);
        let isEmp = isEmpty(value);
        let valid = true;
        if (validate.type === 'required' && isEmp) {
            valid = false;
        } else if (!isEmp) {
            switch (validate.type) {
                case 'length':
                    valid = value.length == validate.extend;
                    break;
                case 'min':
                    valid = value.length >= validate.extend;
                    break;
                case 'max':
                    valid = value.length <= validate.extend;
                    break;
                case 'email':
                    valid = isEmail(value);
                    break;
                case 'url':
                    valid = isUrl(value);
                    break;
                case 'ip':
                    valid = isIp(value);
                    break;
                case 'integer':
                    valid = isInteger(value);
                    break;
                case 'number':
                    valid = isNumber(value);
                    break;
                case 'regex':
                    let regex;
                    if (_.isRegExp(validate.extend)) {
                        regex = validate.extend;
                    } else {
                        regex = eval(validate.extend);
                    }
                    if (_.isRegExp(regex)) {
                        valid = regex.test(value);
                    }
                    break;
                case 'between':
                    let [min, max] = validate.extend.split(',');
                    if (value < min || value > max) {
                        valid = false;
                    }
                    break;
                case 'confirm':
                    let confirm = data[validate.extend];
                    valid = value === confirm;
                    break;
                case '>':
                case '>=':
                case '<':
                case '<=':
                case '==':
                case '!=':
                    valid = eval(value + validate.type + validate.extend);
                    break;
                default:
                    if (_.isFunction(this[validate.type])) {
                        let errorMsg = this[validate.type](value, validate.extend, data, key);
                        if (errorMsg !== true) {
                            return errorMsg;
                        }
                    }
            }
        } else if (_.isFunction(this[validate.type])) {
            let errorMsg = this[validate.type](value, validate.extend, data, key);
            if (errorMsg !== true) {
                return errorMsg;
            }
        }
        if (!valid) {
            return this.getErrorMsg(key, label, validate);
        }
        return valid;
    };

    getErrorMsg(key, label, validate) {
        let errorMsg;
        if (_.get(this.message, key + '.' + validate.type)) {
            errorMsg = _.get(this.message, key + '.' + validate.type);
        } else {
            errorMsg = this.defaultMsg[validate.type] || '';
            errorMsg = errorMsg.replace('[label]', label);
            if (validate.extend) {
                errorMsg = errorMsg.replace('[extend]', validate.extend);
            }
        }
        return errorMsg;
    }

    setErrorMsg(name, errorMsg) {
        this.state.errorMsg[name] = errorMsg;
    }

    getError() {
        return Object.assign({}, this.state.errorMsg);
    }

    isEmpty(value) {
        return value === '' || value === undefined || value === null;
    }
}
