export interface TouristPlace {
  id: number;
  name: string;
  image: string;
  location: string;
  type: string;
  rating: number;
  price: number; 
  description?: string;
  activities?: string[];
  bestTimeToVisit?: string;
}

export const touristPlaces: TouristPlace[] = [
  {
    id: 1,
    name: 'Đà Nẵng',
    image: 'https://wondertour.vn/wp-content/uploads/2021/12/da-nang-wondertour.jpg',
    location: 'Miền Trung, Việt Nam',
    type: 'biển',
    rating: 4.5,
    price: 1000000,
    description: 'Thành phố biển xinh đẹp với bãi biển Mỹ Khê nổi tiếng và cầu Rồng độc đáo',
    activities: ['Tắm biển', 'Leo núi Ngũ Hành Sơn', 'Tham quan Bà Nà Hills'],
    bestTimeToVisit: 'Tháng 2 đến tháng 8',
  },
  {
    id: 2,
    name: 'Hạ Long',
    image: 'https://image.plo.vn/300x200/Uploaded/2025/ernccqrwq/2024_12_24/thuc-hu-thong-tin-vinh-ha-long-bi-unesco-xem-xet-loai-khoi-danh-sach-di-san-thien-nhien-the-gioi-7957-6068.png.webp',
    location: 'Miền Bắc, Việt Nam',
    type: 'vịnh',
    rating: 4.8,
    price: 2000000,
    description: 'Vịnh Hạ Long là di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi',
    activities: ['Du thuyền', 'Khám phá hang động', 'Chèo thuyền kayak'],
    bestTimeToVisit: 'Tháng 10 đến tháng 4',
  },
  {
    id: 3,
    name: 'Đà Lạt',
    image: 'https://i.pinimg.com/736x/03/eb/2c/03eb2c14d9af611d8dc6ed0e8bcf79ad.jpg',
    location: 'Tây Nguyên, Việt Nam',
    type: 'núi',
    rating: 4.6,
    price: 1500000,
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm và nhiều địa điểm du lịch hấp dẫn',
    activities: ['Tham quan vườn hoa', 'Chèo thuyền hồ Tuyền Lâm', 'Cắm trại'],
    bestTimeToVisit: 'Tháng 12 đến tháng 3',
  },
  {
    id: 4,
    name: 'Phú Quốc',
    image: 'https://go2joy.s3.ap-southeast-1.amazonaws.com/blog/wp-content/uploads/2022/07/14151347/gioi-thieu-canh-dep-phu-quoc.jpg',
    location: 'Miền Nam, Việt Nam',
    type: 'biển đảo',
    rating: 4.7,
    price: 1200000,
    description: 'Hòn đảo thiên đường với bãi biển cát trắng, nước biển trong xanh và nhiều khu nghỉ dưỡng cao cấp',
    activities: ['Lặn biển ngắm san hô', 'Câu cá', 'Khám phá rừng nguyên sinh'],
    bestTimeToVisit: 'Tháng 11 đến tháng 5',
  },
  {
    id: 5,
    name: 'Hội An',
    image: 'https://cdn.pixabay.com/photo/2021/08/04/02/54/hoi-an-6520902_1280.jpg',
    location: 'Miền Trung, Việt Nam',
    type: 'phố cổ',
    rating: 4.9,
    price: 1700000,
    description: 'Phố cổ xinh đẹp với kiến trúc độc đáo và các hoạt động văn hóa phong phú',
    activities: ['Dạo phố đèn lồng', 'Trải nghiệm ẩm thực', 'May đo quần áo'],
    bestTimeToVisit: 'Tháng 2 đến tháng 4',
  },
  {
    id: 6,
    name: 'Sapa',
    image: 'https://dulichhoangnam.vn/pic/Tour/2_636385588033387543_HasThumb_Thumb.jpg.ashx',
    location: 'Miền Bắc, Việt Nam',
    type: 'núi',
    rating: 4.6,
    price: 1900000,
    description: 'Thị trấn trong sương với những thửa ruộng bậc thang tuyệt đẹp và văn hóa dân tộc đa dạng',
    activities: ['Trekking', 'Thăm bản làng dân tộc', 'Chinh phục Fansipan'],
    bestTimeToVisit: 'Tháng 9 đến tháng 11',
  },
  {
    id: 7,
    name: 'Nha Trang',
    image: 'https://viettourism.biz.vn/uploads/trang2.jpeg',
    location: 'Miền Trung, Việt Nam',
    type: 'biển',
    rating: 4.4,
    price: 3000000,
    description: 'Thành phố biển sôi động với nhiều khu vui chơi giải trí và hoạt động biển đa dạng',
    activities: ['Lặn biển', 'Vui chơi ở Vinpearl Land', 'Tắm bùn khoáng'],
    bestTimeToVisit: 'Tháng 6 đến tháng 8',
  },
  {
    id: 8,
    name: 'Huế',
    image: 'https://cdn.giaoducthoidai.vn/images/eee836ebf9bf0eaa2ce7ff9d71860fe89b123a5304e4b54efe56d25adf3a90e8b4ca5d02e1566ba8d69e29c7e666457556c73ac8344b3380242ffa3ba7aa1236e943dac6c374cb63a22ec7cf21dd59b472af66d5ab5c8f181d542613beb1e8d8437319994b4a902e3effb2e46cc021c38d3fbf2c7a25a3280c835247df8be05f/tai-hien-le-ban-lich-dau-nam-moi-trieu-nguyen-tai-co-do-hue-6080.jpg.webp',
    location: 'Miền Trung, Việt Nam',
    type: 'di tích',
    rating: 4.5,
    price: 1600000,
    description: 'Cố đô Huế với hệ thống di tích cung đình và ẩm thực cung đình độc đáo',
    activities: ['Thăm Đại Nội', 'Du thuyền sông Hương', 'Thưởng thức ẩm thực Huế'],
    bestTimeToVisit: 'Tháng 1 đến tháng 2',
  },
  {
    id: 9,
    name: 'Mũi Né',
    image: 'https://diadanhbinhthuan.com/wp-content/uploads/2021/03/2-20-300x200.jpg',
    location: 'Miền Nam, Việt Nam',
    type: 'biển',
    rating: 4.3,
    price: 700000,
    description: 'Thiên đường biển với những đồi cát vàng và hoàng hôn tuyệt đẹp',
    activities: ['Lướt ván buồm', 'Trượt cát', 'Tham quan làng chài'],
    bestTimeToVisit: 'Tháng 11 đến tháng 5',
  },
  {
    id: 10,
    name: 'Ninh Bình',
    image: 'https://onevivu.vn/wp-content/uploads/2020/10/Du-lich-Tam-Coc-Ninh-Binh-6.jpg',
    location: 'Miền Bắc, Việt Nam',
    type: 'di tích',
    rating: 4.7,
    price: 900000,
    description: 'Vùng đất cổ kính với danh thắng Tràng An và nhiều di tích lịch sử văn hóa',
    activities: ['Du thuyền Tràng An', 'Thăm Tam Cốc - Bích Động', 'Khám phá Hang Múa'],
    bestTimeToVisit: 'Tháng 9 đến tháng 11',
  }
];

export const initTouristData = () => {
  const storageKey = 'touristPlaces';
  
  // Kiểm tra xem dữ liệu đã tồn tại trong localStorage chưa
  if (!localStorage.getItem(storageKey)) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(touristPlaces));
      console.log('Dữ liệu du lịch đã được khởi tạo trong localStorage');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào localStorage:', error);
    }
  }
};

export const getTouristPlaces = (): TouristPlace[] => {
  const storageKey = 'touristPlaces';
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
};

export default touristPlaces;