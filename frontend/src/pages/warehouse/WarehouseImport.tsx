import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  Table,
  Space,
  message,
  Divider,
  DatePicker,
  AutoComplete,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
import { AppDispatch } from '../../store/store';
import { addImport } from '../../store/slices/warehouseSlice';
import { warehouseApi } from '../../api/warehouseApi';
import { WarehouseImport } from '../../store/slices/warehouseSlice';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axiosInstance';

interface ImportItem {
  id: string;
  bookId: string;
  bookTitle: string;
  quantity: number;
  supplier?: string;
}

const WarehouseImportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [items, setItems] = useState<ImportItem[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ImportItem>>({});

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      // Sử dụng axiosInstance để gọi API books (đã có baseURL sẵn)
      const response = await axiosInstance.get('/books');
      const booksData = response.data.data || [];
      setBooks(booksData);
      console.log('Loaded books:', booksData.length);
      if (booksData.length === 0) {
        message.info('Chưa có sách nào trong hệ thống. Vui lòng thêm sách trước.');
      }
    } catch (error: any) {
      console.error('Error fetching books:', error);
      message.error('Lỗi khi tải danh sách sách. Vui lòng kiểm tra kết nối backend.');
    }
  };

  const handleAddItem = () => {
    console.log('Current item:', currentItem);
    
    if (!currentItem.bookId || !currentItem.quantity) {
      message.warning('Vui lòng chọn sách từ danh sách và nhập số lượng');
      return;
    }

    // Kiểm tra sách có tồn tại trong danh sách không
    const selectedBook = books.find((b) => b.id === currentItem.bookId);
    if (!selectedBook) {
      message.error('Vui lòng chọn sách từ danh sách, không thể tạo sách mới từ trang này');
      return;
    }
    
    console.log('Selected book:', selectedBook);
    
    const newItem: ImportItem = {
      id: `item-${Date.now()}`,
      bookId: currentItem.bookId,
      bookTitle: selectedBook.title,
      quantity: currentItem.quantity,
      supplier: currentItem.supplier,
    };

    setItems([...items, newItem]);
    setCurrentItem({});
    message.success('Đã thêm sách vào phiếu nhập');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleSubmit = async (values: any) => {
    console.log('=== SUBMIT STARTED ===');
    console.log('Submit called with values:', values);
    console.log('Items to save:', items);
    console.log('Items count:', items.length);
    
    if (items.length === 0) {
      console.log('No items, showing warning');
      message.warning('Vui lòng thêm ít nhất một sách vào phiếu nhập');
      return;
    }

    console.log('Starting API call...');
    setLoading(true);
    try {
      const importData = {
        importDate: values.importDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
        supplier: values.supplier,
        notes: values.notes,
        items: items.map(item => ({
          bookId: item.bookId,
          bookTitle: item.bookTitle,
          quantity: item.quantity,
          supplier: item.supplier || values.supplier,
        })),
        status: 'completed' as const,
      };

      // Gọi API để lưu phiếu nhập
      console.log('Calling API with data:', importData);
      const response = await warehouseApi.createImport(importData);
      console.log('API response:', response);

      message.success(`Tạo phiếu nhập kho thành công! Mã phiếu: ${response.data.id}`);
      
      // Reset form sau khi lưu thành công
      form.resetFields();
      setItems([]);
      setCurrentItem({});
      console.log('=== SUBMIT COMPLETED SUCCESSFULLY ===');
    } catch (error: any) {
      console.error('=== SUBMIT ERROR ===');
      console.error('Submit error:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);
      message.error(`Lỗi khi tạo phiếu nhập kho: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      console.log('Loading state reset');
    }
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
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (value) => value || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: ImportItem) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const bookOptions = books.map((book) => ({
    label: `${book.title} (Mã: ${book.id})`,
    value: book.id,
  }));

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Phiếu Nhập Kho</span>
            {books.length === 0 && (
              <span style={{ fontSize: '14px', color: '#ff4d4f', fontWeight: 'normal' }}>
                ⚠️ Chưa có sách trong hệ thống. Vui lòng thêm sách trước khi nhập kho.
              </span>
            )}
          </div>
        } 
        style={{ marginBottom: '24px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Ngày nhập"
                name="importDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplier"
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về phiếu nhập" />
          </Form.Item>

          <Divider>Chi tiết nhập kho</Divider>

          <Card type="inner" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Chọn sách" required>
                  <AutoComplete
                    placeholder="Gõ để tìm sách..."
                    options={bookOptions}
                    value={currentItem.bookTitle}
                    onChange={(value) => {
                      // Chỉ update khi user đang gõ để search
                      setCurrentItem({
                        ...currentItem,
                        bookTitle: value,
                      });
                    }}
                    onSelect={(value, option: any) => {
                      // Khi chọn từ dropdown, lưu cả bookId và bookTitle
                      setCurrentItem({
                        ...currentItem,
                        bookId: value,
                        bookTitle: option?.label || value,
                      });
                    }}
                    filterOption={(inputValue, option) =>
                      (option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Số lượng" required>
                  <InputNumber
                    min={1}
                    value={currentItem.quantity}
                    onChange={(value) =>
                      setCurrentItem({ ...currentItem, quantity: value || 0 })
                    }
                    placeholder="Nhập số lượng"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Nhà cung cấp (chi tiết)" required={false}>
                  <Input
                    placeholder="Nhà cung cấp"
                    value={currentItem.supplier}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, supplier: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  style={{ width: '100%' }}
                >
                  Thêm
                </Button>
              </Col>
            </Row>
          </Card>

          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: 'Chưa có sách nào được thêm',
            }}
            style={{ marginBottom: '24px' }}
          />

          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              htmlType="submit"
              size="large"
            >
              Lưu phiếu nhập
            </Button>
            <Button icon={<ClearOutlined />} onClick={() => {
              form.resetFields();
              setItems([]);
              setCurrentItem({});
            }}>
              Xóa toàn bộ
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default WarehouseImportPage;
