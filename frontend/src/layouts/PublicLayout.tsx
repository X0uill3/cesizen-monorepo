import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-zen-cream">
            <Sidebar />
            <main className="flex-1 ml-64 p-10">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default PublicLayout;
