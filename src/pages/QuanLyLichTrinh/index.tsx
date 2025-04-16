import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  List,
  Typography,
  Divider,
  Space,
  Empty,
  Modal,
  Input,
  Statistic,
  Popconfirm,
  Timeline,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DragOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TouristPlace } from '@/services/touristData';
import { touristPlaces } from '@/services/touristData';
import dayjs from 'dayjs';
import DiscoverDestinations from './DiscoverDestinations';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Định nghĩa cấu trúc dữ liệu cho lịch trình
interface ItineraryDay {
  date: string;
  places: (TouristPlace & { 
    startTime?: string; 
    endTime?: string;
    note?: string;
    transportationType?: string;
    transportationCost?: number;
    transportationTime?: number;
  })[];
}

interface Itinerary {
  name: string;
  days: ItineraryDay[];
  startDate: string;
  endDate: string;
  totalBudget: number;
  totalDuration: number;
}

// Định nghĩa khoảng cách giữa các vị trí (ví dụ)
// Trong thực tế, bạn có thể sử dụng API Maps hoặc có dữ liệu thực tế
interface Distance {
  from: string;
  to: string;
  distance: number; // km
  time: number; // phút
  cost: number; // VND
}

// Dữ liệu giả định về khoảng cách, thời gian, chi phí di chuyển
const transportationData: Distance[] = [
  { from: 'Hà Nội', to: 'Hạ Long', distance: 165, time: 150, cost: 200000 },
  { from: 'Hạ Long', to: 'Hà Nội', distance: 165, time: 150, cost: 200000 },
  { from: 'Hà Nội', to: 'Sapa', distance: 320, time: 300, cost: 350000 },
  { from: 'Sapa', to: 'Hà Nội', distance: 320, time: 300, cost: 350000 },
  { from: 'Hà Nội', to: 'Ninh Bình', distance: 100, time: 120, cost: 150000 },
  { from: 'Ninh Bình', to: 'Hà Nội', distance: 100, time: 120, cost: 150000 },
  { from: 'Hồ Chí Minh', to: 'Vũng Tàu', distance: 120, time: 120, cost: 180000 },
  { from: 'Vũng Tàu', to: 'Hồ Chí Minh', distance: 120, time: 120, cost: 180000 },
  { from: 'Hồ Chí Minh', to: 'Đà Lạt', distance: 310, time: 360, cost: 400000 },
  { from: 'Đà Lạt', to: 'Hồ Chí Minh', distance: 310, time: 360, cost: 400000 },
  // Thêm các cặp khoảng cách khác
];

// Hàm tính toán thông tin di chuyển giữa hai điểm
const calculateTransportation = (from: string, to: string): { cost: number; time: number; distance: number } => {
  const transportInfo = transportationData.find(
    item => (item.from === from && item.to === to)
  );

  if (transportInfo) {
    return {
      cost: transportInfo.cost,
      time: transportInfo.time,
      distance: transportInfo.distance
    };
  }

  // Giá trị mặc định nếu không tìm thấy
  return {
    cost: 200000, // VND
    time: 120,    // phút
    distance: 100 // km
  };
};

const TravelItinerary: React.FC = () => {
  const [itinerary, setItinerary] = useState<Itinerary>({
    name: 'Chuyến du lịch mới',
    days: [],
    startDate: '',
    endDate: '',
    totalBudget: 0,
    totalDuration: 0
  });
  
  const [isDestinationModalVisible, setIsDestinationModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [currentDay, setCurrentDay] = useState<string | null>(null);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  // Tính tổng ngân sách và thời gian
  useEffect(() => {
    calculateTotals();
  }, [itinerary.days]);

  // Khởi tạo các ngày trong lịch trình khi chọn khoảng thời gian
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
      
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      
      const days: ItineraryDay[] = [];
      let currentDate = dayjs(startDate);
      const lastDate = dayjs(endDate);
      
      while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate, 'day')) {
        days.push({
          date: currentDate.format('YYYY-MM-DD'),
          places: []
        });
        currentDate = currentDate.add(1, 'day');
      }
      
      setItinerary({
        ...itinerary,
        days,
        startDate,
        endDate
      });
    }
  };

  // Mở modal chọn điểm đến cho một ngày cụ thể
  const showDestinationModal = (date: string) => {
    setCurrentDay(date);
    setIsDestinationModalVisible(true);
  };

  // Thêm điểm đến vào ngày đã chọn
  const addDestinationToDay = (destination: TouristPlace) => {
    if (!currentDay) return;

    const updatedDays = itinerary.days.map(day => {
      if (day.date === currentDay) {
        // Tính toán thông tin di chuyển nếu đã có điểm trước đó
        let transportInfo = { cost: 0, time: 0, distance: 0 };
        if (day.places.length > 0) {
          const prevPlace = day.places[day.places.length - 1];
          transportInfo = calculateTransportation(prevPlace.location, destination.location);
        }

        // Thêm điểm đến mới với thông tin di chuyển
        return {
          ...day,
          places: [
            ...day.places,
            {
              ...destination,
              transportationCost: transportInfo.cost,
              transportationTime: transportInfo.time,
              startTime: '09:00',
              endTime: '11:00',
              note: '',
              transportationType: 'Xe khách'
            }
          ]
        };
      }
      return day;
    });

    setItinerary({
      ...itinerary,
      days: updatedDays
    });
  };

  // Xóa điểm đến khỏi lịch trình
  const removeDestination = (dayIndex: number, placeIndex: number) => {
    const updatedDays = [...itinerary.days];
    updatedDays[dayIndex].places.splice(placeIndex, 1);
    
    // Cập nhật lại thông tin di chuyển sau khi xóa
    if (placeIndex < updatedDays[dayIndex].places.length) {
      // Nếu xóa một điểm ở giữa, cần tính lại chi phí di chuyển cho điểm tiếp theo
      const prevLocation = placeIndex > 0 
        ? updatedDays[dayIndex].places[placeIndex - 1].location 
        : '';
        
      if (prevLocation) {
        const nextPlace = updatedDays[dayIndex].places[placeIndex];
        const transportInfo = calculateTransportation(prevLocation, nextPlace.location);
        updatedDays[dayIndex].places[placeIndex] = {
          ...nextPlace,
          transportationCost: transportInfo.cost,
          transportationTime: transportInfo.time
        };
      }
    }
    
    setItinerary({
      ...itinerary,
      days: updatedDays
    });
  };

  // Mở modal chỉnh sửa chi tiết điểm đến
  const showEditModal = (day: ItineraryDay, place: any, index: number) => {
    setEditingPlace({
      ...place,
      dayDate: day.date,
      index
    });
    setIsEditModalVisible(true);
  };

  // Lưu thông tin chỉnh sửa
  const saveEditedPlace = () => {
    if (!editingPlace) return;

    const updatedDays = itinerary.days.map(day => {
      if (day.date === editingPlace.dayDate) {
        const updatedPlaces = [...day.places];
        updatedPlaces[editingPlace.index] = {
          ...updatedPlaces[editingPlace.index],
          startTime: editingPlace.startTime,
          endTime: editingPlace.endTime,
          note: editingPlace.note,
          transportationType: editingPlace.transportationType,
          transportationCost: editingPlace.transportationCost,
          transportationTime: editingPlace.transportationTime
        };
        return { ...day, places: updatedPlaces };
      }
      return day;
    });

    setItinerary({
      ...itinerary,
      days: updatedDays
    });
    setIsEditModalVisible(false);
  };

  // Xử lý kéo thả để sắp xếp lại các điểm đến
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const dayId = source.droppableId;
    
    // Nếu kéo thả trong cùng một ngày
    if (source.droppableId === destination.droppableId) {
      const dayIndex = itinerary.days.findIndex(day => day.date === dayId);
      const places = [...itinerary.days[dayIndex].places];
      const [removed] = places.splice(source.index, 1);
      places.splice(destination.index, 0, removed);
      
      // Cập nhật lại thông tin di chuyển sau khi sắp xếp lại
      const updatedPlaces = places.map((place, index) => {
        if (index === 0) {
          return { ...place, transportationCost: 0, transportationTime: 0 };
        }
        
        const prevPlace = places[index - 1];
        const transportInfo = calculateTransportation(prevPlace.location, place.location);
        
        return {
          ...place,
          transportationCost: transportInfo.cost,
          transportationTime: transportInfo.time
        };
      });
      
      const updatedDays = [...itinerary.days];
      updatedDays[dayIndex] = { ...updatedDays[dayIndex], places: updatedPlaces };
      
      setItinerary({
        ...itinerary,
        days: updatedDays
      });
    }
    // TODO: Xử lý kéo thả giữa các ngày khác nhau nếu cần
  };

  // Tính tổng ngân sách và thời gian
  const calculateTotals = () => {
    let totalBudget = 0;
    let totalDuration = 0;

    itinerary.days.forEach(day => {
      day.places.forEach(place => {
        totalBudget += place.price || 0;
        totalBudget += place.transportationCost || 0;
        totalDuration += place.transportationTime || 0;
      });
    });

    setItinerary({
      ...itinerary,
      totalBudget,
      totalDuration
    });
  };

  // Format thời gian từ phút sang giờ:phút
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="travel-itinerary">
      <Card className="itinerary-header" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Title level={2}>Tạo lịch trình du lịch</Title>
            <Input 
              placeholder="Tên chuyến đi" 
              size="large"
              value={itinerary.name}
              onChange={(e) => setItinerary({ ...itinerary, name: e.target.value })}
              style={{ marginBottom: 16 }}
            />
            <Space>
              <CalendarOutlined /> 
              <Text strong>Chọn thời gian:</Text>
            </Space>
            <RangePicker 
              style={{ width: '100%', marginTop: 8 }}
              onChange={dates => handleDateRangeChange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng ngân sách dự tính"
                    value={itinerary.totalBudget}
                    precision={0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<DollarOutlined />}
                    suffix="₫"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng thời gian di chuyển"
                    value={formatDuration(itinerary.totalDuration)}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {itinerary.days.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {itinerary.days.map((day, dayIndex) => (
            <Card 
              key={day.date} 
              title={
                <Space>
                  <CalendarOutlined />
                  <Text strong>Ngày {dayIndex + 1}: {dayjs(day.date).format('DD/MM/YYYY')}</Text>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showDestinationModal(day.date)}
                >
                  Thêm điểm đến
                </Button>
              }
              style={{ marginBottom: 16 }}
            >
              <Droppable droppableId={day.date}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: 100 }}
                  >
                    {day.places.length > 0 ? (
                      <Timeline mode="left">
                        {day.places.map((place, placeIndex) => (
                          <Draggable
                            key={`${place.id}-${placeIndex}`}
                            draggableId={`${place.id}-${placeIndex}`}
                            index={placeIndex}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Timeline.Item
                                  dot={<EnvironmentOutlined style={{ fontSize: '16px' }} />}
                                  color="green"
                                >
                                  <Card 
                                    size="small"
                                    title={
                                      <Row justify="space-between" align="middle">
                                        <Col>
                                          <Space>
                                            <DragOutlined style={{ cursor: 'grab' }} />
                                            <Text strong>{place.name}</Text>
                                            <Tag color="blue">{place.startTime} - {place.endTime}</Tag>
                                          </Space>
                                        </Col>
                                        <Col>
                                          <Space>
                                            <Button 
                                              size="small" 
                                              type="text"
                                              onClick={() => showEditModal(day, place, placeIndex)}
                                            >
                                              Chỉnh sửa
                                            </Button>
                                            <Popconfirm
                                              title="Bạn có chắc muốn xóa điểm đến này?"
                                              onConfirm={() => removeDestination(dayIndex, placeIndex)}
                                              okText="Có"
                                              cancelText="Không"
                                            >
                                              <Button 
                                                size="small" 
                                                type="text" 
                                                danger 
                                                icon={<DeleteOutlined />}
                                              />
                                            </Popconfirm>
                                          </Space>
                                        </Col>
                                      </Row>
                                    }
                                    style={{ marginBottom: 8 }}
                                  >
                                    <Row gutter={[16, 8]}>
                                      <Col span={24}>
                                        <Space>
                                          <EnvironmentOutlined />
                                          <Text>{place.location}</Text>
                                        </Space>
                                      </Col>
                                      <Col span={12}>
                                        <Space>
                                          <DollarOutlined />
                                          <Text>{place.price.toLocaleString('vi-VN')} ₫</Text>
                                        </Space>
                                      </Col>
                                      
                                      {placeIndex > 0 && (
                                        <Col span={24}>
                                          <Divider orientation="left" plain>
                                            <Space>
                                              <ArrowRightOutlined />
                                              <Text type="secondary">Di chuyển từ điểm trước</Text>
                                            </Space>
                                          </Divider>
                                          <Row gutter={[16, 8]}>
                                            <Col span={8}>
                                              <Text type="secondary">Phương tiện:</Text>
                                              <div>{place.transportationType}</div>
                                            </Col>
                                            <Col span={8}>
                                              <Text type="secondary">Chi phí:</Text>
                                              <div>{place.transportationCost?.toLocaleString('vi-VN')} ₫</div>
                                            </Col>
                                            <Col span={8}>
                                              <Text type="secondary">Thời gian:</Text>
                                              <div>{formatDuration(place.transportationTime || 0)}</div>
                                            </Col>
                                          </Row>
                                        </Col>
                                      )}
                                      
                                      {place.note && (
                                        <Col span={24}>
                                          <Text type="secondary">Ghi chú:</Text>
                                          <Paragraph>{place.note}</Paragraph>
                                        </Col>
                                      )}
                                    </Row>
                                  </Card>
                                </Timeline.Item>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Timeline>
                    ) : (
                      <Empty
                        description="Chưa có điểm đến nào được thêm vào ngày này"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          ))}
        </DragDropContext>
      ) : (
        <Card>
          <Empty
            description="Vui lòng chọn thời gian cho chuyến đi để bắt đầu lập lịch trình"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Modal chọn điểm đến để thêm vào lịch trình */}
      <Modal
        title="Chọn điểm đến"
        visible={isDestinationModalVisible}
        footer={null}
        onCancel={() => setIsDestinationModalVisible(false)}
        width={1000}
      >
        <Row gutter={[16, 16]}>
          {touristPlaces.map(place => (
            <Col xs={24} sm={12} md={8} key={place.id}>
              <Card
                hoverable
                cover={<img alt={place.name} src={place.image} style={{ height: 150, objectFit: 'cover' }} />}
                actions={[
                  <Button
                    type="primary"
                    onClick={() => {
                      addDestinationToDay(place);
                      setIsDestinationModalVisible(false);
                    }}
                  >
                    Thêm vào lịch trình
                  </Button>
                ]}
              >
                <Card.Meta
                  title={place.name}
                  description={
                    <Space direction="vertical">
                      <Space><EnvironmentOutlined /> {place.location}</Space>
                      <Space><DollarOutlined /> {place.price.toLocaleString('vi-VN')} ₫</Space>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Modal chỉnh sửa chi tiết điểm đến */}
      <Modal
        title="Chỉnh sửa điểm đến"
        visible={isEditModalVisible}
        onOk={saveEditedPlace}
        onCancel={() => setIsEditModalVisible(false)}
      >
        {editingPlace && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Điểm đến:</Text>
              <Input value={editingPlace.name} disabled />
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Giờ bắt đầu:</Text>
                <Input
                  type="time"
                  value={editingPlace.startTime}
                  onChange={(e) => setEditingPlace({ ...editingPlace, startTime: e.target.value })}
                />
              </Col>
              <Col span={12}>
                <Text strong>Giờ kết thúc:</Text>
                <Input
                  type="time"
                  value={editingPlace.endTime}
                  onChange={(e) => setEditingPlace({ ...editingPlace, endTime: e.target.value })}
                />
              </Col>
            </Row>
            
            {editingPlace.index > 0 && (
              <>
                <Divider orientation="left">Thông tin di chuyển</Divider>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>Phương tiện:</Text>
                    <Input
                      value={editingPlace.transportationType}
                      onChange={(e) => setEditingPlace({ ...editingPlace, transportationType: e.target.value })}
                    />
                  </Col>
                  <Col span={8}>
                    <Text strong>Chi phí (VNĐ):</Text>
                    <Input
                      type="number"
                      value={editingPlace.transportationCost}
                      onChange={(e) => setEditingPlace({ ...editingPlace, transportationCost: parseInt(e.target.value) })}
                    />
                  </Col>
                  <Col span={8}>
                    <Text strong>Thời gian (phút):</Text>
                    <Input
                      type="number"
                      value={editingPlace.transportationTime}
                      onChange={(e) => setEditingPlace({ ...editingPlace, transportationTime: parseInt(e.target.value) })}
                    />
                  </Col>
                </Row>
              </>
            )}
            
            <div>
              <Text strong>Ghi chú:</Text>
              <Input.TextArea
                rows={4}
                value={editingPlace.note}
                onChange={(e) => setEditingPlace({ ...editingPlace, note: e.target.value })}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default TravelItinerary;