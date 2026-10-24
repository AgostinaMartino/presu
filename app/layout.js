import './globals.css';

export const metadata = {
  title: 'Presupuesto',
  description: 'Carga de gastos mensuales',
  appleWebApp: { capable: true, title: 'Presupuesto' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f0f4ff'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
