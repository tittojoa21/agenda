import { Component, inject, input, OnInit, viewChild, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactsService } from '../../services/contacts-service';
import { Router } from '@angular/router';
import { Contact, NewContact } from '../../interfaces/contacto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-edit-contact',
  imports: [FormsModule, CommonModule],
  templateUrl: './new-edit-contact.html',
  styleUrl: './new-edit-contact.scss'
})
export class NewEditContact implements OnInit {
  contactsService = inject(ContactsService);
  router = inject(Router);
  
  errorEnBack = signal(false);
  idContacto = input<string>();
  contactoBack = signal<Contact | undefined>(undefined);
  form = viewChild<NgForm>("newContactForm");
  solicitudABackEnCurso = signal(false);
  errorMessage = signal('');
  
  fieldStates = signal<{[key: string]: string}>({});

  async ngOnInit() {
    if (this.idContacto()) {
      try {
        const contacto: Contact | null = await this.contactsService.getContactById(this.idContacto()!);
        if (contacto) {
          this.contactoBack.set(contacto);
          setTimeout(() => {
            this.form()?.setValue({
              address: contacto.address || '',
              company: contacto.company || '',
              email: contacto.email || '',
              firstName: contacto.firstName,
              image: contacto.image || '',
              lastName: contacto.lastName || '',
              number: contacto.number,
              description: contacto.description || ''
            });
          });
        } else {
          this.errorEnBack.set(true);
          this.errorMessage.set('Contacto no encontrado');
        }
      } catch (error) {
        this.errorEnBack.set(true);
        this.errorMessage.set('Error al cargar el contacto');
      }
    }
  }

  async handleFormSubmission(form: NgForm) {
    if (form.invalid || this.solicitudABackEnCurso()) {
      return;
    }

    this.errorEnBack.set(false);
    this.errorMessage.set('');

    const nuevoContacto: NewContact = {
      firstName: form.value.firstName?.trim() || '',
      lastName: form.value.lastName?.trim() || '',
      address: form.value.address?.trim() || '',
      email: form.value.email?.trim() || '',
      image: form.value.image?.trim() || '',
      number: form.value.number?.trim() || '',
      company: form.value.company?.trim() || '',
      description: form.value.description?.trim() || '',
      isFavorite: false
    };

    if (!nuevoContacto.firstName || !nuevoContacto.number) {
      this.errorEnBack.set(true);
      this.errorMessage.set('Nombre y teléfono son campos obligatorios');
      return;
    }

    this.solicitudABackEnCurso.set(true);

    try {
      let res;
      if (this.idContacto()) {
        const contactToUpdate: Contact = {
          ...nuevoContacto,
          id: this.contactoBack()!.id
        };
        res = await this.contactsService.editContact(contactToUpdate);
        
        if (!res) {
          console.warn('El servidor no devolvió el contacto actualizado, usando datos locales');
          res = contactToUpdate;
        }
      } else {
        res = await this.contactsService.createContact(nuevoContacto);
      }

      this.solicitudABackEnCurso.set(false);

      if (!res) {
        this.errorEnBack.set(true);
        this.errorMessage.set('Error al guardar el contacto. Por favor, intente nuevamente.');
        return;
      }

      const contactId = res.id || this.idContacto();
      this.router.navigate(["/contacts", contactId]);
      
    } catch (error) {
      this.solicitudABackEnCurso.set(false);
      this.errorEnBack.set(true);
      this.errorMessage.set('Error de conexión. Por favor, verifique su internet e intente nuevamente.');
    }
  }

  validateField(field: any, fieldName: string): void {
    if (field.dirty || field.touched) {
      const states = { ...this.fieldStates() };
      
      if (field.invalid) {
        if (field.errors?.['required']) {
          states[fieldName] = 'Este campo es obligatorio';
        } else if (field.errors?.['minlength']) {
          states[fieldName] = `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
        } else if (field.errors?.['maxlength']) {
          states[fieldName] = `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
        } else if (field.errors?.['email']) {
          states[fieldName] = 'Formato de email inválido';
        } else {
          states[fieldName] = 'Campo inválido';
        }
      } else {
        states[fieldName] = '';
      }
      
      this.fieldStates.set(states);
    }
  }

  getFieldClass(field: any): string {
    if (!field?.dirty && !field?.touched) return '';
    return field?.invalid ? 'error' : 'valid';
  }

  cancel(): void {
    if (this.idContacto()) {
      this.router.navigate(['/contacts', this.idContacto()]);
    } else {
      this.router.navigate(['/contacts']);
    }
  }
}