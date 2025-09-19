# Jira Integration

This directory contains components and utilities for integrating Quarterback with Jira.

## Components

### JiraConfig
Configuration component for setting up Jira connection. Includes:
- Jira URL input
- Username/email input
- API token input (with show/hide toggle)
- Project key input
- Connection status display
- Test connection functionality

### JiraSync
Sync component for managing data flow between Quarterback and Jira. Includes:
- Sync from Jira (with custom JQL support)
- Sync to Jira (create/update issues)
- Status display
- Error handling

## Hooks

### useJira
Main hook for Jira operations:
- `connect(config)` - Connect to Jira
- `disconnect()` - Disconnect from Jira
- `syncFromJira(jql?)` - Sync issues from Jira to Quarterback
- `syncToJira(items?)` - Sync plan items to Jira
- `getJiraStatus()` - Get connection status
- `isLoading` - Loading state
- `error` - Error messages

## API Client

### JiraClient
Low-level API client for Jira operations:
- Authentication (Basic Auth with API token)
- Search issues with JQL
- Get/update/create issues
- Project and issue type management
- Error handling

## Data Mapping

### Jira Issue → Plan Item
- `id` → `jiraId`
- `key` → `jiraKey` and `key`
- `summary` → `title`
- `description` → `notes`
- `issuetype.name` → `type` (mapped to Feature/Story)
- `labels` → `label` (comma-separated)
- `customfield_10016` → `baseDays` (story points)
- `status.name` → `jiraStatus`
- `priority.name` → `jiraPriority`
- `assignee.displayName` → `jiraAssignee`
- `customfield_10020` → `jiraSprint`
- `created` → `jiraCreated`
- `updated` → `jiraUpdated`

### Plan Item → Jira Issue
- `title` → `summary`
- `notes` → `description`
- `type` → `issuetype`
- `label` → `labels` (split by comma)
- `baseDays` → `customfield_10016` (story points)

## Usage

1. Configure Jira connection in Settings page
2. Use Jira Sync in Plan page to sync data
3. Plan items with Jira keys will be kept in sync
4. Local items can be synced to Jira to create new issues

## Custom Fields

The integration assumes these Jira custom fields:
- `customfield_10016` - Story Points (maps to baseDays)
- `customfield_10020` - Sprint (maps to jiraSprint)

Adjust field IDs in `src/lib/jira.ts` if your Jira instance uses different custom field IDs.


