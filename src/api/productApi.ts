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
}: {
  limit?: number;
  skip?: number;
}): Promise<ProductsResponse> => {
  const response = await axiosInstance.get<ProductsResponse>('/products', {
    params: { limit, skip },
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
}: {
  query: string;
  limit?: number;
  skip?: number;
}): Promise<ProductsResponse> => {
  const response = await axiosInstance.get<ProductsResponse>(
    '/products/search',
    {
      params: { q: query, limit, skip },
    },
  );
  return response.data;
};
