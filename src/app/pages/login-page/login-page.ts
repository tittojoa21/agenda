import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [RouterModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {
  authService = inject(Auth)
  router = inject(Router)

  errorLogin = false;
  showPassword = false; 

  async login(form: NgForm) {
    console.log(form.value)
    this.errorLogin = false;
    if (!form.value.email || !form.value.password) {
      this.errorLogin = true;
      return
    }
    const loginResult = await this.authService.login(form.value);
    if (loginResult) this.router.navigate(["/"]);
    this.errorLogin = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}