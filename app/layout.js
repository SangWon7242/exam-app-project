import "./globals.css";

export const metadata = {
  title: "웹 스크래핑",
  description: "웹 스크래핑 연습",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
