import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Rate, Select, Slider, Input, Space, Tag, Typography, Button, notification } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, StarOutlined, ReloadOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Title, Text } = Typography;
const { Option } = Select;

interface TouristPlace {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  image: string;
}

const DiscoverDestinations = () => {
  const [destinations, setDestinations] = useState<TouristPlace[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priceRange: [500000, 3000000] as [number, number],
    minRating: 0,
    sortBy: 'rating'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadDestinationsFromLocalStorage = () => {
    try {
      const storedDestinations = localStorage.getItem('touristPlaces');
      
      if (storedDestinations) {
        const parsedData = JSON.parse(storedDestinations);
        setDestinations(parsedData);
        console.log('Loaded destinations from localStorage:', parsedData);
      } else {
        console.log('No destinations found in localStorage');
        setDestinations([]);
      }
    } catch (error) {
      console.error('Error loading destinations from localStorage:', error);
      setDestinations([]);
    }
  };

  useEffect(() => {
    loadDestinationsFromLocalStorage();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'touristPlaces') {
        console.log('touristPlaces changed in localStorage');
        loadDestinationsFromLocalStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshTrigger]);

  const saveDestinationsToLocalStorage = (data: TouristPlace[]) => {
    localStorage.setItem('touristPlaces', JSON.stringify(data));
    setDestinations(data);
    setRefreshTrigger(prev => prev + 1);
    notification.success({
      message: 'Lưu thành công',
      description: 'Dữ liệu điểm đến đã được cập nhật'
    });
  };

  const refreshData = () => {
    loadDestinationsFromLocalStorage();
    notification.info({
      message: 'Làm mới dữ liệu',
      description: 'Dữ liệu đã được cập nhật từ localStorage'
    });
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredDestinations = destinations
    .filter(dest => {
      return (
        (filters.search === '' || dest.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.type === 'all' || dest.type === filters.type) &&
        (dest.price >= filters.priceRange[0] && dest.price <= filters.priceRange[1]) &&
        (dest.rating >= filters.minRating)
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (filters.sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (filters.sortBy === 'price-desc') {
        return b.price - a.price;
      }
      return 0;
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'biển': return 'blue';
      case 'núi': return 'green';
      case 'thành phố': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div className="discover-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2}>Khám phá điểm đến</Title>
          <Text type="secondary">Tìm kiếm các điểm đến hấp dẫn cho chuyến đi của bạn</Text>
        </div>
        <Button 
          type="primary"
          icon={<ReloadOutlined />}
          onClick={refreshData}
          title="Làm mới dữ liệu từ localStorage"
        >
          Làm mới
        </Button>
      </div>

      <div className="filters-section" style={{ marginBottom: 24, padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={6}>
            <Input
              placeholder="Tìm kiếm điểm đến..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              value={filters.search}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Loại hình:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Option value="all">Tất cả</Option>
              <Option value="biển">Biển</Option>
              <Option value="núi">Núi</Option>
              <Option value="thành phố">Thành phố</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Mức giá:</Text>
            <Slider
              range
              min={0}
              max={10000000}
              step={100000}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
              marks={{
                0: '0',
                1500000: '1.5tr',
                10000000 :'10tr'
              }}
              tipFormatter={(value) => (value ?? 0).toLocaleString('vi-VN') + ' ₫'}
              style={{ marginTop: 8 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Đánh giá tối thiểu:</Text>
            <Rate
              allowHalf
              value={filters.minRating}
              onChange={(value) => handleFilterChange('minRating', value)}
              style={{ marginTop: 8 }}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Sắp xếp theo:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
            >
              <Option value="rating">Đánh giá cao nhất</Option>
              <Option value="price-asc">Giá: Thấp - Cao</Option>
              <Option value="price-desc">Giá: Cao - Thấp</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Hiển thị số lượng điểm đến */}
      <div style={{ marginBottom: 16 }}>
        <Text>
          Hiển thị {filteredDestinations.length} / {destinations.length} điểm đến
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {filteredDestinations.length > 0 ? (
          filteredDestinations.map(dest => (
            <Col xs={24} sm={12} md={8} lg={6} key={dest.id}>
              <Card
                hoverable
                cover={<img alt={dest.name} src={dest.image} style={{ height: 200, objectFit: 'cover' }} />}
              >
                <Meta
                  title={dest.name}
                  description={
                    <Space direction="vertical" size={2}>
                      <Space><EnvironmentOutlined /> <span>{dest.location}</span></Space>
                      <Tag color={getTypeColor(dest.type)}>{dest.type}</Tag>
                      <Space>
                        <StarOutlined />
                        <Rate disabled allowHalf defaultValue={dest.rating} style={{ fontSize: 14 }} />
                        <span>({dest.rating})</span>
                      </Space>
                      <Space>
                        <DollarOutlined />
                        <Text>{dest.price.toLocaleString('vi-VN')} ₫</Text>
                      </Space>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: 48, background: '#f9f9f9', borderRadius: 8 }}>
              <Text type="secondary">Không tìm thấy điểm đến phù hợp với bộ lọc đã chọn</Text>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default DiscoverDestinations;