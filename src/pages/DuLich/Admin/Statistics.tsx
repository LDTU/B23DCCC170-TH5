import React, { useState, useEffect } from 'react';
import { Card, Table, Select, DatePicker, Row, Col } from 'antd';
import { getTouristPlaces } from '../../../services/touristData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface StatisticData {
  month: string;
  count: number;
}

interface PopularDestination {
  name: string;
  count: number;
}

const Statistics: React.FC = () => {
  const [monthlyStats, setMonthlyStats] = useState<StatisticData[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);

  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    const destinations = getTouristPlaces();
    
    // Tạo dữ liệu thống kê giả lập
    const mockMonthlyStats = [
      { month: 'Tháng 1', count: 15 },
      { month: 'Tháng 2', count: 20 },
      { month: 'Tháng 3', count: 25 },
      { month: 'Tháng 4', count: 18 },
      { month: 'Tháng 5', count: 22 },
      { month: 'Tháng 6', count: 30 },
    ];

    const mockPopularDestinations = destinations
      .map(dest => ({
        name: dest.name,
        count: Math.floor(Math.random() * 100) + 50, // Số lượt ngẫu nhiên
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setMonthlyStats(mockMonthlyStats);
    setPopularDestinations(mockPopularDestinations);
  }, []);

  const monthlyColumns = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Số lượt lịch trình',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const popularColumns = [
    {
      title: 'Địa điểm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượt tham quan',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Thống kê theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Số lượt lịch trình" />
              </BarChart>
            </ResponsiveContainer>
            <Table
              dataSource={monthlyStats}
              columns={monthlyColumns}
              rowKey="month"
              pagination={false}
              style={{ marginTop: 20 }}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Địa điểm phổ biến">
            <Table
              dataSource={popularDestinations}
              columns={popularColumns}
              rowKey="name"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics; 