import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ContactsService } from '../../services/contacts-service';
import { ModalHelpers } from '../../utils/modals';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-logged-layout',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './logged-layout.html',
  styleUrl: './logged-layout.scss'
})
export class LoggedLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  authService = inject(Auth);
  contactsService = inject(ContactsService);
  router = inject(Router);

  contactsCount = 0;

  ngOnInit(): void {
    this.contactsCount = this.contactsService.contacts.length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async showLogoutModal(): Promise<void> {
    const result = await ModalHelpers.confirmAction(
      '¿Estás seguro de cerrar sesión?',
      'Serás redirigido a la página de inicio de sesión'
    );

    if (result) {
      this.performLogout();
    }
  }

  private performLogout(): void {
    const mainContent = document.querySelector('.layout-main');
    if (mainContent) {
      mainContent.classList.add('fade-out');
    }

    setTimeout(() => {
      this.authService.logout();
    }, 300);
  }
}