"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex-none w-full mx-auto bg-white dark:bg-gray-800">

      {/* <div className="flex justify-end items-center border-b border-gray-300 py-2 px-4 text-gray-700 text-sm select-none">
        <button className="flex items-center space-x-1 mr-6 text-indigo-600 hover:text-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 10-8 0v4a4 4 0 008 0V7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6" />
          </svg>
          <span>Career</span>
        </button>
        <div className="border-l border-gray-300 h-5 mx-2"></div>
        <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V6a2 2 0 00-2-2h-6l-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>View Demo</span>
        </button>
      </div> */}
      <div
        tabIndex={-1}
        className='z-50 flex justify-end items-centerw-full py-2.5 px-[7.125rem] bg-gray-50 dark:bg-gray-700'>
        <div className='items-center flex gap-[2.188rem]'>
          <a href="https://flowbite.com/application-ui/preview/" className='inline-flex gap-[0.625rem] items-center text-base'>
            <img
              alt="Icon User"
              src={"/assets/icons/career.svg"}
              className="w-[1.063rem] h-[1.5rem] text-blue-600 dark:text-blue-500"
            />
            Career</a>
          <div className="border-l border-gray-300 h-5"></div>
          <a href="https://flowbite.com/application-ui/preview/" className='inline-flex gap-[0.625rem] items-center text-base'>
            <img
              alt="Icon User"
              src={"/assets/icons/view-demo.svg"}
              className="w-[1.5rem] h-[1.5rem] text-blue-600 dark:text-blue-500"
            />
            View Demo
          </a>
        </div>
      </div>
      <div className="h-[7.625rem] flex items-center justify-between w-full mx-auto bg-[#2A53CC]">
        <div className="flex items-center">
          <button id="toggleSidebarMobile" aria-expanded="true" aria-controls="sidebar" className="p-2 mr-2 text-gray-500 rounded-sm cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            <svg id="toggleSidebarMobileHamburger" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
            <svg id="toggleSidebarMobileClose" className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
          <div className="flex items-center justify-between">
            <a href="/" className="flex">
              <img src="/assets/icons/logo.png" className="w-[15.813rem] ml-8" alt="WePortal Logo" />
            </a>
          </div>
          <div id="docsearch" className="hidden md:flex ml-6 xl:ml-20"></div>
        </div>
        <div className="relative h-full flex justify-between items-center pr-[7.125rem] pl-[4.563rem] px-6 w-[calc(100vw-20.063rem)] bg-white after:absolute after:top-0 after:left-0 after:bottom-0 after:w-[50px] after:bg-[#2A53CC] after:clip-path-polygon">
          <ul className="flex-row self-center flex gap-7">
            <li className="mb-3 lg:px-2 xl:px-2 lg:mb-0">
              <a href="/docs/getting-started/quickstart/" className="text-lg font-bold text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">About Us</a>
            </li>
            <li className="mb-3 lg:px-2 xl:px-2 lg:mb-0">
              <a href="/blocks/" className="text-lg font-bold text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Services</a>
            </li>
            <li className="mb-3 lg:px-2 xl:px-2 lg:mb-0">
              <a href="/figma/" className="text-lg font-bold text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Dips361</a>
            </li>
            <li className="mb-3 lg:px-2 xl:px-2 lg:mb-0">
              <a href="/icons/" className="text-lg font-bold text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Clients</a>
            </li>
            <li className="mb-3 lg:px-2 xl:px-2 lg:mb-0">
              <a href="/blog/" className="text-lg font-bold text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Insight</a>
            </li>
          </ul>
          <div className='flex justify-end h-full'>
            <div className="items-center flex">
              <div className="border-l border-gray-300 self-stretch flex items-center justify-center">
                <a href="https://flowbite.com/application-ui/preview/" className='px-4 flex items-center justify-center'>
                  <img
                    alt="Icon User"
                    src={"/assets/icons/search.svg"}
                    className="h-6 w-6"
                  />
                </a>
              </div>
              <div className="border-l border-gray-300 self-stretch flex gap-4 pl-[1.375rem] items-center justify-center">
                <a href="https://flowbite.com/application-ui/preview/" className='flex items-center justify-center'>
                  <img
                    alt="Icon User"
                    src={"/assets/icons/lang.svg"}
                    className="h-6 w-6"
                  />
                </a>
                <a href="/pro/#pricing" className="items-center border-l border-gray-300 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-normal rounded-[1.875rem] text-lg text-center py-4 px-[1.625rem] ">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
