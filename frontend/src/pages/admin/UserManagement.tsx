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
      const customersList = response.data || [];
      dispatch(setUsers(customersList));
    } catch (error) {
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
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => {
              console.log('Confirm delete, userId:', record.id);
              handleDeleteUser(record.id);
            }}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            Thêm khách hàng
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUser ? 'Sửa khách hàng' : 'Thêm khách hàng'}
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tên khách hàng"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="VD: 0123456789" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="VD: ngoc@gmail.com" type="email" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
          >
            <Input.TextArea rows={2} placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" />
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

          <Form.Item>
            <div className="flex gap-2">
              <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }} block>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" block loading={loading}>
                OK
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
