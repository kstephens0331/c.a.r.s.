import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        setError('You must be logged in to view your documents.');
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      try {
        const { data: docs, error: docsError } = await supabase
          .from('customer_documents')
          .select(`
            id,
            created_at,
            document_type,
            document_url,
            file_name,
            work_orders (
              work_order_number,
              vehicles (
                make,
                model,
                year
              )
            )
          `)
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (docsError) throw new Error(docsError.message);
        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(`Failed to load your documents: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>My Documents | Collision & Refinish Shop</title>
          <meta name="description" content="View your quotes, paid invoices, and other documents." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p>Loading documents...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>My Documents | Collision & Refinish Shop</title>
          <meta name="description" content="View your quotes, paid invoices, and other documents." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Documents | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View your quotes, paid invoices, and other documents."
        />
      </Helmet>

      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <p className="text-lg">Access your quotes and paid invoices here.</p>

        {documents.length === 0 ? (
          <p className="text-gray-500">No documents found for your account.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="border p-4 rounded shadow bg-white">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {doc.document_type === 'quote' ? 'Quote' : 'Paid Invoice'}
                </h3>
                <p className="text-gray-700 mb-1">
                  Work Order # {doc.work_orders?.work_order_number || 'N/A'} (
                  {doc.work_orders?.vehicles?.year} {doc.work_orders?.vehicles?.make} {doc.work_orders?.vehicles?.model})
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                </p>
                <a href={doc.document_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center text-brandRed hover:underline text-sm font-semibold">
                  View {doc.document_type === 'quote' ? 'Quote' : 'Invoice'}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
