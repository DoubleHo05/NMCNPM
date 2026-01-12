import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { RootState, AppDispatch } from '../../store/store';
import { setUsers, addUser, updateUser, deleteUser } from '../../store/slices/userSlice';
import { customerApi } from '../../api/customerApi';
import { User } from '../../store/slices/userSlice';

interface UserFormData {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'user';
  isActive: boolean;
}

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const usersFromState = useSelector((state: RootState) => state.user.users);
  // Đảm bảo users luôn là array
  const users = Array.isArray(usersFromState) ? usersFromState : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomers();
      console.log('API Response:', response);
      // Backend trả về {data: {success: true, data: [...]}}
      const customersData = response.data?.data || response.data || [];
      console.log('Customers data:', customersData);
      
      // Map backend format to frontend format
      const customersList = customersData.map((customer: any) => ({
        id: String(customer.maKH),
        fullName: customer.tenKH || '',
        phone: customer.soDienThoai || '',
        email: customer.email || '',
        address: customer.diaChi || '',
        points: customer.diemTichLuy || 0,
        role: 'customer',
        isActive: true,
      }));
      
      console.log('Mapped customers:', customersList);
      dispatch(setUsers(customersList));
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Lỗi khi tải danh sách khách hàng');
      dispatch(setUsers([]));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    form.resetFields();
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    form.setFieldsValue({
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      address: user.address,
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('Deleting customer:', userId);
    try {
      await customerApi.deleteCustomer(userId);
      message.success('Xóa khách hàng thành công');
      fetchUsers();
    } catch (error: any) {
      console.error('Delete error:', error);
      message.error('Lỗi khi xóa khách hàng');
    }
  };

  const handleSubmit = async (values: UserFormData) => {
    console.log('Form submitted with values:', values);
    setLoading(true);
    try {
      if (editingUser) {
        console.log('Updating customer:', editingUser.id);
        await customerApi.updateCustomer(editingUser.id, values);
        message.success('Cập nhật khách hàng thành công');
      } else {
        console.log('Creating new customer');
        await customerApi.createCustomer(values);
        message.success('Tạo khách hàng thành công');
      }
      
      await fetchUsers();
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error:', error);
      message.error(error?.response?.data?.message || 'Lỗi khi lưu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName?.toLowerCase().includes(searchText.toLowerCase()) || '') ||
      (user.phone?.toLowerCase().includes(searchText.toLowerCase()) || '') ||
      (user.email?.toLowerCase().includes(searchText.toLowerCase()) || '')
  );

  const columns = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            {text?.charAt(0)?.toUpperCase() || 'K'}
          </div>
          <span className="font-medium text-slate-700">{text || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => (
        <span className="text-slate-600">{text || 'Chưa cập nhật'}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text: string) => (
        <span className="text-slate-600">{text || 'Chưa cập nhật'}</span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => (
        <span className="text-slate-600">{text || 'Chưa cập nhật'}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      align: 'center' as const,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="default"
            size="middle"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => {
              console.log('Confirm delete, userId:', record.id);
              handleDeleteUser(record.id);
            }}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              size="middle" 
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý khách hàng</h1>
            <p className="text-sm text-slate-500">Quản lý thông tin khách hàng của cửa hàng</p>
          </div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <Space size="middle">
          <Input
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 350 }}
            size="large"
            className="rounded-lg"
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddUser}
            size="large"
            className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            Thêm khách hàng
          </Button>
        </Space>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} khách hàng`,
            showSizeChanger: true,
          }}
          className="custom-table"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-800">
              {editingUser ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </span>
          </div>
        }
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={600}
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="mt-4"
        >
          <Form.Item
            label={<span className="font-medium text-slate-700">Tên khách hàng</span>}
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input 
              placeholder="VD: Nguyễn Văn A" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-slate-700">Số điện thoại</span>}
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input 
              placeholder="VD: 0123456789" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-slate-700">Email</span>}
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input 
              placeholder="VD: ngoc@gmail.com" 
              type="email" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-slate-700">Địa chỉ</span>}
            name="address"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="role"
            initialValue="user"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            initialValue={`customer_${Date.now()}`}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            initialValue={`temp_${Date.now()}`}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="isActive"
            initialValue={true}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <div className="flex gap-3 justify-end">
              <Button 
                onClick={() => { setIsModalOpen(false); form.resetFields(); }} 
                size="large"
                className="min-w-[100px] rounded-lg"
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                {editingUser ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
