import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, notification, Row, Col, Table, Statistic, Progress, Space, Modal, Popconfirm } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getTouristPlaces, TouristPlace } from '../../../services/touristData';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

const STORAGE_KEY = 'budget_manager_data';

const BudgetManager: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const getDefaultItems = (): BudgetItem[] => {
    return [
      {
        id: '1',
        category: 'food',
        amount: 500000,
        description: 'Ăn tối tại nhà hàng',
        date: '2024-03-20'
      },
      {
        id: '2',
        category: 'transport',
        amount: 300000,
        description: 'Thuê xe máy',
        date: '2024-03-20'
      },
      {
        id: '3',
        category: 'accommodation',
        amount: 1000000,
        description: 'Khách sạn 3 sao',
        date: '2024-03-20'
      },
      {
          id: '4',
          category: 'entertainment',
          amount: 900000,
          description: 'Đi công viên',
          date: '2024-03-20'
      },
      {
          id: '5',
          category: 'other',
          amount: 1100000,
          description: 'shopping',
          date: '2024-03-20'
      }
    ];
  };
  
  // Tải dữ liệu từ localStorage hoặc sử dụng dữ liệu mặc định
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : getDefaultItems();
  });
  
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    return budgetItems.reduce((sum, item) => sum + item.amount, 0);
  });
  
  const [selectedDestination, setSelectedDestination] = useState<TouristPlace | null>(null);
  const [destinations, setDestinations] = useState<TouristPlace[]>([]);

  useEffect(() => {
    const data = getTouristPlaces();
    setDestinations(data);
  }, []);

  // Lưu dữ liệu vào localStorage khi budgetItems thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetItems));
    const newTotal = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalBudget(newTotal);
  }, [budgetItems]);

  const handleAddBudgetItem = (values: any) => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: values.category,
      amount: values.amount,
      description: values.description,
      date: new Date().toISOString().split('T')[0]
    };

    const newBudgetItems = [...budgetItems, newItem];
    setBudgetItems(newBudgetItems);

    if (selectedDestination && totalBudget > selectedDestination.price) {
      notification.warning({
        message: 'Cảnh báo vượt ngân sách',
        description: `Tổng chi phí (${totalBudget.toLocaleString()} VNĐ) đã vượt quá ngân sách dự kiến (${selectedDestination.price.toLocaleString()} VNĐ)`,
      });
    }

    form.resetFields(['category', 'amount', 'description']);
  };

  const handleDeleteItem = (id: string) => {
    const newItems = budgetItems.filter(item => item.id !== id);
    setBudgetItems(newItems);
    notification.success({
      message: 'Xóa thành công',
      description: 'Đã xóa khoản chi tiêu'
    });
  };

  const showEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      category: item.category,
      amount: item.amount,
      description: item.description
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then(values => {
      if (editingItem) {
        const updatedItems = budgetItems.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...values } 
            : item
        );
        setBudgetItems(updatedItems);
        setIsEditModalVisible(false);
        notification.success({
          message: 'Cập nhật thành công',
          description: 'Đã cập nhật khoản chi tiêu'
        });
      }
    });
  };

  const handleDestinationChange = (value: number) => {
    const destination = destinations.find(dest => dest.id === value);
    setSelectedDestination(destination || null);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const data = [
    { name: 'Ăn uống', value: budgetItems.filter(item => item.category === 'food').reduce((sum, item) => sum + item.amount, 0) },
    { name: 'Di chuyển', value: budgetItems.filter(item => item.category === 'transport').reduce((sum, item) => sum + item.amount, 0) },
    { name: 'Lưu trú', value: budgetItems.filter(item => item.category === 'accommodation').reduce((sum, item) => sum + item.amount, 0) },
    { name: 'Giải trí', value: budgetItems.filter(item => item.category === 'entertainment').reduce((sum, item) => sum + item.amount, 0) },
    { name: 'Khác', value: budgetItems.filter(item => item.category === 'other').reduce((sum, item) => sum + item.amount, 0) },
  ];

  const columns = [
    {
      title: 'Hạng mục',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => {
        const categoryNames: { [key: string]: string } = {
          food: 'Ăn uống',
          transport: 'Di chuyển',
          accommodation: 'Lưu trú',
          entertainment: 'Giải trí',
          other: 'Khác'
        };
        return categoryNames[text] || text;
      }
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString()} VNĐ`
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BudgetItem) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khoản chi tiêu này?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const getBudgetPercentage = () => {
    if (!selectedDestination) return 0;
    return Math.min((totalBudget / selectedDestination.price) * 100, 100);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Quản lý ngân sách du lịch">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddBudgetItem}
                  >
                    <Form.Item
                      name="destination"
                      label="Điểm đến"
                      rules={[{ required: true, message: 'Vui lòng chọn điểm đến' }]}
                    >
                      <Select
                        placeholder="Chọn điểm đến"
                        onChange={handleDestinationChange}
                      >
                        {destinations.map(dest => (
                          <Option key={dest.id} value={dest.id.toString()}>
                            {dest.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="category"
                      label="Hạng mục"
                      rules={[{ required: true, message: 'Vui lòng chọn hạng mục' }]}
                    >
                      <Select placeholder="Chọn hạng mục chi tiêu">
                        <Option value="food">Ăn uống</Option>
                        <Option value="transport">Di chuyển</Option>
                        <Option value="accommodation">Lưu trú</Option>
                        <Option value="entertainment">Giải trí</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="amount"
                      label="Số tiền"
                      rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => {
                          if (!value) return 0;
                          const parsed = parseInt(value.replace(/\$\s?|(,*)/g, ''));
                          return (isNaN(parsed) ? 0 : parsed) as 0;
                        }}
                        min={0}
                      />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Mô tả"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Thêm chi tiêu
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Thống kê chi tiêu">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Tổng chi phí"
                        value={totalBudget}
                        formatter={(value) => `${value.toLocaleString()} VNĐ`}
                      />
                    </Col>
                    <Col span={12}>
                      {selectedDestination && (
                        <Statistic
                          title="Ngân sách dự kiến"
                          value={selectedDestination.price}
                          formatter={(value) => `${value.toLocaleString()} VNĐ`}
                        />
                      )}
                    </Col>
                  </Row>
                  
                  {selectedDestination && (
                    <div style={{ marginTop: '20px' }}>
                      <Progress
                        percent={getBudgetPercentage()}
                        status={totalBudget > selectedDestination.price ? 'exception' : 'active'}
                        format={(percent) => `${percent?.toFixed(1)}%`}
                      />
                    </div>
                  )}

                  <div style={{ height: '300px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} VNĐ`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="Danh sách chi tiêu" style={{ marginTop: '20px' }}>
              <Table
                dataSource={budgetItems}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Card>
        </Col>
      </Row>

      {/* Modal Chỉnh sửa */}
      <Modal
        title="Chỉnh sửa khoản chi tiêu"
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="category"
            label="Hạng mục"
            rules={[{ required: true, message: 'Vui lòng chọn hạng mục' }]}
          >
            <Select placeholder="Chọn hạng mục chi tiêu">
              <Option value="food">Ăn uống</Option>
              <Option value="transport">Di chuyển</Option>
              <Option value="accommodation">Lưu trú</Option>
              <Option value="entertainment">Giải trí</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => {
                if (!value) return 0;
                const parsed = parseInt(value.replace(/\$\s?|(,*)/g, ''));
                return (isNaN(parsed) ? 0 : parsed) as 0;
              }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BudgetManager;
