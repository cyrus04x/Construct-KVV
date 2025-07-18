import { Shop } from '@/types/shop';
import axios from 'axios';
import dotenv from "dotenv";
import { toast } from 'sonner';
dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ShopResponse {
  success: boolean;
  data: Shop[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ShopService = {
  async createShop(formData: FormData, authToken: string): Promise<Shop> {
    try {
      const response = await axios.post(`${API_URL}/api/v1/shops`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`
        },
      });
      return response.data as Shop;
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  },
  
  async getAllShops(): Promise<Shop[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/shops?page=1&limit=10&active=true&sort=createdAt&order=desc`);
      // Handle both direct array response and nested data response, with proper type checking
      const data: unknown = response.data;
      if (Array.isArray(data)) {
        return data as Shop[];
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as { data: Shop[] }).data;
      } else {
        throw new Error('Unexpected response format when fetching shops');
      }
      // End of try block
    } catch (error: unknown) {
      console.error('Error fetching shops:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Admin method to get all shops with pagination and filters
  async getShopsForAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
    active?: boolean,
    sellerId?: string,
    sort?: string,
    order?: 'asc' | 'desc',
    authToken?: string
  ): Promise<ShopResponse> {
    try {
      let url = `${API_URL}/api/v1/shops?page=${page}&limit=${limit}`;
      
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (active !== undefined) url += `&active=${active}`;
      if (sellerId) url += `&sellerId=${sellerId}`;
      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;

      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
      const response = await axios.get(url, { headers });
      return response.data as ShopResponse;
    } catch (error: unknown) {
      console.error('Error fetching shops for admin:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },


  async getShopById(id: string): Promise<Shop> { 
    try {
      const response = await axios.get(`${API_URL}/api/v1/shops/id/${id}`);
      return response.data as Shop;
    } catch (error: unknown) {
      console.error('Error fetching shop by id:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async getShopBySlug(slug: string): Promise<Shop> { 
    try {
      const response = await axios.get(`${API_URL}/api/v1/shops/slug/${slug}`);
      return response.data as Shop;
    } catch (error: unknown) {
      console.error('Error fetching shop by slug:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async getMyShop(authToken: string): Promise<Shop> { 
    try {
      const myshopdata = await axios.get<{ data: Shop[] }>(`${API_URL}/api/v1/shops/my-shops?page=1&limit=10&active=true&sort=createdAt&order=desc`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const response = myshopdata.data.data[0];

      console.log("MY-SHOP-DATA",response);
      return response as Shop;
    } catch (error: unknown) {
      console.error('Error fetching my shop:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async updateShop(id: string, formData: FormData, authToken: string): Promise<Shop> {
    try {
      const response = await axios.put(`${API_URL}/api/v1/shops/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`
        }
      });
      toast.success('Shop updated successfully');
      return response.data as Shop;
    } catch (error: unknown) {
      console.error('Error updating shop:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async deleteCategory(id: string, authToken: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/v1/shops/${id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      toast.success('Shop deleted successfully');
      } catch (error: unknown) {
      console.error('Error deleting category:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async getShopProductsCount(shopId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products?shopId=${shopId}`);
      const data = response.data as any;
      return data.meta?.total || 0;
    } catch (error: unknown) {
      console.error('Error fetching shop products count:', error);
      return 0;
    }
  },

  // Fetch products for a seller (admin view)
  async getProductsBySellerId(sellerId: string, page: number = 1, limit: number = 10, authToken?: string): Promise<{ products: any[]; meta?: any }> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products/seller/${sellerId}?page=${page}&limit=${limit}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
      });
      // The response may have products in data.products or data.data
      const data: any = response.data;
      return {
        products: data && (data.products || data.data) || [],
        meta: data && data.meta || undefined
      };
    } catch (error) {
      console.error('Error fetching products by sellerId:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
 
};