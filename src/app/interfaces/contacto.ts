export interface Contact {
  id: number,
  firstName: string,
  lastName: string,
  address: string,
  email: string,
  number: string,
  company: string,
  isFavorite : boolean,
  description : string,
  image : string,
}

export type NewContact = Omit<Contact, 'id'>
