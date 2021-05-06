import {useReducer} from "react";
import ModuleManager from './ModuleManager'
import Request from './lib/request';
import {session} from "./lib/storage";
import {instances} from "./Model";
import Listener from "sixbee2/lib/listener";

export const request = new Request();
export const moduleManager = new ModuleManager();
export const listener = new Listener();
export const loading = (open = true) => {
    listener.publish("loading", {open});
};
export {session};
export {instances};


const App = {
    request,
    session,
    moduleManager,
    instances,
    listener,
    loading
};
export default App;