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
import logo from "../../../public/logo.png";
import { LinkIcon } from 'lucide-react';
import background from "../../../public/moviebackground.png";

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

        <>
            <div className='fixed inset-0 z-0'
                style={{
                    backgroundImage:
                        `url(${background.src})`,
                    backgroundPosition: "center"
                }}>

            </div >
            <div className='min-h-screen' style={{
                backgroundColor: "black",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>

                <div className='py-5 pt-8 relative lg:px-20 px-4'>
                    <div className="z-10 lg:absolute flex justify-center top-9 2xl:left-16 left-10">
                        <Link href="/" className='lg:w-40 w-36'>
                            <Image src={logo} alt='logo' className='lg:w-40 w-36' />
                        </Link>
                    </div>
                    <div className='lg:w-2/3 w-full mt-5 lg:mt-0 xl:mx-auto ms-auto'>
                        <Search onSearch={handleSearch} initialQuery={currentSearchQuery} />
                    </div>
                </div>
                <div className="max-w-4xl mx-auto p-4 z-[5] relative text-white">
                    {movies.length === 0 && !loading && (
                        <div className="text-center text-gray-500">No movies found</div>
                    )}

                    {movies.length > 0 && (
                        <div className="space-y-4">
                            {(latestMovies ? movies : currentMovies).map((movie) => (
                                <div key={movie.id} className="flex gap-4 p-2 sm:pe-5 border rounded-lg">
                                    <div className='lg:w-32 lg:h-32 w-28 h-28 object-cover rounded'>
                                        <Image
                                            src={movie.imageBase64 || '/placeholder-image.png'}
                                            alt={movie.title}
                                            className="lg:w-32 lg:h-32 w-28 h-28  object-cover rounded"
                                            width={100}
                                            height={100}
                                        />
                                    </div>

                                    <div className='overflow-hidden flex sm:flex-row flex-col justify-between w-full'>
                                        <div className='lg:w-9/12 sm:w-4/6'>
                                            <h2 className="lg:text-xl sm:text-lg text-base font-semibold md:mt-4">{movie.title}</h2>
                                            <p className="text-sm max-h-16 overflow-hidden text-ellipsis lg:line-clamp-3 line-clamp-2">{movie.description}</p>
                                        </div>
                                        <div className='sm:self-center mt-3 sm:mt-0'>
                                            {movie.link && (
                                                <Link
                                                    href={movie.link}
                                                    className="border break-words lg:text-base text-sm lg:py-2 sm:py-1.5 py-1 px-3 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 max-w-fit"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span> <LinkIcon size={18} /></span> Download Link
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
                                // className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-[#BABABABB] text-gray-700 cursor-not-allowed' : 'bg-[#a3a3a3]'
                                //     }`}
                                className={`px-4 py-2 border rounded ${currentPage === 1 ? 'cursor-pointer' : 'bg-white text-black'
                                    }`}
                            >
                                Previous
                            </button>
                            {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 border rounded ${page === currentPage ? 'bg-[#BABABABB] text-white' : 'bg-[#a3a3a3]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))} */}
                            <span className="px-3 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                // className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'bg-[#BABABABB] text-gray-700 cursor-not-allowed' : 'bg-[#a3a3a3]'
                                //     }`}
                                className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'cursor-pointer' : 'bg-white text-black'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default function Movies() {
    return (
        <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
            <MoviesContent />
        </Suspense>
    );
}