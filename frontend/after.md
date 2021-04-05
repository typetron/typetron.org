
```file-path
📁 login.component.ts (After - Using Typetron Form Builder)
```

```ts
import { Component } from '@angular/core'
import { FormBuilder } from '@Typetron/angular'
import { AuthService } from '../../services/auth.service'
import { LoginForm } from '@Data/Forms/LoginForm'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    form = FormBuilder.build(LoginForm)
    
    constructor(
        private authService: AuthService
    ) {}

    async login(): Promise<void> {
        await this.authService.login(this.form.value)
    }
}
```
