import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterPage {
  errorRegister = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordMismatch = false;
  isLoading = false;

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  async register() {
    this.errorRegister = false;
    this.errorMessage = '';
    this.passwordMismatch = false;

    if (!this.formData.firstName || !this.formData.lastName || 
        !this.formData.email || !this.formData.password || 
        !this.formData.confirmPassword) {
      this.errorRegister = true;
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.passwordMismatch = true;
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorRegister = true;
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    if (this.formData.password.length < 4) {
      this.errorRegister = true;
      this.errorMessage = 'La contraseña debe tener al menos 4 caracteres';
      return;
    }

    const userData = {
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.toLowerCase().trim(),
      password: this.formData.password
    };

    console.log('Enviando datos al backend:', userData);

    this.isLoading = true;

    try {
      const res = await fetch('https://agenda-api.somee.com/api/Users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        console.log('Registro exitoso');
        this.errorRegister = false;
        this.errorMessage = '';
        
        const loginSuccess = await this.autoLoginAfterRegister(userData.email, userData.password);
        
        if (loginSuccess) {
          
          this.router.navigate(['/']);
        } else {
          
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'true' } 
          });
        }
      } else {
        this.handleRegistrationError(res);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      this.errorRegister = true;
      this.errorMessage = 'Error de conexión. Verifica tu conexión a internet';
    } finally {
      this.isLoading = false;
    }
  }

  private async autoLoginAfterRegister(email: string, password: string): Promise<boolean> {
    try {
      const loginData = { email, password };
      return await this.authService.login(loginData);
    } catch (error) {
      console.log('Auto-login falló, redirigiendo al login manual');
      return false;
    }
  }

  private async handleRegistrationError(response: Response) {
    try {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      this.errorRegister = true;
      
      switch (response.status) {
        case 409:
          this.errorMessage = 'Este email ya está registrado';
          break;
        case 400:
          this.errorMessage = errorData.message || 'Datos inválidos. Por favor verifica la información';
          break;
        case 500:
          this.errorMessage = 'Error del servidor. Por favor intenta más tarde';
          break;
        default:
          this.errorMessage = errorData.message || 'Error en el registro. Por favor intenta nuevamente';
      }
      
      console.error('Error en el registro:', response.status, errorData);
    } catch (error) {
      this.errorMessage = 'Error inesperado. Por favor intenta nuevamente';
      console.error('Error al procesar respuesta:', error);
    }
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }


  clearError() {
    this.errorRegister = false;
    this.errorMessage = '';
    this.passwordMismatch = false;
  }


  checkPasswordMatch() {
    if (this.formData.password && this.formData.confirmPassword) {
      this.passwordMismatch = this.formData.password !== this.formData.confirmPassword;
      if (this.passwordMismatch) {
        this.errorMessage = 'Las contraseñas no coinciden';
      } else {
        this.errorMessage = '';
      }
    }
  }
}