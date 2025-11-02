/**
 * Time Utilities
 * Helper functions for time calculations and formatting
 */

/** @constant {number} Total hours in a day */
export const HOURS_IN_DAY = 24

/** @constant {number} Degrees per hour in a 24-hour circle */
export const DEGREES_PER_HOUR = 360 / HOURS_IN_DAY // 15 degrees

/** @constant {number} Minutes per hour */
export const MINUTES_PER_HOUR = 60

/** @constant {number} Degrees per minute in a 24-hour circle */
export const DEGREES_PER_MINUTE = DEGREES_PER_HOUR / MINUTES_PER_HOUR // 0.25 degrees

/**
 * Get the current hour (0-23)
 * @returns {number} Current hour in 24-hour format
 */
export function getCurrentHour() {
  return new Date().getHours()
}

/**
 * Get the current minute (0-59)
 * @returns {number} Current minute
 */
export function getCurrentMinute() {
  return new Date().getMinutes()
}

/**
 * Format time as HH:MM
 * @param {number} hour - Hour (0-23)
 * @param {number} [minute=0] - Minute (0-59)
 * @returns {string} Formatted time string (e.g., "09:30")
 */
export function formatTime(hour, minute = 0) {
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Format date as readable string
 * @param {Date} [date=new Date()] - Date object
 * @returns {string} Formatted date string (e.g., "Monday, January 1, 2024")
 */
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Convert hour to angle in degrees
 * 0° is at the top (12 o'clock position)
 * Angles increase clockwise
 * @param {number} hour - Hour (0-23)
 * @returns {number} Angle in degrees (0-360)
 */
export function hourToAngle(hour) {
  // Normalize hour to 0-23 range
  const normalizedHour = ((hour % HOURS_IN_DAY) + HOURS_IN_DAY) % HOURS_IN_DAY
  // Calculate angle (0° at top, clockwise)
  return normalizedHour * DEGREES_PER_HOUR
}

/**
 * Convert angle to hour
 * @param {number} angle - Angle in degrees (0-360)
 * @returns {number} Hour (0-23)
 */
export function angleToHour(angle) {
  // Normalize angle to 0-360 range
  const normalizedAngle = ((angle % 360) + 360) % 360
  // Calculate hour
  const hour = Math.floor(normalizedAngle / DEGREES_PER_HOUR)
  return hour % HOURS_IN_DAY
}

/**
 * Calculate SVG arc path for a time segment
 * Creates a circular arc segment for visualization
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @param {number} radius - Radius of the circle
 * @param {number} centerX - X coordinate of circle center
 * @param {number} centerY - Y coordinate of circle center
 * @param {number} [innerRadius=0] - Inner radius for donut shape (0 for pie)
 * @returns {string} SVG path data
 */
export function calculateArcPath(
  startHour,
  endHour,
  radius,
  centerX,
  centerY,
  innerRadius = 0
) {
  const startAngle = hourToAngle(startHour)
  const endAngle = hourToAngle(endHour)

  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180

  // Calculate outer arc points
  const x1 = centerX + radius * Math.sin(startRad)
  const y1 = centerY - radius * Math.cos(startRad)
  const x2 = centerX + radius * Math.sin(endRad)
  const y2 = centerY - radius * Math.cos(endRad)

  // Determine if arc is larger than 180 degrees
  let angleDiff = endAngle - startAngle
  if (angleDiff < 0) angleDiff += 360
  const largeArc = angleDiff > 180 ? 1 : 0

  if (innerRadius === 0) {
    // Pie slice (with center point)
    return [
      `M ${centerX} ${centerY}`, // Move to center
      `L ${x1} ${y1}`, // Line to start of arc
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Arc
      'Z' // Close path
    ].join(' ')
  } else {
    // Donut segment
    const x3 = centerX + innerRadius * Math.sin(endRad)
    const y3 = centerY - innerRadius * Math.cos(endRad)
    const x4 = centerX + innerRadius * Math.sin(startRad)
    const y4 = centerY - innerRadius * Math.cos(startRad)

    return [
      `M ${x1} ${y1}`, // Move to start of outer arc
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Outer arc
      `L ${x3} ${y3}`, // Line to inner arc
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`, // Inner arc (reverse)
      'Z' // Close path
    ].join(' ')
  }
}

/**
 * Calculate position on circle for a given hour
 * @param {number} hour - Hour (0-23)
 * @param {number} radius - Radius of the circle
 * @param {number} centerX - X coordinate of circle center
 * @param {number} centerY - Y coordinate of circle center
 * @returns {{x: number, y: number}} Position coordinates
 */
export function getHourPosition(hour, radius, centerX, centerY) {
  const angle = hourToAngle(hour)
  const rad = (angle * Math.PI) / 180

  return {
    x: centerX + radius * Math.sin(rad),
    y: centerY - radius * Math.cos(rad)
  }
}

/**
 * Check if a time range overlaps with another
 * @param {number} start1 - Start hour of first range
 * @param {number} end1 - End hour of first range
 * @param {number} start2 - Start hour of second range
 * @param {number} end2 - End hour of second range
 * @returns {boolean} True if ranges overlap
 */
export function timeRangesOverlap(start1, end1, start2, end2) {
  // Handle ranges that cross midnight by checking if they overlap
  // in the normalized 24-hour space or in the wrapped space

  // Check if range crosses midnight
  const range1CrossesMidnight = end1 < start1
  const range2CrossesMidnight = end2 < start2

  // If neither crosses midnight, simple check
  if (!range1CrossesMidnight && !range2CrossesMidnight) {
    return start1 < end2 && start2 < end1
  }

  // If range1 crosses midnight (e.g., 22-2)
  if (range1CrossesMidnight && !range2CrossesMidnight) {
    // Range1 is either [start1, 24) or [0, end1)
    return start2 < end1 || start1 < end2
  }

  // If range2 crosses midnight
  if (!range1CrossesMidnight && range2CrossesMidnight) {
    // Range2 is either [start2, 24) or [0, end2)
    return start1 < end2 || start2 < end1
  }

  // Both cross midnight - they always overlap
  return true
}

/**
 * Calculate duration in hours between two times
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @returns {number} Duration in hours
 */
export function calculateDuration(startHour, endHour) {
  let duration = endHour - startHour
  if (duration < 0) {
    duration += HOURS_IN_DAY
  }
  return duration
}

/**
 * Get an array of all hours in a day
 * @returns {number[]} Array of hours [0, 1, 2, ..., 23]
 */
export function getAllHours() {
  return Array.from({ length: HOURS_IN_DAY }, (_, i) => i)
}

/**
 * Convert time (hour + minute) to angle in degrees
 * 0° is at the top (12 o'clock position)
 * Angles increase clockwise
 * @param {number} hour - Hour (0-23)
 * @param {number} [minute=0] - Minute (0-59)
 * @returns {number} Angle in degrees (0-360)
 */
export function timeToAngle(hour, minute = 0) {
  const normalizedHour = ((hour % HOURS_IN_DAY) + HOURS_IN_DAY) % HOURS_IN_DAY
  const normalizedMinute = Math.max(0, Math.min(59, minute))
  return normalizedHour * DEGREES_PER_HOUR + normalizedMinute * DEGREES_PER_MINUTE
}

/**
 * Convert angle to time (hour + minute)
 * @param {number} angle - Angle in degrees (0-360)
 * @returns {{hour: number, minute: number}} Time object
 */
export function angleToTime(angle) {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const totalMinutes = normalizedAngle / DEGREES_PER_MINUTE
  const hour = Math.floor(totalMinutes / MINUTES_PER_HOUR) % HOURS_IN_DAY
  const minute = Math.floor(totalMinutes % MINUTES_PER_HOUR)
  return { hour, minute }
}

/**
 * Calculate SVG arc path for a minute-precise event
 * Creates a circular arc segment for visualization
 * @param {number} startHour - Start hour (0-23)
 * @param {number} startMinute - Start minute (0-59)
 * @param {number} endHour - End hour (0-23)
 * @param {number} endMinute - End minute (0-59)
 * @param {number} radius - Radius of the circle
 * @param {number} centerX - X coordinate of circle center
 * @param {number} centerY - Y coordinate of circle center
 * @param {number} [innerRadius=0] - Inner radius for donut shape (0 for pie)
 * @returns {string} SVG path data
 */
export function calculateEventArcPath(
  startHour,
  startMinute,
  endHour,
  endMinute,
  radius,
  centerX,
  centerY,
  innerRadius = 0
) {
  const startAngle = timeToAngle(startHour, startMinute)
  const endAngle = timeToAngle(endHour, endMinute)

  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180

  // Calculate outer arc points
  const x1 = centerX + radius * Math.sin(startRad)
  const y1 = centerY - radius * Math.cos(startRad)
  const x2 = centerX + radius * Math.sin(endRad)
  const y2 = centerY - radius * Math.cos(endRad)

  // Determine if arc is larger than 180 degrees
  let angleDiff = endAngle - startAngle
  if (angleDiff < 0) angleDiff += 360
  const largeArc = angleDiff > 180 ? 1 : 0

  if (innerRadius === 0) {
    // Pie slice (with center point)
    return [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
  } else {
    // Donut segment
    const x3 = centerX + innerRadius * Math.sin(endRad)
    const y3 = centerY - innerRadius * Math.cos(endRad)
    const x4 = centerX + innerRadius * Math.sin(startRad)
    const y4 = centerY - innerRadius * Math.cos(startRad)

    return [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ')
  }
}

/**
 * Check if two events overlap (with minute precision)
 * @param {Object} event1 - First event
 * @param {number} event1.startHour - Start hour
 * @param {number} event1.startMinute - Start minute
 * @param {number} event1.endHour - End hour
 * @param {number} event1.endMinute - End minute
 * @param {Object} event2 - Second event
 * @param {number} event2.startHour - Start hour
 * @param {number} event2.startMinute - Start minute
 * @param {number} event2.endHour - End hour
 * @param {number} event2.endMinute - End minute
 * @returns {boolean} True if events overlap
 */
export function eventsOverlap(event1, event2) {
  // Convert to minutes since midnight for easier comparison
  const start1 = event1.startHour * 60 + (event1.startMinute || 0)
  const end1 = event1.endHour * 60 + (event1.endMinute || 0)
  const start2 = event2.startHour * 60 + (event2.startMinute || 0)
  const end2 = event2.endHour * 60 + (event2.endMinute || 0)

  // Handle events that cross midnight
  const event1CrossesMidnight = end1 <= start1
  const event2CrossesMidnight = end2 <= start2

  if (!event1CrossesMidnight && !event2CrossesMidnight) {
    // Simple overlap check
    return start1 < end2 && start2 < end1
  }

  if (event1CrossesMidnight && !event2CrossesMidnight) {
    // Event1 wraps around midnight
    return start2 < end1 || start1 < end2
  }

  if (!event1CrossesMidnight && event2CrossesMidnight) {
    // Event2 wraps around midnight
    return start1 < end2 || start2 < end1
  }

  // Both cross midnight - they always overlap
  return true
}

/**
 * Calculate duration in minutes between two times
 * @param {number} startHour - Start hour (0-23)
 * @param {number} startMinute - Start minute (0-59)
 * @param {number} endHour - End hour (0-23)
 * @param {number} endMinute - End minute (0-59)
 * @returns {number} Duration in minutes
 */
export function calculateDurationInMinutes(startHour, startMinute, endHour, endMinute) {
  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute

  let duration = endTotalMinutes - startTotalMinutes
  if (duration < 0) {
    duration += HOURS_IN_DAY * 60 // Add 24 hours in minutes
  }
  return duration
}
