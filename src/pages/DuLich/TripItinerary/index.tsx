import React, { useState, useEffect } from 'react';
import { 
  Card, Timeline, Button, Collapse, Input, DatePicker, 
  Space, Typography, Select, Row, Col, Empty, Modal, 
  Table, Badge, Divider, Tag, Alert, message, InputNumber
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, 
  CarOutlined, HomeOutlined, ClockCircleOutlined, BankOutlined, 
  DollarOutlined, EnvironmentOutlined, SwapOutlined 
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock Data - Thay thế bằng API trong thực tế
const mockDestinations = [
  { id: 1, name: 'Đà Nẵng', image: 'https://via.placeholder.com/100', type: 'biển' },
  { id: 2, name: 'Hội An', image: 'https://via.placeholder.com/100', type: 'thành phố' },
  { id: 3, name: 'Ngũ Hành Sơn', image: 'https://via.placeholder.com/100', type: 'núi' },
  { id: 4, name: 'Bà Nà Hills', image: 'https://via.placeholder.com/100', type: 'núi' },
  { id: 5, name: 'Biển Mỹ Khê', image: 'https://via.placeholder.com/100', type: 'biển' },
  { id: 6, name: 'Cầu Rồng', image: 'https://via.placeholder.com/100', type: 'thành phố' },
];

// Mô phỏng phí đi lại giữa các điểm đến
const transportCostMap = {
  '1-2': { time: 30, cost: 150000 },
  '1-3': { time: 25, cost: 120000 },
  '1-4': { time: 45, cost: 200000 },
  '1-5': { time: 15, cost: 80000 },
  '1-6': { time: 10, cost: 50000 },
  '2-3': { time: 35, cost: 170000 },
  '2-4': { time: 60, cost: 250000 },
  '2-5': { time: 40, cost: 180000 },
  '2-6': { time: 35, cost: 160000 },
  '3-4': { time: 40, cost: 190000 },
  '3-5': { time: 30, cost: 140000 },
  '3-6': { time: 20, cost: 100000 },
  '4-5': { time: 60, cost: 230000 },
  '4-6': { time: 50, cost: 220000 },
  '5-6': { time: 20, cost: 90000 },
};

// Mô phỏng chi phí hoạt động tại mỗi điểm đến
const activityCostsMap = {
  1: { entrance: 0, food: 200000, accommodation: 750000 },
  2: { entrance: 120000, food: 250000, accommodation: 650000 },
  3: { entrance: 100000, food: 150000, accommodation: 0 },
  4: { entrance: 750000, food: 350000, accommodation: 900000 },
  5: { entrance: 0, food: 180000, accommodation: 0 },
  6: { entrance: 0, food: 220000, accommodation: 0 },
};

const TripItinerary = () => {
  const [tripDates, setTripDates] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [tripName, setTripName] = useState('Chuyến đi Đà Nẵng');
  interface TripDay {
    day: number;
    date: string;
    displayDate: string;
    spots: {
      id: number;
      name: string;
      image: string;
      type: string;
      note: string;
      duration: number;
      stayOvernight: boolean;
    }[];
  }
  
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [budget, setBudget] = useState(5000000); // 5 triệu VND
  const [totalCost, setTotalCost] = useState(0);
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);

  // Khởi tạo itinerary trống
  useEffect(() => {
    if (tripDates) {
      const startDate = tripDates[0].startOf('day');
      const endDate = tripDates[1].startOf('day');
      const daysDiff = endDate.diff(startDate, 'days') + 1;
      
      const newTripDays = Array.from({ length: daysDiff }, (_, i) => {
        const currentDate = startDate.clone().add(i, 'days');
        return {
          day: i + 1,
          date: currentDate.format('YYYY-MM-DD'),
          displayDate: currentDate.format('DD/MM/YYYY'),
          spots: [],
        };
      });
      
      setTripDays(newTripDays);
      calculateTotalCost(newTripDays);
    }
  }, [tripDates]);

  // Tính toán tổng chi phí
  const calculateTotalCost = (days: TripDay[]) => {
    let cost = 0;
    
    days.forEach(day => {
      day.spots.forEach((spot, index) => {
        // Chi phí hoạt động tại địa điểm
        const activityCost = activityCostsMap[spot.id as keyof typeof activityCostsMap];
        if (activityCost) {
          cost += activityCost.entrance + activityCost.food;
          // Thêm chi phí chỗ ở nếu được đánh dấu là ở lại đây
          if (spot.stayOvernight) {
            cost += activityCost.accommodation;
          }
        }
        
        // Chi phí di chuyển giữa các điểm
        if (index > 0) {
          const prevSpot = day.spots[index - 1];
          const transportKey = `${Math.min(prevSpot.id, spot.id)}-${Math.max(prevSpot.id, spot.id)}`;
          const transportInfo = transportCostMap[transportKey as keyof typeof transportCostMap];
          if (transportInfo) {
            cost += transportInfo.cost;
          }
        }
      });
    });
    
    setTotalCost(cost);
    // Kiểm tra vượt ngân sách
    if (cost > budget) {
      message.warning('Cảnh báo: Chi phí dự kiến đã vượt quá ngân sách!');
    }
    
    return cost;
  };

  // Thêm điểm đến vào lịch trình
  const handleAddSpot = (dayIndex: number, destination: { id: number; name: string; image: string; type: string }) => {
    const newTripDays = [...tripDays];
    newTripDays[dayIndex].spots.push({
      id: destination.id,
      name: destination.name,
      image: destination.image,
      type: destination.type,
      note: '',
      duration: 2, // Giờ
      stayOvernight: false,
    });
    
    setTripDays(newTripDays);
    calculateTotalCost(newTripDays);
    setIsAddingSpot(false);
  };

  // Xóa điểm đến khỏi lịch trình
  const handleRemoveSpot = (dayIndex: number, spotIndex: number) => {
    const newTripDays = [...tripDays];
    newTripDays[dayIndex].spots.splice(spotIndex, 1);
    setTripDays(newTripDays);
    calculateTotalCost(newTripDays);
  };

  // Cập nhật thông tin cho điểm đến
  const updateSpotInfo = (dayIndex: number, spotIndex: number, key: string, value: any) => {
    const newTripDays = [...tripDays];
    (newTripDays[dayIndex].spots[spotIndex] as any)[key] = value;
    setTripDays(newTripDays);
    
    if (key === 'stayOvernight') {
      calculateTotalCost(newTripDays);
    }
  };

  // Xử lý kéo thả điểm đến
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const sourceDay = parseInt(source.droppableId.split('-')[1]);
    const destDay = parseInt(destination.droppableId.split('-')[1]);
    
    const newTripDays = [...tripDays];
    const [removed] = newTripDays[sourceDay].spots.splice(source.index, 1);
    newTripDays[destDay].spots.splice(destination.index, 0, removed);
    
    setTripDays(newTripDays);
    calculateTotalCost(newTripDays);
  };

  // Tính thời gian di chuyển giữa hai điểm
  const getTravelTime = (fromId: number, toId: number): number => {
    if (fromId === toId) return 0;
    const transportKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
    return transportCostMap[transportKey as keyof typeof transportCostMap]?.time || 0;
  };

  // Tính chi phí di chuyển giữa hai điểm
  const getTravelCost = (fromId: number, toId: number): number => {
    if (fromId === toId) return 0;
    const transportKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
    return transportCostMap[transportKey as keyof typeof transportCostMap]?.cost || 0;
  };

  // Định dạng tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Modal thêm điểm đến
  const AddDestinationModal = () => (
    <Modal
      title="Chọn điểm đến"
      visible={isAddingSpot}
      onCancel={() => setIsAddingSpot(false)}
      footer={null}
      width={700}
    >
      <Row gutter={[16, 16]}>
        {mockDestinations.map(dest => (
          <Col span={8} key={dest.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={<img alt={dest.name} src={dest.image} style={{ height: 100, objectFit: 'cover' }} />}
              onClick={() => currentDay !== null && handleAddSpot(currentDay, dest)}
            >
              <Card.Meta
                title={dest.name}
                description={<Tag color={dest.type === 'biển' ? 'blue' : dest.type === 'núi' ? 'green' : 'purple'}>{dest.type}</Tag>}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );

  return (
    <div className="trip-planner" style={{ padding: '20px 0' }}>
      <Card className="trip-header" style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Input 
              value={tripName} 
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Tên chuyến đi"
              size="large"
              style={{ fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={(dates) => setTripDates(dates ? [dates[0]!, dates[1]!] : null)}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Col>
          <Col xs={24} md={8}>
            <Space align="center">
              <Text>Ngân sách:</Text>
              <InputNumber
                style={{ width: 200 }}
                value={budget}
                formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => parseFloat((value ?? '').replace(/₫\s?|(,*)/g, '') || '0')}
                onChange={(value) => value !== null && setBudget(value)}
                step={100000}
              />
            </Space>
          </Col>
        </Row>

        {tripDays.length > 0 && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Space align="center">
                <Text>Tổng chi phí dự kiến:</Text>
                <Text 
                  style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold',
                    color: totalCost > budget ? '#ff4d4f' : '#52c41a'
                  }}
                >
                  {formatCurrency(totalCost)}
                </Text>
                {totalCost > budget && (
                  <Tag color="error">Vượt ngân sách {formatCurrency(totalCost - budget)}</Tag>
                )}
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {!tripDates ? (
        <Empty
          description="Chọn ngày để bắt đầu lập kế hoạch cho chuyến đi của bạn"
          style={{ margin: '40px 0' }}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          {tripDays.map((day, dayIndex) => (
            <Card 
              key={dayIndex}
              title={
                <Space>
                  <Badge 
                    count={`Ngày ${day.day}`} 
                    style={{ backgroundColor: '#1890ff' }} 
                  />
                  <span>{day.displayDate}</span>
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setCurrentDay(dayIndex);
                    setIsAddingSpot(true);
                  }}
                >
                  Thêm điểm đến
                </Button>
              }
              style={{ marginBottom: 16 }}
            >
              <Droppable droppableId={`day-${dayIndex}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {day.spots.length === 0 ? (
                      <Empty description="Chưa có điểm đến nào trong ngày này" />
                    ) : (
                      <Timeline>
                        {day.spots.map((spot, spotIndex) => {
                          // Tính chi phí di chuyển từ điểm trước
                          let travelTime = 0;
                          let travelCost = 0;
                          
                          if (spotIndex > 0) {
                            const prevSpot = day.spots[spotIndex - 1];
                            travelTime = getTravelTime(prevSpot.id, spot.id);
                            travelCost = getTravelCost(prevSpot.id, spot.id);
                          }
                          
                          const activityCost = activityCostsMap[spot.id.toString() as keyof typeof activityCostsMap];
                          
                          return (
                            <Draggable 
                              key={`spot-${dayIndex}-${spotIndex}`}
                              draggableId={`spot-${dayIndex}-${spotIndex}`}
                              index={spotIndex}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Timeline.Item 
                                    dot={spotIndex > 0 ? <CarOutlined style={{ fontSize: '16px' }} /> : null}
                                    color="blue"
                                  >
                                    {spotIndex > 0 && (
                                      <Card 
                                        size="small" 
                                        style={{ marginBottom: 8, backgroundColor: '#f5f5f5' }}
                                      >
                                        <Space>
                                          <ClockCircleOutlined /> {travelTime} phút
                                          <Divider type="vertical" />
                                          <DollarOutlined /> {formatCurrency(travelCost)}
                                        </Space>
                                      </Card>
                                    )}
                                    
                                    <Card
                                      actions={[
                                        <Button 
                                          icon={<DeleteOutlined />} 
                                          danger
                                          onClick={() => handleRemoveSpot(dayIndex, spotIndex)}
                                        >
                                          Xóa
                                        </Button>
                                      ]}
                                    >
                                      <Row gutter={16}>
                                        <Col xs={24} sm={6}>
                                          <img 
                                            src={spot.image} 
                                            alt={spot.name}
                                            style={{ width: '100%', borderRadius: 4 }}
                                          />
                                        </Col>
                                        <Col xs={24} sm={18}>
                                          <Title level={4}>{spot.name}</Title>
                                          <Tag color={spot.type === 'biển' ? 'blue' : spot.type === 'núi' ? 'green' : 'purple'}>
                                            {spot.type}
                                          </Tag>
                                          
                                          <Divider style={{ margin: '12px 0' }} />
                                          
                                          <Space direction="vertical" style={{ width: '100%' }}>
                                            <Space>
                                              <ClockCircleOutlined />
                                              <span>Thời gian tham quan:</span>
                                              <Select
                                                value={spot.duration}
                                                style={{ width: 120 }}
                                                onChange={(value) => updateSpotInfo(dayIndex, spotIndex, 'duration', value)}
                                              >
                                                {[1, 2, 3, 4, 5, 6].map(hours => (
                                                  <Option key={hours} value={hours}>{hours} giờ</Option>
                                                ))}
                                              </Select>
                                            </Space>
                                            
                                            <Space>
                                              <HomeOutlined />
                                              <span>Ở lại qua đêm:</span>
                                              <Select
                                                value={spot.stayOvernight}
                                                style={{ width: 120 }}
                                                onChange={(value) => updateSpotInfo(dayIndex, spotIndex, 'stayOvernight', value)}
                                              >
                                                <Option value={false}>Không</Option>
                                                <Option value={true}>Có</Option>
                                              </Select>
                                            </Space>
                                            
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                              <Text strong>Chi phí dự kiến:</Text>
                                              <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
                                                <li>Vé vào cửa: {formatCurrency(activityCost?.entrance || 0)}</li>
                                                <li>Ăn uống: {formatCurrency(activityCost?.food || 0)}</li>
                                                {spot.stayOvernight && (
                                                  <li>Chỗ ở: {formatCurrency(activityCost?.accommodation || 0)}</li>
                                                )}
                                              </ul>
                                            </Space>
                                            
                                            <Input.TextArea
                                              placeholder="Ghi chú cho điểm đến này..."
                                              value={spot.note}
                                              onChange={(e) => updateSpotInfo(dayIndex, spotIndex, 'note', e.target.value)}
                                              autoSize={{ minRows: 2, maxRows: 4 }}
                                            />
                                          </Space>
                                        </Col>
                                      </Row>
                                    </Card>
                                  </Timeline.Item>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </Timeline>
                    )}
                  </div>
                )}
              </Droppable>
            </Card>
          ))}
        </DragDropContext>
      )}
      
      {/* Modal thêm điểm đến */}
      <AddDestinationModal />
      
      {/* Nút lưu lịch trình */}
      {tripDays.length > 0 && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Col>
            <Button 
              type="primary" 
              size="large" 
              icon={<SaveOutlined />}
              onClick={() => message.success('Đã lưu lịch trình thành công!')}
            >
              Lưu lịch trình
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default TripItinerary;