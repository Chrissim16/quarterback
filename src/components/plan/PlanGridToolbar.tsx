
interface Props {
  total: number
  query: string
  onQuery: (v: string) => void
  filter: {
    application: string
    type: 'Feature' | 'Story' | 'all'
    certainty: 'Low' | 'Mid' | 'High' | 'all'
    label: string
  }
  onFilter: (f: Props['filter']) => void
  sort: {
    by: 'title' | 'application' | 'adjusted' | 'base' | 'certainty'
    dir: 'asc' | 'desc'
  }
  onSort: (s: Props['sort']) => void
  onAddItem: () => void
}

const PlanGridToolbar = ({
  total,
  query,
  onQuery,
  filter,
  onFilter,
  sort,
  onSort,
  onAddItem,
}: Props) => {
  const handleFilterChange = (field: keyof Props['filter'], value: string) => {
    onFilter({
      ...filter,
      [field]: value === 'all' ? undefined : value,
    })
  }

  const handleSortChange = (by: Props['sort']['by']) => {
    onSort({
      by,
      dir: sort.by === by && sort.dir === 'asc' ? 'desc' : 'asc',
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section - Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search title, key, notes…"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">🔍</span>
            </div>
          </div>
        </div>

        {/* Center Section - Filters */}
        <div className="flex items-center space-x-3">
          {/* Type Filter */}
          <select
            value={filter.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Feature">Feature</option>
            <option value="Story">Story</option>
          </select>

          {/* Certainty Filter */}
          <select
            value={filter.certainty || 'all'}
            onChange={(e) => handleFilterChange('certainty', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Certainty</option>
            <option value="High">High</option>
            <option value="Mid">Mid</option>
            <option value="Low">Low</option>
          </select>

          {/* Application Filter */}
          <input
            type="text"
            placeholder="Application"
            value={filter.application || ''}
            onChange={(e) => handleFilterChange('application', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
          />

          {/* Label Filter */}
          <input
            type="text"
            placeholder="Label"
            value={filter.label || ''}
            onChange={(e) => handleFilterChange('label', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
          />
        </div>

        {/* Right Section - Sort, Results, Add Item */}
        <div className="flex items-center space-x-3">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sort.by}
              onChange={(e) => handleSortChange(e.target.value as Props['sort']['by'])}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="title">Title</option>
              <option value="application">Application</option>
              <option value="adjusted">Adjusted Days</option>
              <option value="base">Base Days</option>
              <option value="certainty">Certainty</option>
            </select>
            <button
              onClick={() => onSort({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' })}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={`Sort ${sort.dir === 'asc' ? 'descending' : 'ascending'}`}
            >
              <span className="text-sm">{sort.dir === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>

          {/* Results Counter */}
          <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {total} result{total !== 1 ? 's' : ''}
          </div>

          {/* Add Item Button */}
          <button
            onClick={onAddItem}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanGridToolbar
