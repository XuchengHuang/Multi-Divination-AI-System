
import React from 'react';

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const UserGroupIcon: React.FC<SVGProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-7.772-4.322A12.005 12.005 0 0112 6.75c2.17 0 4.207.576 5.963 1.584A6.062 6.062 0 0118 12.72v6z" />
  </svg>
);
