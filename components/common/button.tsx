import React, { ReactNode } from "react";
import Link from "next/link";
import { Button } from "../ui/button";  
 
interface ButtonProps {
  href: string;            
  icon?: ReactNode;         
  className?: string;        
  text: string;      
}

const MainButton: React.FC<ButtonProps> = ({
  href,
  icon,
  className = "",  
  text,
}) => {
  return (
    <Link href={href}>
      <Button
        className={`flex items-center gap-2 bg-cyan-500 text-white hover:bg-cyan-600 ${className}`}
      >
        {icon && <span className="h-4 w-4">{icon}</span>}
        {text}
      </Button>
    </Link>
  );
};

export default MainButton;
