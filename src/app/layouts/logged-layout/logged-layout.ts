import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ContactsService } from '../../services/contacts-service';
import Swal from 'sweetalert2';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-logged-layout',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './logged-layout.html',
  styleUrl: './logged-layout.scss'
})
export class LoggedLayoutComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    this.contactsCount = this.contactsService.contacts.length;
    this.setupRouteTracking();
  }
  private destroy$ = new Subject<void>();
  
  authService = inject(Auth);
  contactsService = inject(ContactsService);
  router = inject(Router);

  contactsCount = 0;
  currentRoute = '';
  isMobileMenuOpen = false;


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 
  private setupRouteTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.isMobileMenuOpen = false; 
      });
  }

  showLogoutModal(): void {
    Swal.fire({
      title: '¿Estás seguro de cerrar sesión?',
      text: 'Serás redirigido a la página de inicio de sesión',
      icon: 'question',
      iconColor: '#7E57C2',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      backdrop: true,
      background: '#1f2937',
      color: '#f9fafb',
      customClass: {
        popup: 'logout-modal',
        confirmButton: 'logout-confirm-btn',
        cancelButton: 'logout-cancel-btn',
        title: 'logout-title'
      },
      showClass: {
        popup: 'swal2-noanimation',
        backdrop: 'swal2-noanimation'
      },
      hideClass: {
        popup: '',
        backdrop: ''
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performLogout();
      }
    });
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

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  getPageTitle(): string {
    const routeMap: { [key: string]: string } = {
      '/': 'Mis Contactos',
      '/groups': 'Grupos de Contactos',
      '/contacts/new': 'Nuevo Contacto'
    };
    
    return routeMap[this.currentRoute] || 'ContactApp';
  }
}