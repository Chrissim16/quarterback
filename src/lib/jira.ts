// Jira API client and utilities
import type { PlanItem } from '../types'

export interface JiraConfig {
  baseUrl: string
  username: string
  apiToken: string
  projectKey: string
}

export interface JiraIssue {
  id: string
  key: string
  summary: string
  description?: string
  issuetype: {
    name: string
  }
  status: {
    name: string
  }
  priority?: {
    name: string
  }
  labels: string[]
  customfield_10016?: number // Story Points
  customfield_10020?: string // Sprint
  assignee?: {
    displayName: string
    emailAddress: string
  }
  created: string
  updated: string
}

export interface JiraSearchResult {
  issues: JiraIssue[]
  total: number
  startAt: number
  maxResults: number
}

export class JiraClient {
  private config: JiraConfig

  constructor(config: JiraConfig) {
    this.config = config
  }

  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.username}:${this.config.apiToken}`)
    return `Basic ${credentials}`
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use proxy in development, direct URL in production
    const isDevelopment = import.meta.env.DEV
    const url = isDevelopment 
      ? `/api/jira${endpoint}`
      : `${this.config.baseUrl}/rest/api/3${endpoint}`
    
    console.log('Jira API Request:', {
      url,
      method: options.method || 'GET',
      hasAuth: !!this.config.apiToken,
      isDevelopment
    })
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    console.log('Jira API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      let errorMessage = `Jira API error: ${response.status} ${response.statusText}`
      
      // Try to get more detailed error information
      try {
        const errorData = await response.json()
        console.error('Jira API Error Details:', errorData)
        
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check your username and API token.'
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. Please check your permissions and project access.'
        } else if (response.status === 404) {
          errorMessage = 'Jira instance not found. Please check your Jira URL.'
        } else if (errorData.errorMessages && errorData.errorMessages.length > 0) {
          errorMessage = `Jira error: ${errorData.errorMessages.join(', ')}`
        }
      } catch (e) {
        console.error('Could not parse error response:', e)
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Jira connection with config:', {
        baseUrl: this.config.baseUrl,
        username: this.config.username,
        projectKey: this.config.projectKey,
        hasApiToken: !!this.config.apiToken
      })
      
      const result = await this.makeRequest('/myself')
      console.log('Jira connection successful:', result)
      return true
    } catch (error) {
      console.error('Jira connection test failed:', error)
      return false
    }
  }

  async searchIssues(jql: string, startAt = 0, maxResults = 50): Promise<JiraSearchResult> {
    const params = new URLSearchParams({
      jql,
      startAt: startAt.toString(),
      maxResults: maxResults.toString(),
      fields: 'id,key,summary,description,issuetype,status,priority,labels,customfield_10016,customfield_10020,assignee,created,updated',
    })

    return this.makeRequest(`/search?${params}`)
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    return this.makeRequest(`/issue/${issueKey}`)
  }

  async createIssue(issue: {
    summary: string
    description?: string
    issuetype: string
    labels?: string[]
    customfield_10016?: number
  }): Promise<{ id: string; key: string }> {
    const payload = {
      fields: {
        project: { key: this.config.projectKey },
        summary: issue.summary,
        description: issue.description,
        issuetype: { name: issue.issuetype },
        labels: issue.labels || [],
        ...(issue.customfield_10016 && { customfield_10016: issue.customfield_10016 }),
      },
    }

    return this.makeRequest('/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateIssue(issueKey: string, updates: {
    summary?: string
    description?: string
    labels?: string[]
    customfield_10016?: number
  }): Promise<void> {
    const payload = {
      fields: {
        ...(updates.summary && { summary: updates.summary }),
        ...(updates.description && { description: updates.description }),
        ...(updates.labels && { labels: updates.labels }),
        ...(updates.customfield_10016 !== undefined && { customfield_10016: updates.customfield_10016 }),
      },
    }

    await this.makeRequest(`/issue/${issueKey}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async getProjects(): Promise<Array<{ key: string; name: string }>> {
    const result = await this.makeRequest<Array<{ key: string; name: string }>>('/project')
    return result
  }

  async getIssueTypes(projectKey?: string): Promise<Array<{ id: string; name: string; subtask: boolean }>> {
    const endpoint = projectKey ? `/project/${projectKey}` : '/issuetype'
    const result = await this.makeRequest<{ issueTypes?: Array<{ id: string; name: string; subtask: boolean }> }>(endpoint)
    return result.issueTypes || result as any
  }
}

// Utility functions for converting between Jira and Quarterback data
export function jiraIssueToPlanItem(issue: JiraIssue): PlanItem {
  return {
    id: `jira-${issue.id}`,
    key: issue.key,
    title: issue.summary,
    type: mapJiraIssueType(issue.issuetype.name),
    label: issue.labels.join(', ') || undefined,
    application: undefined, // Will need to be set manually or via custom field
    baseDays: issue.customfield_10016 || 1, // Use story points as base days
    certainty: 'Mid', // Default, can be updated
    adjustedDays: (issue.customfield_10016 || 1) * 1.2, // Default multiplier
    notes: issue.description || undefined,
    jiraId: issue.id,
    jiraKey: issue.key,
    jiraStatus: issue.status.name,
    jiraPriority: issue.priority?.name,
    jiraAssignee: issue.assignee?.displayName,
    jiraSprint: issue.customfield_10020,
    jiraCreated: issue.created,
    jiraUpdated: issue.updated,
  }
}

export function planItemToJiraIssue(item: PlanItem): Partial<JiraIssue> {
  return {
    key: item.jiraKey,
    summary: item.title,
    description: item.notes,
    labels: item.label ? item.label.split(', ').filter(Boolean) : [],
    customfield_10016: item.baseDays,
  }
}

function mapJiraIssueType(jiraType: string): 'Feature' | 'Story' {
  const type = jiraType.toLowerCase()
  if (type.includes('epic') || type.includes('feature')) {
    return 'Feature'
  }
  return 'Story'
}

// JQL query builders
export function buildJQLForProject(projectKey: string, additionalFilters?: string): string {
  let jql = `project = "${projectKey}"`
  
  if (additionalFilters) {
    jql += ` AND ${additionalFilters}`
  }
  
  return jql
}

export function buildJQLForSprint(sprintName: string, projectKey?: string): string {
  let jql = `Sprint = "${sprintName}"`
  
  if (projectKey) {
    jql = `project = "${projectKey}" AND ${jql}`
  }
  
  return jql
}

export function buildJQLForAssignee(assignee: string, projectKey?: string): string {
  let jql = `assignee = "${assignee}"`
  
  if (projectKey) {
    jql = `project = "${projectKey}" AND ${jql}`
  }
  
  return jql
}

