import { Component, input, output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Contact } from '../../interfaces/contacto';
import { ContactsService } from '../../services/contacts-service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-contact-list-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-list-item.html',
  styleUrls: ['./contact-list-item.scss']
})
export class ContactListItem {
  private contactsService = inject(ContactsService);
  private router = inject(Router);

  // Inputs
  contacto = input.required<Contact>();
  index = input.required<number>();
  showIndex = input<boolean>(true);
  showActions = input<boolean>(true);
  variant = input<'default' | 'compact' | 'detailed'>('default');

  // Outputs
  contactUpdated = output<void>();
  contactDeleted = output<void>();
  contactSelected = output<Contact>();

  // Estado interno
  isDeleting = false;
  isTogglingFavorite = false;

  // Métodos públicos
  async onToggleFavorite(event: Event): Promise<void> {
    event.stopPropagation();
    
    if (this.isTogglingFavorite) return;

    this.isTogglingFavorite = true;
    
    try {
      const success = await this.contactsService.setFavourite(this.contacto().id);
      if (success) {
        this.contactUpdated.emit();
        const action = this.contacto().isFavorite ? 'quitado de' : 'agregado a';
        Swal.fire(`Contacto ${action} favoritos`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Swal.fire('Error al actualizar favorito');
    } finally {
      this.isTogglingFavorite = false;
    }
  }

  async onDeleteContact(): Promise<void> {
    if (this.isDeleting) return;

    this.isDeleting = true;

    try {
      const success = await this.contactsService.deleteContact(this.contacto().id);
      if (success) {
        this.contactDeleted.emit();
        Swal.fire('Contacto eliminado correctamente');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      Swal.fire('Error al eliminar el contacto');
    } finally { 
      this.isDeleting = false;
    }
  }

  onEditContact(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/contacts', this.contacto().id, 'edit']);
  }

  onContactClick(): void {
    this.contactSelected.emit(this.contacto());
    this.router.navigate(['/contacts', this.contacto().id]);
  }

  // Helpers
  getContactInitials(): string {
    const contact = this.contacto();
    const first = contact.firstName?.charAt(0)?.toUpperCase() || '';
    const last = contact.lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }

  getFullName(): string {
    const contact = this.contacto();
    return `${contact.firstName} ${contact.lastName || ''}`.trim();
  }

  hasContactInfo(): boolean {
    const contact = this.contacto();
    return !!(contact.email || contact.number || contact.company);
  }

  showDeleteModal(): void {
    const contactName = this.getFullName();
    
    Swal.fire({
      title: '¿Estás seguro?',
      html: `Vas a eliminar a <strong>${contactName}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      backdrop: true,
      background: '#1f2937',
      color: '#f9fafb',
      customClass: {
        popup: 'delete-modal',
        confirmButton: 'delete-confirm-btn',
        cancelButton: 'delete-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.onDeleteContact();
      }
    });
  }
}