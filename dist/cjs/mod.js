"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * Type-safe event emitter with support for async event handling and error handling
 * @template Events Type describing the events and their listener signatures
 */
class EventEmitter {
    /**
     * Creates a new EventEmitter instance
     * @param onError Optional error handler called when listeners throw errors
     */
    constructor(onError) {
        this.onError = onError;
        this.eventRegistry = {};
    }
    /**
     * Emits an event to all registered listeners
     * @param event The event name to emit
     * @param args Arguments to pass to the event listeners
     */
    emit(event, ...args) {
        void this.emitAsync(event, ...args);
    }
    /**
     * Emits an event to all registered listeners and waits for any async listeners to complete
     * @param event The event name to emit
     * @param args Arguments to pass to the event listeners
     * @returns Promise that resolves when all async listeners have completed
     */
    async emitAsync(event, ...args) {
        const listeners = this.eventRegistry[event];
        if (!listeners)
            return;
        const promises = [];
        for (const listener of listeners) {
            try {
                const result = listener(...args);
                if (result instanceof Promise)
                    promises.push(result.catch((error) => this.onError?.(error, event)));
            }
            catch (error) {
                this.onError?.(error, event);
            }
        }
        await Promise.allSettled(promises);
    }
    /**
     * Registers a listener for the specified event
     * @param event The event name to listen for
     * @param listener The callback function to execute when the event is emitted
     * @returns Unsubscribe function that removes this listener when called
     */
    on(event, listener) {
        var _a;
        const listeners = ((_a = this.eventRegistry)[event] ?? (_a[event] = []));
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index === -1)
                return;
            listeners.splice(index, 1);
            if (listeners.length === 0)
                delete this.eventRegistry[event];
        };
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=mod.js.map