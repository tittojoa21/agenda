import { inject, Injectable } from '@angular/core';
import { Contact, NewContact } from '../interfaces/contacto';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  authService = inject(Auth);
  readonly URL_BASE = "https://agenda-api.somee.com/api/contacts";

  contacts: Contact[] = [];

  async getContacts(): Promise<Contact[]> {
    try {
      const res = await fetch(this.URL_BASE, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + this.authService.token
        }
      });
      
      if (res.ok) {
        const resJson: Contact[] = await res.json();
        this.contacts = resJson;
        return this.contacts;
      } else {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('No se pudieron cargar los contactos');
    }
  }

  async getContactById(id: string | number): Promise<Contact | null> {
    try {
      const localContact = this.contacts.find(contact => contact.id.toString() === id.toString());
      if (localContact) {
        return localContact;
      }

      const res = await fetch(`${this.URL_BASE}/${id}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + this.authService.token
        }
      });

      if (res.ok) {
        const contact: Contact = await res.json();
        return contact;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      return null;
    }
  }

  async createContact(nuevoContacto: NewContact): Promise<Contact> {
    try {
      const res = await fetch(this.URL_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.authService.token,
        },
        body: JSON.stringify(nuevoContacto)
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const resContact: Contact = await res.json();
      this.contacts.push(resContact);
      return resContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('No se pudo crear el contacto');
    }
  }

  async deleteContact(id: string | number): Promise<boolean> {
    try {
      const res = await fetch(`${this.URL_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + this.authService.token
        }
      });

      if (!res.ok) {
        return false;
      }

      this.contacts = this.contacts.filter(contact => contact.id.toString() !== id.toString());
      return true;
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      return false;
    }
  }

  async updateContact(contact: Contact): Promise<Contact | null> {
    try {
      const res = await fetch(`${this.URL_BASE}/${contact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.authService.token,
        },
        body: JSON.stringify(contact)
      });

      if (!res.ok) {
        console.error(`HTTP Error ${res.status}: ${res.statusText}`);
        return null;
      }

      const contentLength = res.headers.get('content-length');
      const contentType = res.headers.get('content-type');
      
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        console.log('Respuesta vacía o no JSON, actualizando localmente');
        this.contacts = this.contacts.map(oldContact => {
          if (oldContact.id.toString() === contact.id.toString()) {
            return contact;
          }
          return oldContact;
        });
        return contact;
      }

      const updatedContact: Contact = await res.json();
      
      this.contacts = this.contacts.map(oldContact => {
        if (oldContact.id.toString() === contact.id.toString()) {
          return updatedContact;
        }
        return oldContact;
      });
      
      return updatedContact;
    } catch (error) {
      console.error(`Error updating contact ${contact.id}:`, error);
      
      this.contacts = this.contacts.map(oldContact => {
        if (oldContact.id.toString() === contact.id.toString()) {
          return contact;
        }
        return oldContact;
      });
      
      return contact;
    }
  }

  async setFavourite(id: string | number): Promise<boolean> {
    try {
      const res = await fetch(`${this.URL_BASE}/${id}/favorite`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.authService.token,
        },
      });

      if (!res.ok) {
        return false;
      }

      this.contacts = this.contacts.map(contact => {
        if (contact.id.toString() === id.toString()) {
          return { ...contact, isFavorite: !contact.isFavorite };
        }
        return contact;
      });

      return true;
    } catch (error) {
      console.error(`Error toggling favorite for contact ${id}:`, error);
      return false;
    }
  }

  searchContacts(searchTerm: string): Contact[] {
    if (!searchTerm.trim()) {
      return this.contacts;
    }

    const term = searchTerm.toLowerCase();
    return this.contacts.filter(contact =>
      contact.firstName?.toLowerCase().includes(term) ||
      contact.lastName?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.number?.includes(term) ||
      contact.company?.toLowerCase().includes(term) ||
      contact.address?.toLowerCase().includes(term)
    );
  }

  getFavoriteContacts(): Contact[] {
    return this.contacts.filter(contact => contact.isFavorite);
  }

  getStats() {
    return {
      total: this.contacts.length,
      favorites: this.getFavoriteContacts().length
    };
  }

  async editContact(contact: Contact): Promise<Contact | null> {
    return this.updateContact(contact);
  }

  async toggleFavorite(id: string | number): Promise<boolean> {
    return this.setFavourite(id);
  }
}