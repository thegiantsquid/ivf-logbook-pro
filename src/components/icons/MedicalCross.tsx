
import React from 'react';
import { LucideProps } from 'lucide-react';

const MedicalCross: React.FC<LucideProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 2,
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 4h8v16H8z" />
      <path d="M4 8h16v8H4z" />
    </svg>
  );
};

export default MedicalCross;
