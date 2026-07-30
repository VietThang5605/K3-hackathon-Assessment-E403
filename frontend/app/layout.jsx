import './globals.css';

export const metadata = {
  title: 'VLearn Assessment Agent — AI Tạo Quiz & Thống kê Lỗ hổng Học tập',
  description: 'AI Agent cho Giảng viên: Tạo Quiz tự động từ Slide VLearn và xuất Báo cáo Lỗ hổng Kiến thức trong 3 phút.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
