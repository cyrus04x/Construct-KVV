/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { GenericButton } from "@/components/ui/generic-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  Funnel,
  Plus,
  Upload,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Store,
  Package,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shop } from '@/types/shop';
import { useRouter } from 'next/navigation';
import { ShopService, ShopResponse } from '@/app/services/shopServices';
import { toast } from 'sonner';
import { getUserDataFromLocalStorage } from '@/app/utils/middlewares/UserCredentions';
import { useTranslations } from '@/app/hooks/useTranslations';

// Temporary Pagination component implementation
interface PaginationProps {
  total: number;
  current: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ total, current, onPageChange }: PaginationProps) => {
  if (total <= 1) return null;
  return (
    <div className="flex space-x-1">
      <GenericButton
        className="px-2 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
      >
        Prev
      </GenericButton>
      {Array.from({ length: total }, (_, i) => (
        <GenericButton
          key={i + 1}
          className={`px-2 py-1 border rounded ${current === i + 1 ? 'bg-primary text-white' : ''}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </GenericButton>
      ))}
      <GenericButton
        className="px-2 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
      >
        Next
      </GenericButton>
    </div>
  );
};

// Extended Shop interface with additional fields
interface ExtendedShop extends Shop {
  sellerName?: string;
  productsCount?: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [shops, setShops] = useState<ExtendedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalShops, setTotalShops] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const USER = getUserDataFromLocalStorage();
  const authToken = USER?.token;
  const { t } = useTranslations();

  // Fetch shops data
  const fetchShops = async () => {
    if (!authToken) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const response = await ShopService.getShopsForAdmin(
        currentPage,
        resultsPerPage,
        searchTerm || undefined,
        true,
        undefined,
        'createdAt',
        'desc',
        authToken // Pass the token here
      );

      // Transform the response to match our ExtendedShop interface
      const transformedShops: ExtendedShop[] = await Promise.all(response.data.map(async shop => {
        let productCount = 0;
        try {
          productCount = await ShopService.getShopProductsCount(shop.id);
        } catch (e) {
          productCount = 0;
        }
        return {
          ...shop,
          sellerName: shop.seller?.businessName || 'Unknown Seller',
          productCount,
          status: shop.isActive ? 'active' : 'inactive',
          createdAt: shop.createdAt || new Date().toISOString()
        };
      }));

      setShops(transformedShops);
      setTotalShops(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  // Fetch shops when dependencies change
  useEffect(() => {
    fetchShops();
  }, [currentPage, resultsPerPage, searchTerm]);

  // Local filtering by isActive for tabs
  let currentShops = shops;
  if (activeTab === 'active') {
    currentShops = shops.filter(shop => shop.isActive === true);
  } else if (activeTab === 'inactive') {
    currentShops = shops.filter(shop => shop.isActive === false);
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleResultsPerPageChange = (value: string) => {
    setResultsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewShop = (shopId: string) => {
    router.push(`/dashboard/shops/${shopId}`);
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If no inactive shops, display a message
  const showNoInactive = activeTab === 'inactive' && currentShops.length === 0 && !loading;

  if (loading && shops.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('dashboard.loadingShops', 'Loading shops...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('dashboard.shopsManagement', 'Shops Management')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.shopsManagementDesc', 'View and manage all shops registered on your platform.')}
          </p>
        </div>
        <div className="space-x-2">
          <GenericButton variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t('dashboard.export', 'Export')}
          </GenericButton>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">{t('dashboard.allShops', 'All Shops')}</TabsTrigger>
            <TabsTrigger value="active">{t('dashboard.active', 'Active')}</TabsTrigger>
            <TabsTrigger value="inactive">{t('dashboard.inactive', 'Inactive')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <GenericButton variant="outline" size="sm">
                <Funnel className="h-4 w-4 mr-2" />
                {t('dashboard.filter', 'Filter')} <ChevronDown className="h-4 w-4 ml-2" />
              </GenericButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>{t('dashboard.filterByName', 'Filter by Name')}</DropdownMenuItem>
              <DropdownMenuItem>{t('dashboard.filterBySeller', 'Filter by Seller')}</DropdownMenuItem>
              <DropdownMenuItem>{t('dashboard.filterByDate', 'Filter by Date')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="search"
            placeholder={t('dashboard.searchShops', 'Search shops...')}
            className="w-[300px] sm:w-[400px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-amber-300'>{t('dashboard.shop', 'Shop')}</TableHead>
              <TableHead className='text-amber-300'>{t('dashboard.seller', 'Seller')}</TableHead>
              <TableHead className='text-amber-300'>{t('dashboard.products', 'Products')}</TableHead>
              <TableHead className='text-amber-300'>{t('dashboard.status', 'Status')}</TableHead>
              <TableHead className='text-amber-300'>{t('dashboard.created', 'Created')}</TableHead>
              <TableHead className='text-amber-300'>{t('dashboard.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentShops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Store className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{shop.name}</div>
                      <div className="text-sm text-gray-500">{shop.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">{shop.sellerName}</TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span>{shop.productsCount || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(shop.status)}
                </TableCell>
                <TableCell className="py-4">{formatDate(shop.createdAt)}</TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <GenericButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewShop(shop.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </GenericButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentShops.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    <Store className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>{t('dashboard.noShopsFound', 'No shops found.')}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalShops > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {t('dashboard.showingResults', 'Showing {start}-{end} of {total} Results', { start: ((currentPage - 1) * resultsPerPage) + 1, end: Math.min(currentPage * resultsPerPage, totalShops), total: totalShops })}
          </p>
          <div className="flex items-center space-x-4">
            <Pagination
              total={totalPages}
              current={currentPage}
              onPageChange={handlePageChange}
            />
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">{t('dashboard.resultsPerPage', 'Results Per Page:')}</p>
              <Select value={resultsPerPage.toString()} onValueChange={handleResultsPerPageChange}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">{t('dashboard.resultsPerPage10', '10')}</SelectItem>
                  <SelectItem value="20">{t('dashboard.resultsPerPage20', '20')}</SelectItem>
                  <SelectItem value="50">{t('dashboard.resultsPerPage50', '50')}</SelectItem>
                  <SelectItem value="100">{t('dashboard.resultsPerPage100', '100')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;