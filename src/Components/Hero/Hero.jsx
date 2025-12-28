import React from 'react'
import logo from "../../assets/icons/logo2.png"

const navLinkClass = "relative text-[var(--gray)] transition-colors duartion-300 ease-out hover:text-[var(--purple)]";

function Hero() {
  return (
    <div >
        <header className='w-full bg-[var(--cream)]'>

            <div className="max-w-[1440px] mx-auto px-6 py-7 flex items-center justify-between">

                <a href="/" className='logo'>
                    <img src={logo} alt="TearSwipe logo" className="h-10 w-auto" />

                </a>

        
                <nav className='className="hidden md:flex gap-8 text-sm"'>
                    <a href="/about" className={navLinkClass}>About Us</a>                   
                    <a href="/features" className={navLinkClass}>Features</a>
                    <a href="/features" className={navLinkClass}>Features</a>
                    <a href="/features" className={navLinkClass}>Features</a>                   
                    <a href="/testimonials" className={navLinkClass}>Testimonials</a>

                </nav>
            </div>

        </header>
    </div>
  )
}

export default Hero
