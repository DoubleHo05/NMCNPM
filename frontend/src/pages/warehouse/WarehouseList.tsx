import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { RootState, AppDispatch } from '../../store/store';
import { setItems, updateItem } from '../../store/slices/warehouseSlice';
import { warehouseApi } from '../../api/warehouseApi';
import { WarehouseItem } from '../../store/slices/warehouseSlice';

const WarehouseListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.warehouse.items);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await warehouseApi.getItems();
      dispatch(setItems(data.data || []));
    } catch (error) {
      message.error('Lỗi khi tải danh sách kho');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await warehouseApi.getWarehouseStats();
      setStats(data.data);
    } catch (error) {
      console.error('Lỗi khi tải thống kê kho');
    }
  };

  const handleEditItem = (item: WarehouseItem) => {
    form.setFieldsValue({
      bookTitle: item.bookTitle,
      quantity: item.quantity,
      minStock: item.minStock,
      location: item.location,
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Editing item:', editingItem);
    console.log('Form values:', values);
    
    if (!editingItem) {
      console.error('No editing item!');
      return;
    }

    try {
      console.log('Calling API updateItem...');
      const updateData = {
        quantity: values.quantity,
        minStock: values.minStock,
        location: values.location,
      };
      console.log('Update data:', updateData);
      
      const response = await warehouseApi.updateItem(editingItem.id, updateData);
      console.log('API Response:', response);
      
      message.success('Cập nhật kho thành công');
      setIsModalOpen(false);
      
      // Reload data from server
      console.log('Reloading items...');
      await fetchItems();
      console.log('Items reloaded');
    } catch (error: any) {
      console.error('=== UPDATE ERROR ===', error);
      message.error(`Lỗi khi cập nhật kho: ${error?.response?.data?.message || error?.message}`);
    }
  };

  const handleExport = () => {
    // Tạo CSV từ dữ liệu
    const headers = ['Mã sách', 'Tên sách', 'Số lượng', 'Tồn kho tối thiểu', 'Vị trí'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map((item) =>
        [
          item.bookId,
          item.bookTitle,
          item.quantity,
          item.minStock,
          item.location,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('Xuất dữ liệu thành công');
  };

  const filteredItems = items.filter(
    (item) =>
      item.bookTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.bookId.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity < minStock) {
      return <Tag color="red">Tồn kho thấp</Tag>;
    }
    if (quantity < minStock * 1.5) {
      return <Tag color="orange">Cảnh báo</Tag>;
    }
    return <Tag color="green">Bình thường</Tag>;
  };

  const columns = [
    {
      title: 'Mã sách',
      dataIndex: 'bookId',
      key: 'bookId',
    },
    {
      title: 'Tên sách',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Tồn kho tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    // Ẩn cột Vị trí vì chưa có data thật
    // {
    //   title: 'Vị trí',
    //   dataIndex: 'location',
    //   key: 'location',
    // },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: WarehouseItem) =>
        getStockStatus(record.quantity, record.minStock),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (value) => value || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: WarehouseItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
        Danh Sách Kho
      </h2>
      
      {/* Thông báo hướng dẫn nếu chưa có dữ liệu */}
      {items.length === 0 && !loading && (
        <Card style={{ marginBottom: '24px', backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ color: '#1890ff', marginBottom: '12px' }}>📦 Chưa có sản phẩm nào trong kho</h3>
            <p style={{ color: '#595959', marginBottom: '16px' }}>
              Để bắt đầu quản lý kho, bạn cần:
            </p>
            <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto', color: '#595959' }}>
              <li>Thêm sách vào hệ thống (Menu: Tra cứu sách → Thêm sách mới)</li>
              <li>Tạo phiếu nhập kho (Menu: Kho → Nhập kho)</li>
            </ol>
          </div>
        </Card>
      )}

      {/* Thống kê */}
      {stats && items.length > 0 && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng loại sách"
                value={stats.totalItems || 0}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số lượng"
                value={stats.totalQuantity || 0}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Cảnh báo tồn kho"
                value={stats.lowStockCount || 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Giá trị kho (dự tính)"
                value={stats.estimatedValue || 0}
                suffix="đ"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Công cụ tìm kiếm và xuất */}
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã sách"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất CSV
          </Button>
        </Space>
      </div>

      {/* Bảng danh sách */}
      <Table
        columns={columns}
        dataSource={filteredItems}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 15 }}
        scroll={{ x: 1200 }}
      />

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật thông tin kho"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tên sách"
            name="bookTitle"
            rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Tồn kho tối thiểu"
            name="minStock"
            rules={[{ required: true, message: 'Vui lòng nhập tồn kho tối thiểu' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          {/* Ẩn field Vị trí trong kho vì chưa có trong database */}
          {/* <Form.Item
            label="Vị trí trong kho"
            name="location"
            help="Chức năng này đang được phát triển"
          >
            <Input placeholder="VD: Khu A, Giá 1, Tầng 2" disabled />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default WarehouseListPage;
