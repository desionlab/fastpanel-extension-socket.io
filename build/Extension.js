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
const fastpanel_core_1 = require("fastpanel-core");
/**
 * Class Extension
 *
 * Initialization of the extension.
 *
 * @version 1.0.0
 */
class Extension extends fastpanel_core_1.Extensions.ExtensionDefines {
    /**
     * Registers a service provider.
     */
    async register() {
        if (this.context instanceof fastpanel_core_1.Cli.Handler) {
            /* Registration websocket emitter. */
            this.di.set('socket', (container) => {
                let socket = SocketIOEmitter(container.get('redis', this.config.get('Extensions/SocketIO.redis', null)));
                return socket;
            }, true);
        }
        else if (this.context instanceof fastpanel_core_1.Cluster.Handler) {
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
    }
    /**
     * Startup a service provider.
     */
    async startup() {
        if (this.di.has('socket')) {
            /* Fire http startup event. */
            this.events.emit('socket:startup', this.socket);
        }
    }
}
exports.Extension = Extension;
/* End of file Extension.ts */ 
