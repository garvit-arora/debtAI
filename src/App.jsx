import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Intro from './components/Intro';
import WhyCryptix from './components/WhyCryptix';
import AllCryptos from './components/AllCryptos';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div
      id="main"
      data-app-hydrate-v2='{"routeId":"augiA20Il","localeId":"default","breakpoints":[{"hash":"72rtr7","mediaQuery":"(min-width: 1200px)"},{"hash":"1xn60wy","mediaQuery":"(min-width: 810px) and (max-width: 1199.98px)"},{"hash":"1atwl3l","mediaQuery":"(max-width: 809.98px)"},{"hash":"1v8948n","mediaQuery":"(min-width: 1200px)"},{"hash":"1l1lbps","mediaQuery":"(min-width: 810px) and (max-width: 1199.98px)"},{"hash":"wcqt3f","mediaQuery":"(max-width: 809.98px)"}]}'
      data-app-ssr-released-at="2025-12-19T16:35:14.703Z"
      data-app-page-optimized-at="2025-12-20T19:22:35.756Z"
      data-app-generated-page="true"
    >
      <div className="app-F2weD app-1v8948n" data-layout-template="true" style={{ minHeight: '100vh', width: 'auto' }}>
      <Navigation />
      <div 
          data-app-root
          className="app-hHESZ app-bvWHt app-7CG6N app-TN3Xf app-MNF3p app-hqYnS app-PBwPv app-oDok0 app-72rtr7"
          style={{ minHeight: '100vh', width: 'auto', display: 'contents' }}
        >
        
        <Hero />
        <Intro />
        <WhyCryptix />
        <AllCryptos />
        <HowItWorks />
        
        <Testimonials />
        <FAQ />
        
        <Footer />
      </div>
    </div>
    </div>
  );
}

export default App;
