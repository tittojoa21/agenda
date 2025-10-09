import { inject } from '@angular/core';
import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const onlyUserGuard: CanActivateChildFn = (childRoute, state) => {
  const authService = inject(Auth)
  const router = inject(Router);
  if(!authService.token){
  const redirectPath = router.parseUrl("/login");
    return new RedirectCommand(redirectPath, {
      skipLocationChange: true,
    });
  }
  return true
};
