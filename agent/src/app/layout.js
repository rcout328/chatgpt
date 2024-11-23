import './globals.css';
import Providers from '../components/Providers';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Market Insight Analysis',
  description: 'AI-powered market insight and analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
