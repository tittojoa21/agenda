export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
}

export interface FormUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  password2: string;
}

export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
