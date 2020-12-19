---
layout: docs

title: Authentication
---

## {{ page.title }}

Authentication is built in Typetron and configured for you out of the box. All the magic happens inside
_AuthController_ that comes with the blank Typetron app. Inside, there are two methods that take care of registering and
logging in users.

You can check the _config/auth.ts_ file to see the different configuration options.

#### Creating a new user

If you want to create a new user, simply make a POST request to the _/register_ endpoint giving it an email, password
and a password confirmation as in the following image, and you will have a user created in your database.

```json
{
    "email": "john@example.com",
    "password": "myPassword",
    "passwordConfirmation": "myPassword"
}
```

#### Logging in a user

You can now log-in with your newly created user by making a POST request to the _/login_ route providing the email and
the password:

```json
{
    "email": "john@example.com",
    "password": "myPassword"
}
```

You will be getting a [JWT](https://jwt.io/) token back that you can use to authenticate the user in your app.
