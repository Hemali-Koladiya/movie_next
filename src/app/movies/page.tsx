'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query as firestoreQuery, orderBy, getDocs, QuerySnapshot, limit } from 'firebase/firestore';
import Image from 'next/image';
import Search from '@/components/search';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/types';
import Link from 'next/link';

const MoviesContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams.get('search') || '';
    const latestMovies = searchParams.get('latest') === 'true';
    const [movies, setMovies] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Change this value to control how many items per page

    const handleSearch = (query: string) => {
        setCurrentSearchQuery(query);
        setCurrentPage(1); // Reset to the first page on a new search
        router.push(`/movies?search=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        if (latestMovies) {
            fetchLatestMovies();
        } else if (searchQuery) {
            fetchMovies(searchQuery);
        }
    }, [searchQuery, latestMovies]);

    const fetchMovies = async (query: string) => {
        setLoading(true);
        try {
            const moviesRef = collection(db, 'searchResults');
            const q = firestoreQuery(moviesRef, orderBy('created_at', 'desc'));
    
            const snapshot: QuerySnapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    title: docData.title || '',
                    description: docData.description || '',
                    imageBase64: docData.imageBase64 || undefined,
                    link: docData.link || undefined,
                    category: docData.category || '',
                };
            });
    
            const lowercaseQuery = query.toLowerCase();
            const filteredMovies = data.filter(
                (movie) =>
                    movie.title.toLowerCase().includes(lowercaseQuery) ||
                    movie.description.toLowerCase().includes(lowercaseQuery)
            );
    
            setMovies(filteredMovies);
        } catch (error) {
            console.error('Error fetching movies:', error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };
    

    // const fetchMovies = async (query: string) => {
    //     setLoading(true);
    //     try {
    //         const moviesRef = collection(db, 'searchResults');
    //         let q = firestoreQuery(moviesRef, orderBy('created_at', 'desc'));

    //         if (query) {
    //             q = firestoreQuery(moviesRef, where('title', '>=', query), where('title', '<=', query + '\uf8ff'));
    //         }

    //         const snapshot: QuerySnapshot = await getDocs(q);
    //         const data = snapshot.docs.map((doc) => {
    //             const docData = doc.data(); // Use `doc.data()` and cast it as SearchResult
    //             return {
    //                 id: doc.id,
    //                 title: docData.title || '',
    //                 description: docData.description || '',
    //                 imageBase64: docData.imageBase64 || undefined,
    //                 link: docData.link || undefined,
    //                 category: docData.category || '',
    //             };
    //         });

    //         setMovies(data);
    //     } catch (error) {
    //         console.error('Error fetching movies:', error);
    //         setMovies([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchLatestMovies = async () => {
        setLoading(true);
        try {
            const moviesRef = collection(db, 'searchResults');
            const q = firestoreQuery(moviesRef, orderBy('created_at', 'desc'), limit(10));
            const snapshot: QuerySnapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    title: docData.title || '',
                    description: docData.description || '',
                    imageBase64: docData.imageBase64 || undefined,
                    link: docData.link || undefined,
                    category: docData.category || '',
                };
            });

            setMovies(data);
        } catch (error) {
            console.error('Error fetching latest movies:', error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(movies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMovies = movies.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }
    
    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="my-4 mb-6">
                <Search onSearch={handleSearch} initialQuery={currentSearchQuery} />
            </div>

            {movies.length === 0 && !loading && (
                <div className="text-center text-gray-500">No movies found</div>
            )}

            {movies.length > 0 && (
                <div className="space-y-4">
                    {(latestMovies ? movies : currentMovies).map((movie) => (
                        <div key={movie.id} className="flex gap-4 p-2 pe-5 border rounded-lg">
                            <div className='lg:w-32 lg:h-32 sm:w-28 sm:h-28 w-24 h-24 object-cover rounded'>
                                <Image
                                    src={movie.imageBase64 || '/placeholder-image.png'}
                                    alt={movie.title}
                                    className="lg:w-32 lg:h-32 sm:w-28 sm:h-28 w-24 h-24 object-cover rounded"
                                    width={100}
                                    height={100}
                                />
                            </div>

                            <div className='overflow-hidden flex sm:flex-row flex-col justify-between w-full'>
                                <div className='sm:w-5/6'>
                                    <h2 className="lg:text-xl sm:text-lg text-base font-semibold mt-4">{movie.title}</h2>
                                    <p className="text-sm max-h-16 overflow-hidden text-ellipsis line-clamp-2">{movie.description}</p>
                                </div>
                                <div className='sm:self-center mt-5 sm:mt-0'>
                                    {movie.link && (
                                        <Link
                                            href={movie.link}
                                            className="border break-words lg:text-base text-sm py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Get Link
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!latestMovies && totalPages > 1 && (
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-[#BABABABB] text-gray-700 cursor-not-allowed' : 'bg-[#a3a3a3]'
                            }`}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 border rounded ${page === currentPage ? 'bg-[#BABABABB] text-white' : 'bg-[#a3a3a3]'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'bg-[#BABABABB] text-gray-700 cursor-not-allowed' : 'bg-[#a3a3a3]'
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
  };

  export default function Movies() {
    return (
      <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
        <MoviesContent />
      </Suspense>
    );
  }