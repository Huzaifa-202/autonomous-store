import { Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'

const navigation = [
  { id: 1, title: 'Home', url: '#hero' },
  { id: 2, title: 'Features', url: '#features' },
  { id: 3, title: 'Products', url: '#products' },
  { id: 4, title: 'About', url: '#about' },
  { id: 5, title: 'Contact', url: '#contact' },
]

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { hash } = useLocation()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    document.body.style.overflow = isOpen ? 'unset' : 'hidden'
  }

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-n-8/90 backdrop-blur-md border-b border-n-6'>
      <div className='max-w-7xl mx-auto px-5 lg:px-7.5 xl:px-10'>
        <div className='flex items-center h-20'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <a href='#hero' className='block w-[12rem] xl:mr-8'>
              <div className='flex items-center'>
                <img
                  src='../../src/assets/auto-logo.png'
                  alt='Logo'
                  className='ml-3 p-2'
                  width={125}
                  height={40}
                />
                {/* <span className='text-sm font-code text-n-1 ml-3'>
                  Autonomous Store
                </span> */}
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex mx-auto'>
            <div className='flex items-center space-x-2'>
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  className={`relative font-code text-lg uppercase transition-colors px-12 py-2 ${
                    hash === item.url
                      ? 'text-n-1'
                      : 'text-n-1/50 hover:text-n-1'
                  }`}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Sign In Button - Desktop */}
          <div className='hidden lg:flex'>
            <a
              href='/login'
              className='font-code text-lg uppercase border border-n-1/5 rounded-xl py-2 px-4 hover:bg-n-1/5 transition-colors duration-200'
            >
              Sign in
            </a>
          </div>

          {/* Mobile menu button */}
          <button onClick={toggleMenu} className='lg:hidden ml-auto px-3'>
            {isOpen ? (
              <X className='w-6 h-6 text-n-1' />
            ) : (
              <Menu className='w-6 h-6 text-n-1' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-0 z-40 w-full bg-n-8 transform transition-transform duration-300 ease-in-out lg:hidden`}
        style={{ top: '80px' }}
      >
        <div className='flex flex-col items-center justify-center py-8'>
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.url}
              onClick={toggleMenu}
              className={`block relative font-code text-2xl uppercase transition-colors px-6 py-6 md:py-8 ${
                hash === item.url ? 'text-n-1' : 'text-n-1/50 hover:text-n-1'
              }`}
            >
              {item.title}
            </a>
          ))}
          <a
            href='/login'
            className='mt-8 font-code text-lg uppercase border border-n-1/5 rounded-xl py-2 px-4 hover:bg-n-1/5 transition-colors duration-200'
          >
            Sign in
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
