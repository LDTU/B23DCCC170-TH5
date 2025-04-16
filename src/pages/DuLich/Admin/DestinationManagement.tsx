import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Select, InputNumber } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { getTouristPlaces, TouristPlace } from '../../../services/touristData';

const { TextArea } = Input;
const { Option } = Select;

const DestinationManagement: React.FC = () => {
  const [destinations, setDestinations] = useState<TouristPlace[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDestination, setEditingDestination] = useState<TouristPlace | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = () => {
    const data = getTouristPlaces();
    setDestinations(data);
  };

  const handleAdd = () => {
    setEditingDestination(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: TouristPlace) => {
    setEditingDestination(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    const newDestinations = destinations.filter(dest => dest.id !== id);
    localStorage.setItem('touristPlaces', JSON.stringify(newDestinations));
    setDestinations(newDestinations);
    message.success('Xóa điểm đến thành công');
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newDestinations = [...destinations];
      if (editingDestination) {
        // Sửa
        const index = newDestinations.findIndex(dest => dest.id === editingDestination.id);
        newDestinations[index] = { ...editingDestination, ...values };
      } else {
        // Thêm mới
        const newId = Math.max(...destinations.map(dest => dest.id)) + 1;
        newDestinations.push({ ...values, id: newId });
      }
      localStorage.setItem('touristPlaces', JSON.stringify(newDestinations));
      setDestinations(newDestinations);
      setIsModalVisible(false);
      message.success(editingDestination ? 'Cập nhật thành công' : 'Thêm mới thành công');
    });
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (link: string) => (
        <img src={link} alt="ảnh" style={{ width: 80, height: 60, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Tên điểm đến',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: any) => (typeof price === 'number' ? `${price.toLocaleString()} VNĐ` : ''),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: TouristPlace) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)} icon={<EditOutlined />}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)} icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const uploadProps: UploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} tải lên thành công`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} tải lên thất bại`);
      }
    },
  };

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm điểm đến
      </Button>
      <Table columns={columns} dataSource={destinations} rowKey="id" />

      <Modal
        title={editingDestination ? 'Sửa điểm đến' : 'Thêm điểm đến'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên điểm đến"
            rules={[{ required: true, message: 'Vui lòng nhập tên điểm đến' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select>
              <Option value="biển">Biển</Option>
              <Option value="núi">Núi</Option>
              <Option value="vịnh">Vịnh</Option>
              <Option value="phố cổ">Phố cổ</Option>
              <Option value="di tích">Di tích</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập đánh giá' }]}
          >
            <InputNumber min={0} max={5} step={0.1} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Link hình ảnh"
            rules={[{ required: true, message: 'Vui lòng nhập link hình ảnh' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default DestinationManagement; 