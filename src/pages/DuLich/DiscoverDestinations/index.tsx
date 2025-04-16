import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Rate, Select, Slider, Input, Space, Tag, Typography } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';
import { TouristPlace } from '@/services/touristData';
import { touristPlaces } from '@/services/touristData';

const { Meta } = Card;
const { Title, Text } = Typography;
const { Option } = Select;

const DiscoverDestinations = () => {
  const [destinations, setDestinations] = useState<TouristPlace[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priceRange: [500000, 3000000] as [number, number],
    minRating: 0,
    sortBy: 'rating'
  });

  useEffect(() => {
    setDestinations(touristPlaces);
  }, []);

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
      <div className="page-header">
        <Title level={2}>Khám phá điểm đến</Title>
        <Text type="secondary">Tìm kiếm các điểm đến hấp dẫn cho chuyến đi của bạn</Text>
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
              min={500000}
              max={3000000}
              step={100000}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
              marks={{
                500000: '500k',
                1500000: '1.5tr',
                3000000: '3tr'
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

      <Row gutter={[16, 16]}>
        {filteredDestinations.length > 0 ? (
          filteredDestinations.map(dest => (
            <Col xs={24} sm={12} md={8} lg={6} key={dest.id}>
              <Card
                hoverable
                cover={<img alt={dest.name} src={dest.image} />}
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
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Text type="secondary">Không tìm thấy điểm đến phù hợp với bộ lọc đã chọn</Text>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default DiscoverDestinations;
