import React from 'react';
import Sidebar from '../components/layout/Sidebar'; // On importe la Sidebar

interface WebLayoutProps {
    children: React.ReactNode;
}

const WebLayout: React.FC<WebLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-zen-cream">
            <Sidebar />

            <main className="flex-1 ml-64 p-10">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default WebLayout;