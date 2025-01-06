'use client';

import Image from 'next/image';
import logo from "../../public/logo.png";
import Search from '@/components/search';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import background from "../../public/background2.png";

export default function Home() {
  const router = useRouter();
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setCurrentSearchQuery(query || '');
    if (query?.trim()) {
      router.push(`/movies?search=${encodeURIComponent(query)}`);
    }
  };

  const performSearch = () => {
    if (currentSearchQuery?.trim()) {
      router.push(`/movies?search=${encodeURIComponent(currentSearchQuery)}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <>
      <div className='absolute inset-0 z-0'
        style={{
          backgroundImage: `linear-gradient(
        to bottom,
rgba(38, 36, 36, 0.76),
        #1B1919FC,
        #12101000,
        #121010C7
      )`}}>

      </div >
      <main className="h-screen flex flex-col items-center justify-center p-4"
        style={{
          backgroundImage:
            `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="w-full max-w-2xl mx-auto text-center z-10">
          <Image
            src={logo}
            alt="Logo"
            width={300}
            height={100}
            className="mx-auto mb-8"
          />

          <div onKeyPress={handleKeyPress}>
            <Search onSearch={handleSearch} initialQuery={currentSearchQuery} />
          </div>

          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={performSearch}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => router.push('/movies?latest=true')}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Latest Videos
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
