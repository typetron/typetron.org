---
layout: docs

title: Getting started
---

## {{ page.title }}

[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) are a way to implement real-time communication
between your applications. It is also used to update the user interface immediately after the change took place or when
something happened in some other part of your application. Typically, an event is sent from the server (usually, the
backend server) to be handled by the client (usually, the browser).

Typetron makes it easy to implement events and send message from the server to the client in a very intuitive and simple
way.

In order to have Typetron start the WebSocket server, you need to set a port to listen to. This port can be set in the
_config/app.ts_ file:

```file-path
📁 config/app.ts
```

```ts
import { AppConfig, DatabaseProvider } from '@Typetron/Framework'
import { RoutingProvider } from 'App/Providers/RoutingProvider'
import { AppProvider } from 'App/Providers/AppProvider'

export default new AppConfig({
    // ...
    websocketsPort: 8001,
    // ...
})
```

Now, you should see a message in the console saying that Typetron is listening to WebSocket connections on port _8001_.

#### Message format of the WebSocket events

The Typetron WebSocket server uses a specific message format when exchanging information between it and the clients.
These message have the following format:
_When sending a message:_
```json
{
    "event": "event name",
    "message": { // optional
        "body": "content sent to the controllers",
        "parameters": ["param1","param1"] // controller method parameters (optional)
    }
}
```
_When receiving a message:_
```json
{
    "event": "event name",
    "status": "OK" // or "Error",
    "message": "backend response", // optional
}
```

Let's see how we can create a few events to listen to when the client is firing
them: [Creating events](/docs/websockets/controllers-and-events)
