---
layout: docs

title: Creating WebSocket events
---

## {{ page.title }}

Creating WebSocket events is easy enough. All you have to do is to add the _@Event()_ decorator to your controller
methods and that's it. Here is an example:

```ts
import { Controller, Event } from '@Typetron/Router'

@Controller()
class HomeController {

    @Event()
    home() {
        return 'Welcome to Typetron!'
    }
}
```

This will create a WebSocket event listener called _home_, based on the method name, that you can send from the client.
Then, Typetron will send back the content returned from the controller.

> **_Note_** You can easily listen to event using the Typetron WebSockets library.
> Check [Using WebSockets on frontend](/docs/websockets/using-on-frontend) on how to do so.

You can change the name of the event by just passing the new name in the _@Event()_ decorator:

```ts
import { Controller, Event } from '@Typetron/Router'

@Controller()
class HomeController {

    @Event('main')
    home() {
        return 'Welcome to Typetron!'
    }
}
```

This will create the _main_ event listener instead of _home_.

You can also group events using the _@Controller()_ decorator:

```ts
import { Controller, Event } from '@Typetron/Router'

@Controller('users')
class UserController {

    @Event()
    list() {
        return 'List of users'
    }
}
```

This will create the _users.list_ event listener. Every method under this controller will have the _users._ prefix.

Let's also send and listen to these events on a browser
client: [Using WebSockets on frontend](/docs/websockets/using-on-frontend)
