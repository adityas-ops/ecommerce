import axiosInstance from './axiosInstance';
import { Product } from '../types/product';

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export const getProducts = async ({
  limit = 10,
  skip = 0,
  sortBy,
  order,
}: {
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<ProductsResponse> => {
  const params: Record<string, any> = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
  }
  if (order) {
    params.order = order;
  }

  const response = await axiosInstance.get<ProductsResponse>('/products', {
    params,
  });
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
};

export const searchProducts = async ({
  query,
  limit = 10,
  skip = 0,
  sortBy,
  order,
}: {
  query: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<ProductsResponse> => {
  const params: Record<string, any> = { q: query, limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
  }
  if (order) {
    params.order = order;
  }

  const response = await axiosInstance.get<ProductsResponse>(
    '/products/search',
    { params },
  );
  return response.data;
};

export const getCategoriesList = async (): Promise<string[]> => {
  const response = await axiosInstance.get<string[]>('/products/category-list');
  return response.data;
};

export const getProductsByCategory = async ({
  category,
  limit = 10,
  skip = 0,
  sortBy,
  order,
}: {
  category: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<ProductsResponse> => {
  const params: Record<string, any> = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
  }
  if (order) {
    params.order = order;
  }

  const response = await axiosInstance.get<ProductsResponse>(
    `/products/category/${category}`,
    { params },
  );
  return response.data;
};
