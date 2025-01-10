// components/ProtectedRoute.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('UserId');
    if (!userId) {
      // Redirect to login if not authenticated
      router.push('/admin/Login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    // Optionally, return a loading spinner or message while checking authentication
    return <div className='flex justify-center items-center' style={{ height: "calc(100vh - 20vh)" }}><div className='loader'></div></div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
