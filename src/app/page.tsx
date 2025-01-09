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
rgba(38, 36, 36, 0.85),
rgba(27, 25, 25, 0.85),
        #12101000,
        #121010C7
      )`, backgroundRepeat: "no-repeat",
          backgroundSize: "cover"
        }}>

      </div >
      <main className="h-screen flex flex-col items-center justify-center p-4"
        style={{
          backgroundImage:
            `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="w-full max-w-5xl mx-auto text-center z-10">
          <div className=''>
            <Image
              src={logo}
              alt="Logo"
              // width={300}
              // height={100}
              className="mx-auto object-cover xl:w-[300px] lg:w-[250px] sm:w-[200px] w-[150px]"
            />
          </div>

          <div className='my-5'>
            <p className='text-white xl:text-[40px] lg:text-[32px] md:text-[28px] text-[18px] font-bold'>
              Unlimited movies, Unlimited Shorts
            </p>
            <p className='text-white xl:text-[32px] lg:text-[25px] md:text-[20px] text-[14px] font-semibold	'>
              Watch Anywhere, Anytime
            </p>
          </div>

          <div onKeyPress={handleKeyPress} className='max-w-2xl mx-auto'>
            <Search onSearch={handleSearch} initialQuery={currentSearchQuery} />
          </div>

          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={performSearch}
              className="lg:px-6 lg:py-2 md:px-5 px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors xl:text-lg md:text-base text-sm"
            >
              Search
            </button>
            <button
              onClick={() => router.push('/movies?latest=true')}
              className="lg:px-6 lg:py-2 md:px-5 px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors xl:text-lg md:text-base text-sm"
            >
              Latest Videos
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
