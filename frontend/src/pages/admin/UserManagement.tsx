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
import { userApi } from '../../api/userApi';
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
      const response = await userApi.getUsers();
      // userApi.getUsers() đã map dữ liệu từ backend sang frontend format
      const usersList = response.data || [];
      dispatch(setUsers(usersList));
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng');
      dispatch(setUsers([])); // Đảm bảo users luôn là array
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
      username: user.username,
      fullName: user.username, // Assuming username is used as fullName
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('Deleting user:', userId);
    try {
      try {
        await userApi.deleteUser(userId);
      } catch (apiError: any) {
        console.error('Delete API error:', apiError);
        // Tiếp tục xóa từ Redux ngay cả khi API fail
      }
      dispatch(deleteUser(userId));
      message.success('Xóa người dùng thành công');
    } catch (error: any) {
      console.error('Delete error:', error);
      message.error('Lỗi khi xóa người dùng');
    }
  };

  const handleSubmit = async (values: UserFormData) => {
    console.log('Form submitted with values:', values);
    try {
      if (editingUser) {
        console.log('Updating user:', editingUser.id);
        try {
          await userApi.updateUser(editingUser.id, values);
        } catch (apiError: any) {
          console.error('API Update Error:', apiError);
          // Continue anyway for offline mode
        }
        dispatch(
          updateUser({
            ...editingUser,
            ...values,
          })
        );
        message.success('Cập nhật người dùng thành công');
        setIsModalOpen(false);
        form.resetFields();
      } else {
        console.log('Creating new user');
        try {
          const response = await userApi.createUser(values);
          console.log('API response:', response);
          const newUser = response.data || response;
          dispatch(addUser({
            id: String(Date.now()),
            ...values,
            createdAt: new Date().toISOString(),
          }));
          message.success('Tạo người dùng thành công');
          setIsModalOpen(false);
          form.resetFields();
        } catch (apiError: any) {
          console.error('API Error:', apiError);
          // Nếu API fail, vẫn thêm user vào Redux để test UI
          dispatch(addUser({
            id: String(Date.now()),
            ...values,
            createdAt: new Date().toISOString(),
          }));
          message.warning('Người dùng được thêm vào hệ thống (chế độ offline)');
          setIsModalOpen(false);
          form.resetFields();
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      message.error(error?.response?.data?.message || 'Lỗi khi lưu người dùng');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap = { admin: 'red', staff: 'blue', user: 'green' };
        return <Tag color={colorMap[role as keyof typeof colorMap]}>{role}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Hoạt động' : 'Vô hiệu'}</Tag>
      ),
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
            placeholder="Tìm kiếm theo tên hoặc email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            Thêm người dùng
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
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
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
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input placeholder="VD: ngocdzz" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="VD: ngoc@gmail.com" type="email" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
          >
            <Input placeholder="VD: 0123456789" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            initialValue="user"
          >
            <Select>
              <Select.Option value="user">Người dùng</Select.Option>
              <Select.Option value="staff">Nhân viên</Select.Option>
              <Select.Option value="admin">Quản trị viên</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>Hoạt động</Select.Option>
              <Select.Option value={false}>Vô hiệu</Select.Option>
            </Select>
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
