/**
 * Unit tests for timeUtils
 */

import { describe, it, expect } from 'vitest'
import {
  HOURS_IN_DAY,
  DEGREES_PER_HOUR,
  MINUTES_PER_HOUR,
  DEGREES_PER_MINUTE,
  formatTime,
  hourToAngle,
  angleToHour,
  timeToAngle,
  angleToTime,
  calculateArcPath,
  calculateEventArcPath,
  getHourPosition,
  timeRangesOverlap,
  eventsOverlap,
  calculateDuration,
  calculateDurationInMinutes,
  getAllHours,
} from '../../src/lib/timeUtils.js'

describe('timeUtils', () => {
  describe('constants', () => {
    it('should have correct constants', () => {
      expect(HOURS_IN_DAY).toBe(24)
      expect(DEGREES_PER_HOUR).toBe(15)
      expect(MINUTES_PER_HOUR).toBe(60)
      expect(DEGREES_PER_MINUTE).toBe(0.25)
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(9, 30)).toBe('09:30')
      expect(formatTime(15, 45)).toBe('15:45')
      expect(formatTime(0, 0)).toBe('00:00')
      expect(formatTime(23, 59)).toBe('23:59')
    })

    it('should default minute to 0', () => {
      expect(formatTime(12)).toBe('12:00')
    })

    it('should pad single digits', () => {
      expect(formatTime(5, 5)).toBe('05:05')
    })
  })

  describe('hourToAngle', () => {
    it('should convert 0 hour to 0 degrees', () => {
      expect(hourToAngle(0)).toBe(0)
    })

    it('should convert 6 hours to 90 degrees', () => {
      expect(hourToAngle(6)).toBe(90)
    })

    it('should convert 12 hours to 180 degrees', () => {
      expect(hourToAngle(12)).toBe(180)
    })

    it('should convert 18 hours to 270 degrees', () => {
      expect(hourToAngle(18)).toBe(270)
    })

    it('should convert all 24 hours correctly', () => {
      for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
        expect(hourToAngle(hour)).toBe(hour * DEGREES_PER_HOUR)
      }
    })

    it('should handle negative hours', () => {
      expect(hourToAngle(-1)).toBe(345) // 23 * 15
      expect(hourToAngle(-6)).toBe(270) // 18 * 15
    })

    it('should handle hours > 24', () => {
      expect(hourToAngle(25)).toBe(15) // Same as hour 1
      expect(hourToAngle(30)).toBe(90) // Same as hour 6
    })
  })

  describe('angleToHour', () => {
    it('should convert 0 degrees to 0 hour', () => {
      expect(angleToHour(0)).toBe(0)
    })

    it('should convert 90 degrees to 6 hours', () => {
      expect(angleToHour(90)).toBe(6)
    })

    it('should convert 180 degrees to 12 hours', () => {
      expect(angleToHour(180)).toBe(12)
    })

    it('should convert 270 degrees to 18 hours', () => {
      expect(angleToHour(270)).toBe(18)
    })

    it('should handle negative angles', () => {
      expect(angleToHour(-15)).toBe(23)
      expect(angleToHour(-90)).toBe(18)
    })

    it('should handle angles > 360', () => {
      expect(angleToHour(375)).toBe(1) // 375 - 360 = 15
      expect(angleToHour(450)).toBe(6) // 450 - 360 = 90
    })
  })

  describe('hourToAngle and angleToHour round-trip', () => {
    it('should be reversible for all hours', () => {
      for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
        const angle = hourToAngle(hour)
        const backToHour = angleToHour(angle)
        expect(backToHour).toBe(hour)
      }
    })
  })

  describe('calculateArcPath', () => {
    it('should return a valid SVG path string', () => {
      const path = calculateArcPath(0, 1, 100, 200, 200, 0)
      expect(path).toMatch(/^M \d+\.?\d* \d+\.?\d* L \d+\.?\d* \d+\.?\d* A .* Z$/)
    })

    it('should create different paths for different hours', () => {
      const path1 = calculateArcPath(0, 1, 100, 200, 200, 0)
      const path2 = calculateArcPath(6, 7, 100, 200, 200, 0)
      expect(path1).not.toBe(path2)
    })

    it('should handle donut shape with inner radius', () => {
      const path = calculateArcPath(0, 1, 100, 200, 200, 50)
      // Donut shape has two arcs
      expect(path.split('A').length).toBe(3) // M ... A ... A ... Z
    })

    it('should handle large arcs (> 180 degrees)', () => {
      const path = calculateArcPath(0, 13, 100, 200, 200, 0)
      expect(path).toContain('1 1') // Large arc flag
    })
  })

  describe('getHourPosition', () => {
    it('should calculate position for hour 0 (top)', () => {
      const pos = getHourPosition(0, 100, 200, 200)
      expect(pos.x).toBeCloseTo(200, 1)
      expect(pos.y).toBeCloseTo(100, 1)
    })

    it('should calculate position for hour 6 (right)', () => {
      const pos = getHourPosition(6, 100, 200, 200)
      expect(pos.x).toBeCloseTo(300, 1)
      expect(pos.y).toBeCloseTo(200, 1)
    })

    it('should calculate position for hour 12 (bottom)', () => {
      const pos = getHourPosition(12, 100, 200, 200)
      expect(pos.x).toBeCloseTo(200, 1)
      expect(pos.y).toBeCloseTo(300, 1)
    })

    it('should calculate position for hour 18 (left)', () => {
      const pos = getHourPosition(18, 100, 200, 200)
      expect(pos.x).toBeCloseTo(100, 1)
      expect(pos.y).toBeCloseTo(200, 1)
    })
  })

  describe('timeRangesOverlap', () => {
    it('should detect overlap in simple cases', () => {
      expect(timeRangesOverlap(9, 12, 10, 13)).toBe(true)
      expect(timeRangesOverlap(9, 12, 11, 13)).toBe(true)
    })

    it('should detect no overlap', () => {
      expect(timeRangesOverlap(9, 12, 13, 15)).toBe(false)
      expect(timeRangesOverlap(9, 12, 12, 15)).toBe(false)
    })

    it('should handle adjacent ranges', () => {
      expect(timeRangesOverlap(9, 12, 12, 15)).toBe(false)
    })

    it('should handle ranges that cross midnight', () => {
      expect(timeRangesOverlap(22, 2, 23, 1)).toBe(true)
      expect(timeRangesOverlap(22, 2, 1, 3)).toBe(true)
      expect(timeRangesOverlap(22, 2, 3, 5)).toBe(false)
    })

    it('should handle same start and end times', () => {
      expect(timeRangesOverlap(9, 12, 9, 12)).toBe(true)
    })
  })

  describe('calculateDuration', () => {
    it('should calculate duration correctly', () => {
      expect(calculateDuration(9, 12)).toBe(3)
      expect(calculateDuration(0, 6)).toBe(6)
      expect(calculateDuration(18, 23)).toBe(5)
    })

    it('should handle duration across midnight', () => {
      expect(calculateDuration(22, 2)).toBe(4)
      expect(calculateDuration(23, 1)).toBe(2)
    })

    it('should handle same start and end time', () => {
      expect(calculateDuration(12, 12)).toBe(0)
    })
  })

  describe('getAllHours', () => {
    it('should return array of 24 hours', () => {
      const hours = getAllHours()
      expect(hours).toHaveLength(24)
      expect(hours[0]).toBe(0)
      expect(hours[23]).toBe(23)
    })

    it('should return consecutive numbers', () => {
      const hours = getAllHours()
      for (let i = 0; i < hours.length; i++) {
        expect(hours[i]).toBe(i)
      }
    })
  })

  describe('timeToAngle (minute precision)', () => {
    it('should convert time with minutes to angle', () => {
      expect(timeToAngle(0, 0)).toBe(0)
      expect(timeToAngle(0, 30)).toBe(7.5) // 30 * 0.25
      expect(timeToAngle(6, 0)).toBe(90)
      expect(timeToAngle(6, 30)).toBe(97.5) // 90 + 7.5
      expect(timeToAngle(12, 0)).toBe(180)
      expect(timeToAngle(23, 45)).toBe(356.25) // 23*15 + 45*0.25 = 345 + 11.25
    })

    it('should handle edge cases', () => {
      expect(timeToAngle(0, 15)).toBe(3.75)
      expect(timeToAngle(23, 59)).toBe(359.75)
      expect(timeToAngle(12, 30)).toBe(187.5)
    })

    it('should default minute to 0', () => {
      expect(timeToAngle(6)).toBe(90)
      expect(timeToAngle(12)).toBe(180)
    })

    it('should normalize hour values', () => {
      expect(timeToAngle(24, 0)).toBe(0) // Wraps to 0
      expect(timeToAngle(25, 30)).toBe(22.5) // Wraps to hour 1 (1*15 + 30*0.25 = 15 + 7.5)
      expect(timeToAngle(-1, 0)).toBe(345) // -1 hour = 23
    })

    it('should clamp minute values to valid range', () => {
      expect(timeToAngle(6, 30)).toBe(97.5)
      expect(timeToAngle(6, 59)).toBe(104.75)
      // Minutes > 59 should be clamped to 59
      expect(timeToAngle(6, 60)).toBe(104.75)
    })
  })

  describe('angleToTime (minute precision)', () => {
    it('should convert angle to time object', () => {
      expect(angleToTime(0)).toEqual({ hour: 0, minute: 0 })
      expect(angleToTime(7.5)).toEqual({ hour: 0, minute: 30 })
      expect(angleToTime(90)).toEqual({ hour: 6, minute: 0 })
      expect(angleToTime(97.5)).toEqual({ hour: 6, minute: 30 })
      expect(angleToTime(180)).toEqual({ hour: 12, minute: 0 })
      expect(angleToTime(356.25)).toEqual({ hour: 23, minute: 45 })
    })

    it('should handle edge cases', () => {
      expect(angleToTime(3.75)).toEqual({ hour: 0, minute: 15 })
      expect(angleToTime(359.75)).toEqual({ hour: 23, minute: 59 })
    })

    it('should normalize angles', () => {
      expect(angleToTime(360)).toEqual({ hour: 0, minute: 0 }) // Full circle
      expect(angleToTime(375)).toEqual({ hour: 1, minute: 0 }) // 360 + 15
      expect(angleToTime(-15)).toEqual({ hour: 23, minute: 0 }) // Negative
    })
  })

  describe('timeToAngle and angleToTime round-trip (minute precision)', () => {
    it('should be reversible for various times', () => {
      const testCases = [
        { hour: 0, minute: 0 },
        { hour: 6, minute: 30 },
        { hour: 12, minute: 15 },
        { hour: 18, minute: 45 },
        { hour: 23, minute: 59 }
      ]

      testCases.forEach(({ hour, minute }) => {
        const angle = timeToAngle(hour, minute)
        const result = angleToTime(angle)
        expect(result.hour).toBe(hour)
        expect(result.minute).toBe(minute)
      })
    })
  })

  describe('calculateEventArcPath (minute precision)', () => {
    it('should return a valid SVG path string', () => {
      const path = calculateEventArcPath(9, 30, 10, 45, 100, 200, 200, 0)
      expect(path).toMatch(/^M \d+\.?\d* \d+\.?\d* L \d+\.?\d* \d+\.?\d* A .* Z$/)
    })

    it('should create different paths for different times', () => {
      const path1 = calculateEventArcPath(9, 0, 10, 0, 100, 200, 200, 0)
      const path2 = calculateEventArcPath(9, 30, 10, 30, 100, 200, 200, 0)
      expect(path1).not.toBe(path2)
    })

    it('should handle donut shape with inner radius', () => {
      const path = calculateEventArcPath(9, 15, 10, 45, 100, 200, 200, 50)
      // Donut shape has two arcs
      expect(path.split('A').length).toBe(3) // M ... A ... A ... Z
    })

    it('should handle short events (< 1 hour)', () => {
      const path = calculateEventArcPath(9, 0, 9, 30, 100, 200, 200, 0)
      expect(path).toBeDefined()
      expect(path).toContain('M')
      expect(path).toContain('A')
    })

    it('should handle events crossing hour boundaries', () => {
      const path = calculateEventArcPath(9, 45, 10, 15, 100, 200, 200, 0)
      expect(path).toBeDefined()
    })
  })

  describe('eventsOverlap (minute precision)', () => {
    it('should detect overlap in simple cases', () => {
      const event1 = { startHour: 9, startMinute: 0, endHour: 10, endMinute: 0 }
      const event2 = { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 }
      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('should detect no overlap', () => {
      const event1 = { startHour: 9, startMinute: 0, endHour: 10, endMinute: 0 }
      const event2 = { startHour: 10, startMinute: 0, endHour: 11, endMinute: 0 }
      expect(eventsOverlap(event1, event2)).toBe(false)
    })

    it('should detect adjacent events (no overlap)', () => {
      const event1 = { startHour: 9, startMinute: 0, endHour: 10, endMinute: 0 }
      const event2 = { startHour: 10, startMinute: 0, endHour: 11, endMinute: 0 }
      expect(eventsOverlap(event1, event2)).toBe(false)
    })

    it('should handle minute-level adjacency', () => {
      const event1 = { startHour: 9, startMinute: 0, endHour: 9, endMinute: 30 }
      const event2 = { startHour: 9, startMinute: 30, endHour: 10, endMinute: 0 }
      expect(eventsOverlap(event1, event2)).toBe(false)
    })

    it('should detect overlap with minute precision', () => {
      const event1 = { startHour: 9, startMinute: 0, endHour: 9, endMinute: 45 }
      const event2 = { startHour: 9, startMinute: 30, endHour: 10, endMinute: 0 }
      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('should handle events crossing midnight', () => {
      const event1 = { startHour: 23, startMinute: 30, endHour: 0, endMinute: 30 }
      const event2 = { startHour: 23, startMinute: 45, endHour: 0, endMinute: 15 }
      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('should handle event1 crosses midnight, event2 does not', () => {
      const event1 = { startHour: 23, startMinute: 0, endHour: 1, endMinute: 0 }
      const event2 = { startHour: 0, startMinute: 30, endHour: 2, endMinute: 0 }
      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('should detect no overlap when event2 is after midnight event', () => {
      const event1 = { startHour: 23, startMinute: 0, endHour: 0, endMinute: 30 }
      const event2 = { startHour: 1, startMinute: 0, endHour: 2, endMinute: 0 }
      expect(eventsOverlap(event1, event2)).toBe(false)
    })

    it('should handle backward compatibility (no minutes)', () => {
      const event1 = { startHour: 9, startMinute: undefined, endHour: 10, endMinute: undefined }
      const event2 = { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 }
      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('should handle same event times', () => {
      const event1 = { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 }
      const event2 = { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 }
      expect(eventsOverlap(event1, event2)).toBe(true)
    })
  })

  describe('calculateDurationInMinutes', () => {
    it('should calculate duration in minutes', () => {
      expect(calculateDurationInMinutes(9, 0, 10, 0)).toBe(60)
      expect(calculateDurationInMinutes(9, 30, 10, 30)).toBe(60)
      expect(calculateDurationInMinutes(9, 0, 9, 30)).toBe(30)
      expect(calculateDurationInMinutes(9, 15, 10, 45)).toBe(90)
    })

    it('should handle duration across midnight', () => {
      expect(calculateDurationInMinutes(23, 30, 0, 30)).toBe(60)
      expect(calculateDurationInMinutes(23, 0, 1, 0)).toBe(120)
      expect(calculateDurationInMinutes(23, 45, 0, 15)).toBe(30)
    })

    it('should handle same start and end time', () => {
      expect(calculateDurationInMinutes(12, 30, 12, 30)).toBe(0)
    })

    it('should handle full day duration', () => {
      expect(calculateDurationInMinutes(0, 0, 23, 59)).toBe(1439)
    })

    it('should handle various durations', () => {
      expect(calculateDurationInMinutes(8, 0, 17, 0)).toBe(540) // 9 hours
      expect(calculateDurationInMinutes(10, 15, 11, 45)).toBe(90) // 1.5 hours
      expect(calculateDurationInMinutes(14, 30, 14, 35)).toBe(5) // 5 minutes
    })
  })
})
