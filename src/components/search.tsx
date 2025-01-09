

'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Suggestion {
  title: string;
  imageBase64?: string;
  description?: string;
  id?: string; // Include `id` for managing hide/unhide
  isHidden?: boolean;
}

// const staticTrendingSuggestions: Suggestion[] = [
//   { title: 'Trending movie 1' },
//   { title: 'Trending movie 2' },
//   { title: 'Trending movie 3' },
// ];

const Search = ({ onSearch, initialQuery = '' }: { onSearch: (query: string) => void, initialQuery?: string }) => {
  const [queryString, setQuery] = useState<string>(initialQuery);
  // const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isInputFocused, setInputFocused] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Suggestion[]>([]);
  
  const [trendingSuggestions, setTrendingSuggestions] = useState<Suggestion[]>([]); 

   // Fetch trending items from Firestore
   const fetchTrendingSuggestions = async () => {
    try {
      const q = query(collection(db, 'trending'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      const fetchedTrending = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          imageBase64: doc.data().imageBase64,
          description: doc.data().description,
          isHidden: doc.data().isHidden,
        }))
        .filter((item) => !item.isHidden); // Filter out hidden items

      setTrendingSuggestions(fetchedTrending); // Set trending suggestions
    } catch (error) {
      console.error('Error fetching trending suggestions:', error);
    }
  };

  // const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const input = e.target.value;
  //   setQuery(input);

  //   console.log("input",input.length);
  //   try {
  //   // Check for empty input and clear suggestions
  //   if (input === "") {
  //     setDynamicSuggestions([]);
  //     setSelectedIndex(null);
  //     onSearch(''); 
  //     return;
  //   }else{
  //     // const lowerInput = input.toLowerCase();
  //     // // Only fetch suggestions if input has content
  //     // if (lowerInput.trim() && lowerInput) {
    
  //     // } else {
  //     //   setDynamicSuggestions([]);
  //     // }
  //   }

  //   } catch (error) {
  //     console.error('Error fetching suggestions:', error);
  //     setDynamicSuggestions([]);
  //   }
  // };

useEffect(() => {
  const lowerInput = queryString.toLowerCase();
  const debounceHandler = setTimeout(async() => {
   if (lowerInput) {
    const q = query(
      collection(db, 'searchResults'),
      where('titleLowercase', '>=', lowerInput),
      where('titleLowercase', '<=', lowerInput + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);

    const fetchedSuggestions = querySnapshot.empty
      ? []
      : querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          title: data.title,
          imageBase64: data.imageBase64,
          description: data.description,
        };
      });

      setDynamicSuggestions(fetchedSuggestions);
    }else{
      setDynamicSuggestions([]);

    }
  }, 300);
  


  return () => {
    clearTimeout(debounceHandler)
  }
}, [queryString])

// Initial fetch of trending suggestions
useEffect(() => {
  fetchTrendingSuggestions();
}, []);

  const handleSearch = () => {
    if (queryString.trim()) {
      onSearch(queryString);
      // setSuggestions([]);
      // setHasSearched(true);
      setDynamicSuggestions([]);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedIndex(null);
    setDynamicSuggestions([]);
    // setSelectedIndex(null);
    onSearch('');
    setInputFocused(false);
    // setHasSearched(false);
    // setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const combinedSuggestions = [...trendingSuggestions, ...dynamicSuggestions];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (combinedSuggestions.length > 0) {
        setSelectedIndex(prevIndex =>
          prevIndex !== null && prevIndex < combinedSuggestions.length - 1 ? prevIndex + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (combinedSuggestions.length > 0) {
        setSelectedIndex(prevIndex =>
          prevIndex !== null && prevIndex > 0 ? prevIndex - 1 : combinedSuggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex !== null && selectedIndex >= 0) {
        const selectedSuggestion = combinedSuggestions[selectedIndex];
        setQuery(selectedSuggestion.title);
        onSearch(selectedSuggestion.title);
        setDynamicSuggestions([]);
        setSelectedIndex(null);
      } else {
        handleSearch();
      }
    }
  };

  return (
   
    <div className="w-full">
      <form
        className="w-full relative"
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <div>
          <input
            type="text"
            value={queryString}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-black w-full px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
          />
          <button
            type="button"
            onClick={queryString ? handleClear : handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
          >
            {queryString ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-black  w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-black  w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {isInputFocused && (
          <ul className="absolute w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto z-[99] text-start">
            {queryString.trim() === '' // Show trending suggestions if input is empty
              ? trendingSuggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.id || index}
                    className={`flex items-center ps-3 px-4 py-2 hover:bg-gray-100 cursor-pointer text-black ${selectedIndex === index ? 'bg-gray-300' : ''}`}
                    onClick={() => {
                      setQuery(suggestion.title);
                      onSearch(suggestion.title);
                      setDynamicSuggestions([]);
                      setInputFocused(false);
                    }}
                  >
                    <svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className='text-black w-6 h-6 mr-2 text-red-100'>
                      <rect width="48" height="48" fill="white" fillOpacity="0.01" />
                      <path d="M40.9999 27.0007L40.9999 15.0007L29 15.0007" stroke="#8c8a89" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 37.0002L16.3385 24.5002L26.1846 30.5002L41 15.0002" stroke="#8c8a89" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p>{suggestion.title}</p>
                  </li>
                ))
              : dynamicSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-black ${selectedIndex === index ? 'bg-gray-300' : ''}`}
                    onClick={() => {
                      setQuery(suggestion.title);
                      onSearch(suggestion.title);
                      setDynamicSuggestions([]);
                      setInputFocused(false);
                    }}
                  >
                    <div className="text-black w-16 h-16 min-w-16 mr-2">
                      <img
                        src={suggestion.imageBase64}
                        alt={suggestion.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{suggestion.title}</p>
                      <p className="text-sm text-gray-600 max-h-16 overflow-hidden text-ellipsis line-clamp-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </li>
                ))}
          </ul>
        )}
      </form>
    </div>
  );
};

export default Search;