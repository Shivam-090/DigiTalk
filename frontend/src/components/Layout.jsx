import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = ({children,showSidebar=false}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <div className='min-h-screen'>
        <div className='flex'>
            {showSidebar && (
              <Sidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
              />
            )}

            <div className='flex-1 flex flex-col'>
                <Navbar
                  showSidebarToggle={showSidebar}
                  onSidebarToggle={() => setMobileSidebarOpen((open) => !open)}
                />

                <main className='flex-1 overflow-y-auto'>
                    {children}
                </main>
            </div>

        </div>
      
    </div>
  )
}

export default Layout
