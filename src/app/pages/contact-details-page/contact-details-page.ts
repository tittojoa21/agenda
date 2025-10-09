import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactsService } from '../../services/contacts-service';
import { Contact } from '../../interfaces/contacto';

@Component({
  selector: 'app-contact-details-page',
  imports: [RouterModule],
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
  activeTab: 'info' | 'activity' = 'info';
  
  toastMessage = '';
  showToast = false;

  async ngOnInit(): Promise<void> {
    await this.loadContact();
  }

  async loadContact(): Promise<void> {
    const contactId = this.route.snapshot.paramMap.get('id');
    
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
        const res = await this.contactsService.getContactById(contactId);
        if (res) {
          this.contacto = res;
        }
      }
      
      if (!this.contacto) {
        this.showError = true;
        this.errorMessage = 'No se pudo encontrar el contacto';
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
      const res = await this.contactsService.setFavourite(this.contacto.id);
      if (res) {
        this.contacto.isFavorite = !this.contacto.isFavorite;
        
        // Mostrar feedback
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

    const contactName = this.getFullName();
    if (!confirm(`¿Estás seguro de que quieres eliminar a "${contactName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await this.contactsService.deleteContact(this.contacto.id);
      if (res) {
        this.showToastMessage('Contacto eliminado correctamente');
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      this.showError = true;
      this.errorMessage = error.message || 'Error al eliminar el contacto';
    }
  }

  editContact(): void {
    if (!this.contacto) return;
    this.router.navigate(['/contacts', this.contacto.id, 'edit']);
  }

  getContactInitials(): string {
    if (!this.contacto) return '';
    const first = this.contacto.firstName.charAt(0).toUpperCase();
    const last = this.contacto.lastName ? this.contacto.lastName.charAt(0).toUpperCase() : '';
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

  setActiveTab(tab: 'info' | 'activity'): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Limpiar el número
    const cleaned = phone.replace(/\D/g, '');
    
    // Aplicar formato según la longitud
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
    
    // Mostrar iniciales si la imagen falla
    const avatarElement = imgElement.closest('.contact-avatar');
    if (avatarElement) {
      const initialsElement = avatarElement.querySelector('.avatar-initials') as HTMLElement;
      if (initialsElement) {
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
        document.execCommand('copy');
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

  hasImage(): boolean {
    return !!(this.contacto?.image);
  }
}