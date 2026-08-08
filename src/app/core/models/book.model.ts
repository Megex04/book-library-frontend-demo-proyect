export interface Book {
  id?: number;
  title: string;
  isbn: string;
  year: number;
  edition: string;
  publisher: string;
  language: string;
  pages: number;
  description: string;
  coverImage?: string;
  location: string;
  stock: number;
  availableStock: number;
  authors: Author[];
  categories: Category[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Author {
  id?: number;
  name: string;
  biography?: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
}