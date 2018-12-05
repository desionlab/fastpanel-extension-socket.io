"use strict";
/**
 * Extension.ts
 *
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
const SocketIOEmitter = require('socket.io-emitter');
const socket_io_redis_1 = __importDefault(require("socket.io-redis"));
const core_1 = require("@fastpanel/core");
/**
 * Class Extension
 *
 * Initialization of the extension.
 *
 * @version 1.0.0
 */
class Extension extends core_1.Extensions.ExtensionDefines {
    /**
     * Registers a service provider.
     */
    async register() {
        if (this.context instanceof core_1.Cluster.Handler) {
            /* Registration websocket server. */
            this.di.set('socket', (container) => {
                /* Create server. */
                let socket = socket_io_1.default(this.http, {
                    path: '/real-time'
                });
                /* Set io adapter. */
                socket.adapter(socket_io_redis_1.default({
                    pubClient: container.get('redis', this.config.get('Extensions/SocketIO.redis', null)),
                    subClient: container.get('redis', this.config.get('Extensions/SocketIO.redis', null))
                }));
                return socket;
            }, true);
        }
        else {
            /* Registration websocket emitter. */
            this.di.set('socket', (container) => {
                let socket = SocketIOEmitter(container.get('redis', this.config.get('Extensions/SocketIO.redis', null)));
                return socket;
            }, true);
        }
        /* Install and configure the basic components of the system. */
        this.events.once('app:setup', async (app) => { });
        /* Registered cli commands. */
        this.events.once('cli:getCommands', async (cli) => { });
    }
    /**
     * Startup a service provider.
     */
    async startup() {
        /* Check context. */
        if (this.context instanceof core_1.Cluster.Handler) {
            /* Fire event. */
            this.events.emit('socket:getMiddleware', this.socket);
            this.events.emit('socket:getActions', this.socket);
        }
        /* Fire event. */
        this.events.emit('socket:startup', this.socket);
    }
}
exports.Extension = Extension;
/* End of file Extension.ts */ 
