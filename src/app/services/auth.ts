import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginData } from '../interfaces/auth';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private router = inject(Router);
  
  token: string | null = localStorage.getItem("token");
  private revisionTokenInterval: number | undefined;

  constructor() {
    if (this.token) {
      this.revisionTokenInterval = this.revisionToken();
    }
  }

  async login(loginData: LoginData): Promise<boolean> {
    try {
      const res = await fetch('https://agenda-api.somee.com/api/authentication/authenticate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData),
      });

      if (res.ok) {
        const resText = await res.text();
        this.token = resText;
        localStorage.setItem("token", this.token);
        this.revisionTokenInterval = this.revisionToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  async register(registerData: RegisterData): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('https://agenda-api.somee.com/api/Users', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData),
      });

      if (res.ok) {
        return { success: true };
      } else {
        const errorText = await res.text();
        return { 
          success: false, 
          message: this.getErrorMessage(res.status, errorText)
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Verifica tu internet' 
      };
    }
  }

  private getErrorMessage(status: number, errorText: string): string {
    try {
      const errorData = JSON.parse(errorText);
      return errorData.message || errorText;
    } catch {
      switch (status) {
        case 409: return 'Este email ya está registrado';
        case 400: return 'Datos inválidos. Por favor verifica la información';
        case 500: return 'Error del servidor. Intenta más tarde';
        default: return `Error en el registro (${status})`;
      }
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    this.token = null;
    this.router.navigate(["/login"]);
    if (this.revisionTokenInterval) {
      clearInterval(this.revisionTokenInterval);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }


  private revisionToken(): number {
    return window.setInterval(() => {
      if (this.token) {
        try {
          const base64Url = this.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
          );

          const claims: { exp: number } = JSON.parse(jsonPayload);
          if (new Date(claims.exp * 1000) < new Date()) {
            this.logout();
          }
        } catch (error) {
          console.error('Error al verificar token:', error);
          this.logout();
        }
      }
    }, 10 * 60 * 1000); 
  }

  ngOnDestroy(): void {
    if (this.revisionTokenInterval) {
      clearInterval(this.revisionTokenInterval);
    }
  }
}