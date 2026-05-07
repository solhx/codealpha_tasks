//frontend/src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar     from './Navbar';
import Sidebar    from './Sidebar';
import RightPanel from './RightPanel';
import MobileNav  from './MobileNav';

const Layout = () => (
  <>
    <Navbar />
    <div
      style={{
        display:    'flex',
        minHeight:  '100vh',
        paddingTop: 'var(--navbar-height)',
        background: 'var(--bg-secondary)',
        transition: 'background 0.3s',
        /* ✅ FIX: Must NOT be overflow:hidden — dropdown must escape */
        overflow:   'visible',
      }}
    >
      <Sidebar />

      <main
        className="centre-main"
        style={{
          flex:        1,
          marginLeft:  'var(--sidebar-width)',
          marginRight: 'var(--right-panel-width)',
          padding:     '1.5rem',
          minHeight:   'calc(100vh - var(--navbar-height))',
          boxSizing:   'border-box',
          transition:  'margin 0.3s',
          /* ✅ FIX: This is the REAL culprit — main was creating a 
             clipping context that swallowed the popup menu.
             overflow must be visible so absolutely positioned 
             children (the popup) can render outside their parent bounds */
          overflow:    'visible',
        }}
      >
        <Outlet />
      </main>

      <RightPanel />
    </div>
    <MobileNav />
  </>
);

export default Layout;