import React, { useState, useEffect, useRef } from 'react';
import { PromptTemplate, promptTemplates } from '../promptLibrary';
import { PromptLibraryIcon } from './icons';

interface PromptLibraryProps {
    onSelectTemplate: (template: PromptTemplate) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelectTemplate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleSelect = (template: PromptTemplate) => {
        onSelectTemplate(template);
        setIsOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={panelRef} className="fixed top-6 right-6 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-brand-secondary p-3 rounded-full text-white shadow-lg hover:scale-110 transform transition-transform duration-200"
                aria-label="Open prompt library"
            >
                <PromptLibraryIcon />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-base-200 border border-base-300 rounded-xl shadow-2xl animate-fade-in">
                    <div className="p-4 border-b border-base-300">
                        <h3 className="font-bold text-text-primary text-lg">Prompt Library</h3>
                        <p className="text-sm text-content">Select a template to get started.</p>
                    </div>
                    <ul className="max-h-96 overflow-y-auto p-2">
                        {promptTemplates.map((template) => (
                            <li key={template.name}>
                                <button
                                    onClick={() => handleSelect(template)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-base-100 transition-colors"
                                >
                                    <p className="font-semibold text-text-primary">{template.name}</p>
                                    <p className="text-xs text-content">{template.description}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};