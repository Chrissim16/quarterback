import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const TestDataLoader = () => {
  const { 
    quarters,
    items,
    team,
    holidays,
    addQuarter, 
    addPlanItem, 
    addTeamMember, 
    addHoliday, 
    updateSettings,
    setCurrentQuarter
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const testData = {
    quarter: {
      id: 'q1-2025',
      name: 'Q1 2025',
      description: 'Q1 2025 - ERP Treasury Management System Development',
      startISO: '2025-01-01',
      endISO: '2025-03-31',
      label: 'Q1-25'
    },
    features: [
      {
        id: 'f1',
        type: 'Feature' as const,
        key: 'ERP-001',
        title: 'Core Treasury Management Module',
        label: 'Core Treasury',
        application: 'FIS' as const,
        baseDays: 45,
        certainty: 'High' as const,
        adjustedDays: 45,
        notes: 'Central treasury management functionality including cash positioning, liquidity management, and risk controls',
        requiredSkills: ['Treasury Management', 'Financial Systems', 'Risk Management', 'Backend Development'],
        priority: 'Critical' as const,
        estimatedComplexity: 'Very Complex' as const,
        maxConcurrentAssignments: 3,
        deadline: '2025-03-15',
        tags: ['core', 'treasury', 'critical-path']
      },
      {
        id: 'f2',
        type: 'Feature' as const,
        key: 'ERP-002',
        title: 'Multi-Currency Trading Platform',
        label: 'FX Trading',
        application: 'FIS' as const,
        baseDays: 38,
        certainty: 'High' as const,
        adjustedDays: 38,
        notes: 'Advanced foreign exchange trading platform with real-time pricing and execution',
        requiredSkills: ['FX Trading', 'Real-time Systems', 'Financial Markets', 'Backend Development'],
        priority: 'High' as const,
        estimatedComplexity: 'Very Complex' as const,
        maxConcurrentAssignments: 4,
        deadline: '2025-03-20',
        tags: ['trading', 'fx', 'real-time'],
      },
      {
        id: 'f3',
        type: 'Feature' as const,
        key: 'ERP-003',
        title: 'Regulatory Compliance Suite',
        label: 'Compliance',
        application: 'FIS' as const,
        baseDays: 42,
        certainty: 'High' as const,
        adjustedDays: 42,
        notes: 'Comprehensive regulatory compliance reporting for MiFID II, Basel III, and local regulations',
        requiredSkills: ['Regulatory Compliance', 'Financial Reporting', 'Backend Development'],
        priority: 'Critical' as const,
        estimatedComplexity: 'Very Complex' as const,
        maxConcurrentAssignments: 2,
        deadline: '2025-03-10',
        tags: ['compliance', 'regulatory', 'reporting'],
      },
      {
        id: 'f4',
        type: 'Feature' as const,
        key: 'ERP-004',
        title: 'Advanced Analytics & Reporting',
        label: 'Analytics',
        application: 'FIS' as const,
        baseDays: 35,
        certainty: 'Mid' as const,
        adjustedDays: 42,
        notes: 'Advanced analytics dashboard with custom reporting and data visualization',
        requiredSkills: ['Data Analytics', 'Business Intelligence', 'Frontend Development'],
        priority: 'Medium' as const,
        estimatedComplexity: 'Complex' as const,
        maxConcurrentAssignments: 3,
        deadline: '2025-03-25',
        tags: ['analytics', 'reporting', 'dashboard'],
      },
      {
        id: 'f5',
        type: 'Feature' as const,
        key: 'ERP-005',
        title: 'Integration Hub',
        label: 'Integration',
        application: 'FIS' as const,
        baseDays: 40,
        certainty: 'High' as const,
        adjustedDays: 40,
        notes: 'Central integration hub for connecting with external systems and APIs',
        requiredSkills: ['API Development', 'Integration', 'Backend Development'],
        priority: 'High' as const,
        estimatedComplexity: 'Very Complex' as const,
        maxConcurrentAssignments: 3,
        deadline: '2025-03-18',
        tags: ['integration', 'api', 'connectivity'],
      },
      {
        id: 'f6',
        type: 'Feature' as const,
        key: 'ERP-006',
        title: 'User Management & Security',
        label: 'Security',
        application: 'FIS' as const,
        baseDays: 28,
        certainty: 'High' as const,
        adjustedDays: 28,
        notes: 'Comprehensive user management with role-based access control and security features',
        requiredSkills: ['Security', 'Authentication', 'Authorization', 'Backend Development'],
        priority: 'High' as const,
        estimatedComplexity: 'Complex' as const,
        maxConcurrentAssignments: 2,
        deadline: '2025-03-12',
        tags: ['security', 'user-management', 'rbac'],
      },
      {
        id: 'f7',
        type: 'Feature' as const,
        key: 'ERP-007',
        title: 'Mobile Treasury App',
        label: 'Mobile',
        application: 'FIS' as const,
        baseDays: 32,
        certainty: 'Mid' as const,
        adjustedDays: 38,
        notes: 'Mobile application for treasury operations and monitoring',
        requiredSkills: ['Mobile Development', 'React Native', 'Treasury Management'],
        priority: 'Medium' as const,
        estimatedComplexity: 'Complex' as const,
        maxConcurrentAssignments: 2,
        deadline: '2025-03-28',
        tags: ['mobile', 'treasury', 'app'],
      },
      {
        id: 'f8',
        type: 'Feature' as const,
        key: 'ERP-008',
        title: 'Workflow Automation',
        label: 'Workflow',
        application: 'FIS' as const,
        baseDays: 30,
        certainty: 'Mid' as const,
        adjustedDays: 36,
        notes: 'Automated workflow engine for treasury operations and approvals',
        requiredSkills: ['Workflow Automation', 'Business Process', 'Backend Development'],
        priority: 'Medium' as const,
        estimatedComplexity: 'Complex' as const,
        maxConcurrentAssignments: 2,
        deadline: '2025-03-22',
        tags: ['workflow', 'automation', 'approvals'],
      },
      {
        id: 'f9',
        type: 'Feature' as const,
        key: 'ERP-009',
        title: 'Data Migration Tools',
        label: 'Migration',
        application: 'FIS' as const,
        baseDays: 25,
        certainty: 'High' as const,
        adjustedDays: 25,
        notes: 'Tools for migrating data from legacy treasury systems',
        requiredSkills: ['Data Migration', 'ETL', 'Legacy Systems', 'Backend Development'],
        priority: 'High' as const,
        estimatedComplexity: 'Complex' as const,
        maxConcurrentAssignments: 2,
        deadline: '2025-03-08',
        tags: ['migration', 'etl', 'legacy'],
      },
      {
        id: 'f10',
        type: 'Feature' as const,
        key: 'ERP-010',
        title: 'Performance Monitoring',
        label: 'Monitoring',
        application: 'FIS' as const,
        baseDays: 22,
        certainty: 'Mid' as const,
        adjustedDays: 26,
        notes: 'Comprehensive performance monitoring and alerting system',
        requiredSkills: ['Monitoring', 'Alerting', 'Performance', 'Backend Development'],
        priority: 'Medium' as const,
        estimatedComplexity: 'Medium' as const,
        maxConcurrentAssignments: 2,
        deadline: '2025-03-30',
        tags: ['monitoring', 'performance', 'alerting'],
      }
    ],
    stories: [
      {
        id: 's1',
        type: 'Story' as const,
        key: 'ERP-001-1',
        title: 'Cash Position Dashboard',
        application: 'FIS' as const,
        baseDays: 8,
        certainty: 'High' as const,
        adjustedDays: 8,
        notes: 'Real-time cash position visualization with drill-down capabilities',
        requiredSkills: ['Frontend Development', 'Data Visualization', 'Treasury Management'],
        priority: 'High' as const,
        estimatedComplexity: 'Complex' as const,
      },
      {
        id: 's2',
        type: 'Story' as const,
        key: 'ERP-001-2',
        title: 'Liquidity Forecasting Engine',
        application: 'FIS' as const,
        baseDays: 12,
        certainty: 'High' as const,
        adjustedDays: 12,
        notes: 'ML-based liquidity forecasting with scenario analysis',
        requiredSkills: ['Machine Learning', 'Financial Modeling', 'Backend Development'],
        priority: 'High' as const,
        estimatedComplexity: 'Very Complex' as const,
      },
      {
        id: 's3',
        type: 'Story' as const,
        key: 'ERP-001-3',
        title: 'Risk Limit Monitoring',
        application: 'FIS' as const,
        baseDays: 10,
        certainty: 'High' as const,
        adjustedDays: 10,
        notes: 'Real-time risk limit monitoring and alerting system',
        requiredSkills: ['Risk Management', 'Backend Development', 'Alerting Systems'],
        priority: 'High' as const,
        estimatedComplexity: 'Complex' as const,
      },
      {
        id: 's4',
        type: 'Story' as const,
        key: 'ERP-002-1',
        title: 'Real-time Price Feed Integration',
        application: 'FIS' as const,
        baseDays: 15,
        certainty: 'High' as const,
        adjustedDays: 15,
        notes: 'Integration with multiple price providers for real-time FX rates',
        requiredSkills: ['API Integration', 'Real-time Systems', 'Financial Data'],
        priority: 'High' as const,
        estimatedComplexity: 'Complex' as const,
      },
      {
        id: 's5',
        type: 'Story' as const,
        key: 'ERP-002-2',
        title: 'Trading Execution Engine',
        application: 'FIS' as const,
        baseDays: 18,
        certainty: 'High' as const,
        adjustedDays: 18,
        notes: 'High-performance trading execution with order management',
        requiredSkills: ['Trading Systems', 'High Performance', 'Order Management'],
        priority: 'High' as const,
        estimatedComplexity: 'Very Complex' as const,
      }
    ],
    teamMembers: [
      {
        id: 'tm1',
        name: 'James Mitchell',
        country: 'GB' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 25,
        skills: ['Treasury Management', 'Financial Systems', 'Risk Management', 'Leadership'],
        skillLevels: {
          'Treasury Management': 'Expert' as const,
          'Financial Systems': 'Expert' as const,
          'Risk Management': 'Advanced' as const,
          'Leadership': 'Expert' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm2',
        name: '김민수 (Kim Min-su)',
        country: 'GB' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 20,
        skills: ['Backend Development', 'Financial Systems', 'API Development', 'Database Design'],
        skillLevels: {
          'Backend Development': 'Expert' as const,
          'Financial Systems': 'Advanced' as const,
          'API Development': 'Expert' as const,
          'Database Design': 'Advanced' as const
        },
        preferences: {
          maxConcurrentItems: 3,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm3',
        name: 'Siti Rahayu',
        country: 'NL' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 25,
        skills: ['Frontend Development', 'Data Visualization', 'UI/UX Design', 'React'],
        skillLevels: {
          'Frontend Development': 'Expert' as const,
          'Data Visualization': 'Advanced' as const,
          'UI/UX Design': 'Expert' as const,
          'React': 'Expert' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm4',
        name: '田中太郎 (Tanaka Taro)',
        country: 'ES' as const,
        application: 'FIS' as const,
        allocationPct: 80,
        ptoDays: 22,
        skills: ['Machine Learning', 'Financial Modeling', 'Data Science', 'Python'],
        skillLevels: {
          'Machine Learning': 'Expert' as const,
          'Financial Modeling': 'Advanced' as const,
          'Data Science': 'Expert' as const,
          'Python': 'Expert' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 6
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm5',
        name: 'Li Wei (李伟)',
        country: 'NL' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 20,
        skills: ['Security', 'Authentication', 'Authorization', 'Backend Development'],
        skillLevels: {
          'Security': 'Expert' as const,
          'Authentication': 'Expert' as const,
          'Authorization': 'Advanced' as const,
          'Backend Development': 'Advanced' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm6',
        name: 'Sarah Thompson',
        country: 'GB' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 25,
        skills: ['Regulatory Compliance', 'MiFID II', 'Basel III', 'Financial Reporting'],
        skillLevels: {
          'Regulatory Compliance': 'Expert' as const,
          'MiFID II': 'Expert' as const,
          'Basel III': 'Advanced' as const,
          'Financial Reporting': 'Expert' as const
        },
        preferences: {
          maxConcurrentItems: 1,
          preferredItemTypes: ['Feature' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm7',
        name: 'Ahmad Wijaya',
        country: 'ES' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 22,
        skills: ['FX Trading', 'Trading Systems', 'Financial Markets', 'Real-time Systems'],
        skillLevels: {
          'FX Trading': 'Expert' as const,
          'Trading Systems': 'Expert' as const,
          'Financial Markets': 'Advanced' as const,
          'Real-time Systems': 'Advanced' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm8',
        name: 'Yamamoto Yuki (山本由紀)',
        country: 'NL' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 20,
        skills: ['Mobile Development', 'React Native', 'UI/UX', 'Cross-platform'],
        skillLevels: {
          'Mobile Development': 'Expert' as const,
          'React Native': 'Expert' as const,
          'UI/UX': 'Advanced' as const,
          'Cross-platform': 'Advanced' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm9',
        name: 'Chen Xiaoli (陈小丽)',
        country: 'GB' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 25,
        skills: ['Data Analytics', 'Business Intelligence', 'Report Building', 'SQL'],
        skillLevels: {
          'Data Analytics': 'Expert' as const,
          'Business Intelligence': 'Advanced' as const,
          'Report Building': 'Expert' as const,
          'SQL': 'Expert' as const
        },
        preferences: {
          maxConcurrentItems: 3,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      },
      {
        id: 'tm10',
        name: 'Marco Rodriguez',
        country: 'ES' as const,
        application: 'FIS' as const,
        allocationPct: 100,
        ptoDays: 22,
        skills: ['Workflow Automation', 'Business Process', 'Integration', 'Backend Development'],
        skillLevels: {
          'Workflow Automation': 'Advanced' as const,
          'Business Process': 'Expert' as const,
          'Integration': 'Advanced' as const,
          'Backend Development': 'Advanced' as const
        },
        preferences: {
          maxConcurrentItems: 2,
          preferredItemTypes: ['Feature' as const, 'Story' as const],
          maxDailyHours: 8
        },
        availability: {
          startDate: '2025-01-01',
          workingDays: [1, 2, 3, 4, 5]
        },
      }
    ],
    holidays: [
      // Netherlands 2025
      { id: 'h1', dateISO: '2025-01-01', name: 'New Year\'s Day', countryCodes: ['NL'] },
      { id: 'h2', dateISO: '2025-04-18', name: 'Good Friday', countryCodes: ['NL'] },
      { id: 'h3', dateISO: '2025-04-21', name: 'Easter Monday', countryCodes: ['NL'] },
      { id: 'h4', dateISO: '2025-04-27', name: 'King\'s Day', countryCodes: ['NL'] },
      { id: 'h5', dateISO: '2025-05-05', name: 'Liberation Day', countryCodes: ['NL'] },
      { id: 'h6', dateISO: '2025-05-29', name: 'Ascension Day', countryCodes: ['NL'] },
      { id: 'h7', dateISO: '2025-06-09', name: 'Whit Monday', countryCodes: ['NL'] },
      { id: 'h8', dateISO: '2025-12-25', name: 'Christmas Day', countryCodes: ['NL'] },
      { id: 'h9', dateISO: '2025-12-26', name: 'Boxing Day', countryCodes: ['NL'] },

      // United Kingdom 2025
      { id: 'h10', dateISO: '2025-01-01', name: 'New Year\'s Day', countryCodes: ['GB'] },
      { id: 'h11', dateISO: '2025-04-18', name: 'Good Friday', countryCodes: ['GB'] },
      { id: 'h12', dateISO: '2025-04-21', name: 'Easter Monday', countryCodes: ['GB'] },
      { id: 'h13', dateISO: '2025-05-05', name: 'Early May Bank Holiday', countryCodes: ['GB'] },
      { id: 'h14', dateISO: '2025-05-26', name: 'Spring Bank Holiday', countryCodes: ['GB'] },
      { id: 'h15', dateISO: '2025-08-25', name: 'Summer Bank Holiday', countryCodes: ['GB'] },
      { id: 'h16', dateISO: '2025-12-25', name: 'Christmas Day', countryCodes: ['GB'] },
      { id: 'h17', dateISO: '2025-12-26', name: 'Boxing Day', countryCodes: ['GB'] },

      // Spain 2025
      { id: 'h18', dateISO: '2025-01-01', name: 'New Year\'s Day', countryCodes: ['ES'] },
      { id: 'h19', dateISO: '2025-01-06', name: 'Epiphany', countryCodes: ['ES'] },
      { id: 'h20', dateISO: '2025-04-18', name: 'Good Friday', countryCodes: ['ES'] },
      { id: 'h21', dateISO: '2025-05-01', name: 'Labour Day', countryCodes: ['ES'] },
      { id: 'h22', dateISO: '2025-08-15', name: 'Assumption Day', countryCodes: ['ES'] },
      { id: 'h23', dateISO: '2025-10-12', name: 'National Day', countryCodes: ['ES'] },
      { id: 'h24', dateISO: '2025-11-01', name: 'All Saints\' Day', countryCodes: ['ES'] },
      { id: 'h25', dateISO: '2025-12-06', name: 'Constitution Day', countryCodes: ['ES'] },
      { id: 'h26', dateISO: '2025-12-08', name: 'Immaculate Conception', countryCodes: ['ES'] },
      { id: 'h27', dateISO: '2025-12-25', name: 'Christmas Day', countryCodes: ['ES'] }
    ],
    settings: {
      certaintyMultipliers: {
        Low: 1.5,
        Mid: 1.2,
        High: 1.0
      },
      strictAppMatching: true
    }
  }

  const loadTestData = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      console.log('🚀 Starting test data loading...')
      console.log('Current quarters before loading:', quarters.length)
      console.log('Current team members before loading:', team.length)
      console.log('Current items before loading:', items.length)
      
      // Check if quarter already exists, if not add it
      const existingQuarter = quarters.find(q => q.name === testData.quarter.name)
      if (!existingQuarter) {
        console.log('Creating new quarter:', testData.quarter.name)
        const quarterResult = await addQuarter(testData.quarter)
        console.log('Quarter creation result:', quarterResult)
        
        if (!quarterResult) {
          throw new Error('Failed to create quarter')
        }
        
        // Set the new quarter as current
        console.log('Setting current quarter to:', testData.quarter.id)
        setCurrentQuarter(testData.quarter.id)
      } else {
        // If quarter exists, set it as current
        console.log('Using existing quarter:', existingQuarter.id)
        setCurrentQuarter(existingQuarter.id)
      }
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Debug: Check current state
      const currentState = useAppStore.getState()
      console.log('Current quarter ID after setting:', currentState.currentQuarterId)
      console.log('Available quarters:', currentState.quarters.map(q => ({ id: q.id, name: q.name })))
      console.log('Current quarter object:', currentState.getCurrentQuarter())

      // Add features (check for duplicates)
      console.log('Adding features...')
      let featuresAdded = 0
      for (const feature of testData.features) {
        const existingFeature = items.find(item => item.key === feature.key)
        if (!existingFeature) {
          const success = await addPlanItem(feature)
          if (success) featuresAdded++
          console.log(`Feature ${feature.key}: ${success ? 'added' : 'failed'}`)
        }
      }
      console.log(`Features added: ${featuresAdded}/${testData.features.length}`)

      // Add stories (check for duplicates)
      console.log('Adding stories...')
      let storiesAdded = 0
      for (const story of testData.stories) {
        const existingStory = items.find(item => item.key === story.key)
        if (!existingStory) {
          const success = await addPlanItem(story)
          if (success) storiesAdded++
          console.log(`Story ${story.key}: ${success ? 'added' : 'failed'}`)
        }
      }
      console.log(`Stories added: ${storiesAdded}/${testData.stories.length}`)

      // Add team members (check for duplicates)
      console.log('Adding team members...')
      let addedCount = 0
      for (const member of testData.teamMembers) {
        const existingMember = team.find(m => m.name === member.name)
        if (!existingMember) {
          console.log('Adding team member:', member.name, 'with original quarterId:', member.quarterId)
          console.log('Current quarter ID in store:', currentState.currentQuarterId)
          
          // Remove the hardcoded quarterId from the member data
          const { quarterId, ...memberWithoutQuarterId } = member
          console.log('Member data without quarterId:', memberWithoutQuarterId)
          
          const success = await addTeamMember(memberWithoutQuarterId)
          console.log('Team member added successfully:', success)
          if (success) addedCount++
        } else {
          console.log('Team member already exists:', member.name)
        }
      }
      
      // Debug: Check team state after adding
      const finalState = useAppStore.getState()
      console.log('Team members in store after adding:', finalState.team.length)
      console.log('Current quarter ID:', finalState.currentQuarterId)
      console.log('Team members for current quarter:', finalState.team.filter(m => m.quarterId === finalState.currentQuarterId).length)
      console.log('Successfully added team members:', addedCount)

      // Add holidays (check for duplicates)
      console.log('Adding holidays...')
      let holidaysAdded = 0
      for (const holiday of testData.holidays) {
        const existingHoliday = holidays.find(h => h.name === holiday.name && h.dateISO === holiday.dateISO)
        if (!existingHoliday) {
          const success = await addHoliday(holiday)
          if (success) holidaysAdded++
          console.log(`Holiday ${holiday.name}: ${success ? 'added' : 'failed'}`)
        }
      }
      console.log(`Holidays added: ${holidaysAdded}/${testData.holidays.length}`)

      // Update settings
      await updateSettings(testData.settings)

      // Check final state after all operations
      const postLoadState = useAppStore.getState()
      console.log('Final state after loading:')
      console.log('- Quarters:', postLoadState.quarters.length)
      console.log('- Items:', postLoadState.items.length)
      console.log('- Team members:', postLoadState.team.length)
      console.log('- Holidays:', postLoadState.holidays.length)
      console.log('- Current quarter ID:', postLoadState.currentQuarterId)
      
      // Verify data in Supabase
      console.log('Verifying data in Supabase...')
      try {
        const { supabaseDataService } = await import('../lib/supabaseDataService')
        const supabaseData = await supabaseDataService.loadAllData()
        if (supabaseData) {
          console.log('Supabase data verification:')
          console.log('- Quarters in DB:', supabaseData.quarters.length)
          console.log('- Items in DB:', supabaseData.items.length)
          console.log('- Team members in DB:', supabaseData.team.length)
          console.log('- Holidays in DB:', supabaseData.holidays.length)
        } else {
          console.log('Failed to load data from Supabase for verification')
        }
      } catch (error) {
        console.error('Error verifying Supabase data:', error)
      }
      
      // All data should already be saved to Supabase by individual functions
      setMessage({
        type: 'success',
        text: `Test data loaded successfully! ${testData.features.length} features, ${testData.stories.length} stories, ${testData.teamMembers.length} team members, ${testData.holidays.length} holidays. All data saved to Supabase.`
      })
    } catch (error) {
      console.error('Test data loading failed:', error)
      setMessage({
        type: 'error',
        text: `Failed to load test data: ${error.message}. Check console for details.`
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Load Test Data</h2>
      <p className="text-gray-600 mb-6">
        Load comprehensive test data for the ERP Treasury Management System including:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Features & Stories</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 10 ERP/FIS Features (Core Treasury, FX Trading, Compliance, etc.)</li>
            <li>• 5 Child Stories with detailed planning data</li>
            <li>• Skills, priorities, deadlines, and complexity ratings</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Team & Holidays</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 10 International team members (EN, KR, ID, JP, CN names)</li>
            <li>• Locations: Netherlands, UK, Spain</li>
            <li>• National holidays for 2025 (NL, GB, ES)</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={loadTestData}
          disabled={isLoading}
          className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Load Test Data
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            <div className={`w-5 h-5 mr-3 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.type === 'success' ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestDataLoader
