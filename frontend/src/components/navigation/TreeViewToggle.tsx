import React from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react'
import type { HierarchyTree } from '../../services/types'

interface TreeViewToggleProps {
  hierarchyTree?: HierarchyTree
  currentPath: string[]
  onNavigate: (path: string[]) => void
  isTreeViewActive: boolean
  onToggle: () => void
}

export const TreeViewToggle: React.FC<TreeViewToggleProps> = ({
  hierarchyTree,
  currentPath,
  onNavigate,
  onToggle
}) => {
  if (!hierarchyTree) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 ml-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 ml-8"></div>
        </div>
      </div>
    )
  }

  const TreeNode: React.FC<{
    nodeName: string
    path: string[]
    level: number
    isExpanded?: boolean
    isSelected?: boolean
    hasChildren?: boolean
    isLeaf?: boolean
  }> = ({ 
    nodeName, 
    path, 
    level, 
    isExpanded = false, 
    isSelected = false, 
    hasChildren = false,
    isLeaf = false
  }) => {
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      // Toggle expansion logic would go here
    }

    const handleSelect = () => {
      onNavigate(path)
    }

    const IconComponent = isLeaf ? FileText : (isExpanded ? FolderOpen : Folder)
    const ChevronComponent = hasChildren ? (isExpanded ? ChevronDown : ChevronRight) : null

    return (
      <div className="space-y-1">
        <div
          className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 transition-colors
            ${isSelected ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-700'}
          `}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={handleSelect}
        >
          {ChevronComponent && (
            <button onClick={handleToggle} className="p-1">
              <ChevronComponent className="h-3 w-3" />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <IconComponent className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{nodeName}</span>
        </div>

        {/* Children would be rendered here recursively */}
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {/* Placeholder for child nodes */}
          </div>
        )}
      </div>
    )
  }

  // Mock hierarchy for demonstration
  const mockHierarchy = [
    { name: 'Total Revenue', path: ['revenue'], hasChildren: true, isLeaf: false },
    { name: 'North America', path: ['revenue', 'north_america'], hasChildren: true, isLeaf: false },
    { name: 'Premium Segment', path: ['revenue', 'north_america', 'premium'], hasChildren: false, isLeaf: true },
    { name: 'Standard Segment', path: ['revenue', 'north_america', 'standard'], hasChildren: false, isLeaf: true },
    { name: 'Operating Expenses', path: ['operating_expenses'], hasChildren: true, isLeaf: false },
    { name: 'COGS', path: ['operating_expenses', 'cogs'], hasChildren: false, isLeaf: true },
    { name: 'SG&A', path: ['operating_expenses', 'sga'], hasChildren: false, isLeaf: true },
  ]

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Model Structure</h3>
          <button
            onClick={onToggle}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Collapse
          </button>
        </div>
      </div>

      <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
        <TreeNode
          nodeName="Company"
          path={[]}
          level={0}
          isSelected={currentPath.length === 0}
          hasChildren={true}
          isExpanded={true}
        />
        
        {mockHierarchy.map((node) => {
          const isSelected = JSON.stringify(currentPath) === JSON.stringify(node.path)
          const level = node.path.length
          
          return (
            <TreeNode
              key={node.path.join('/')}
              nodeName={node.name}
              path={node.path}
              level={level}
              isSelected={isSelected}
              hasChildren={node.hasChildren}
              isLeaf={node.isLeaf}
              isExpanded={currentPath.some((_, index) => 
                JSON.stringify(currentPath.slice(0, index + 1)) === JSON.stringify(node.path.slice(0, index + 1))
              )}
            />
          )
        })}
      </div>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Tree structure will be dynamically generated from your model in Phase 4</p>
      </div>
    </div>
  )
}