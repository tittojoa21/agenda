import { Component, input, output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Contact } from '../../interfaces/contacto';
import { ContactsService } from '../../services/contacts-service';
import { Toast, ModalHelpers } from '../../utils/modals';

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

  contacto = input.required<Contact>();
  index = input.required<number>();
  showIndex = input<boolean>(true);
  showActions = input<boolean>(true);
  variant = input<'default' | 'compact' | 'detailed'>('default');

  contactUpdated = output<void>();
  contactDeleted = output<void>();
  contactSelected = output<Contact>();

  isDeleting = false;
  isTogglingFavorite = false;

  async onToggleFavorite(event: Event): Promise<void> {
    event.stopPropagation();
    
    if (this.isTogglingFavorite) return;

    this.isTogglingFavorite = true;
    
    try {
      const success = await this.contactsService.setFavourite(this.contacto().id);
      if (success) {
        this.contactUpdated.emit();
        const action = this.contacto().isFavorite ? 'quitado de' : 'agregado a';
        Toast.success(`Contacto ${action} favoritos`);
      } else {
        Toast.error('Error al actualizar favorito');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Toast.error('Error al actualizar favorito');
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
        Toast.success('Contacto eliminado correctamente');
      } else {
        Toast.error('Error al eliminar el contacto');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      Toast.error('Error al eliminar el contacto');
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

  async showDeleteModal(): Promise<void> {
    const contactName = this.getFullName();
    
    const result = await ModalHelpers.confirmDelete(contactName);

    if (result) {
      await this.onDeleteContact();
    }
  }

  async confirmAction(action: string, message: string): Promise<boolean> {
    return await Toast.confirm(action, message);
  }

  async showContactInfo(): Promise<void> {
    const contact = this.contacto();
    const htmlContent = `
      <div class="contact-info-modal">
        <div class="contact-header">
          <div class="contact-avatar-large">
            ${contact.image ? 
              `<img src="${contact.image}" alt="${this.getFullName()}" class="avatar-image">` : 
              `<div class="avatar-initials-large">${this.getContactInitials()}</div>`
            }
          </div>
          <h3>${this.getFullName()}</h3>
          ${contact.isFavorite ? '<span class="favorite-badge-modal">⭐ Favorito</span>' : ''}
        </div>
        
        <div class="contact-details-modal">
          ${contact.company ? `
            <div class="detail-item">
              <i class="fas fa-building"></i>
              <span>${contact.company}</span>
            </div>
          ` : ''}
          
          ${contact.email ? `
            <div class="detail-item">
              <i class="fas fa-envelope"></i>
              <a href="mailto:${contact.email}">${contact.email}</a>
            </div>
          ` : ''}
          
          ${contact.number ? `
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <a href="tel:${contact.number}">${contact.number}</a>
            </div>
          ` : ''}
          
          ${contact.address ? `
            <div class="detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${contact.address}</span>
            </div>
          ` : ''}
          
          ${contact.description ? `
            <div class="detail-item description">
              <i class="fas fa-file-alt"></i>
              <p>${contact.description}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    await Toast.infoModal('Información del Contacto', htmlContent);
  }
}