import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

interface RulesConfig {
  minImportQuantity?: number;
  maxStockBeforeImport?: number;
  minStockAfterSale?: number;
  maxDebtAmount?: number;
}

const RulesConfigPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call when backend is ready
      // const response = await rulesApi.getRules();
      // form.setFieldsValue(response.data);
      
      // Temporary default values
      form.setFieldsValue({
        minImportQuantity: 150,
        maxStockBeforeImport: 300,
        minStockAfterSale: 20,
        maxDebtAmount: 50000000,
      });
    } catch (error) {
      message.error('Lỗi khi tải quy định');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: RulesConfig) => {
    setLoading(true);
    try {
      // TODO: Implement API call when backend is ready
      // await rulesApi.updateRules(values);
      console.log('Updating rules:', values);
      message.success('Cập nhật quy định thành công');
    } catch (error) {
      message.error('Lỗi khi cập nhật quy định');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quy định nghiệp vụ</h1>
      
      <Card title="Cấu hình quy định" className="max-w-2xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="minImportQuantity"
            label="Số lượng nhập tối thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <Input type="number" addonAfter="cuốn" />
          </Form.Item>

          <Form.Item
            name="maxStockBeforeImport"
            label="Lượng tồn tối đa trước khi nhập"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <Input type="number" addonAfter="cuốn" />
          </Form.Item>

          <Form.Item
            name="minStockAfterSale"
            label="Lượng tồn tối thiểu sau khi bán"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <Input type="number" addonAfter="cuốn" />
          </Form.Item>

          <Form.Item
            name="maxDebtAmount"
            label="Số tiền nợ tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <Input type="number" addonAfter="VNĐ" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Lưu quy định
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RulesConfigPage;
