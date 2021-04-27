import React from 'react';
import _ from 'lodash';
import Icon from "../UI/Icon";
import Listener from "./listener";

/**
 * 空格连接
 * @param arg
 * @returns {string}
 */
export const joinBlankSpace = (...arg) => {
    let classNames = [];
    _.isArray(arg) && arg.map(str => {
        str && classNames.push(str);
    });
    return classNames.join(' ');
};

export const renderLeftIcon = (props) => {
    return _.isString(props.leftIcon) ? <Icon className="left-icon" name={props.leftIcon}/> : props.leftIcon
};

export const renderRightIcon = (props) => {
    return _.isString(props.rightIcon) ? <Icon className="right-icon" name={props.rightIcon}/> : props.rightIcon
};

/**
 * 文本替换 例 data = {name: "Joey", des: "high"}; replaceText = "[name] [des]"; return "Joey high"
 * @param data 数据源
 * @param replaceText
 * @returns {*}
 */
export const replaceText = (data, replaceText) => {
    let text = _.get(data, replaceText);
    if (text !== undefined) {
        return text;
    }
    let reg = /\[((\w|\w.\w||\w.\w.\w)*)\]/g;
    let textFields = replaceText.match(reg);
    if (_.isArray(textFields)) {
        let ret = undefined;
        textFields.map((field) => {
            let key = field.substr(1, field.length - 2);
            let value = _.get(data, key, '');
            ret = replaceText.replace(`[${key}]`, value);
            replaceText = ret;
        });
        return ret;
    } else {
        return undefined;
    }
};

/**
 * @param value
 * @param dataSource
 * @param dataSourceConfig
 * @returns {*}
 */
export const getDataFromDataSourceByValue = (value, dataSource, dataSourceConfig) => {
    for (let i = 0; i < dataSource.length; i++) {
        let data = dataSource[i];
        if (data[dataSourceConfig.value] === value) {
            return data;
        }
        if (data.children && data.children.length > 0) {
            let tempData = getDataFromDataSourceByValue(value, data.children, dataSourceConfig);
            if (tempData) return tempData;
        }
    }
};

/**
 * 获取过滤数据
 * @param filterText
 * @param dataSource
 * @param dataSourceConfig
 * @param filter
 * @returns {Array}
 */
export const getFilterDataSource = (filterText, dataSource, dataSourceConfig, filter) => {
    if (filter === undefined) {
        filter = (data, filterText) => {
            let text = replaceText(data, dataSourceConfig.text);
            return filterText === '' ? true : text.toString().indexOf(filterText) >= 0;
        }
    }
    let filterDataSource = [];
    dataSource.map(data => {
        let children = getFilterDataSource(filterText, data.children || [], dataSourceConfig);
        if (children && children.length > 0) {
            filterDataSource.push({...data, children: children});
        } else if (filter(data, filterText)) {
            filterDataSource.push({...data, children: []});
        }
    });
    return filterDataSource;
};

export const isEmpty = (value) => {
    return value === undefined || value === null || value === '';
};

export const isEmail = (value) => {
    let reg = /^[A-Za-z0-9._-\u4e00-\u9fff]+@[a-zA-Z0-9_-\u4e00-\u9fff]+(\.[a-zA-Z0-9_-\u4e00-\u9fff]+)+$/;
    return reg.test(value);
};

export const isMobile = (value) => {
    let reg = /^\d{11}$/;
    return reg.test(value);
};

export const isUrl = (value) => {
    let reg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return reg.test(value);
};

export const isIp = (value) => {
    let reg = /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/;
    return reg.test(value);
};

export const isInteger = (value) => {
    let reg = /^\d+$/;
    return reg.test(value);
};

export const isNumber = (value) => {
    let reg = /^\d+(\.\d+)?$/;
    return reg.test(value);
};

export const cmpDateTime = (datetime1, datetime2) => {
    let diff = new Date(Date.parse(datetime1)).getTime() - new Date(Date.parse(datetime2)).getTime();
    if (diff > 0) {
        return 1;
    } else if (diff == 0) {
        return 0;
    } else {
        return -1;
    }
};

/**
 * 遍历所有树形节点
 * @param data
 * @param callback
 */
export const forEach = (data, callback, childrenKey = "children") => {
    data.forEach(row => {
        callback(row);
        if (row[childrenKey] && _.isArray(row[childrenKey])) {
            forEach(row[childrenKey], callback);
        }
    });
};

/**
 * 时间戳转日期时间
 * @param format
 * @param timestamp
 * @returns {*}
 */
export const date = (format = 'Y-m-d H:i:s', timestamp) => {
    let myDate = new Date();
    myDate.setTime(timestamp * 1000);
    let year = myDate.getFullYear().toString();
    let month = (myDate.getMonth() + 1).toString();
    let date = myDate.getDate().toString();
    let hour = myDate.getHours().toString();
    let minute = myDate.getMinutes().toString();
    let second = myDate.getSeconds().toString();
    let datetime = format;
    datetime = datetime.replace('Y', year);
    datetime = datetime.replace('m', month.padStart(2, '0'));
    datetime = datetime.replace('d', date.padStart(2, '0'));
    datetime = datetime.replace('H', hour.padStart(2, '0'));
    datetime = datetime.replace('i', minute.padStart(2, '0'));
    datetime = datetime.replace('s', second.padStart(2, '0'));
    return datetime;
};

/**
 * 日期字符串转时间戳
 * @param str
 * @returns {number}
 */
export const strToTime =
    (str) => {
        return parseInt(strToDate(str).getTime() / 1000);
    };

/**
 * 转成常见日期格式
 * @param date
 */
export const dateToStr =
    (date) => {
        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString();
        date = date.getDate().toString();
        return year + '-' + month.padStart(2, '0') + '-' + date.padStart(2, '0');
    };

/**
 * 转成时间格式
 * @param date
 * @returns {string}
 */
export const dateToTimeStr = (date) => {
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    return hour.padStart(2, '0') + ':' + minute.padStart(2, '0');
};

/**
 * 字符串转Date类型
 * @param str
 * @returns {*}
 */
export const strToDate = (str) => {
    if (_.isDate(str)) {
        return str;
    } else if (str === '') {
        return undefined;
    } else if (_.isString(str)) {
        str = str.replace(/-/g, '/');
        return new Date(str);
    } else {
        return undefined;
    }
};


/**
 * 获取数据源
 * @param searchText
 * @returns {Promise<any>}
 */
export const getDataSource = async ({dataSource, filterText = undefined}) => {
    dataSource = _.isFunction(dataSource) ? dataSource({filterText}) : dataSource;
    if (dataSource instanceof Promise) {
        dataSource = await dataSource;
    }
    return dataSource;
};

/**
 * Object转FormData
 * @param obj
 * @param form
 * @param namespace
 * @returns {*|FormData}
 */
export const objectToFormData = (obj, form, namespace) => {
    let fd = form || new FormData();
    let formKey;
    if (_.isArray(obj)) {
        if (obj.length == 0) {
            fd.append(namespace, '');
        } else {
            obj.map((item, index) => {
                if (_.isObject(item) && !(item instanceof File)) {
                    objectToFormData(item, fd, namespace + '[' + index + ']');
                } else {
                    fd.append(namespace + '[]', item)
                }
            })
        }
    } else {
        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (namespace) {
                    formKey = namespace + '[' + property + ']';
                } else {
                    formKey = property;
                }
                if (typeof obj[property] === 'object' && obj[property] !== null && !(obj[property] instanceof File)) {
                    objectToFormData(obj[property], fd, formKey);
                } else {
                    if (obj[property] !== undefined) {
                        fd.append(formKey, (obj[property] === undefined || obj[property] === null) ? '' : obj[property]);
                    }
                }
            }
        }
    }
    return fd;
};

/**
 * 获取鼠标坐标
 * @param event
 * @returns {{x: (Number|number), y: (Number|number)}}
 */
export const getMousePosition = (event) => {
    const e = event || window.event;
    const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    const scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    const x = e.pageX || e.clientX + scrollX;
    const y = e.pageY || e.clientY + scrollY;
    return {x: x, y: y};
};

export const call = (func, ...arg) => {
    if (_.isFunction(func)) {
        return func(...arg);
    }
};

export const getControlValue = (context) => {
    if (context.props.value === undefined) {
        return context.state.value === undefined ? context.props.defaultValue : context.state.value;
    }
    return context.props.value;
};

export const listener = new Listener();

export const renderContent = (data, column, defaultValue = "") => {
    let key = column.dataKey || column.key;
    let value = _.get(data, key, defaultValue);
    switch (column.type) {
        case 'date':
            return /^\d+$/.test(value) ? date(column.format || 'Y-m-d', value) : value;
        case 'time':
            return /^\d+$/.test(value) ? date(column.format || 'H:i', value) : value;
        case 'datetime':
            return /^\d+$/.test(value) ? date(column.format || 'Y-m-d H:i', value) : value;
        case 'money':
            return value == 0 && column.showZero !== true ? '' : parseMoney(value, column.float);
        case 'select':
        case 'select-check':
        case 'radio':
            if (_.isArray(column.dataSource)) {
                let dataSource = column.dataSource;
                let dataSourceConfig = column.dataSourceConfig || {text: 'text', value: 'value'};
                let map = {};
                dataSource.map((data) => {
                    map[data[dataSourceConfig.value]] = data[dataSourceConfig.text];
                });
                return column.renderTag ?
                    <Tag value={value} text={map[value]} dataSource={dataSource} size="small"/> : map[value];
            } else {
                return value;
            }
        case 'checkbox':
            if (column.multiple) {
                let dataSourceConfig = column.dataSourceConfig || {text: 'text', value: 'value'};
                let texts = [];
                if (_.isArray(value)) {
                    value.map(row => {
                        return texts.push(row[dataSourceConfig.text]);
                    })
                }
                return texts.join(' ');
            } else if (_.isArray(column.dataSource) && column.dataSource.length > 0) {

            } else {
                return value ? '是' : '否';
            }
        case 'auto':
            if (column.withKey) {
                let withData = _.get(data, column.withKey, {});
                let dataSourceConfig = column.dataSourceConfig || {text: 'text', value: 'value'};
                return replaceText(dataSourceConfig.text, withData);
            } else {
                return value;
            }
        case 'image':
            let renderStyle = {
                width: 80,
                height: 80,
                display: 'inline-block',
                overflow: 'hidden',
                ...column.renderStyle
            };
            let isBase64OrUrl = (str) => {
                return _.isString(str) ? str.substr(0, 4) === 'http' || str.substr(0, 10) === 'data:image' : false;
            };
            return value ? <div style={renderStyle}>
                <div className="flex center middle" style={{height: '100%', border: '1px solid #f1f1f1'}}>
                    <img id={"image_" + key + '_' + data.id}
                         src={isBase64OrUrl(value) ? value : (column.documentRoot || '') + value}
                         onLoad={() => {
                             let id = '#image_' + key + '_' + data.id;
                             let width = $(id).width();
                             let height = $(id).height();
                             if (width > height) {
                                 $(id).css({width: width / height * 100 + '%'});
                             } else {
                                 $(id).css({height: height / width * 100 + '%'});
                             }
                         }}/>
                </div>
            </div> : <div style={renderStyle}></div>;
        case 'editor':
            return _.isString(value) ? value.replace(/<[^<>]+>/g, "") : '';
        case 'textarea':
            return <div
                dangerouslySetInnerHTML={{__html: _.isString(value) ? value.replace(/[\r\n]|[\n]|[\r]/g, "<br/>") : ''}}></div>
        default:
            return value;
    }
};

/**
 * 字符串,金额转数值
 * @param str
 * @returns {Number}
 */
export const parseNumber = (str) => {
    str = (str + '').toString().replace(/,/g, '');
    if (/^-?\d*((\.\d*)?)$/.test(str)) {
        if (str.indexOf('.') == 0) {
            str = 0 + str;
        }
        if (str.indexOf('.') > 0) {
            return parseFloat(str);
        } else {
            return parseInt(str);
        }
    } else {
        return 0;
    }
};

/**
 * 数值转千分位格式
 * @param number
 * @param float
 * @returns {*}
 */
export const parseMoney = (number, float = 2) => {
    if (_.isFunction(float)) {
        float = float();
    }
    float = parseInt(float);
    if (number === undefined || number === null) {
        return '';
    }
    if (number !== '') {
        number = round(parseNumber(number), float);
        let groups = (/([\-\+]?)(\d*)(\.\d+)?/g).exec(number.toString()),
            mask = groups[1],            //符号位
            integers = (groups[2] || "").split(""), //整数部分
            decimal = groups[3] || "",       //小数部分
            remain = integers.length % 3;
        let temp = integers.reduce((previousValue, currentValue, index) => {
            if (index + 1 === remain || (index + 1 - remain) % 3 === 0) {
                return previousValue + currentValue + ",";
            } else {
                return previousValue + currentValue;
            }
        }, "").replace(/\,$/g, "");
        return mask + temp + (decimal ? (!isNaN(float) ? decimal.padEnd(float + 1, '0') : '') : (float ? '.' + ''.padEnd(float, '0') : ''));
    }
    return number;
};

/**
 * 数值,金额转大写中文
 * @param number
 * @returns {*}
 */
export const parseChinese = (number) => {
    number = parseNumber(number);
    if (isNaN(number) || number >= Math.pow(10, 12)) return '';
    let symbol = number < 0 ? '负' : '';
    let words = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    let units = [
        ['分', '角'],
        ['', '拾', '佰', '仟'],
        ['元', '万', '亿']
    ];
    let splits = number.toString().split(".");
    let [integer, decimal] = splits;
    let chinese = '';
    for (let i = 0; i < 3 && integer; i++) {
        let str = '';
        let length = integer.toString().length;
        for (let j = 0; j < 4 && j < length; j++) {
            let digit = integer % 10;
            integer = parseInt(integer / 10);
            str = words[digit] + (digit > 0 ? units[1][j] : '') + str;
            str = str.replace('零零', '零');
        }
        if (str.lastIndexOf('零') == str.length - 1) {
            str = str.substr(0, str.length - 1);
        }
        if (str) {
            chinese = str + units[2][i] + chinese;
        }
    }
    if (decimal) {
        for (let i = 0; i < 2; i++) {
            if (decimal[i] > 0) {
                chinese += words[decimal[i]] + units[0][1 - i];
            }
        }
    } else {
        chinese += '整';
    }
    return chinese;
};

/**
 * 数字精度
 * @param number
 * @param float
 * @returns {number}
 */
export const round = (number, float) => {
    let times = Math.pow(10, float);
    return Math.round(number * times) / times;
};

/**
 *
 * @param number
 * @param float
 * @returns {string}
 */
export const toFixed = (number, float) => {
    return round(number, float).toFixed(float);
};

/**
 * 计算同比/环比
 * @param newValue
 * @param oldValue
 * @returns {string}
 */
export const compareToPercent = (newValue, oldValue) => {
    if (oldValue == 0) return "-";
    return round(newValue / oldValue * 100 - 100, 2) + "%";
};

export const pager = (dataSource, {page, limit}) => {
    const start = (page - 1) * limit;
    return dataSource.slice(start, start + limit);
};

export const total = (dataSource, {key, type = "number", float = 2}) => {
    const total = dataSource.reduce((total, item) => round(total + parseFloat(item[key] || 0), 2), 0);
    return type === "money" ? parseMoney(total, float) : total;
};