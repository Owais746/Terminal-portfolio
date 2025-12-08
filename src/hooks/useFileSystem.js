import { useState, useCallback } from 'react';
import { personalInfo, about, skills, projects, experience, services, stats } from '../data/portfolioData';

// Initial File System Structure
const initialFileSystem = {
    name: 'root',
    type: 'directory',
    children: {
        home: {
            type: 'directory',
            children: {
                owais: {
                    type: 'directory',
                    children: {
                        'about.txt': { type: 'file', content: about.description.join('\n\n') },
                        'skills.json': { type: 'file', content: JSON.stringify(skills, null, 2) },
                        'projects.db': { type: 'file', content: JSON.stringify(projects, null, 2) },
                        'experience.log': { type: 'file', content: JSON.stringify(experience, null, 2) },
                        'contact.info': { type: 'file', content: `Email: ${personalInfo.email}\nPhone: ${personalInfo.phone}\nGitHub: ${personalInfo.github}` },
                        'README.md': { type: 'file', content: '# Welcome to my portfolio!\nType `help` to get started.' },
                    }
                }
            }
        }
    }
};

export const useFileSystem = () => {
    const [currentPath, setCurrentPath] = useState(['home', 'owais']);
    const [fileSystem, setFileSystem] = useState(initialFileSystem);

    // Helper to get node at current path
    const getNodeAtPath = useCallback((pathArray, fs = fileSystem) => {
        let current = fs;
        // Skip 'root' if it's implicitly the start, but our structure starts inside root's children
        // The pathArray ['home', 'visitor'] starts looking at initialFileSystem.children

        for (const segment of pathArray) {
            if (current.children && current.children[segment]) {
                current = current.children[segment];
            } else {
                return null;
            }
        }
        return current;
    }, [fileSystem]);

    const ls = useCallback(() => {
        const node = getNodeAtPath(currentPath);
        if (node && node.type === 'directory') {
            return Object.keys(node.children).map(name => {
                const child = node.children[name];
                return { name, type: child.type };
            });
        }
        return [];
    }, [currentPath, getNodeAtPath]);

    const cd = useCallback((path) => {
        if (!path || path === '~') {
            setCurrentPath(['home', 'owais']);
            return { success: true, message: '' };
        }
        if (path === '..') {
            if (currentPath.length > 0) {
                setCurrentPath(prev => prev.slice(0, -1));
                return { success: true, message: '' };
            }
            return { success: true, message: '' }; // At entry root, do nothing loop
        }
        if (path === '/') {
            setCurrentPath([]);
            return { success: true, message: '' };
        }

        // Support relative path for single level for now
        const currentDir = getNodeAtPath(currentPath);
        if (currentDir && currentDir.children && currentDir.children[path]) {
            if (currentDir.children[path].type === 'directory') {
                setCurrentPath(prev => [...prev, path]);
                return { success: true, message: '' };
            }
            return { success: false, message: `cd: ${path}: Not a directory` };
        }

        return { success: false, message: `cd: ${path}: No such file or directory` };
    }, [currentPath, getNodeAtPath]);

    const cat = useCallback((filename) => {
        const currentDir = getNodeAtPath(currentPath);
        if (currentDir && currentDir.children && currentDir.children[filename]) {
            const file = currentDir.children[filename];
            if (file.type === 'file') {
                return { success: true, content: file.content };
            }
            return { success: false, message: `cat: ${filename}: Is a directory` };
        }
        return { success: false, message: `cat: ${filename}: No such file or directory` };
    }, [currentPath, getNodeAtPath]);

    const pwd = useCallback(() => {
        return '/' + currentPath.join('/');
    }, [currentPath]);

    const getCompletions = useCallback((partial) => {
        const node = getNodeAtPath(currentPath);
        if (!node || !node.children) return [];
        return Object.keys(node.children)
            .filter(name => name.startsWith(partial))
            .map(name => {
                // append slash if directory
                return node.children[name].type === 'directory' ? name + '/' : name;
            });
    }, [currentPath, getNodeAtPath]);

    return {
        currentPath,
        ls,
        cd,
        cat,
        pwd,
        getCompletions
    };
};
