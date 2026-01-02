import React from 'react'
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BsArrowRight,
  BsArrowUpRight,
  BsInstagram,
  BsLinkedin,
  BsTwitter,
} from "react-icons/bs";
import logo from '../../assets/icons/logo.jpeg';

gsap.registerPlugin(ScrollTrigger);

const footerNavLinkClass =
  "hover:text-(--purple) transition-colors duration-300 ease-out";

const Footer = () => {
    const footerTriggerRef = useRef(null);
    const footerRef = useRef(null);

    // const footerTl = gsap.timeline({
    //     scrollTrigger: {
    //       trigger: footerTriggerRef.current, // The spacer at the bottom
    //       start: "top bottom", // When top of spacer hits bottom of viewport
    //       end: "bottom bottom", // When bottom of spacer hits bottom of viewport
    //       scrub: 1, // Smooth scrubbing linked to scrollbar
    //     },
    //   });

    useEffect(() => {
    let ctx = gsap.context(() => {
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: footerTriggerRef.current, // The spacer at the bottom
          start: "top bottom", // When top of spacer hits bottom of viewport
          end: "bottom bottom", // When bottom of spacer hits bottom of viewport
          scrub: 1, // Smooth scrubbing linked to scrollbar
        },
      });

      footerTl.fromTo(
        footerRef.current,
        {
          yPercent: 100, // Start completely off-screen (down)
          backgroundColor: "rgba(28, 25, 23, 0)", // Transparent
          backdropFilter: "blur(0px)",
        },
        {
          yPercent: 0, // End filling the screen
          backgroundColor: "rgba(28, 25, 23, 0.9)", // Dark background
          backdropFilter: "blur(16px)", // Heavy blur
          ease: "none",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>

       <div
        ref={footerTriggerRef}
        className="h-[120vh] w-full bg-transparent pointer-events-none relative z-0"
      ></div>

       <footer
              ref={footerRef}
              className="fixed bottom-0 left-0 w-full h-screen z-50 flex items-center justify-center text-stone-200 overflow-hidden"
              style={{ willChange: "transform, backdrop-filter" }}
            >
              <div className="w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-12 md:py-20">
                {/* Top Section: CTA & Nav */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-10">
                  <div className="md:col-span-7 space-y-8 footer-content">
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-(--mint)">
                      Ready to <br />
                      <span className="text-emerald-500">breathe easy?</span>
                    </h2>
                    <p className="text-xl text-stone-300 max-w-lg leading-relaxed">
                      Join the financial revolution that prioritizes your peace of
                      mind over profit. No judgment, just clarity.
                    </p>
                    <div className="flex gap-4 pt-4">
                      <button className="px-8 py-4 mb-2 rounded-full bg-white text-orange-950 text-lg font-bold hover:bg-emerald-300 transition-colors flex items-center gap-2">
                        Get Started Free <BsArrowRight />
                      </button>
                    </div>
                  </div>
      
                  {/* Links Grid */}
                  <div className="md:col-span-5 grid grid-cols-2 gap-8 pt-4">
                    <div className="footer-content">
                      <h4 className="text-emerald-500 font-mono font-semibold text-l uppercase tracking-widest mb-6">
                        Platform
                      </h4>
                      <ul className="space-y-4 text-lg font-medium text-stone-400">
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors flex items-center gap-2 group"
                          >
                            Features{" "}
                            <BsArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            Pricing
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            Testimonials
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            API
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="footer-content">
                      <h4 className="text-emerald-500 font-mono font-semibold text-l uppercase tracking-widest mb-6">
                        Company
                      </h4>
                      <ul className="space-y-4 text-lg font-medium text-stone-400">
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            About Us
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            Careers
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            Privacy Policy
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="hover:text-(--mint) transition-colors"
                          >
                            Terms of Service
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
      
                {/* Bottom Section: Socials & Copyright */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-6 footer-content">
                  <div className="flex items-center gap-2">
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-8 w-auto brightness-0 invert opacity-80"
                    />
                    <span className="text-2xl font-bold text-white tracking-tight">
                      DebtAI
                    </span>
                  </div>
      
                  <div className="text-sm text-stone-500">
                    © {new Date().getFullYear()} DebtAI Inc. All rights reserved.
                  </div>
      
                  <div className="flex gap-6">
                    <SocialLink icon={<BsTwitter />} href="#" />
                    <SocialLink icon={<BsLinkedin />} href="#" />
                    <SocialLink icon={<BsInstagram />} href="#" />
                  </div>
                </div>
              </div>
        </footer>
    </div>
  )
}

// Helper Component for Social Icons
const SocialLink = ({ icon, href }) => (
  <a
    href={href}
    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-stone-900 transition-all duration-300 hover:scale-110"
  >
    {icon}
  </a>
);


export default Footer
