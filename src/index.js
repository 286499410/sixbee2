import ModuleManager from './ModuleManager'
import Request from './lib/request';
import {session} from "./lib/storage";
import {instances} from "./Model";

export const request = new Request();
export const moduleManager = new ModuleManager();

export {session};
export {instances};

export default {
    request,
    session,
    moduleManager,
    instances
}