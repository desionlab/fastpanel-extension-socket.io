/**
 * Extension.ts
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */

import SocketIO from 'socket.io';
const SocketIOEmitter = require('socket.io-emitter');
import SocketIORedisAdapter from 'socket.io-redis';
import { Cli, Cluster, Di, Extensions } from 'fastpanel-core';

/**
 * Class Extension
 * 
 * Initialization of the extension.
 * 
 * @version 1.0.0
 */
export class Extension extends Extensions.ExtensionDefines {

  /**
   * Registers a service provider.
   */
  async register () : Promise<any> {
    if (this.context instanceof Cli.Handler) {
      /* Registration websocket emitter. */
      this.di.set('socket', (container: Di.Container) => {
        let socket = SocketIOEmitter(
          container.get('redis', this.config.get('Extensions/SocketIO.redis', null))
        );
        return socket;
      }, true);
    } else if (this.context instanceof Cluster.Handler) {
      /* Registration websocket server. */
      this.di.set('socket', (container: Di.Container) => {
        /* Create server. */
        let socket = SocketIO(this.http, {
          path: '/real-time'
        });

        /* Set io adapter. */
        socket.adapter(SocketIORedisAdapter({
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
  async startup () : Promise<any> {
    if (this.di.has('socket')) {
      /* Fire http startup event. */
      this.events.emit('socket:startup', this.socket);
    }
  }

}

/* End of file Extension.ts */