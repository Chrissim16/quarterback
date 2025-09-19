import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { workingDaysBetween } from '../lib/dates'
import type { TeamMember, Holiday, QuarterWithId } from '../types'

export interface CapacityDetails {
  workingDays: number
  allocationPct: number
  ptoDays: number
  publicHolidayDays: number
}

export interface MemberCapacity {
  memberId: string
  name: string
  application?: string
  capacityDays: number
  details: CapacityDetails
}

export interface CapacityData {
  totalWorkingDays: number
  perMember: MemberCapacity[]
}

/**
 * Calculate public holidays that apply to a specific member
 * A holiday applies if:
 * - It has no countries (global holiday), OR
 * - The member has a country and the holiday includes that country
 */
const getPublicHolidaysForMember = (
  holidays: Holiday[],
  member: TeamMember,
  quarter: QuarterWithId
): Holiday[] => {
  return holidays.filter(holiday => {
    // Check if holiday is within the quarter
    const holidayDate = new Date(holiday.dateISO)
    const quarterStart = new Date(quarter.startISO)
    const quarterEnd = new Date(quarter.endISO)
    
    if (holidayDate < quarterStart || holidayDate > quarterEnd) {
      return false
    }

    // Global holiday (no countries specified)
    if (holiday.countries.length === 0) {
      return true
    }

    // Member has no country specified
    if (!member.country) {
      return false
    }

    // Check if member's country is in the holiday's countries list
    return holiday.countries.includes(member.country)
  })
}

/**
 * Calculate capacity for a single team member
 */
const calculateMemberCapacity = (
  member: TeamMember,
  holidays: Holiday[],
  quarter: QuarterWithId,
  totalWorkingDays: number
): MemberCapacity => {
  const allocationPct = member.allocationPct || 0
  const ptoDays = member.ptoDays || 0
  
  // Get public holidays that apply to this member
  const applicableHolidays = getPublicHolidaysForMember(holidays, member, quarter)
  const publicHolidayDays = applicableHolidays.length

  // Calculate capacity: (WorkingDays * Allocation%) - PTO - PublicHolidays
  const capacityDays = Math.max(0, 
    (totalWorkingDays * (allocationPct / 100)) - ptoDays - publicHolidayDays
  )

  return {
    memberId: member.id,
    name: member.name,
    application: member.application,
    capacityDays: Math.round(capacityDays * 100) / 100, // Round to 2 decimal places
    details: {
      workingDays: totalWorkingDays,
      allocationPct,
      ptoDays,
      publicHolidayDays,
    },
  }
}

/**
 * Hook to calculate team capacity
 */
export const useCapacity = (): CapacityData => {
  const { team, holidays, getCurrentQuarter } = useAppStore()
  const currentQuarter = getCurrentQuarter()

  return useMemo(() => {
    if (!currentQuarter) {
      return {
        totalWorkingDays: 0,
        perMember: [],
      }
    }

    // Calculate total working days in the quarter
    const totalWorkingDays = workingDaysBetween(
      currentQuarter.startISO,
      currentQuarter.endISO
    )

    // Calculate capacity for each team member
    const perMember = team.map(member =>
      calculateMemberCapacity(member, holidays, currentQuarter, totalWorkingDays)
    )

    return {
      totalWorkingDays,
      perMember,
    }
  }, [team, holidays, currentQuarter])
}



