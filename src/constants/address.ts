export const cities = ['Đà Nẵng', 'Hồ Chí Minh', 'Hà Nội', 'Cần Thơ', 'Hải Phòng'] as const

export type City = (typeof cities)[number]

export const districtsByCity: Record<City, string[]> = {
  'Đà Nẵng': ['Cẩm Lệ', 'Hải Châu', 'Liên Chiểu', 'Ngũ Hành Sơn', 'Thanh Khê'],
  'Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Tân Bình', 'Bình Thạnh'],
  'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Cầu Giấy', 'Thanh Xuân'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn'],
  'Hải Phòng': ['Hải An', 'Hồng Bàng', 'Ngô Quyền', 'Lê Chân']
}

export const wardsByDistrict: Record<string, string[]> = {
  'Cẩm Lệ': ['Khuê Trung', 'Hòa Phát', 'Hòa An', 'Hòa Xuân'],
  'Hải Châu': ['Phước Ninh', 'Hải Châu 1', 'Hải Châu 2', 'Thạc Gián'],
  'Liên Chiểu': ['Liên Chiểu', 'Hòa Khánh', 'Hòa Minh', 'Tam Thăng'],
  'Ngũ Hành Sơn': ['Ngũ Hành Sơn', 'Hòa Quý', 'Hòa Xuân'],
  'Thanh Khê': ['Thanh Khê Đông', 'Thanh Khê Tây', 'Xuân Hà', 'Tân Chính'],
  'Quận 1': ['Ben Nghe', 'Cau Kho', 'Da Kao', 'Nguyen Thai Binh'],
  'Quận 3': ['Vo Thi Sau', 'Pham Ngoc Thach', 'Co Giang', 'Nguyen Cu Trinh'],
  'Quận 7': ['Phu My Hung', 'Tan Quy', 'Tan Phong', 'Phu Thu'],
  'Tân Bình': ['Ward 1', 'Ward 2', 'Ward 3', 'Sân Bay'],
  'Bình Thạnh': ['Ward 1', 'Ward 2', 'Ward 3', 'Phu Nhuan'],
  'Ba Đình': ['Phúc Xá', 'Trúc Bạch', 'Vĩnh Phúc', 'Cống Vị'],
  'Hoàn Kiếm': ['Chương Dương', 'Đồng Xuân', 'Hàng Bạc', 'Hàng Bài'],
  'Đống Đa': ['Thượng Đình', 'Thị Nại', 'Trung Liệt', 'Phương Liên'],
  'Cầu Giấy': ['Dịch Vọng', 'Dịch Vọng Hậu', 'Nghĩa Đô', 'Trung Hòa'],
  'Thanh Xuân': ['Thanh Xuân Trung', 'Thanh Xuân Bắc', 'Thanh Xuân Nam', 'Hạ Đình'],
  'Ninh Kiều': ['An Phú', 'Xuân Khánh', 'Tân An', 'Cái Khế'],
  'Bình Thủy': ['Bình Thủy', 'Trà No', 'Long Tuyền', 'Lộ Bê'],
  'Cái Răng': ['Cái Răng', 'Thường Thạnh', 'Phong Thạnh', 'Thạnh Phú'],
  'Ô Môn': ['Ô Môn 1', 'Ô Môn 2', 'Ô Môn 3', 'Thường Lạc'],
  'Hải An': ['Cát Bi', 'Đằng Giả', 'Ha Lam', 'Ngọc Sơn'],
  'Hồng Bàng': ['Hồng Bàng', 'Hoàng Văn Thụ', 'Minh Khai', 'Quang Trung'],
  'Ngô Quyền': ['Ngô Quyền', 'Gia Viễn', 'Lạc Vệ', 'Trường Chinh'],
  'Lê Chân': ['Lê Chân', 'An Dương', 'Lam Sơn', 'Minh Khai', 'Vạn Sơn']
}

export type District = string
export type Ward = string