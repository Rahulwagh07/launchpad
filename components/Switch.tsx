import React from 'react';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ id, label, ...props }) => {
  return (
    <div className="flex items-center space-x-2">
      {label && <span className="ml-2">{label}</span>}
      <input
        type="checkbox"
        id={id}
        {...props}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="flex items-center cursor-pointer"
      >
        {props.checked ? (
          <FaToggleOn className="text-blue-500 text-2xl" />
        ) : (
          <FaToggleOff className="text-gray-400 text-2xl" />
        )}
      </label>
    </div>
  );
};