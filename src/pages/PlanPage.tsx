import { useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { usePlanSummary } from '../hooks/usePlanSummary'
import { useProposal } from '../hooks/useProposal'
import { useEnhancedProposal } from '../hooks/useEnhancedProposal'
import AssignmentControls from '../components/assignment/AssignmentControls'
import AssignmentMetrics from '../components/assignment/AssignmentMetrics'
import { hasValidApplication } from '../lib/apps'
import JiraSync from '../components/jira/JiraSync'
import PlanGridToolbar from '../components/plan/PlanGridToolbar'
import PlanRecordGrid from '../components/plan/PlanRecordGrid'
import type { PageProps, PlanItem } from '../types'

const PlanPage = ({ className = '' }: PageProps) => {
  const { getCurrentQuarterItems, addPlanItem, updatePlanItem, removePlanItem } = useAppStore()
  const items = getCurrentQuarterItems()
  const planSummary = usePlanSummary()
  const proposal = useProposal()
  const enhancedProposal = useEnhancedProposal()
  const [useEnhancedEngine, setUseEnhancedEngine] = useState(true)
  const [bulkImportText, setBulkImportText] = useState('')
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [showJiraSync, setShowJiraSync] = useState(false)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    key: '',
    type: 'Feature' as 'Feature' | 'Story',
    application: '',
    label: '',
    notes: '',
    baseDays: 1,
    certainty: 'Mid' as 'Low' | 'Mid' | 'High',
  })

  // Grid state
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState({
    application: '',
    type: 'all' as 'Feature' | 'Story' | 'all',
    certainty: 'all' as 'Low' | 'Mid' | 'High' | 'all',
    label: '',
  })

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
  }
  const [sort, setSort] = useState({
    by: 'title' as 'title' | 'application' | 'adjusted' | 'base' | 'certainty',
    dir: 'asc' as 'asc' | 'desc',
  })

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items

    // Search filter
    if (query) {
      const searchLower = query.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.key?.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
      )
    }

    // Type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter(item => item.type === filter.type)
    }

    // Certainty filter
    if (filter.certainty !== 'all') {
      filtered = filtered.filter(item => item.certainty === filter.certainty)
    }

    // Application filter
    if (filter.application) {
      const appLower = filter.application.toLowerCase()
      filtered = filtered.filter(item =>
        item.application?.toLowerCase().includes(appLower)
      )
    }

    // Label filter
    if (filter.label) {
      const labelLower = filter.label.toLowerCase()
      filtered = filtered.filter(item =>
        item.label?.toLowerCase().includes(labelLower)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sort.by) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'application':
          aValue = a.application || ''
          bValue = b.application || ''
          break
        case 'adjusted':
          aValue = a.adjustedDays || 0
          bValue = b.adjustedDays || 0
          break
        case 'base':
          aValue = a.baseDays || 0
          bValue = b.baseDays || 0
          break
        case 'certainty':
          const certaintyOrder = { High: 3, Mid: 2, Low: 1 }
          aValue = certaintyOrder[a.certainty as keyof typeof certaintyOrder] || 0
          bValue = certaintyOrder[b.certainty as keyof typeof certaintyOrder] || 0
          break
        default:
          aValue = a.title
          bValue = b.title
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue)
        return sort.dir === 'asc' ? result : -result
      }

      const result = (aValue as number) - (bValue as number)
      return sort.dir === 'asc' ? result : -result
    })

    return filtered
  }, [items, query, filter, sort])

  const handleAddItem = () => {
    setShowAddItemForm(true)
    setNewItem({
      title: '',
      key: '',
      type: 'Feature',
      application: '',
      label: '',
      notes: '',
      baseDays: 1,
      certainty: 'Mid',
    })
  }

  const handleSaveNewItem = async () => {
    if (newItem.title.trim()) {
      const success = await addPlanItem({
        title: newItem.title.trim(),
        key: newItem.key || undefined,
        type: newItem.type,
        application: newItem.application || undefined,
        label: newItem.label || undefined,
        notes: newItem.notes || undefined,
        baseDays: newItem.baseDays,
        certainty: newItem.certainty,
      })
      
      if (success) {
        setShowAddItemForm(false)
      } else {
        alert('Failed to add plan item. Please try again.')
      }
    }
  }

  const handleCancelNewItem = () => {
    setShowAddItemForm(false)
    setNewItem({
      title: '',
      key: '',
      type: 'Feature',
      application: '',
      label: '',
      notes: '',
      baseDays: 1,
      certainty: 'Mid',
    })
  }

  const handleBulkImport = async () => {
    const lines = bulkImportText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let successCount = 0
    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim())
      if (parts.length >= 3) {
        const [key, title, type, label, application] = parts
        const success = await addPlanItem({
          ...(key && { key }),
          title: title || '',
          type: (type as 'Feature' | 'Story') || 'Feature',
          ...(label && { label }),
          ...(application && { application }),
          baseDays: 1,
          certainty: 'Mid',
        })
        if (success) successCount++
      }
    }

    setBulkImportText('')
    alert(`Bulk import completed: ${successCount}/${lines.length} items added successfully`)
  }

  const handleGenerateProposals = async () => {
    if (useEnhancedEngine) {
      await enhancedProposal.generateProposals()
    } else {
      await proposal.generateProposals()
    }
    // Simple notification - in a real app you'd use a proper toast library
    alert('Proposal updated! Check the Team page to see assignments.')
  }

  const handleDuplicateItem = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      const success = await addPlanItem({
        ...item,
        title: `${item.title} (Copy)`,
        key: item.key ? `${item.key}-copy` : undefined,
      })
      if (!success) {
        alert('Failed to duplicate item. Please try again.')
      }
    }
  }

  const handleEditItem = async (partial: Partial<PlanItem> & { id: string }) => {
    const { id, ...updates } = partial
    const success = await updatePlanItem(id, updates)
    if (!success) {
      alert('Failed to update plan item. Please try again.')
    }
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
        {/* Plan Items Section */}
        <div className="space-y-6">
          {/* Plan Items Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Plan Items</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowJiraSync(!showJiraSync)}
                className="btn-primary px-4 py-2 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {showJiraSync ? 'Hide Jira Sync' : 'Jira Sync'}
              </button>
              <button
                onClick={() => setShowBulkImportDialog(true)}
                className="btn-secondary px-4 py-2 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Bulk Import
              </button>
            </div>
          </div>

          {/* Jira Sync Section */}
          {showJiraSync && (
            <div className="card p-6 animate-fadeIn">
              <JiraSync onSyncComplete={(result) => {
                console.log('Sync completed:', result)
                setShowJiraSync(false)
              }} />
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Summary */}
            <div className="card-gradient p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Plan Summary</h3>
              
              {/* Total Adjusted Effort */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Adjusted Effort</span>
                  <span className="text-3xl font-bold text-gradient">
                    {planSummary.totalAdjustedEffort.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {planSummary.totalItems} items
                </div>
                
                {/* Visual Progress Bar */}
                <div className="progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${Math.min((planSummary.totalAdjustedEffort / 100) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {planSummary.totalAdjustedEffort > 100 ? 'Over capacity' : 'Within capacity'}
                </div>
              </div>

              {/* By Application */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">By Application</h4>
                {planSummary.byApplication.length > 0 ? (
                  <div className="space-y-2">
                    {planSummary.byApplication.map((app) => {
                      const percentage = planSummary.totalAdjustedEffort > 0 
                        ? (app.totalAdjustedDays / planSummary.totalAdjustedEffort) * 100 
                        : 0
                      
                      return (
                        <div key={app.application} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{app.application}</div>
                            <div className="text-xs text-gray-500">{app.itemCount} items</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-700">
                              {app.totalAdjustedDays.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No items with applications</div>
                )}
              </div>
            </div>

            {/* Assignment Summary */}
            {proposal.hasProposals && (
              <div className="card p-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Assignment Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Assignment Efficiency</span>
                    <span className={`text-sm font-semibold ${
                      proposal.assignmentEfficiency >= 90 ? 'text-emerald-600' : 
                      proposal.assignmentEfficiency >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {proposal.assignmentEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Assigned</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {proposal.totalAssignedDays.toFixed(1)} / {proposal.totalAdjustedDays.toFixed(1)} days
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Items Assigned</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {proposal.proposals.filter(p => p.allocations.length > 0).length} / {proposal.proposals.length}
                    </span>
                  </div>
                  
                  {proposal.hasUnassignedItems && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center">
                        <span className="text-orange-600 text-sm font-medium">⚠️ Some items could not be fully assigned</span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        Consider adjusting team capacity or reducing item scope
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <PlanGridToolbar
            total={filteredAndSortedItems.length}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={handleFilterChange}
            sort={sort}
            onSort={setSort}
            onAddItem={handleAddItem}
          />

          {/* Add Item Form */}
          {showAddItemForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Plan Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter item title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jira Key</label>
                  <input
                    type="text"
                    value={newItem.key}
                    onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
                    placeholder="e.g., PROJ-123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'Feature' | 'Story' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Story">Story</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                  <input
                    type="text"
                    value={newItem.application}
                    onChange={(e) => setNewItem({ ...newItem, application: e.target.value })}
                    placeholder="e.g., Web App, Mobile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., epic-1, sprint-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Additional details..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Days</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newItem.baseDays}
                    onChange={(e) => setNewItem({ ...newItem, baseDays: Math.max(0, parseFloat(e.target.value) || 1) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certainty</label>
                  <select
                    value={newItem.certainty}
                    onChange={(e) => setNewItem({ ...newItem, certainty: e.target.value as 'Low' | 'Mid' | 'High' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Mid">Mid</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelNewItem}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewItem}
                  disabled={!newItem.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          )}

          {/* Grid */}
          <PlanRecordGrid
            items={filteredAndSortedItems}
            onEdit={handleEditItem}
            onDelete={removePlanItem}
            onDuplicate={handleDuplicateItem}
          />

          {/* Enhanced Assignment Engine Toggle */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assignment Engine</h3>
                <p className="text-sm text-gray-600">
                  {useEnhancedEngine 
                    ? 'Enhanced engine with skill matching, workload balancing, and dependencies'
                    : 'Basic engine with application matching only'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useEnhancedEngine}
                    onChange={(e) => setUseEnhancedEngine(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use Enhanced Engine</span>
                </label>
              </div>
            </div>
          </div>

          {/* Assignment Controls (Enhanced Engine Only) */}
          {useEnhancedEngine && (
            <AssignmentControls
              strategy={enhancedProposal.strategy}
              onStrategyChange={enhancedProposal.updateStrategy}
              manualOverrides={enhancedProposal.manualOverrides}
              onAddOverride={enhancedProposal.addManualOverride}
              onRemoveOverride={enhancedProposal.removeManualOverride}
              strategyOptions={enhancedProposal.strategyOptions}
            />
          )}

          {/* Assignment Metrics (Enhanced Engine Only) */}
          {useEnhancedEngine && enhancedProposal.metrics && (
            <AssignmentMetrics metrics={enhancedProposal.metrics} />
          )}

          {/* Propose Plan Actions */}
          <div className="flex justify-center space-x-3 pt-6">
            <button
              onClick={handleGenerateProposals}
              disabled={(useEnhancedEngine ? enhancedProposal.isGenerating : proposal.isGenerating) || items.length === 0}
              className="btn-primary px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(useEnhancedEngine ? enhancedProposal.isGenerating : proposal.isGenerating) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {useEnhancedEngine ? 'Generate Enhanced Proposals' : 'Propose Plan'}
                </>
              )}
            </button>
            {(useEnhancedEngine ? enhancedProposal.hasProposals : proposal.hasProposals) && (
              <button
                onClick={useEnhancedEngine ? enhancedProposal.clearProposals : proposal.clearProposals}
                className="btn-secondary px-6 py-3 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

            {/* Assignment Proposals */}
            {(useEnhancedEngine ? enhancedProposal.hasProposals : proposal.hasProposals) && (
              <div className="card p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Assignment Proposals</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Efficiency: {(useEnhancedEngine ? enhancedProposal.assignmentEfficiency : proposal.assignmentEfficiency).toFixed(1)}%</span>
                    {(useEnhancedEngine ? enhancedProposal.totalUnassignedDays : proposal.totalUnassignedDays) > 0 && (
                      <span className="text-orange-600 font-medium">
                        ⚠️ {(useEnhancedEngine ? enhancedProposal.totalUnassignedDays : proposal.totalUnassignedDays).toFixed(1)}d unassigned
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {useEnhancedEngine ? 'Enhanced Engine' : 'Basic Engine'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(useEnhancedEngine ? enhancedProposal.proposals : proposal.proposals).map((proposal) => (
                    <div key={proposal.itemId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{proposal.itemTitle}</h4>
                          <p className="text-sm text-gray-600">
                            {proposal.application || 'No Application'} • {proposal.adjustedDays.toFixed(1)} days
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {proposal.status === 'fully-assigned' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Fully assigned
                            </span>
                          )}
                          {proposal.status === 'partially-assigned' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠️ Partial: {proposal.unassignedDays?.toFixed(1)}d left
                            </span>
                          )}
                          {proposal.status === 'unassigned' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ No matching team app
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status hint */}
                      {proposal.status !== 'fully-assigned' && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          {proposal.status === 'unassigned' && !hasValidApplication(proposal.application) && 
                            'Application required for assignment'
                          }
                          {proposal.status === 'unassigned' && hasValidApplication(proposal.application) && 
                            `No team member with application '${proposal.application}'`
                          }
                          {proposal.status === 'partially-assigned' && 
                            `Insufficient capacity for '${proposal.application}' (left: ${proposal.unassignedDays?.toFixed(1)}d)`
                          }
                        </div>
                      )}
                      
                      {proposal.allocations.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">Assignments:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {proposal.allocations.map((allocation, index) => (
                              <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                                <span className="text-sm text-gray-900">{allocation.name}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {allocation.daysAssigned.toFixed(1)} days
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No assignments possible</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Bulk Import Dialog */}
        {showBulkImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Import</h3>
              <p className="mb-4 text-sm text-gray-600">
                Paste lines with format: Key,Title,Type,Label,Application (one per line)
              </p>
              <div className="space-y-4">
                <textarea
                  value={bulkImportText}
                  onChange={e => setBulkImportText(e.target.value)}
                  placeholder="ISSUE-123,Implement user authentication,Feature,backend,web-app&#10;ISSUE-124,Add login form,Story,frontend,web-app"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBulkImportDialog(false)
                      setBulkImportText('')
                    }}
                    className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleBulkImport()
                      setShowBulkImportDialog(false)
                    }}
                    disabled={!bulkImportText.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Import Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default PlanPage
