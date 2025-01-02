'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AdminLayout from '../AdminLayout';
import Image from 'next/image';
// import Search from '@/components/search';
import { SearchResult } from '@/types';
import { Edit, Filter, MoreVertical, Trash } from 'lucide-react';
import AdminSearch from '@/components/adminsearch';

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [originalResults, setOriginalResults] = useState<SearchResult[]>([]);
  const itemsPerPage = 10;

  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});

  const toggleDropdown = (id: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the dropdown for the specific row
    }));
  };

  useEffect(() => {
    // Get initial values from URL parameters
    const categoryFromUrl = searchParams.get('category') || '';
    const searchFromUrl = searchParams.get('search') || '';

    setSelectedCategory(categoryFromUrl);
    setCurrentSearchQuery(searchFromUrl);

    fetchResults();
  }, [searchParams]);

  useEffect(() => {
    filterResults();
  }, [currentSearchQuery, selectedCategory, originalResults]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'searchResults'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || '',
        description: doc.data().description || '',
        category: doc.data().category || '',
        imageBase64: doc.data().imageBase64 || undefined,
        link: doc.data().link || undefined,
      }));

      setOriginalResults(data);
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
      setOriginalResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filteredData = [...originalResults];

    if (currentSearchQuery) {
      const lowercaseQuery = currentSearchQuery.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery)
      );
    }

    if (selectedCategory) {
      filteredData = filteredData.filter(item =>
        item.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }

    setResults(filteredData);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'searchResults', id));
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  // const handleEdit = (id: string) => {
  //   router.push(`/admin/edit/${id}`);
  // };

  const handleEdit = (id: string) => {
    const params = new URLSearchParams();
    if (currentSearchQuery) {
      params.set('search', currentSearchQuery);
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    router.push(`/admin/edit/${id}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSearch = (query: string) => {
    setCurrentSearchQuery(query);
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    router.push(`/admin/dashboard?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    const params = new URLSearchParams(window.location.search);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    if (currentSearchQuery) {
      params.set('search', currentSearchQuery);
    }
    router.push(`/admin/dashboard?${params.toString()}`);
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-[22px] font-bold mb-6 bg-[#D9D9D9] max-w-max px-14 py-1.5 rounded-[18px]">Dashboard</h1>
        <div className='flex items-center mb-8 gap-4'>
          <div className='w-1/3'>
            {/* <Search onSearch={handleSearch} initialQuery={currentSearchQuery} /> */}
            <AdminSearch onSearch={handleSearch} initialQuery={currentSearchQuery} />
          </div>
          <div className='flex gap-1 items-center border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-3 rounded-[8px]'>
            <Filter size={20} />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className='w-44 border-none outline-none'
            >
              <option value="">All Categories</option>
              <option value="Movie">Movie</option>
              <option value="Short">Short</option>
              <option value="Other">Other video</option>
            </select>
          </div>
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            No results found
          </div>
        )}

        {results.length > 0 && (
          <div className="overflow-x-auto">
            {/* <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border w-[300px]" >Description</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border w-[300px]">Link</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((result) => (
                  <tr key={result.id}>
                    <td className="p-2 border align-top">{result.title}</td>
                    <td className="p-2 border w-[300px] align-top"><p className='text-ellipsis line-clamp-2'>{result.description}</p></td>
                    <td className="p-2 border align-top">{result.category}</td>
                    <td className="p-2 border align-top w-[150px]">
                      {result.imageBase64 ? (
                        <Image
                          src={result.imageBase64}
                          alt={result.title}
                          className="w-16 h-20 object-cover rounded"
                          width={100}
                          height={100}
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="p-2 border w-[300px] align-top"><p className='!break-all'>{result.link}</p></td>
                    <td className="p-2 border align-top">
                      <div className="flex gap-2 align-top">
                        <button
                          onClick={() => handleEdit(result.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
            <table className="w-full border-collapse ">
              <thead className='w-full'>
                <tr className="gap-2 flex mb-4">
                  <th className="p-2.5 bg-[#D9D9D9] rounded-[18px] min-w-[150px]">Image</th>
                  <th className="p-2.5 min-w-[150px] bg-[#D9D9D9] rounded-[18px]">Title Name</th>
                  <th className="p-2.5 w-full bg-[#D9D9D9] rounded-[18px]">Description</th>
                  <th className="p-2.5 min-w-[150px] bg-[#D9D9D9] rounded-[18px]">Category</th>
                  <th className="p-2.5 w-full bg-[#D9D9D9] rounded-[18px]">Link</th>
                  <th className="p-2.5 min-w-[100px] bg-[#D9D9D9] rounded-[18px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((result) => (
                  <tr key={result.id} className='flex items-center gap-2 rounded-[18px] mt-3 bg-[#E9E9E9]'>
                    <td className="p-2.5 min-w-[150px] flex justify-center">
                      {result.imageBase64 ? (
                        <Image
                          src={result.imageBase64}
                          alt={result.title}
                          className="w-20 h-28 object-cover rounded"
                          width={100}
                          height={100}
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="p-2.5 min-w-[150px] text-center font-medium">{result.title}</td>
                    <td className="p-2.5 w-full text-center font-medium"><p className='text-ellipsis line-clamp-4 text-start'>{result.description}</p></td>
                    <td className="p-2.5 min-w-[150px] text-center font-medium capitalize">{result.category}</td>

                    <td className="p-2.5 w-full text-center font-medium"><p className='!break-all text-start'>{result.link}</p></td>
                    <td className="p-2.5 min-w-[100px] text-center">
                      {/* <div className="flex gap-2 align-top p-2.5 min-w-[100px]">
                        <button
                          onClick={() => handleEdit(result.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div> */}
                      <div className="relative">
                        {/* Vertical Ellipsis Button */}
                        <button
                          onClick={() => toggleDropdown(result.id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownStates[result.id] && (
                          <div className="absolute z-50 right-[20px] top-[24px] mt-2 min-w-max bg-white shadow-md rounded-lg">
                            <button
                              onClick={() => {
                                handleEdit(result.id);
                                setDropdownStates((prev) => ({ ...prev, [result.id]: false })); // Close the dropdown
                              }}
                              className="flex items-center gap-2 px-4 py-2 w-full text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                              Edit Movie
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(result.id);
                                setDropdownStates((prev) => ({ ...prev, [result.id]: false })); // Close the dropdown
                              }}
                              className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-gray-100 transition-colors"
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                              Delete Movie
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* <tbody>
                {currentResults.map((result) => (
                  <tr key={result.id}>
                    <td className="p-2 border align-top">{result.title}</td>
                    <td className="p-2 border w-[300px] align-top"><p className='text-ellipsis line-clamp-2'>{result.description}</p></td>
                    <td className="p-2 border align-top">{result.category}</td>
                    <td className="p-2 border align-top w-[150px]">
                      {result.imageBase64 ? (
                        <Image
                          src={result.imageBase64}
                          alt={result.title}
                          className="w-16 h-20 object-cover rounded"
                          width={100}
                          height={100}
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="p-2 border w-[300px] align-top"><p className='!break-all'>{result.link}</p></td>
                    <td className="p-2 border align-top">
                      <div className="flex gap-2 align-top">
                        <button
                          onClick={() => handleEdit(result.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between gap-2 mt-12 px-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-8 py-2  rounded-md disabled:opacity-50  transition-colors bg-[#BABABABB] hover:bg-[#a3a3a3] font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-8 py-2  rounded-md disabled:opacity-50  transition-colors bg-[#BABABABB] hover:bg-[#a3a3a3] font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};


export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </AdminLayout>
  );
}