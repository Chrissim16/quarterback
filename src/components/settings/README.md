# Settings Components

This directory contains the organized settings components with a sidebar navigation layout.

## Structure

### SettingsLayout
Main layout component that provides:
- Left sidebar navigation
- Responsive design
- Section switching
- URL hash routing

### Settings Subpages

#### GeneralSettings
- **Certainty Multipliers**: Configure how base days are multiplied based on uncertainty
- **Current Quarter Info**: Display current quarter details and working days
- **Assignment Rules**: Toggle strict application matching

#### QuartersSettings
- **Quarter Management**: Add, edit, remove quarters
- **Current Quarter Editor**: Modify the active quarter
- **Working Days Calculation**: Real-time calculation of working days
- **Date Validation**: Ensure valid date ranges

#### CountriesSettings
- **Country Management**: Add, edit, remove countries
- **ISO-2 Code Validation**: Ensure proper country codes
- **Usage Information**: Explain how countries are used in the app

#### JiraSettings
- **Jira Configuration**: Connect to Jira instance
- **Integration Features**: Overview of sync capabilities
- **Field Mapping**: Documentation of data mapping
- **Setup Instructions**: Step-by-step setup guide

## Navigation

The settings use URL hash routing:
- `#settings-general` - General settings
- `#settings-quarters` - Quarter management
- `#settings-countries` - Country management
- `#settings-jira` - Jira integration

## Features

### Responsive Design
- Mobile-friendly sidebar
- Collapsible navigation on small screens
- Proper spacing and typography

### State Management
- Each subpage manages its own state
- Changes are persisted through the main store
- Real-time validation and feedback

### User Experience
- Clear section organization
- Intuitive navigation
- Consistent styling
- Helpful descriptions and instructions

## Usage

The settings page automatically detects the URL hash and loads the appropriate section. Users can navigate between sections using the sidebar, and the URL will update accordingly.

## Benefits

1. **Reduced Clutter**: Each setting type has its own dedicated space
2. **Better Organization**: Related settings are grouped together
3. **Improved Navigation**: Easy to find and access specific settings
4. **Enhanced UX**: Cleaner, more focused interface
5. **Scalability**: Easy to add new setting sections in the future


