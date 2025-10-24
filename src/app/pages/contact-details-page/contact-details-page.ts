import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactsService } from '../../services/contacts-service';
import { Contact } from '../../interfaces/contacto';
import { ModalHelpers } from '../../utils/modals'; 

@Component({
  selector: 'app-contact-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-details-page.html',
  styleUrl: './contact-details-page.scss'
})
export class ContactDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contactsService = inject(ContactsService);

  contacto: Contact | undefined;
  cargandoContacto = false;
  showError = false;
  errorMessage = '';
  
  toastMessage = '';
  showToast = false;

  async ngOnInit(): Promise<void> {
    await this.loadContact();
  }

  async loadContact(): Promise<void> {
    const contactId = this.route.snapshot.paramMap.get('idContacto');
    
    if (!contactId) {
      this.showError = true;
      this.errorMessage = 'ID de contacto no válido';
      return;
    }

    this.cargandoContacto = true;
    this.showError = false;
    this.errorMessage = '';

    try {
      this.contacto = this.contactsService.contacts.find(
        contacto => contacto.id.toString() === contactId
      );
      
      if (!this.contacto) {
        const contact = await this.contactsService.getContactById(contactId);
        this.contacto = contact || undefined;
      }
      
      if (!this.contacto) {
        this.showError = true;
        this.errorMessage = 'No se pudo encontrar el contacto solicitado';
      }
      
    } catch (error: any) {  
      console.error('Error loading contact:', error);
      this.showError = true;
      this.errorMessage = error.message || 'Error al cargar el contacto. Verifica tu conexión.';
    } finally {
      this.cargandoContacto = false;
    }
  }

  async toggleFavorite(): Promise<void> {
    if (!this.contacto) return;

    try {
      const success = await this.contactsService.setFavourite(this.contacto.id);
      if (success) {
        this.contacto.isFavorite = !this.contacto.isFavorite;
        
        const action = this.contacto.isFavorite ? 'agregado a' : 'quitado de';
        this.showToastMessage(`Contacto ${action} favoritos`);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      this.showError = true;
      this.errorMessage = error.message || 'Error al actualizar favorito';
    }
  }

  async deleteContact(): Promise<void> {
    if (!this.contacto) return;

    const confirmed = await ModalHelpers.confirmDelete('el contacto ' + this.getFullName() + '');

    if (!confirmed) {
      return;
    }

    try {
      const success = await this.contactsService.deleteContact(this.contacto.id);
      if (success) {
        this.showToastMessage('Contacto eliminado correctamente');
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      this.showError = true;
      this.errorMessage = error.message || 'Error al eliminar el contacto. Inténtalo de nuevo.';
    }
  }

  editContact(): void {
    if (!this.contacto) return;
    this.router.navigate(['/contacts', this.contacto.id, 'edit']);
  }

  getContactInitials(): string {
    if (!this.contacto) return '';
    const first = this.contacto.firstName?.charAt(0)?.toUpperCase() || '';
    const last = this.contacto.lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }

  getFullName(): string {
    if (!this.contacto) return '';
    return `${this.contacto.firstName} ${this.contacto.lastName || ''}`.trim();
  }

  hasContactInfo(): boolean {
    if (!this.contacto) return false;
    return !!(this.contacto.email || this.contacto.number || this.contacto.address || this.contacto.company);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    } else {
      return phone; 
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    
    const avatarElement = imgElement.closest('.avatar-image');
    if (avatarElement) {
      const initialsElement = avatarElement.nextElementSibling as HTMLElement;
      if (initialsElement && initialsElement.classList.contains('avatar-initials')) {
        initialsElement.style.display = 'flex';
      }
    }
  }

  async copyToClipboard(text: string): Promise<void> {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.showToastMessage('Copiado al portapapeles');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.body.removeChild(textArea);
        this.showToastMessage('Copiado al portapapeles');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        this.showToastMessage('Error al copiar');
      }
    }
  }

  shareContact(): void {
    if (!this.contacto) return;

    const contactInfo = this.generateShareableContactInfo();
    
    if (navigator.share) {
      navigator.share({
        title: `Contacto: ${this.getFullName()}`,
        text: contactInfo,
        url: window.location.href
      }).catch(error => {
        console.log('Error sharing:', error);
        this.copyToClipboard(contactInfo);
      });
    } else {
      this.copyToClipboard(contactInfo);
    }
  }

  private generateShareableContactInfo(): string {
    if (!this.contacto) return '';
    
    const lines = [
      `Contacto: ${this.getFullName()}`,
      this.contacto.company ? `Compañía: ${this.contacto.company}` : null,
      this.contacto.email ? `Email: ${this.contacto.email}` : null,
      this.contacto.number ? `Teléfono: ${this.contacto.number}` : null,
      this.contacto.address ? `Dirección: ${this.contacto.address}` : null,
      this.contacto.description ? `Notas: ${this.contacto.description}` : null
    ].filter(line => line !== null);
    
    return lines.join('\n');
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  async reloadContact(): Promise<void> {
    await this.loadContact();
  }
}