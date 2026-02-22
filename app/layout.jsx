import "./globals.css";

export const metadata = {
  title: "b.Braced Aligner Buddy",
  description: "AI assistant for clear aligner questions in multiple Indian languages",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
