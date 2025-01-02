'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '../AdminLayout';
import { Upload } from 'lucide-react';
import { CircleX } from 'lucide-react';


export default function AdminAddPage() {
  const router = useRouter();
  const [newResult, setNewResult] = useState({
    title: '',
    description: '',
    category: '',
    link: '',
    imageBase64: '',
  });
  // const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [imageName, setImageName] = useState('');

  const [file, setFile] = useState<{ name?: string; size?: string; type?: string; preview?: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 900KB)
    if (selectedFile.size > 900 * 1024) {
      setError('File size must be less than 900KB.');
      return;
    }

    // Convert image to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewResult((prev) => ({ ...prev, imageBase64: reader.result as string }));
      setFile({
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(2), // Size in KB
        type: selectedFile.type,
        preview: URL.createObjectURL(selectedFile),
      });
      setError('');
    };
    reader.readAsDataURL(selectedFile);

    // Simulate upload progress
    simulateUpload();
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200); // Simulate progress increment every 200ms
  };

  const resetFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  // const handleAdd = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');
  //   setLoading(true);

  //   try {
  //     if (!newResult.imageBase64 || !newResult.title || !newResult.description || !newResult.category) {
  //       setError('All fields marked with * are required.');
  //       setLoading(false);
  //       return;
  //     }

  //     // Store new result in Firestore
  //     await addDoc(collection(db, 'searchResults'), {
  //       ...newResult,
  //       created_at: serverTimestamp(),
  //     });

  //     // Reset form and redirect
  //     setNewResult({ title: '', description: '', category: '', link: '', imageBase64: '' });
  //     setPreviewUrl('');
  //     router.push('/admin/dashboard');
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //     setError('Failed to save data. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!newResult.imageBase64 || !newResult.title || !newResult.description || !newResult.category) {
        setError('All fields marked with * are required.');
        setLoading(false);
        return;
      }

      // Add lowercase version of the title
      const titleLowercase = newResult.title.toLowerCase();

      // Store new result in Firestore
      await addDoc(collection(db, 'searchResults'), {
        ...newResult,
        titleLowercase, // Add this line
        created_at: serverTimestamp(),
      });

      // Reset form and redirect
      setNewResult({ title: '', description: '', category: '', link: '', imageBase64: '' });
      // setPreviewUrl('');
      setFile(null);
      setUploadProgress(0);
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // Validate file size (max 900KB)
  //   if (file.size > 900 * 1024) {
  //     setError('File size must be less than 900KB.');
  //     return;
  //   }

  //   // Convert to Base64
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setNewResult((prev) => ({ ...prev, imageBase64: reader.result as string }));
  //     setPreviewUrl(URL.createObjectURL(file));
  //     setImageName(file.name);
  //   };
  //   reader.readAsDataURL(file);
  //   setError('');
  // };

  return (
    <AdminLayout>
      <Suspense>
        <div className="text-black p-8 max-w-[600px] m-auto bg-[#E0E0E0BF] rounded-3xl mt-5">
          <h1 className="font-bold mb-4 text-xl text-center">Create New Media</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="p-4 border rounded-lg">
            <div className="grid gap-2.5">
              <div className="flex justify-between items-center">
                <label htmlFor="title" className="text-base font-bold">Title Name</label>
                <input
                  id="title"
                  type="text"
                  value={newResult.title}
                  onChange={(e) => setNewResult((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Title"
                  required
                  className="px-3 py-2 bg-[#D9D9D9] rounded-[10px] w-2/3 text-sm font-normal focus:outline-none"
                />
              </div>

              <div className="flex justify-between">
                <label htmlFor="description" className="text-base font-bold">Description</label>
                <textarea
                  id="description"
                  rows={5}
                  value={newResult.description}
                  onChange={(e) => setNewResult((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  required
                  className="px-3 py-2 bg-[#D9D9D9] rounded-[10px] w-2/3 text-sm font-normal focus:outline-none"
                />
              </div>

              <div className="flex justify-between">
                <label htmlFor="category" className="text-base font-bold">Category</label>
                <select
                  id="category"
                  value={newResult.category}
                  onChange={(e) => setNewResult((prev) => ({ ...prev, category: e.target.value }))}
                  required
                  className="px-3 py-2 bg-[#D9D9D9] rounded-[10px] w-2/3 text-sm font-normal focus:outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="movie">Movie</option>
                  <option value="short">Short</option>
                  <option value="other">Other Video</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <label htmlFor="link" className="text-base font-bold">Link</label>
                <input
                  id="link"
                  type="url"
                  value={newResult.link}
                  onChange={(e) => setNewResult((prev) => ({ ...prev, link: e.target.value }))}
                  placeholder="Link"
                  autoComplete='off'
                  className="px-3 py-2 bg-[#D9D9D9] rounded-[10px] w-2/3 text-sm font-normal focus:outline-none"
                />
              </div>

              {/* <div className="border-2 border-dotted border-gray-500 rounded-lg bg-white">
              <div className='flex justify-center items-center min-h-40'>
                <label
                  htmlFor="file-upload"
                  className="flex  items-center justify-center cursor-pointer text-black gap-2"
                >
                  <Upload size={24} className="mb-2 text-black" />
                  <span className="text-sm font-medium ">Media upload</span>
                  <input
                    id='file-upload'
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="hidden"
                  />

                </label>
              </div>
              <label className="block mb-2">Image (Max size: 900KB)</label>

              {previewUrl && (
                // <div className="mt-[-50px] flex flex-col justify-center mb-5">
                //   <p className="mb-2 text-sm text-gray-600">Preview:</p>
                //   <img src={previewUrl} alt="Preview" className="max-w-xs h-auto rounded shadow mx-auto" />
                // </div>
                <p className='mt-[-50px] flex items-center justify-center mb-5 gap-2 px-8'>
                 <span className='font-bold min-w-max'>Uploaded Image: </span> <span>{imageName}</span>
                </p>
              )}
            </div> */}

              <div className="border-2 border-dotted border-gray-500 rounded-lg bg-white p-4">
                <div className="flex justify-center items-center min-h-40">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer text-black gap-2"
                  >
                    <Upload size={36} className="mb-2 text-black" />
                    <span className="text-sm font-medium">
                      Choose a file  here
                    </span>
                    <span className="text-xs text-gray-400">
                      JPEG, PNG,  up to 900KB
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                    />
                  </label>
                </div>

                {file && (
                  <div className='border border-gray-200 rounded-lg p-3 bg-[#EEF1F7]'>
                    <div className="flex items-center gap-4">
                      {/* File Preview */}
                      {file.type && file.type.startsWith("image/") ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-lg">
                          <span className="text-red-500 font-bold text-sm">PDF</span>
                        </div>
                      )}

                      {/* File Details */}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size} KB</p>
                      </div>



                      {/* Cancel Button */}
                      <button onClick={resetFile} className="text-gray-500 hover:text-red-500 self-start">
                        <CircleX size={22} />
                      </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-7 py-1 ${loading ? 'bg-gray-400' : 'bg-[#787878] hover:bg-[#666666]'} text-white rounded-full`}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="px-7 py-1 bg-[#BB0000] hover:bg-[#a80303] text-white rounded-full"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </Suspense>
    </AdminLayout>
  );
}
