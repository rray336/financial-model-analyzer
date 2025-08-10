import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import type { HierarchyTree } from '../../services/types'

interface BreadcrumbNavigationProps {
  currentPath: string[]
  hierarchyTree?: HierarchyTree
  onNavigate: (path: string[]) => void
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentPath,
  onNavigate
}) => {
  const breadcrumbItems = [
    { name: 'Company', path: [] },
    ...currentPath.map((segment, index) => ({
      name: segment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path: currentPath.slice(0, index + 1)
    }))
  ]

  const handleNavigate = (path: string[]) => {
    onNavigate(path)
  }

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
            )}
            
            <button
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors
                ${index === breadcrumbItems.length - 1 
                  ? 'text-gray-900 font-medium cursor-default' 
                  : 'text-gray-600 hover:text-gray-900 cursor-pointer'
                }
              `}
              disabled={index === breadcrumbItems.length - 1}
            >
              {index === 0 && <Home className="h-4 w-4" />}
              <span>{item.name}</span>
            </button>
          </li>
        ))}
      </ol>
      
      {/* Path indicator */}
      <div className="ml-4 text-xs text-gray-500">
        Path: /{currentPath.join('/')}
      </div>
    </nav>
  )
}