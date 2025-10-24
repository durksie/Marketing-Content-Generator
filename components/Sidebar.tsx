
import React from 'react';
import { ContentType } from '../types';
import { CONTENT_TYPE_OPTIONS, CONTENT_TYPE_INFO } from '../constants';

interface SidebarProps {
  selectedType: ContentType;
  setSelectedType: (type: ContentType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedType, setSelectedType }) => {
  return (
    <aside className="w-64 bg-base-200 p-4 space-y-2 flex-shrink-0 border-r border-base-300">
      <h1 className="text-2xl font-bold text-text-primary mb-6">MktngGen.AI</h1>
      <nav>
        <ul>
          {CONTENT_TYPE_OPTIONS.map((type) => (
            <li key={type}>
              <button
                onClick={() => setSelectedType(type)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors duration-200 ${
                  selectedType === type
                    ? 'bg-brand-primary text-white shadow-lg'
                    : 'text-content hover:bg-base-100 hover:text-brand-primary'
                }`}
              >
                {CONTENT_TYPE_INFO[type].icon}
                <span>{type}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};