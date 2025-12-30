import React from "react";
import {
  BsArrowRight,
  BsArrowUpRight,
  BsShieldCheck,
  BsGraphUp,
  BsPeople,
  BsInstagram,
  BsLinkedin,
  BsTwitter,
} from "react-icons/bs";
import logo from "../../assets/icons/logo2.png";
import background from "../../assets/images/image1.png";
import background2 from "../../assets/images/bg2.png";
import founder1 from "../../assets/images/Founder1.jpg";
import founder2 from "../../assets/images/Founder2.jpg";
import { useEffect, useRef } from "react";
import DomeGallery from "../ui/DomeGallery";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);
// const handleSubmit =()=>{
//   const navigate = Navigate()
//   const handleSubmit =()=>{
//           navigate("/login")
//       }
// }

const navLinkClass =
  "relative text-l font-semibold text-(--brown) transition-colors duration-300 ease-out hover:text-(--purple) drop-shadow-[0px_1px_0.5px_rgba(255,255,255,0.7)]";
const footerNavLinkClass =
  "hover:text-(--purple) transition-colors duration-300 ease-out";

function Hero() {
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const expandedRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const footerTriggerRef = useRef(null);
  const footerRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Navbar Expansion Logic
      const expanded = expandedRef.current;
      const header = headerRef.current;

      gsap.set(expanded, {
        width: 0,
        opacity: 0,
        paddingLeft: 0,
        overflow: "hidden",
        display: "none",
      });
      
      const onEnter = () => {
        gsap.set(expanded, { display: "flex" });

        gsap.to(expanded, {
          width: "auto",
          paddingLeft: 16,
          opacity: 1,
          //   display: "flex",
          duration: 0.6,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const onLeave = () => {
        gsap.to(expanded, {
          width: 0,
          paddingLeft: 0,
          opacity: 0,
          //   display: "none",
          duration: 0.9,
          ease: "power3.in",
          overwrite: true,
          onComplete: () => {
            gsap.set(expanded, { display: "none" });
          },
        });
      };

      header.addEventListener("mouseenter", onEnter);
      header.addEventListener("mouseleave", onLeave);

      // 2. Hero Section Entrance (Staggered Text)
      const tl = gsap.timeline();
      tl.from(".hero-element", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      // 3. Features Staggered Scroll Animation
      gsap.fromTo(
        ".feature-card",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 75%",
            // toggleActions ensures it replays or stays visible
            toggleActions: "play none none reverse",
          },
        }
      );

      // 4. Parallax effect for Headings
      gsap.utils.toArray(".section-heading").forEach((heading) => {
        gsap.from(heading, {
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
          },
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        });
      });

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

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);

      // Add Lenis to GSAP's animation loop
      const tickerFunction = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerFunction);

      // Disable lag smoothing for smoother scroll feels
      gsap.ticker.lagSmoothing(0);

      // Cleanup event listeners
      return () => {
        header.removeEventListener("mouseenter", onEnter);
        header.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      ctx.revert();
      lenis.destroy(); // Kills smooth scroll
      gsap.ticker.remove(tickerFunction);
    }; // Clean up GSAP context on unmount
  }, []);

 
  return (
    <div className="bg-(--mint) selection:bg-blue-200 selection:text-black">
      <header className="fixed top-0 left-2 w-full z-50">
        <div
          ref={headerRef}
          className="max-w-360 mx-auto px-12 py-7 flex items-center justify-between"
        >
          <div>
            <a
              href="/"
              className="px-5 py-2 rounded-full border border-white/20 shadow-md shadow-stone-200/50 backdrop-blur-lg bg-black/15 text-xl tracking-wide font-semibold text-(--brown) drop-shadow-[0px_1px_0.5px_rgba(255,255,255,0.7)] transition-all duration-300"
            >
              DebtAI
            </a>
          </div>

          <nav
            ref={navRef}
            className="px-5 py-2 width-full rounded-full flex justify-center items-center gap-6 text-sm text-(--gray) border border-white/20 shadow-md shadow-stone-200/50 backdrop-blur-lg  bg-black/15 whitespace-nowrap"
          >
            <div className="wrapped">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 "
              >
                <img src={logo} alt="DebtAI logo" className="h-10 w-auto" />
              </a>
            </div>

            <div
              ref={expandedRef}
              className="expanded flex justify-center items-center gap-6 tracking-wide"
            >
              <a href="/about" className={navLinkClass}>
                About Us
              </a>
              <a href="#features" className={navLinkClass}>
                Features
              </a>
              <a href="#founders" className={navLinkClass}>
                Founders
              </a>
              <a href="#testimonials" className={navLinkClass}>
                Testimonials
              </a>
              <a
                href="/login"
                className="relative text-l font-semibold px-4 py-1.5 rounded-full bg-(--brown) text-(--teal) hover:text-(--brown)  hover:bg-(--light-purple) transition-colors"
              >
                Login
              </a>
            </div>
          </nav>
        </div>
      </header>

      <section
        ref={heroRef}
        className="relative  min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${background2})` }}
      >
        <div className="absolute inset-0 bg-white/30"></div>

        <h1 className="hero-element text-6xl md:text-8xl font-bold tracking-tighter text-orange-950 leading-[1.1]">
          AI that explains <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-500">
            your finances,
          </span>{" "}
          <span className="italic font-serif font-light text-stone-600">
            not advises them.
          </span>
        </h1>

        <p className="hero-element text-xl text-stone-700 max-w-2xl mx-auto leading-relaxed">
          Navigate debt and expenses with empathy. No complex charts, no
          judgment—just clear, human-readable insights to help you breathe
          easier.
        </p>

        <div className="hero-element flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button type="button"
          className="px-8 py-4 cursor-pointer rounded-full bg-orange-950 text-(--teal) text-lg font-medium hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2 group" onClick={() => navigate('/login')}>
           Start your journey
            <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-8 py-4 rounded-full bg-gray-100 text-stone-700 border border-stone-300 text-lg font-medium hover:bg-(--teal) hover:border-stone-500 cursor-pointer transition-all duration-300">
            Contact Us
          </button>
        </div>
      </section>

      <section
        id="features"
        ref={featuresRef}
        className=" relative py-32 bg-(--teal)"
      >
        <div className="max-w-7xl  mx-auto px-6">
          <div className="text-center mb-24 max-w-4xl mx-auto section-heading">
            <h2 className="text-4xl md:text-5xl font-bold text-(--brown) mb-6 tracking-tight">
              Features designed for <br />{" "}
              <span className="text-emerald-700">clarity, calm, and trust</span>
            </h2>
            <p className="text-lg text-stone-800">
              We stripped away the noise of traditional finance apps to focus on
              what matters: your peace of mind.
            </p>
          </div>

          {/* FEATURES GRID */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card Component */}
            <FeatureCard
              icon={<BsGraphUp className="text-2xl" />}
              title="AI-Powered Awareness"
              tag="Insight"
              desc="Translates complex financial patterns into simple, human sentences. We explain what's happening without pushing products."
            />
            <FeatureCard
              icon={<BsShieldCheck className="text-2xl" />}
              title="Privacy-First Design"
              tag="Security"
              desc="Your data is yours. We use minimal data points to generate insights and never sell your history to advertisers."
            />
            <FeatureCard
              icon={<BsPeople className="text-2xl" />}
              title="Habit-First Guidance"
              tag="Behavior"
              desc="Focus on small, consistent actions tailored to your behavior, rather than drastic, unsustainable budget cuts."
            />
            <FeatureCard
              icon={<BsPeople className="text-2xl" />}
              title="Financial Health Snapshot"
              tag="Overview"
              desc="A calm view of spending patterns and stress indicators. Understand where you stand without the red-alert anxiety."
            />
            <FeatureCard
              icon={<BsPeople className="text-2xl" />}
              title="Non-Intrusive Reminders"
              tag="Support"
              desc="Subtle nudges help you stay engaged without guilt, alarm, or emotional overload. Support without the pressure."
            />
            <FeatureCard
              icon={<BsPeople className="text-2xl" />}
              title="Education-Led Clarity"
              tag="Learning"
              desc="Understand the 'why' behind money concepts. We help you learn the trade-offs so your decisions feel truly informed."
            />
          </div>
        </div>
      </section>

      <section id="founders" className="pb-22 bg-(--teal)">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 section-heading">
            <h2 className="text-5xl font-bold text-(--brown)">
              Built by humans, <br /> for humans.
            </h2>
            <a
              href="/team"
              className="text-emerald-800 font-medium hover:underline mt-4 md:mt-0"
            >
              Read our story &rarr;
            </a>
          </div>

          <div className="grid md:grid-cols-2  gap-8">
            <FounderCard
              name="Garvit Arora"
              role="Founder & CEO"
              imgSrc={founder1}
            />

            <FounderCard
              name="Pallavi Jain"
              role="Founder & CTO"
              imgSrc={founder2}
            />
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-950 text-(--light-purple) overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center mb-12 section-heading">
          <h2 id="testimonials" className="text-5xl font-semibold bg-clip-text text-(--light-purple) mb-6">
            What People Say
          </h2>
          <p className="text-stone-300">
            Join thousands who have found clarity with DebtAI.
          </p>
        </div>

        <div style={{ width: "100vw", height: "95vh" }}>
          <DomeGallery />
        </div>
      </section>

      {/* --- FOOTER --- */}

      <div
        ref={footerTriggerRef}
        className="h-[120vh] w-full bg-transparent pointer-events-none relative z-0"
      ></div>

      {/* --- 2. THE MODERN IMMERSIVE FOOTER --- */}
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
  );
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

const FeatureCard = ({ title, desc, tag, icon }) => (
  <div className="feature-card group p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300">
    <div className="flex justify-between items-start ">
      <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-700 transform transition-transform duration-300 origin-center group-hover:scale-110">
        {icon || <div className="w-6 h-6 bg-emerald-100 rounded-full"></div>}
      </div>
      <span className="text-xs font-bold tracking-wider text-stone-400 uppercase bg-white px-2 py-1 rounded-md border border-stone-100">
        {tag}
      </span>
    </div>
    <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-emerald-800 transition-colors">
      {title}
    </h3>
    <p className="text-stone-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const FounderCard = ({ name, role, color, imgSrc }) => (
  <a
    href="/team"
    className="group relative overflow-hidden rounded-3xl aspect-[4/3] flex items-end p-8 transition-all hover:shadow-2xl"
  >
    <img
      src={imgSrc}
      alt={name}
      className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
    />

    <div
      className={`absolute inset-0 ${color} transition-transform duration-700 group-hover:scale-105`}
    ></div>

    <div className="relative z-10 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
      <h3 className="text-2xl font-bold">{name}</h3>
      <p className="text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {role}
      </p>
    </div>
  </a>
);

export default Hero;
