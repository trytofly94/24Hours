/**
 * CircleView Component
 * Renders and manages the 24-hour circle visualization
 */

import {
  HOURS_IN_DAY,
  calculateArcPath,
  getHourPosition,
  getCurrentHour,
  formatTime
} from '../lib/timeUtils.js'

/**
 * Configuration for the circle visualization
 */
const CONFIG = {
  viewBox: 400,
  centerX: 200,
  centerY: 200,
  outerRadius: 180,
  innerRadius: 120,
  labelRadius: 150,
  centerCircleRadius: 80,
  majorHours: [0, 3, 6, 9, 12, 15, 18, 21]
}

/**
 * Create SVG namespace element
 * @param {string} tag - SVG element tag name
 * @param {Object} attrs - Element attributes
 * @returns {SVGElement} Created SVG element
 */
function createSVGElement(tag, attrs = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  return element
}

/**
 * Create a single hour segment
 * @param {number} hour - Hour (0-23)
 * @param {Function} onClick - Click handler
 * @returns {SVGPathElement} Hour segment path
 */
function createHourSegment(hour, onClick) {
  const nextHour = (hour + 1) % HOURS_IN_DAY

  const path = calculateArcPath(
    hour,
    nextHour,
    CONFIG.outerRadius,
    CONFIG.centerX,
    CONFIG.centerY,
    CONFIG.innerRadius
  )

  const segment = createSVGElement('path', {
    class: 'circle__segment',
    d: path,
    'data-hour': hour
  })

  // Mark current hour
  if (hour === getCurrentHour()) {
    segment.classList.add('circle__segment--current')
  }

  // Add click handler
  segment.addEventListener('click', () => onClick(hour))

  // Add hover tooltip
  segment.addEventListener('mouseenter', (e) => {
    segment.setAttribute('data-tooltip', `${formatTime(hour)}:00`)
  })

  return segment
}

/**
 * Create hour label
 * @param {number} hour - Hour (0-23)
 * @returns {SVGGElement} Label group with text
 */
function createHourLabel(hour) {
  const isMajor = CONFIG.majorHours.includes(hour)
  const position = getHourPosition(
    hour,
    CONFIG.labelRadius,
    CONFIG.centerX,
    CONFIG.centerY
  )

  const group = createSVGElement('g', {
    class: 'circle__label-group',
    transform: `translate(${position.x}, ${position.y})`
  })

  const text = createSVGElement('text', {
    class: isMajor ? 'circle__label circle__label--major' : 'circle__label circle__label--minor',
    x: 0,
    y: 0
  })

  text.textContent = hour

  group.appendChild(text)
  return group
}

/**
 * Create center circle with current time display
 * @returns {SVGGElement} Center circle group
 */
function createCenterCircle() {
  const group = createSVGElement('g', {
    class: 'circle__center-group'
  })

  // Background circle
  const circle = createSVGElement('circle', {
    class: 'circle__center',
    cx: CONFIG.centerX,
    cy: CONFIG.centerY,
    r: CONFIG.centerCircleRadius
  })

  // Time text
  const timeText = createSVGElement('text', {
    class: 'circle__center-text',
    x: CONFIG.centerX,
    y: CONFIG.centerY - 10,
    id: 'center-time'
  })

  // Date text (smaller, below time)
  const dateText = createSVGElement('text', {
    class: 'circle__center-text',
    x: CONFIG.centerX,
    y: CONFIG.centerY + 15,
    id: 'center-date',
    style: 'font-size: 14px; fill: var(--color-text-secondary);'
  })

  group.appendChild(circle)
  group.appendChild(timeText)
  group.appendChild(dateText)

  return group
}

/**
 * Create tick marks around the circle
 * @returns {SVGGElement} Group containing all tick marks
 */
function createTickMarks() {
  const group = createSVGElement('g', {
    class: 'circle__ticks'
  })

  for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
    const isMajor = CONFIG.majorHours.includes(hour)
    const innerR = isMajor ? CONFIG.outerRadius + 5 : CONFIG.outerRadius + 3
    const outerR = isMajor ? CONFIG.outerRadius + 15 : CONFIG.outerRadius + 8

    const innerPos = getHourPosition(hour, innerR, CONFIG.centerX, CONFIG.centerY)
    const outerPos = getHourPosition(hour, outerR, CONFIG.centerX, CONFIG.centerY)

    const tick = createSVGElement('line', {
      class: isMajor ? 'circle__tick circle__tick--major' : 'circle__tick',
      x1: innerPos.x,
      y1: innerPos.y,
      x2: outerPos.x,
      y2: outerPos.y
    })

    group.appendChild(tick)
  }

  return group
}

/**
 * Update center time display
 * @param {SVGElement} svg - SVG container element
 */
function updateCenterTime(svg) {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const timeElement = svg.querySelector('#center-time')
  const dateElement = svg.querySelector('#center-date')

  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`
  }

  if (dateElement) {
    dateElement.textContent = `${day}.${month}`
  }
}

/**
 * Create and render the complete circle view
 * @param {HTMLElement} container - Container element for the circle
 * @param {Function} onSegmentClick - Callback for segment clicks
 * @returns {Object} Circle view API
 */
export function createCircleView(container, onSegmentClick = () => {}) {
  // Clear container
  container.innerHTML = ''

  // Create main SVG
  const svg = createSVGElement('svg', {
    class: 'circle__svg',
    viewBox: `0 0 ${CONFIG.viewBox} ${CONFIG.viewBox}`,
    xmlns: 'http://www.w3.org/2000/svg'
  })

  // Add wrapper div with circle class
  const wrapper = document.createElement('div')
  wrapper.className = 'circle'
  wrapper.appendChild(svg)

  // Create and append all elements
  const ticksGroup = createTickMarks()
  svg.appendChild(ticksGroup)

  // Create hour segments
  const segmentsGroup = createSVGElement('g', {
    class: 'circle__segments'
  })

  for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
    const segment = createHourSegment(hour, onSegmentClick)
    segmentsGroup.appendChild(segment)
  }

  svg.appendChild(segmentsGroup)

  // Create labels
  const labelsGroup = createSVGElement('g', {
    class: 'circle__labels'
  })

  CONFIG.majorHours.forEach((hour) => {
    const label = createHourLabel(hour)
    labelsGroup.appendChild(label)
  })

  svg.appendChild(labelsGroup)

  // Add center circle
  const centerCircle = createCenterCircle()
  svg.appendChild(centerCircle)

  // Append to container
  container.appendChild(wrapper)

  // Update center time initially
  updateCenterTime(svg)

  // Update time every minute
  const intervalId = setInterval(() => {
    updateCenterTime(svg)

    // Update current hour segment
    const currentHour = getCurrentHour()
    svg.querySelectorAll('.circle__segment').forEach((segment) => {
      const hour = parseInt(segment.getAttribute('data-hour'))
      if (hour === currentHour) {
        segment.classList.add('circle__segment--current')
      } else {
        segment.classList.remove('circle__segment--current')
      }
    })
  }, 60000) // Update every minute

  // Return API for external control
  return {
    /**
     * Destroy the circle view and clean up
     */
    destroy() {
      clearInterval(intervalId)
      container.innerHTML = ''
    },

    /**
     * Highlight a specific hour segment
     * @param {number} hour - Hour to highlight
     */
    highlightHour(hour) {
      svg.querySelectorAll('.circle__segment').forEach((segment) => {
        const segmentHour = parseInt(segment.getAttribute('data-hour'))
        if (segmentHour === hour) {
          segment.classList.add('circle__segment--selected')
        } else {
          segment.classList.remove('circle__segment--selected')
        }
      })
    },

    /**
     * Clear all highlights
     */
    clearHighlights() {
      svg.querySelectorAll('.circle__segment--selected').forEach((segment) => {
        segment.classList.remove('circle__segment--selected')
      })
    },

    /**
     * Get the SVG element
     * @returns {SVGElement} The SVG element
     */
    getSVG() {
      return svg
    },

    /**
     * Refresh the circle view
     */
    refresh() {
      updateCenterTime(svg)
    }
  }
}
