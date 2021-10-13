---
layout: docs

title: Using WebSockets on frontend
---

## {{ page.title }}

You can listen and emit event from the client side really easily by using the _@typetron/websockets_ library.

#### Installation

You can install the WebSockets library by just running this command in your frontend app:

```bash
$ npm install @typetron/websockets
```

Be aware that you need to have a bundler (webpack, rollup, babel, parcel, etc.) when using this library.

After installing it in the project, you can start using it by creating a socket connection. You can have this in its own
file, so you can import it later in your different part of your app:

```ts
import { Websocket } from '@typetron/websockets'

export const socket = new Websocket('ws://localhost:8001')
```

#### Listening for events

You can listen to a WebSocket event sent from the server using the _on('Event name')_ method like this on the socket
connection:

```ts
socket.on('eventName').subscribe(response => {
    console.log('Backend response', response)
})
socket.on<User>('user.update').subscribe(user => {
    console.log('User updated', user)
})
```

The _on_ method will return an observable (see [RxJS](https://rxjs.dev/) for more details) that you can use to subscribe
to.

#### Emitting events

If you want to signal the server with and event or when you want to send some data to it, you can use the _emit('event
name', data)_ method:

```ts
socket.emit('eventName');
socket.emit('eventName', "my message here");
socket.emit('eventName', {my: {message: "here"}});
```

Be aware that if you are expecting a response from the backend, you need to subscribe to the same event (or the event
the server is emitting to) using the _.on_ method.

#### Emitting and listening for server response

If you want to make a single "request" to the server, meaning that you want to emit and wait for a response at the same
time, you can use the _request('event name', data?)_ method. This will essentially make an _emit_ and listen to its 
response using the _on_ method for you:

```ts
const users = await socket.request<User[]>('users.list')
const savedUser = await socket.request<User>('users.save', {name: 'John'})
```

