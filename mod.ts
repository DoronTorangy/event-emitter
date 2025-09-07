/** A map of event names to their listener function types */
export type EventsMap = { [event: string]: (...args: any) => void };

/** Handler function for errors that occur during event emission */
export type ErrorHandler<T> = (error: unknown, eventName: T) => void;

/** Function returned by event subscription that removes the listener when called */
export type Unsubscribe = () => void;

/**
 * Type-safe event emitter with support for async event handling and error handling
 * @template Events Type describing the events and their listener signatures
 */
export class EventEmitter<Events extends EventsMap = EventsMap> {
	private readonly eventRegistry: Partial<{ [K in keyof Events]: Events[K][] }> = {};

	/**
	 * Creates a new EventEmitter instance
	 * @param onError Optional error handler called when listeners throw errors
	 */
	constructor(private readonly onError?: ErrorHandler<keyof Events>) {}

	/**
	 * Emits an event to all registered listeners
	 * @param event The event name to emit
	 * @param args Arguments to pass to the event listeners
	 */
	emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
		void this.emitAsync(event, ...args);
	}

	/**
	 * Emits an event to all registered listeners and waits for any async listeners to complete
	 * @param event The event name to emit
	 * @param args Arguments to pass to the event listeners
	 * @returns Promise that resolves when all async listeners have completed
	 */
	async emitAsync<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): Promise<void> {
		const listeners = this.eventRegistry[event];
		if (!listeners) return;

		const promises: Promise<unknown>[] = [];
		for (const listener of listeners) {
			try {
				const result = listener(...args) as unknown;
				if (result instanceof Promise) promises.push(result.catch((error) => this.onError?.(error, event)));
			} catch (error) {
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
	on<K extends keyof Events>(event: K, listener: Events[K]): Unsubscribe {
		const listeners = (this.eventRegistry[event] ??= []);
		listeners.push(listener);
		return () => {
			const index = listeners.indexOf(listener);
			if (index === -1) return;

			listeners.splice(index, 1);
			if (listeners.length === 0) delete this.eventRegistry[event];
		};
	}
}
