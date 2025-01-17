'use client';

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { ReactNode, Suspense, useState } from "react";
import logo from "../../../public/logo.png"
import Image from "next/image";
import Images from "../../../public/iconComponent/Image";
import Camera from "../../../public/iconComponent/Camera";
import Short from "../../../public/iconComponent/Short";
import Movies from "../../../public/iconComponent/Movie";
import User from "../../../public/iconComponent/User";
import { useRouter, useSearchParams } from 'next/navigation';

const NavigationContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    // const [isTrendingOpen, setIsTrendingOpen] = useState(false);

    const handleCategoryClick = (category: string) => {
        const currentSearch = searchParams.get('search') || '';
        const params = new URLSearchParams();

        if (currentSearch) {
            params.set('search', currentSearch);
        }
        params.set('category', category);

        router.push(`/admin/dashboard?${params.toString()}`);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="space-y-2">
            <div className="relative">
                <button
                    onClick={toggleDropdown}
                    className={`w-full flex justify-between items-center space-x-3 p-3 rounded-lg bg-[#BABABABB] hover:bg-[#a3a3a3] text-black`}
                >
                    <div className="flex gap-3 items-center">
                        <Images />
                        <span className="text-base font-bold">Media Hub</span>
                    </div>
                    <ChevronDown
                        size={20}
                        className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                {isOpen && (
                    <div className="absolute top-11 left-0 mt-2 w-full z-10 ps-8 bg-[#BABABA] rounded-lg">
                        <button
                            onClick={() => handleCategoryClick('Movie')}
                            className="w-full text-left px-4 py-2 text-black text-base font-normal hover:bg-[#BABABABB] rounded-lg"
                        >
                            <div className="flex gap-3">
                                <Camera />
                                <span>Movie</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleCategoryClick('Short')}
                            className="w-full text-left px-4 py-2 text-black text-base font-normal hover:bg-[#BABABABB] rounded-lg"
                        >
                            <div className="flex gap-3">
                                <Short />
                                <span>Short</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleCategoryClick('Other')}
                            className="w-full text-left px-4 py-2 text-black text-base font-normal hover:bg-[#BABABABB] rounded-lg"
                        >
                            <div className="flex gap-3">
                                <Movies />
                                <span>Other Video</span>
                            </div>
                        </button>
                    </div>
                )}
            </div>
            <div className="relative mt-2">
                <button
                    onClick={() => router.push('/admin/trending')}
                    className="w-full flex justify-between items-center space-x-3 p-3 rounded-lg bg-[#BABABABB] hover:bg-[#a3a3a3] text-black"
                >
                    <div className="flex gap-3 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M23 6l-9.5 9.5-5-5L1 18" />
                            <path d="M17 6h6v6" />
                        </svg>
                        <span className="text-base font-bold">Trending</span>
                    </div>
                </button>
            </div>
        </nav>
    );
};

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem('UserId'); // Clear user email
        router.push('/admin/Login'); // Redirect to login page
    };

    return (
        <div className="flex h-screen bg-white">
            <div className="w-64 bg-[#DBDBDBDD] text-white rounded-r-3xl py-5 flex flex-col justify-between">
                <div className="p-4">
                    <div className="flex items-center justify-center mb-8">
                        <Link href="/" className="lg:w-44 w-36">
                            <Image src={logo} alt="logo" />
                        </Link>
                    </div>
                    <Suspense fallback={<div>Loading navigation...</div>}>
                        <NavigationContent />
                    </Suspense>
                </div>
                <div className="p-4 pb-0">
                    <div className=" bg-[#C4C4C4] rounded-lg p-2 py-3">
                        <div className="flex items-center gap-2">
                            <div className="w-14 h-14 bg-[#D9D9D9] rounded-full flex justify-center items-center">
                                <User />
                            </div>
                            <div className="text-black">
                                <h5 className="text-base leading-[18px] font-extrabold">
                                    IT code
                                </h5>
                                <p className="text-base leading-[24px] font-normal">
                                    Itcodeinfotech@
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="text-white sticky top-0 w-full bg-white z-50">
                    <div className="flex justify-between items-center px-6 py-4 pt-8">
                        <h1 className="text-6xl font-semibold text-black">Media hub</h1>
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/admin/add"
                                className="flex text-base items-center space-x-2 bg-[#787878] text-white px-4 py-2 rounded-lg hover:bg-[#666666] font-bold"
                            >
                                <Plus size={20} />
                                <span>Add Media</span>
                            </Link>
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}

export default AdminLayout;