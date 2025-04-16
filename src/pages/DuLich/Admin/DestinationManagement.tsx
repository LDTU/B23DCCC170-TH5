import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
    // Gán lại dữ liệu cho form, nếu cần chuyển đổi activities về dạng chuỗi cho input
    form.setFieldsValue({
      ...record,
      imageUrl: record.image, // mapping từ image sang imageUrl cho form nhập
      activities: record.activities ? record.activities.join(', ') : '',
    });
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
      // Chuyển giá trị activities thành mảng bằng cách tách chuỗi theo dấu phẩy
      const activitiesArray = values.activities ? values.activities.split(',').map((item: string) => item.trim()) : [];
      const updatedDestination = {
        // Map lại key imageUrl sang image
        name: values.name,
        image: values.imageUrl,
        location: values.location,
        type: values.type,
        rating: values.rating,
        price: values.price,
        description: values.description,
        activities: activitiesArray,
        bestTimeToVisit: values.bestTimeToVisit,
      };

      const newDestinations = [...destinations];
      if (editingDestination) {
        // Sửa: Tìm vị trí của destination cần cập nhật
        const index = newDestinations.findIndex(dest => dest.id === editingDestination.id);
        newDestinations[index] = { ...editingDestination, ...updatedDestination };
        message.success('Cập nhật thành công');
      } else {
        // Thêm mới: Tạo id mới, nếu danh sách rỗng thì bắt đầu từ 1
        const newId = destinations.length > 0 ? Math.max(...destinations.map(dest => dest.id)) + 1 : 1;
        newDestinations.push({ ...updatedDestination, id: newId });
        message.success('Thêm mới thành công');
      }

      localStorage.setItem('touristPlaces', JSON.stringify(newDestinations));
      setDestinations(newDestinations);
      setIsModalVisible(false);
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
      render: (price: number) => (typeof price === 'number' ? `${price.toLocaleString()} VNĐ` : ''),
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
          <Form.Item
            name="activities"
            label="Các hoạt động"
            rules={[{ required: true, message: 'Vui lòng nhập các hoạt động (cách nhau bởi dấu phẩy)' }]}
          >
            <Input placeholder="Ví dụ: Tắm biển, Leo núi, Tham quan di tích" />
          </Form.Item>
          <Form.Item
            name="bestTimeToVisit"
            label="Thời gian tham quan tốt nhất"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian tham quan tốt nhất' }]}
          >
            <Input placeholder="Ví dụ: Tháng 2 đến tháng 8" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DestinationManagement;
