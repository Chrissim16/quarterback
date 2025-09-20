// Test Data Generator for Quarterback ERP/FIS System
// This script creates comprehensive test data for planning purposes

const testData = {
  // Q1 2025 Quarter
  quarter: {
    id: 'q1-2025',
    name: 'Q1 2025',
    description: 'Q1 2025 - ERP Treasury Management System Development',
    startISO: '2025-01-01',
    endISO: '2025-03-31',
    label: 'Q1-25'
  },

  // ERP/FIS Features with child stories
  features: [
    {
      id: 'f1',
      type: 'Feature',
      key: 'ERP-001',
      title: 'Core Treasury Management Module',
      label: 'Core Treasury',
      application: 'FIS',
      baseDays: 45,
      certainty: 'High',
      adjustedDays: 45,
      notes: 'Central treasury management functionality including cash positioning, liquidity management, and risk controls',
      requiredSkills: ['Treasury Management', 'Financial Systems', 'Risk Management', 'Backend Development'],
      priority: 'Critical',
      estimatedComplexity: 'Very Complex',
      maxConcurrentAssignments: 3,
      deadline: '2025-03-15',
      tags: ['core', 'treasury', 'critical-path'],
      stories: [
        {
          id: 's1',
          type: 'Story',
          key: 'ERP-001-1',
          title: 'Cash Position Dashboard',
          application: 'FIS',
          baseDays: 8,
          certainty: 'High',
          adjustedDays: 8,
          notes: 'Real-time cash position visualization with drill-down capabilities',
          requiredSkills: ['Frontend Development', 'Data Visualization', 'Treasury Management'],
          priority: 'High',
          estimatedComplexity: 'Complex',
          parentFeature: 'f1'
        },
        {
          id: 's2',
          type: 'Story',
          key: 'ERP-001-2',
          title: 'Liquidity Forecasting Engine',
          application: 'FIS',
          baseDays: 12,
          certainty: 'High',
          adjustedDays: 12,
          notes: 'ML-based liquidity forecasting with scenario analysis',
          requiredSkills: ['Machine Learning', 'Financial Modeling', 'Backend Development'],
          priority: 'High',
          estimatedComplexity: 'Very Complex',
          parentFeature: 'f1'
        },
        {
          id: 's3',
          type: 'Story',
          key: 'ERP-001-3',
          title: 'Risk Limit Monitoring',
          application: 'FIS',
          baseDays: 10,
          certainty: 'High',
          adjustedDays: 10,
          notes: 'Real-time risk limit monitoring and alerting system',
          requiredSkills: ['Risk Management', 'Backend Development', 'Alerting Systems'],
          priority: 'High',
          estimatedComplexity: 'Complex',
          parentFeature: 'f1'
        }
      ]
    },
    {
      id: 'f2',
      type: 'Feature',
      key: 'ERP-002',
      title: 'Multi-Currency Trading Platform',
      label: 'FX Trading',
      application: 'FIS',
      baseDays: 38,
      certainty: 'High',
      adjustedDays: 38,
      notes: 'Advanced foreign exchange trading platform with real-time pricing and execution',
      requiredSkills: ['FX Trading', 'Real-time Systems', 'Financial Markets', 'Backend Development'],
      priority: 'High',
      estimatedComplexity: 'Very Complex',
      maxConcurrentAssignments: 4,
      deadline: '2025-03-20',
      tags: ['trading', 'fx', 'real-time'],
      stories: [
        {
          id: 's4',
          type: 'Story',
          key: 'ERP-002-1',
          title: 'Real-time Price Feed Integration',
          application: 'FIS',
          baseDays: 15,
          certainty: 'High',
          adjustedDays: 15,
          notes: 'Integration with multiple price providers for real-time FX rates',
          requiredSkills: ['API Integration', 'Real-time Systems', 'Financial Data'],
          priority: 'High',
          estimatedComplexity: 'Complex',
          parentFeature: 'f2'
        },
        {
          id: 's5',
          type: 'Story',
          key: 'ERP-002-2',
          title: 'Trading Execution Engine',
          application: 'FIS',
          baseDays: 18,
          certainty: 'High',
          adjustedDays: 18,
          notes: 'High-performance trading execution with order management',
          requiredSkills: ['Trading Systems', 'High Performance', 'Order Management'],
          priority: 'High',
          estimatedComplexity: 'Very Complex',
          parentFeature: 'f2'
        }
      ]
    },
    {
      id: 'f3',
      type: 'Feature',
      key: 'ERP-003',
      title: 'Regulatory Compliance Suite',
      label: 'Compliance',
      application: 'FIS',
      baseDays: 42,
      certainty: 'High',
      adjustedDays: 42,
      notes: 'Comprehensive regulatory compliance reporting for MiFID II, Basel III, and local regulations',
      requiredSkills: ['Regulatory Compliance', 'Financial Reporting', 'Backend Development'],
      priority: 'Critical',
      estimatedComplexity: 'Very Complex',
      maxConcurrentAssignments: 2,
      deadline: '2025-03-10',
      tags: ['compliance', 'regulatory', 'reporting'],
      stories: [
        {
          id: 's6',
          type: 'Story',
          key: 'ERP-003-1',
          title: 'MiFID II Transaction Reporting',
          application: 'FIS',
          baseDays: 20,
          certainty: 'High',
          adjustedDays: 20,
          notes: 'Automated MiFID II transaction reporting to local regulators',
          requiredSkills: ['MiFID II', 'Regulatory Reporting', 'Backend Development'],
          priority: 'Critical',
          estimatedComplexity: 'Very Complex',
          parentFeature: 'f3'
        },
        {
          id: 's7',
          type: 'Story',
          key: 'ERP-003-2',
          title: 'Basel III Capital Reporting',
          application: 'FIS',
          baseDays: 16,
          certainty: 'High',
          adjustedDays: 16,
          notes: 'Basel III capital adequacy and liquidity reporting',
          requiredSkills: ['Basel III', 'Capital Reporting', 'Financial Modeling'],
          priority: 'Critical',
          estimatedComplexity: 'Very Complex',
          parentFeature: 'f3'
        }
      ]
    },
    {
      id: 'f4',
      type: 'Feature',
      key: 'ERP-004',
      title: 'Advanced Analytics & Reporting',
      label: 'Analytics',
      application: 'FIS',
      baseDays: 35,
      certainty: 'Mid',
      adjustedDays: 42,
      notes: 'Advanced analytics dashboard with custom reporting and data visualization',
      requiredSkills: ['Data Analytics', 'Business Intelligence', 'Frontend Development'],
      priority: 'Medium',
      estimatedComplexity: 'Complex',
      maxConcurrentAssignments: 3,
      deadline: '2025-03-25',
      tags: ['analytics', 'reporting', 'dashboard'],
      stories: [
        {
          id: 's8',
          type: 'Story',
          key: 'ERP-004-1',
          title: 'Custom Report Builder',
          application: 'FIS',
          baseDays: 12,
          certainty: 'Mid',
          adjustedDays: 14,
          notes: 'Drag-and-drop report builder with custom data sources',
          requiredSkills: ['Frontend Development', 'Report Building', 'Data Visualization'],
          priority: 'Medium',
          estimatedComplexity: 'Complex',
          parentFeature: 'f4'
        },
        {
          id: 's9',
          type: 'Story',
          key: 'ERP-004-2',
          title: 'Real-time KPI Dashboard',
          application: 'FIS',
          baseDays: 10,
          certainty: 'Mid',
          adjustedDays: 12,
          notes: 'Real-time key performance indicators with drill-down capabilities',
          requiredSkills: ['Real-time Systems', 'KPI Development', 'Frontend Development'],
          priority: 'Medium',
          estimatedComplexity: 'Complex',
          parentFeature: 'f4'
        }
      ]
    },
    {
      id: 'f5',
      type: 'Feature',
      key: 'ERP-005',
      title: 'Integration Hub',
      label: 'Integration',
      application: 'FIS',
      baseDays: 40,
      certainty: 'High',
      adjustedDays: 40,
      notes: 'Central integration hub for connecting with external systems and APIs',
      requiredSkills: ['API Development', 'Integration', 'Backend Development'],
      priority: 'High',
      estimatedComplexity: 'Very Complex',
      maxConcurrentAssignments: 3,
      deadline: '2025-03-18',
      tags: ['integration', 'api', 'connectivity'],
      stories: [
        {
          id: 's10',
          type: 'Story',
          key: 'ERP-005-1',
          title: 'Bank API Connectors',
          application: 'FIS',
          baseDays: 15,
          certainty: 'High',
          adjustedDays: 15,
          notes: 'Connectors for major bank APIs (SWIFT, SEPA, etc.)',
          requiredSkills: ['Banking APIs', 'SWIFT', 'SEPA', 'Backend Development'],
          priority: 'High',
          estimatedComplexity: 'Complex',
          parentFeature: 'f5'
        },
        {
          id: 's11',
          type: 'Story',
          key: 'ERP-005-2',
          title: 'Third-party System Integration',
          application: 'FIS',
          baseDays: 20,
          certainty: 'High',
          adjustedDays: 20,
          notes: 'Integration with external trading platforms and market data providers',
          requiredSkills: ['System Integration', 'API Development', 'Financial Systems'],
          priority: 'High',
          estimatedComplexity: 'Very Complex',
          parentFeature: 'f5'
        }
      ]
    },
    {
      id: 'f6',
      type: 'Feature',
      key: 'ERP-006',
      title: 'User Management & Security',
      label: 'Security',
      application: 'FIS',
      baseDays: 28,
      certainty: 'High',
      adjustedDays: 28,
      notes: 'Comprehensive user management with role-based access control and security features',
      requiredSkills: ['Security', 'Authentication', 'Authorization', 'Backend Development'],
      priority: 'High',
      estimatedComplexity: 'Complex',
      maxConcurrentAssignments: 2,
      deadline: '2025-03-12',
      tags: ['security', 'user-management', 'rbac'],
      stories: [
        {
          id: 's12',
          type: 'Story',
          key: 'ERP-006-1',
          title: 'Role-Based Access Control',
          application: 'FIS',
          baseDays: 12,
          certainty: 'High',
          adjustedDays: 12,
          notes: 'Granular role-based access control with permission management',
          requiredSkills: ['RBAC', 'Security', 'Backend Development'],
          priority: 'High',
          estimatedComplexity: 'Complex',
          parentFeature: 'f6'
        },
        {
          id: 's13',
          type: 'Story',
          key: 'ERP-006-2',
          title: 'Multi-Factor Authentication',
          application: 'FIS',
          baseDays: 10,
          certainty: 'High',
          adjustedDays: 10,
          notes: 'MFA implementation with SMS, email, and authenticator app support',
          requiredSkills: ['MFA', 'Security', 'Authentication'],
          priority: 'High',
          estimatedComplexity: 'Medium',
          parentFeature: 'f6'
        }
      ]
    },
    {
      id: 'f7',
      type: 'Feature',
      key: 'ERP-007',
      title: 'Mobile Treasury App',
      label: 'Mobile',
      application: 'FIS',
      baseDays: 32,
      certainty: 'Mid',
      adjustedDays: 38,
      notes: 'Mobile application for treasury operations and monitoring',
      requiredSkills: ['Mobile Development', 'React Native', 'Treasury Management'],
      priority: 'Medium',
      estimatedComplexity: 'Complex',
      maxConcurrentAssignments: 2,
      deadline: '2025-03-28',
      tags: ['mobile', 'treasury', 'app'],
      stories: [
        {
          id: 's14',
          type: 'Story',
          key: 'ERP-007-1',
          title: 'Mobile Dashboard',
          application: 'FIS',
          baseDays: 15,
          certainty: 'Mid',
          adjustedDays: 18,
          notes: 'Mobile-optimized dashboard with key treasury metrics',
          requiredSkills: ['Mobile Development', 'UI/UX', 'Treasury Management'],
          priority: 'Medium',
          estimatedComplexity: 'Complex',
          parentFeature: 'f7'
        },
        {
          id: 's15',
          type: 'Story',
          key: 'ERP-007-2',
          title: 'Mobile Trading Interface',
          application: 'FIS',
          baseDays: 12,
          certainty: 'Mid',
          adjustedDays: 14,
          notes: 'Mobile trading interface for emergency trades and approvals',
          requiredSkills: ['Mobile Development', 'Trading Systems', 'UI/UX'],
          priority: 'Medium',
          estimatedComplexity: 'Complex',
          parentFeature: 'f7'
        }
      ]
    },
    {
      id: 'f8',
      type: 'Feature',
      key: 'ERP-008',
      title: 'Workflow Automation',
      label: 'Workflow',
      application: 'FIS',
      baseDays: 30,
      certainty: 'Mid',
      adjustedDays: 36,
      notes: 'Automated workflow engine for treasury operations and approvals',
      requiredSkills: ['Workflow Automation', 'Business Process', 'Backend Development'],
      priority: 'Medium',
      estimatedComplexity: 'Complex',
      maxConcurrentAssignments: 2,
      deadline: '2025-03-22',
      tags: ['workflow', 'automation', 'approvals'],
      stories: [
        {
          id: 's16',
          type: 'Story',
          key: 'ERP-008-1',
          title: 'Approval Workflow Engine',
          application: 'FIS',
          baseDays: 18,
          certainty: 'Mid',
          adjustedDays: 22,
          notes: 'Configurable approval workflows for different transaction types',
          requiredSkills: ['Workflow Engine', 'Business Process', 'Backend Development'],
          priority: 'Medium',
          estimatedComplexity: 'Complex',
          parentFeature: 'f8'
        },
        {
          id: 's17',
          type: 'Story',
          key: 'ERP-008-2',
          title: 'Automated Notifications',
          application: 'FIS',
          baseDays: 8,
          certainty: 'Mid',
          adjustedDays: 10,
          notes: 'Automated notification system for workflow events and alerts',
          requiredSkills: ['Notification Systems', 'Backend Development'],
          priority: 'Medium',
          estimatedComplexity: 'Medium',
          parentFeature: 'f8'
        }
      ]
    },
    {
      id: 'f9',
      type: 'Feature',
      key: 'ERP-009',
      title: 'Data Migration Tools',
      label: 'Migration',
      application: 'FIS',
      baseDays: 25,
      certainty: 'High',
      adjustedDays: 25,
      notes: 'Tools for migrating data from legacy treasury systems',
      requiredSkills: ['Data Migration', 'ETL', 'Legacy Systems', 'Backend Development'],
      priority: 'High',
      estimatedComplexity: 'Complex',
      maxConcurrentAssignments: 2,
      deadline: '2025-03-08',
      tags: ['migration', 'etl', 'legacy'],
      stories: [
        {
          id: 's18',
          type: 'Story',
          key: 'ERP-009-1',
          title: 'Legacy System Connectors',
          application: 'FIS',
          baseDays: 15,
          certainty: 'High',
          adjustedDays: 15,
          notes: 'Connectors for common legacy treasury systems',
          requiredSkills: ['Legacy Systems', 'Data Integration', 'Backend Development'],
          priority: 'High',
          estimatedComplexity: 'Complex',
          parentFeature: 'f9'
        },
        {
          id: 's19',
          type: 'Story',
          key: 'ERP-009-2',
          title: 'Data Validation & Cleanup',
          application: 'FIS',
          baseDays: 8,
          certainty: 'High',
          adjustedDays: 8,
          notes: 'Data validation and cleanup tools for migrated data',
          requiredSkills: ['Data Validation', 'Data Quality', 'Backend Development'],
          priority: 'High',
          estimatedComplexity: 'Medium',
          parentFeature: 'f9'
        }
      ]
    },
    {
      id: 'f10',
      type: 'Feature',
      key: 'ERP-010',
      title: 'Performance Monitoring',
      label: 'Monitoring',
      application: 'FIS',
      baseDays: 22,
      certainty: 'Mid',
      adjustedDays: 26,
      notes: 'Comprehensive performance monitoring and alerting system',
      requiredSkills: ['Monitoring', 'Alerting', 'Performance', 'Backend Development'],
      priority: 'Medium',
      estimatedComplexity: 'Medium',
      maxConcurrentAssignments: 2,
      deadline: '2025-03-30',
      tags: ['monitoring', 'performance', 'alerting'],
      stories: [
        {
          id: 's20',
          type: 'Story',
          key: 'ERP-010-1',
          title: 'System Health Dashboard',
          application: 'FIS',
          baseDays: 10,
          certainty: 'Mid',
          adjustedDays: 12,
          notes: 'Real-time system health monitoring dashboard',
          requiredSkills: ['Monitoring', 'Dashboard Development', 'Backend Development'],
          priority: 'Medium',
          estimatedComplexity: 'Medium',
          parentFeature: 'f10'
        },
        {
          id: 's21',
          type: 'Story',
          key: 'ERP-010-2',
          title: 'Automated Alerting System',
          application: 'FIS',
          baseDays: 8,
          certainty: 'Mid',
          adjustedDays: 10,
          notes: 'Automated alerting for system issues and performance degradation',
          requiredSkills: ['Alerting Systems', 'Monitoring', 'Backend Development'],
          priority: 'Medium',
          estimatedComplexity: 'Medium',
          parentFeature: 'f10'
        }
      ]
    }
  ],

  // International Team Members
  teamMembers: [
    {
      id: 'tm1',
      name: 'James Mitchell',
      country: 'GB',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 25,
      skills: ['Treasury Management', 'Financial Systems', 'Risk Management', 'Leadership'],
      skillLevels: {
        'Treasury Management': 'Expert',
        'Financial Systems': 'Expert',
        'Risk Management': 'Advanced',
        'Leadership': 'Expert'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm2',
      name: '김민수 (Kim Min-su)',
      country: 'GB',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 20,
      skills: ['Backend Development', 'Financial Systems', 'API Development', 'Database Design'],
      skillLevels: {
        'Backend Development': 'Expert',
        'Financial Systems': 'Advanced',
        'API Development': 'Expert',
        'Database Design': 'Advanced'
      },
      preferences: {
        maxConcurrentItems: 3,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm3',
      name: 'Siti Rahayu',
      country: 'NL',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 25,
      skills: ['Frontend Development', 'Data Visualization', 'UI/UX Design', 'React'],
      skillLevels: {
        'Frontend Development': 'Expert',
        'Data Visualization': 'Advanced',
        'UI/UX Design': 'Expert',
        'React': 'Expert'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm4',
      name: '田中太郎 (Tanaka Taro)',
      country: 'ES',
      application: 'FIS',
      allocationPct: 80,
      ptoDays: 22,
      skills: ['Machine Learning', 'Financial Modeling', 'Data Science', 'Python'],
      skillLevels: {
        'Machine Learning': 'Expert',
        'Financial Modeling': 'Advanced',
        'Data Science': 'Expert',
        'Python': 'Expert'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 6
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm5',
      name: 'Li Wei (李伟)',
      country: 'NL',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 20,
      skills: ['Security', 'Authentication', 'Authorization', 'Backend Development'],
      skillLevels: {
        'Security': 'Expert',
        'Authentication': 'Expert',
        'Authorization': 'Advanced',
        'Backend Development': 'Advanced'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm6',
      name: 'Sarah Thompson',
      country: 'GB',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 25,
      skills: ['Regulatory Compliance', 'MiFID II', 'Basel III', 'Financial Reporting'],
      skillLevels: {
        'Regulatory Compliance': 'Expert',
        'MiFID II': 'Expert',
        'Basel III': 'Advanced',
        'Financial Reporting': 'Expert'
      },
      preferences: {
        maxConcurrentItems: 1,
        preferredItemTypes: ['Feature'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm7',
      name: 'Ahmad Wijaya',
      country: 'ES',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 22,
      skills: ['FX Trading', 'Trading Systems', 'Financial Markets', 'Real-time Systems'],
      skillLevels: {
        'FX Trading': 'Expert',
        'Trading Systems': 'Expert',
        'Financial Markets': 'Advanced',
        'Real-time Systems': 'Advanced'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm8',
      name: 'Yamamoto Yuki (山本由紀)',
      country: 'NL',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 20,
      skills: ['Mobile Development', 'React Native', 'UI/UX', 'Cross-platform'],
      skillLevels: {
        'Mobile Development': 'Expert',
        'React Native': 'Expert',
        'UI/UX': 'Advanced',
        'Cross-platform': 'Advanced'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm9',
      name: 'Chen Xiaoli (陈小丽)',
      country: 'GB',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 25,
      skills: ['Data Analytics', 'Business Intelligence', 'Report Building', 'SQL'],
      skillLevels: {
        'Data Analytics': 'Expert',
        'Business Intelligence': 'Advanced',
        'Report Building': 'Expert',
        'SQL': 'Expert'
      },
      preferences: {
        maxConcurrentItems: 3,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    {
      id: 'tm10',
      name: 'Marco Rodriguez',
      country: 'ES',
      application: 'FIS',
      allocationPct: 100,
      ptoDays: 22,
      skills: ['Workflow Automation', 'Business Process', 'Integration', 'Backend Development'],
      skillLevels: {
        'Workflow Automation': 'Advanced',
        'Business Process': 'Expert',
        'Integration': 'Advanced',
        'Backend Development': 'Advanced'
      },
      preferences: {
        maxConcurrentItems: 2,
        preferredItemTypes: ['Feature', 'Story'],
        maxDailyHours: 8
      },
      availability: {
        startDate: '2025-01-01',
        workingDays: [1, 2, 3, 4, 5]
      }
    }
  ],

  // National Holidays for NL, UK, ES (2025 & 2026)
  holidays: [
    // Netherlands 2025
    { id: 'h1', dateISO: '2025-01-01', name: 'New Year\'s Day', countries: ['NL'] },
    { id: 'h2', dateISO: '2025-04-18', name: 'Good Friday', countries: ['NL'] },
    { id: 'h3', dateISO: '2025-04-21', name: 'Easter Monday', countries: ['NL'] },
    { id: 'h4', dateISO: '2025-04-27', name: 'King\'s Day', countries: ['NL'] },
    { id: 'h5', dateISO: '2025-05-05', name: 'Liberation Day', countries: ['NL'] },
    { id: 'h6', dateISO: '2025-05-29', name: 'Ascension Day', countries: ['NL'] },
    { id: 'h7', dateISO: '2025-06-09', name: 'Whit Monday', countries: ['NL'] },
    { id: 'h8', dateISO: '2025-12-25', name: 'Christmas Day', countries: ['NL'] },
    { id: 'h9', dateISO: '2025-12-26', name: 'Boxing Day', countries: ['NL'] },

    // Netherlands 2026
    { id: 'h10', dateISO: '2026-01-01', name: 'New Year\'s Day', countries: ['NL'] },
    { id: 'h11', dateISO: '2026-04-03', name: 'Good Friday', countries: ['NL'] },
    { id: 'h12', dateISO: '2026-04-06', name: 'Easter Monday', countries: ['NL'] },
    { id: 'h13', dateISO: '2026-04-27', name: 'King\'s Day', countries: ['NL'] },
    { id: 'h14', dateISO: '2026-05-05', name: 'Liberation Day', countries: ['NL'] },
    { id: 'h15', dateISO: '2026-05-14', name: 'Ascension Day', countries: ['NL'] },
    { id: 'h16', dateISO: '2026-05-25', name: 'Whit Monday', countries: ['NL'] },
    { id: 'h17', dateISO: '2026-12-25', name: 'Christmas Day', countries: ['NL'] },
    { id: 'h18', dateISO: '2026-12-26', name: 'Boxing Day', countries: ['NL'] },

    // United Kingdom 2025
    { id: 'h19', dateISO: '2025-01-01', name: 'New Year\'s Day', countries: ['GB'] },
    { id: 'h20', dateISO: '2025-04-18', name: 'Good Friday', countries: ['GB'] },
    { id: 'h21', dateISO: '2025-04-21', name: 'Easter Monday', countries: ['GB'] },
    { id: 'h22', dateISO: '2025-05-05', name: 'Early May Bank Holiday', countries: ['GB'] },
    { id: 'h23', dateISO: '2025-05-26', name: 'Spring Bank Holiday', countries: ['GB'] },
    { id: 'h24', dateISO: '2025-08-25', name: 'Summer Bank Holiday', countries: ['GB'] },
    { id: 'h25', dateISO: '2025-12-25', name: 'Christmas Day', countries: ['GB'] },
    { id: 'h26', dateISO: '2025-12-26', name: 'Boxing Day', countries: ['GB'] },

    // United Kingdom 2026
    { id: 'h27', dateISO: '2026-01-01', name: 'New Year\'s Day', countries: ['GB'] },
    { id: 'h28', dateISO: '2026-04-03', name: 'Good Friday', countries: ['GB'] },
    { id: 'h29', dateISO: '2026-04-06', name: 'Easter Monday', countries: ['GB'] },
    { id: 'h30', dateISO: '2026-05-04', name: 'Early May Bank Holiday', countries: ['GB'] },
    { id: 'h31', dateISO: '2026-05-25', name: 'Spring Bank Holiday', countries: ['GB'] },
    { id: 'h32', dateISO: '2026-08-31', name: 'Summer Bank Holiday', countries: ['GB'] },
    { id: 'h33', dateISO: '2026-12-25', name: 'Christmas Day', countries: ['GB'] },
    { id: 'h34', dateISO: '2026-12-26', name: 'Boxing Day', countries: ['GB'] },

    // Spain 2025
    { id: 'h35', dateISO: '2025-01-01', name: 'New Year\'s Day', countries: ['ES'] },
    { id: 'h36', dateISO: '2025-01-06', name: 'Epiphany', countries: ['ES'] },
    { id: 'h37', dateISO: '2025-04-18', name: 'Good Friday', countries: ['ES'] },
    { id: 'h38', dateISO: '2025-05-01', name: 'Labour Day', countries: ['ES'] },
    { id: 'h39', dateISO: '2025-08-15', name: 'Assumption Day', countries: ['ES'] },
    { id: 'h40', dateISO: '2025-10-12', name: 'National Day', countries: ['ES'] },
    { id: 'h41', dateISO: '2025-11-01', name: 'All Saints\' Day', countries: ['ES'] },
    { id: 'h42', dateISO: '2025-12-06', name: 'Constitution Day', countries: ['ES'] },
    { id: 'h43', dateISO: '2025-12-08', name: 'Immaculate Conception', countries: ['ES'] },
    { id: 'h44', dateISO: '2025-12-25', name: 'Christmas Day', countries: ['ES'] },

    // Spain 2026
    { id: 'h45', dateISO: '2026-01-01', name: 'New Year\'s Day', countries: ['ES'] },
    { id: 'h46', dateISO: '2026-01-06', name: 'Epiphany', countries: ['ES'] },
    { id: 'h47', dateISO: '2026-04-03', name: 'Good Friday', countries: ['ES'] },
    { id: 'h48', dateISO: '2026-05-01', name: 'Labour Day', countries: ['ES'] },
    { id: 'h49', dateISO: '2026-08-15', name: 'Assumption Day', countries: ['ES'] },
    { id: 'h50', dateISO: '2026-10-12', name: 'National Day', countries: ['ES'] },
    { id: 'h51', dateISO: '2026-11-01', name: 'All Saints\' Day', countries: ['ES'] },
    { id: 'h52', dateISO: '2026-12-06', name: 'Constitution Day', countries: ['ES'] },
    { id: 'h53', dateISO: '2026-12-08', name: 'Immaculate Conception', countries: ['ES'] },
    { id: 'h54', dateISO: '2026-12-25', name: 'Christmas Day', countries: ['ES'] }
  ],

  // Settings
  settings: {
    certaintyMultipliers: {
      Low: 1.5,
      Mid: 1.2,
      High: 1.0
    },
    countries: [
      { code: 'NL', name: 'Netherlands' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'ES', name: 'Spain' }
    ],
    strictAppMatching: true
  }
}

// Export for use in the app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testData
} else {
  window.testData = testData
}
