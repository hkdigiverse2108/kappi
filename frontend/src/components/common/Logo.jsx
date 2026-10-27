import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

/**
 * KAPEE Enterprise Logo
 * On dark backgrounds (like emerald deep), wraps the logo inside a white rounded badge
 * so it stays 100% visible and untouched as per brand guidelines.
 */
export const Logo = ({
  className = 'h-10 w-auto',
  isDarkBackground = false,
  withLink = true,
  badgeClassName = 'p-1.5 bg-white rounded-xl shadow-sm inline-flex items-center justify-center'
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02] ${isDarkBackground ? badgeClassName : ''}`}>
      <img
        src={logoImg}
        alt="KAPEE Enterprise - Cleaner Solutions, Brighter Living"
        className={`${className} object-contain`}
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" aria-label="KAPEE Enterprise Home" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg inline-block">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
