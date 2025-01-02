// 'use client';
// import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// import { db } from '@/lib/firebase';
// import { collection, query, where, getDocs } from 'firebase/firestore';

// const Search = ({ onSearch, initialQuery = '' }: { onSearch: (query: string) => void, initialQuery?: string }) => {
//   const [queryString, setQuery] = useState<string>(initialQuery);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
//   const [hasSearched, setHasSearched] = useState<boolean>(!!initialQuery);

//   const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const input = e.target.value;
//     setQuery(input);

//     if (input.trim() === '') {
//       setSuggestions([]);
//       setHasSearched(false);
//       onSearch('');
//       return;
//     }

//     try {
//       const q = query(collection(db, 'searchResults'), where('title', '>=', input));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const titles = querySnapshot.docs.map(doc => doc.data().title);
//         const uniqueTitles = Array.from(new Set(titles));
//         setSuggestions(uniqueTitles);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       setSuggestions([]);
//     }
//   };

//   const handleSearch = () => {
//     if (queryString.trim()) {
//       onSearch(queryString);
//       setSuggestions([]);
//       setHasSearched(true);
//     }
//   };

//   const handleClear = () => {
//     setQuery('');
//     setSuggestions([]);
//     setSelectedIndex(null);
//     setHasSearched(false);
//     onSearch('');
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       if (suggestions.length > 0) {
//         setSelectedIndex(prevIndex => (prevIndex !== null && prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0));
//       }
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       if (suggestions.length > 0) {
//         setSelectedIndex(prevIndex => (prevIndex !== null && prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1));
//       }
//     } else if (e.key === 'Enter') {
//       if (selectedIndex !== null && selectedIndex >= 0) {
//         const selectedSuggestion = suggestions[selectedIndex];
//         setQuery(selectedSuggestion);
//         onSearch(selectedSuggestion);
//         setSuggestions([]);
//         setSelectedIndex(null);
//         setHasSearched(true);
//       } else {
//         handleSearch();
//       }
//     }
//   };

//   return (
//     <div className="w-full">
//       <form className="w-full relative" onSubmit={(e) => {
//         e.preventDefault();
//         handleSearch();
//       }}>
//         <div >
//           <input
//             type="text"
//             value={queryString}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             className="w-full px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Search..."
//           />
//           <button
//             type="button"
//             onClick={hasSearched && queryString ? handleClear : handleSearch}
//             className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
//           >
//             {hasSearched && queryString ? (
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             ) : (
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             )}
//           </button>
//         </div>

//         {suggestions.length > 0 && queryString.trim() !== '' && (
//           <ul className="absolute w-full  mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto z-10 text-start">
//             {suggestions.map((suggestion, index) => (
//               <li
//                 key={index}
//                 className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${selectedIndex === index ? 'bg-gray-100' : ''}`}
//                 onClick={() => {
//                   setQuery(suggestion);
//                   onSearch(suggestion);
//                   setSuggestions([]);
//                   setHasSearched(true);
//                 }}
//               >
//                 {suggestion}
//               </li>
//             ))}
//           </ul>
//         )}
//       </form>
//     </div>
//   );
// };

// export default Search;





'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Suggestion {
  title: string;
  imageBase64?: string;
  description?: string;
}


const staticTrendingSuggestions: Suggestion[] = [
  { title: 'Trending movie 1' },
  { title: 'Trending movie 2' },
  { title: 'Trending movie 3' },
];

const Search = ({ onSearch, initialQuery = '' }: { onSearch: (query: string) => void, initialQuery?: string }) => {
  const [queryString, setQuery] = useState<string>(initialQuery);
  // const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isInputFocused, setInputFocused] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Suggestion[]>([]);
  console.log(dynamicSuggestions,"-->>",queryString,"dynamicSuggestions");
  // const [hasSearched, setHasSearched] = useState<boolean>(!!initialQuery);

  // const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const input = e.target.value;
  //   setQuery(input);

  //   if (input.trim() === '') {
  //     setSuggestions([]);
  //     setHasSearched(false);
  //     onSearch('');
  //     return;
  //   }

  //   try {
  //     // Convert input to lowercase for case-insensitive search
  //     const lowerInput = input.toLowerCase();
  //     const q = query(collection(db, 'searchResults'),
  //       where('titleLowercase', '>=', lowerInput),
  //       where('titleLowercase', '<=', lowerInput + '\uf8ff')); // Handles case-insensitive search

  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       const results: Suggestion[] = querySnapshot.docs.map(doc => {
  //         const data = doc.data();
  //         return {
  //           title: data.title,
  //           imageBase64: data.imageBase64,
  //           description: data.description,
  //         };
  //       });
  //       setSuggestions(results);
  //     } else {
  //       setSuggestions([]);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching suggestions:', error);
  //     setSuggestions([]);
  //   }
  // };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setQuery(input);

    console.log("input",input.length);
    try {
    // Check for empty input and clear suggestions
    if (input === "") {
      setDynamicSuggestions([]);
      setSelectedIndex(null);
      onSearch(''); 
      return;
    }else{
      // const lowerInput = input.toLowerCase();
      // // Only fetch suggestions if input has content
      // if (lowerInput.trim() && lowerInput) {
    
      // } else {
      //   setDynamicSuggestions([]);
      // }
    }

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setDynamicSuggestions([]);
    }
  };

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
    setSelectedIndex(null);
    onSearch('');
    setInputFocused(false);
    // setHasSearched(false);
    // setSuggestions([]);
  };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === 'ArrowDown') {
  //     e.preventDefault();
  //     if (suggestions.length > 0) {
  //       setSelectedIndex(prevIndex => (prevIndex !== null && prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0));
  //     }
  //   } else if (e.key === 'ArrowUp') {
  //     e.preventDefault();
  //     if (suggestions.length > 0) {
  //       setSelectedIndex(prevIndex => (prevIndex !== null && prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1));
  //     }
  //   } else if (e.key === 'Enter') {
  //     if (selectedIndex !== null && selectedIndex >= 0) {
  //       const selectedSuggestion = suggestions[selectedIndex];
  //       setQuery(selectedSuggestion.title);
  //       onSearch(selectedSuggestion.title);
  //       setSuggestions([]);
  //       setSelectedIndex(null);
  //       setHasSearched(true);
  //     } else {
  //       handleSearch();
  //     }
  //   }
  // };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const combinedSuggestions = [...staticTrendingSuggestions, ...dynamicSuggestions];
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
    // <div className="w-full">
    //   <form className="w-full relative" onSubmit={(e) => {
    //     e.preventDefault();
    //     handleSearch();
    //   }}>

    //     <div>
    //       <input
    //         type="text"
    //         value={queryString}
    //         onChange={handleInputChange}
    //         onKeyDown={handleKeyDown}
    //         className="w-full px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
    //         placeholder="Search..."
    //       />
    //       <button
    //         type="button"
    //         onClick={hasSearched && queryString ? handleClear : handleSearch}
    //         className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
    //       >
    //         {hasSearched && queryString ? (
    //           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //           </svg>
    //         ) : (
    //           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    //           </svg>
    //         )}
    //       </button>
    //     </div>

    //     {suggestions.length > 0 && queryString.trim() !== '' && (
    //       <>
    //         <ul className="absolute w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto z-10 text-start">
    //           {suggestions.map((suggestion, index) => (
    //             <li
    //               key={index}
    //               className={`flex items-start px-4 py-2 hover:bg-gray-100 cursor-pointer ${selectedIndex === index ? 'bg-gray-100' : ''}`}
    //               onClick={() => {
    //                 setQuery(suggestion.title);
    //                 onSearch(suggestion.title);
    //                 setSuggestions([]);
    //                 setHasSearched(true);
    //               }}
    //             >
    //               <div className='w-16 h-16 min-w-16 mr-2'>
    //                 <img
    //                   src={suggestion.imageBase64}
    //                   alt={suggestion.title}
    //                   className="w-16 h-16 object-cover rounded"
    //                 />
    //               </div>
    //               <div>
    //                 <p className="font-medium">{suggestion.title}</p>
    //                 <p className="text-sm text-gray-600 max-h-16 overflow-hidden text-ellipsis line-clamp-1">{suggestion.description}</p>
    //               </div>
    //             </li>
    //           ))}
    //         </ul>
    //       </>
    //     )}
    //   </form>
    // </div>

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
            onChange={handleInputChange}
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
          <ul className="absolute w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto z-10 text-start">
            {[...staticTrendingSuggestions, ...dynamicSuggestions].map((suggestion, index) => (
              <li
                key={index}
                className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-black ${selectedIndex === index ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  setQuery(suggestion.title);
                  onSearch(suggestion.title);
                  setDynamicSuggestions([]);
                  setInputFocused(false);
                }}
              >
                {index < staticTrendingSuggestions.length ? (
                  <>
                    <svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className='text-black w-6 h-6 mr-2 text-red-100'>
                      <rect width="48" height="48" fill="white" fillOpacity="0.01" />
                      <path d="M40.9999 27.0007L40.9999 15.0007L29 15.0007" stroke="#8c8a89" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 37.0002L16.3385 24.5002L26.1846 30.5002L41 15.0002" stroke="#8c8a89" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p>{suggestion.title}</p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};

export default Search;