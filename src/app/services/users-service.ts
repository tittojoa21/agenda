import { inject, Injectable } from '@angular/core';
import { Auth } from './auth';
import { NewUser, User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  authService = inject(Auth);

  async register(user: NewUser) {
    const res = await fetch('https://agenda-api.somee.com/api/Users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.authService.token,
      },
      body: JSON.stringify(user),
    });
    return res.ok;
  }
}