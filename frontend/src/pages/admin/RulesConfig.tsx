import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
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
import { setRules, addRule, updateRule, deleteRule } from '../../store/slices/rulesSlice';
import { rulesApi } from '../../api/rulesApi';
import { Rule } from '../../store/slices/rulesSlice';

interface RuleFormData {
  name: string;
  description: string;
  maxBookBorrow?: number;
  borrowDays?: number;
  penaltyPerDay?: number;
  isActive: boolean;
}

const RulesConfigPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rules = useSelector((state: RootState) => state.rules.rules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  // Auto-save to localStorage whenever rules change
  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem('rules', JSON.stringify(rules));
    }
  }, [rules]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      // TODO: Backend chưa có /rules endpoint, load từ localStorage
      const savedRules = localStorage.getItem('rules');
      if (savedRules) {
        dispatch(setRules(JSON.parse(savedRules)));
      } else {
        // Mock data mặc định
        const mockRules = [
          {
            id: '1',
            name: 'Quy định mượn sách cơ bản',
            description: 'Áp dụng cho tất cả độc giả',
            maxBookBorrow: 5,
            borrowDays: 30,
            penaltyPerDay: 5000,
            isActive: true,
          },
        ];
        dispatch(setRules(mockRules));
        localStorage.setItem('rules', JSON.stringify(mockRules));
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách quy định');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    form.resetFields();
    form.setFieldsValue({
      maxBookBorrow: 1,
      borrowDays: 1,
      penaltyPerDay: 0,
      isActive: true,
    });
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: Rule) => {
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      maxBookBorrow: rule.maxBookBorrow,
      borrowDays: rule.borrowDays,
      penaltyPerDay: rule.penaltyPerDay,
      isActive: rule.isActive,
    });
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      // TODO: Backend chưa có endpoint, comment tạm
      // await rulesApi.deleteRule(ruleId);
      dispatch(deleteRule(ruleId));
      message.success('Xóa quy định thành công');
    } catch (error) {
      message.error('Lỗi khi xóa quy định');
    }
  };

  const handleSubmit = async (values: RuleFormData) => {
    setSubmitting(true);
    try {
      if (editingRule) {
        // TODO: Backend chưa có endpoint, comment tạm
        // await rulesApi.updateRule(editingRule.id, values);
        dispatch(
          updateRule({
            ...editingRule,
            ...values,
          })
        );
        message.success('Cập nhật quy định thành công');
      } else {
        // TODO: Backend chưa có endpoint, comment tạm
        // const newRule = await rulesApi.createRule(values);
        const newRule = {
          id: String(Date.now()),
          ...values,
        };
        dispatch(addRule(newRule));
        message.success('Tạo quy định thành công');
      }
      form.resetFields();
      setIsModalOpen(false);
      setEditingRule(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi lưu quy định');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRules = rules.filter((rule) =>
    rule.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên quy định',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Max mượn',
      dataIndex: 'maxBookBorrow',
      key: 'maxBookBorrow',
      render: (value: number | undefined) => value || '-',
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDays',
      key: 'borrowDays',
      render: (value: number | undefined) => (value ? `${value} ngày` : '-'),
    },
    {
      title: 'Phí/Ngày',
      dataIndex: 'penaltyPerDay',
      key: 'penaltyPerDay',
      render: (value: number | undefined) => (value ? `${value}đ` : '-'),
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
      render: (_: any, record: Rule) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRule(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa quy định này?"
            onConfirm={() => handleDeleteRule(record.id)}
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
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRule}>
            Thêm quy định
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredRules}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRule ? 'Sửa quy định' : 'Thêm quy định'}
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          form.resetFields();
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tên quy định"
            name="name"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Số lượng sách tối đa có thể mượn"
            name="maxBookBorrow"
            initialValue={1}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            label="Số ngày có thể mượn"
            name="borrowDays"
            initialValue={1}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            label="Tiền phạt trễ hạn (đ/ngày)"
            name="penaltyPerDay"
            initialValue={0}
          >
            <InputNumber min={0} />
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
              <Button
                onClick={() => {
                  form.resetFields();
                  setIsModalOpen(false);
                  setEditingRule(null);
                }}
                block
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                OK
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RulesConfigPage;
