---
layout: blank

title: Frontend

keywords: frontend

description: frontend
---

## Using Typetron with your favorite frontend tools

Typetron provides tools for using backend code in your frontend applications: [Models](/docs/models)
and [Forms](/docs/forms). This way you will be able to reuse some business logic without writing it twice: once on the
backend side and once on the frontend side. Check out these tutorials on how to get started with Typetron and your
favorite framework/library:

<div class="box-wrapper">
	<a class="box" href="angular">
		<h4>Angular</h4>
		<div class="box-content">
			<img src="https://angular.io/assets/images/logos/angular/angular.svg" alt="angular">
		</div>
		<p><i>Let's start</i></p>
	</a>

	<a class="box in-progress" href="">
		<h4>Vue</h4>
		<div class="box-content">
			<img src="https://vuejs.org/images/logo.png" alt="vuejs" height="150">
		</div>
		<p><i>In progress</i></p>
	</a>
	
	<a class="box in-progress" href="">
		<h4>React</h4>
		<div class="box-content">
			<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="reactjs">
		</div>
		<p><i>In progress</i></p>
	</a>


</div>

[comment]: <> (	<a class="box in-progress" href="">)

[comment]: <> (		<h4>Aurelia</h4>)

[comment]: <> (		<div class="box-content">)

[comment]: <> (			<img src="https://aurelia.io/styles/images/aurelia-icon.svg" alt="aurelia">)

[comment]: <> (		</div>)

[comment]: <> (		<p><i>In progress</i></p>)

[comment]: <> (	</a>)

#### Example (with Angular)

Here is an example of a Form that is used on the backend side (with Typetron) and on the frontend side (with Angular).
This form has some validation rules attached so its fields:

```file-path
📁 LoginForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'

export class LoginForm extends Form {

    @Field()
    @Rules(Required)
    username: string

    @Field()
    @Rules(Required)
    password: string
}
```

In the controller, when this form is used, Typetron will automatically validate the request. In case of invalid inputs,
Typetron will throw some errors:

```file-path
📁 AuthController.ts
```

```ts
import { Controller, Post } from '@Typetron/Router'
import { LoginForm } from 'App/Forms/LoginForm'
import { Inject } from '@Typetron/Container'
import { Auth } from '@Typetron/Framework/Auth'

@Controller()
export class AuthController {

    @Inject()
    auth: Auth

    @Post('login')
    async login(form: LoginForm) {
        return {
            token: await this.auth.login(form.username, form.password),
        }
    }
}
```

This form can also be used on the frontend side (in this case with Angular). Check the "before" section where you
have to build the form manually using the Angular FormBuilder, and the "after" section where the form is built using
Typetron frontend utilities. It will create the expected form, and it will also add the needed validations:

<div style="display: flex;flex-direction: row;">
	<div style="flex:1 ; padding-right:8px; width: 50%;">
        {% capture my_include %} {% include_relative before.md %} {% endcapture %}
        {{ my_include | markdownify }}
	</div>
	<div style="flex:1; padding-left:8px; width: 50%;">
        {% capture my_include %} {% include_relative after.md %} {% endcapture %}
        {{ my_include | markdownify }}
	</div>
</div>
