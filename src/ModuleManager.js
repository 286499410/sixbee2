import React, {Component} from 'react';
import _ from 'lodash';

export default class ModuleManager {

    constructor() {

    }

    setImportModule(importModule) {
        this.importModule = importModule;
    }

    loadModule = async ({group, path}) => {
        let {context} = await this.importModule({group});
        if (context && _.isFunction(context)) {
            try {
                return this.getModule(context, `./${path}.js`);
            } catch (e) {
                if (path != "") {
                    console.log(`Error Cannot find module './${path}.js'`);
                }
                return this.getModule(context, `.${path ? "/" : ""}${path}/index.js`);
            }
        }
        return null;
    };

    getModule(context, path) {
        const module = context(path);
        if (module && module.default) {
            return module.default;
        }
    }

}