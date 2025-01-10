'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store authentication status in local storage
      localStorage.setItem('UserId', user.uid || '');
      router.push('/admin/dashboard'); // Redirect to dashboard after login
    } catch {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md p-6 border rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 mb-4 border rounded text-black"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 mb-4 border rounded text-black"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
