import React from 'react';
import '../../assets/css/style.css';

const NavBar = () => (
    <nav className="nav">
        <div className="nav-content">
            <h1>BW Cable Audit System</h1>
            <input type="search" placeholder="Search MO Number..." className="search-box" />
        </div>
    </nav>
);

export default NavBar;