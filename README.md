# Event Emitter

Type-safe event emitter for TypeScript with async support.

## Features

- TypeScript generics for type safety
- Async event handling
- Error handling
- Unsubscribe support

## Installation

```bash
npx jsr add @drt/event-emitter
```

## Usage

```typescript
import { EventEmitter } from "@drt/event-emitter";

interface MyEvents {
  userLogin: (userId: string) => void;
  dataUpdate: (data: { id: string; value: number }) => void;
}

const emitter = new EventEmitter<MyEvents>();

// Subscribe
const unsubscribe = emitter.on("userLogin", (userId) => {
  console.log(`User ${userId} logged in`);
});

// Emit
emitter.emit("userLogin", "user123");

// Async
emitter.on("dataUpdate", async (data) => {
  await saveToDatabase(data);
});

await emitter.emitAsync("dataUpdate", { id: "1", value: 42 });

// Error handling
const emitterWithErrorHandler = new EventEmitter<MyEvents>((error, eventName) => {
  console.error(`Error in ${String(eventName)}:`, error);
});

// Unsubscribe
unsubscribe();
```

## API

```typescript
class EventEmitter<Events> {
  constructor(onError?: ErrorHandler<keyof Events>)
  on<K extends keyof Events>(event: K, listener: Events[K]): Unsubscribe
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void
  emitAsync<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): Promise<void>
}

type EventsMap = { [event: string]: (...args: any) => void };
type ErrorHandler<T> = (error: unknown, eventName: T) => void;
type Unsubscribe = () => void;
```
