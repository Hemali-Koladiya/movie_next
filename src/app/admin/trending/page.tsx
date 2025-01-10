"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import AdminLayout from '../AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TrendingItem {
    id: string;
    title: string;
    isHidden: boolean;
}

const TrendingPage = () => {
    const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Fetch trending items
    const fetchTrendingItems = async () => {
        const q = query(collection(db, 'trending'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as TrendingItem));
        setTrendingItems(items);
    };

    useEffect(() => {
        fetchTrendingItems();
    }, []);

    // Toggle hide/unhide
    const toggleHide = async (id: string, currentHidden: boolean) => {
        try {
            const docRef = doc(db, 'trending', id);
            await updateDoc(docRef, {
                isHidden: !currentHidden,
                timestamp: serverTimestamp(), // Update timestamp if needed
            });
            await fetchTrendingItems(); // Refresh the list
        } catch (error) {
            console.error('Error toggling hide state:', error);
        }
    };

    // Edit title
    const handleEdit = async (id: string) => {
        if (editingId === id) {
            const docRef = doc(db, 'trending', id);
            await updateDoc(docRef, {
                title: editTitle
            });
            setEditingId(null);
            setEditTitle('');
            await fetchTrendingItems();
        } else {
            const item = trendingItems.find(item => item.id === id);
            if (item) {
                setEditTitle(item.title);
                setEditingId(id);
            }
        }
    };

    // Add new trending item
    const addTrendingItem = async () => {
        if (trendingItems.length >= 6) {
            alert('Maximum 6 trending items allowed');
            return;
        }

        await addDoc(collection(db, 'trending'), {
            title: 'New Trending Item',
            isHidden: false,
            timestamp: serverTimestamp()
        });
        await fetchTrendingItems();
    };

    return (
        <AdminLayout>
            <ProtectedRoute>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Manage Trending Items</h1>
                        <button
                            onClick={addTrendingItem}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add New Trending
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {trendingItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                                <div className="flex-1">
                                    {editingId === item.id ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        <span>{item.title}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item.id)}
                                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                    >
                                        {editingId === item.id ? 'Save' : 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => toggleHide(item.id, item.isHidden)}
                                        className={`px-3 py-1 rounded ${item.isHidden
                                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                                            }`}
                                    >
                                        {item.isHidden ? 'Unhide' : 'Hide'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ProtectedRoute>
        </AdminLayout>
    );
};

export default TrendingPage;