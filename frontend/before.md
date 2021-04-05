```file-path
📁 login.component.ts (Before - using Angular Form Builder)
```

```ts
import { Component } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { AuthService } from '../../services/auth.service'
import { LoginForm } from '@Data/Forms/LoginForm'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    form = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]],
    })

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) {}

    async login(): Promise<void> {
        await this.authService.login(this.form.value)
    }
}
```
