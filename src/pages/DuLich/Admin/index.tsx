import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import DestinationManagement from './DestinationManagement';
import Statistics from './Statistics';

const { TabPane } = Tabs;

const AdminPage: React.FC = () => {
  return (
    <Card title="Quản trị du lịch" style={{ margin: '20px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Quản lý điểm đến" key="1">
          <DestinationManagement />
        </TabPane>
        <TabPane tab="Thống kê" key="2">
          <Statistics />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default AdminPage;
