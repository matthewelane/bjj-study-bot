export const metadata = {
  title: 'BJJ Study Bot',
  description: 'Drill your white belt curriculum step-by-step',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

