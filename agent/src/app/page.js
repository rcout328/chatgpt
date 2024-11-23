import ClientLayout from '../components/ClientLayout';

export default function RootPage() {
  return (
    <ClientLayout>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Market Insight Analysis</h2>
        <p className="text-gray-600">
          Select an analysis type from the navigation above to get started.
        </p>
      </div>
    </ClientLayout>
  );
}
