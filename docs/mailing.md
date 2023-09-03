---
layout: docs

title: Mailing
---

## {{ page.title }}

The Typetron Mail feature provides a simple and clean API for sending emails. It has drivers for SendGrid, Amazon SES (
upcoming), Mailgun (upcoming), allowing you to quickly get started sending mail through a local or cloud-based service
of your choice.

### Configuration

The Typetron Mail configuration file is stored in `config/mail.ts`. This file allows you to define your mail service's
driver, as well as a host of other options for any driver that you may choose.

Here is an example of the mail configuration file:

```ts
import { MailConfig } from '@Typetron/Framework'

export default new MailConfig({
    default: 'SendGrid',

    from: {
        email: 'no-reply@example.com',
        name: 'John Example',
    },

    mailers: {
        memory: {},

        SendGrid: {
            key: process.env.SENDGRID_KEY ?? 'no set',
        },
    }
})
```

### Mail Drivers

Typetron currently supports SMTP, SendGrid, and memory mail driver.

1. **SendGrid:** SendGrid is a cloud-based SMTP provider that allows you to send email without having to maintain email
   servers. SendGrid manages all of the technical details, from scaling the infrastructure to ISP outreach and
   reputation monitoring to whitelist services and real-time analytics.

2. **Memory:** This driver is used for testing purposes. It does not actually send the emails but stores them in memory.

3. **AWS SES:** _Upcoming_

4. **Mailgun:** _Upcoming_

Upcoming drivers include AWS SES and Mailgun.

### How to send a simple email

You can send an email by using the `send` method on the `Mailer` instance. Here is a simple example:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Mailer } from '@Typetron/Mail'
import { Inject } from '@Typetron/Container'

@Controller()
export class HomeController {

    @Inject()
    mail: Mailer

    @Get()
    async welcome() {
        await this.mail.to('john@example.com')
            .send('Order #123 shipped')
    }
}

```

### How to send an email using the Mailable class

The Mailable class in Typetron allows you to send complex emails with ease. Here is an example using the Mailable class:

```ts
class OrderShipped extends Mailable {
    constructor(public order: Order) {
        super()
    }

    content() {
        return {
            html: `<h2>Order #${this.order.id} shipped</h2>`,
            text: `Order #${this.order.id} shipped`
        }
    }
}

```

```ts
import { Controller, Get } from '@Typetron/Router'
import { Mailer } from '@Typetron/Mail'
import { Inject } from '@Typetron/Container'

@Controller()
export class OrderController {

    @Inject()
    mail: Mailer

    @Get(':Order')
    async shipped(order: Order) {
        await this.mail.to('john@example.com')
            .send(new OrderShipped(order))
    }
}

```
