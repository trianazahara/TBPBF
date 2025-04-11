import { useState, useEffect } from 'react';
import AddInternForm from '../../components/intern/AddInternForm';

export default function AddInternPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <AddInternForm />
    </div>
  );
}