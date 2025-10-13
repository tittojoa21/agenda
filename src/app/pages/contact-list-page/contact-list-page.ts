import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactListItem } from '../../components/contact-list-item/contact-list-item';
import { Auth } from '../../services/auth';
import { ContactsService } from '../../services/contacts-service';
import { Contact, NewContact } from '../../interfaces/contacto';

@Component({
  selector: 'app-contact-list-page',
  imports: [CommonModule, RouterModule, ContactListItem, FormsModule],
  templateUrl: './contact-list-page.html',
  styleUrl: './contact-list-page.scss'
})
export class ContactListPage implements OnInit, OnDestroy {
  authService = inject(Auth); 
  contactsService = inject(ContactsService);

  showContactForm = false;
  searchTerm = '';
  filteredContacts: Contact[] = [];
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  showError = false;

  newContact: NewContact = {
    firstName: '',
    lastName: '',
    email: '',
    number: '',
    address: '',
    company: '',
    description: '',
    image: '',
    isFavorite: false
  };

  ngOnInit(): void {
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.contactsService.contacts = [];
  }

  async loadContacts(): Promise<void> {
    this.isLoading = true;
    this.showError = false;
    this.errorMessage = '';

    try {
      await this.contactsService.getContacts();
      this.filteredContacts = [...this.contactsService.contacts];
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      this.showError = true;
      this.errorMessage = error.message || 'Error al cargar los contactos. Por favor intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  toggleContactForm(): void {
    this.showContactForm = !this.showContactForm;
    if (!this.showContactForm) {
      this.resetNewContactForm();
    }
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterContacts();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterContacts();
  }

  filterContacts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contactsService.contacts];
      return;
    }

    this.filteredContacts = this.contactsService.contacts.filter(contact =>
      contact.firstName?.toLowerCase().includes(this.searchTerm) ||
      contact.lastName?.toLowerCase().includes(this.searchTerm) ||
      contact.email?.toLowerCase().includes(this.searchTerm) ||
      contact.number?.includes(this.searchTerm) ||
      contact.company?.toLowerCase().includes(this.searchTerm) ||
      contact.address?.toLowerCase().includes(this.searchTerm)
    );
  }

  getFavoriteCount(): number {
    return this.contactsService.contacts.filter(contact => contact.isFavorite).length;
  }

  async createContact(): Promise<void> {
    // Validación básica
    if (!this.newContact.firstName?.trim() || !this.newContact.number?.trim()) {
      this.showError = true;
      this.errorMessage = 'Nombre y teléfono son campos obligatorios.';
      return;
    }

    if (this.newContact.number.length < 4) {
      this.showError = true;
      this.errorMessage = 'El teléfono debe tener al menos 4 caracteres.';
      return;
    }

    this.isSubmitting = true;
    this.showError = false;

    try {
      await this.contactsService.createContact({
        firstName: this.newContact.firstName.trim(),
        lastName: this.newContact.lastName?.trim() || '',
        email: this.newContact.email?.trim() || '',
        number: this.newContact.number.trim(),
        address: this.newContact.address?.trim() || '',
        company: this.newContact.company?.trim() || '',
        description: this.newContact.description?.trim() || '',
        image: this.newContact.image?.trim() || '',
        isFavorite: false
      });

      this.filteredContacts = [...this.contactsService.contacts];
      
      this.resetNewContactForm();
      this.showContactForm = false;
      
      console.log('Contacto creado exitosamente');

    } catch (error: any) {
      console.error('Error creating contact:', error);
      this.showError = true;
      this.errorMessage = error.message || 'Error al crear el contacto. Por favor intenta nuevamente.';
    } finally {
      this.isSubmitting = false;
    }
  }

  crearContactoEjemplo(): void {
    this.newContact = {
      firstName: 'María',
      lastName: 'García',
      email: 'maria.garcia@example.com',
      number: '+1234567890',
      address: 'Avenida Principal 456',
      company: 'Tech Solutions',
      description: 'Ejemplo de contacto',
      image: '',
      isFavorite: false
    };
  }

  resetNewContactForm(): void {
    this.newContact = {
      firstName: '',
      lastName: '',
      email: '',
      number: '',
      address: '',
      company: '',
      description: '',
      image: '',
      isFavorite: false
    };
    this.showError = false;
  }

  onContactUpdate(): void {
    this.filterContacts();
  }

  onContactDelete(): void {
    this.filterContacts();
  }

  logout(): void {
    this.authService.logout();
  }

  get totalContacts(): number {
    return this.contactsService.contacts.length;
  }

  get hasContacts(): boolean {
    return this.contactsService.contacts.length > 0;
  }

  get showNoResults(): boolean {
    return this.hasContacts && this.filteredContacts.length === 0 && this.searchTerm.trim() !== '';
  }

  get showEmptyState(): boolean {
    return !this.hasContacts && !this.isLoading && !this.showError;
  }

  // Método para recargar contactos
  async reloadContacts(): Promise<void> {
    await this.loadContacts();
  }
}