import axiosInstance from './axiosInstance';

export const customerApi = {
  getCustomers: async () => {
    const response = await axiosInstance.get('/customers');
    const backendData = response.data;
    if (backendData.data?.customers) {
      const mappedCustomers = backendData.data.customers.map((customer: any) => ({
        id: String(customer.maKH),
        fullName: customer.tenKH || '',
        phone: customer.soDienThoai || '',
        email: customer.email || '',
        address: customer.diaChi || '',
        points: customer.diemTichLuy || 0,
        role: 'customer',
        isActive: true,
      }));
      
      return { data: mappedCustomers };
    }
    return { data: [] };
  },

  getCustomerById: async (id: string) => {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData: any) => {
    const backendData: any = {
      tenKH: customerData.fullName,
      soDienThoai: customerData.phone,
    };
    
    if (customerData.email) {
      backendData.email = customerData.email;
    }
    if (customerData.address) {
      backendData.diaChi = customerData.address;
    }
    
    console.log('Creating customer with data:', backendData);
    const response = await axiosInstance.post('/customers', backendData);
    return response.data;
  },

  updateCustomer: async (id: string, customerData: any) => {
    const backendData: any = {
      tenKH: customerData.fullName,
      soDienThoai: customerData.phone,
      email: customerData.email || null,
    };
    
    if (customerData.address) {
      backendData.diaChi = customerData.address;
    }
    
    const response = await axiosInstance.put(`/customers/${id}`, backendData);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  },
};
