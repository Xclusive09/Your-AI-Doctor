// Badge generation and sharing utilities

export interface BadgeData {
  id: string
  name: string
  description: string
  rarity: string
  earnedDate: string
  username: string
}

/**
 * Generate a shareable link for a badge
 */
export function generateShareableLink(badge: BadgeData): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams({
    badge: badge.id,
    name: badge.name,
    user: badge.username,
  })
  return `${baseUrl}/credentials?${params.toString()}`
}

/**
 * Generate social sharing text with invite
 */
export function generateShareText(badge: BadgeData): string {
  return `🏆 I just earned the "${badge.name}" badge on HealthBot! 

Track your health metrics, earn achievements, and get AI-powered health insights.

Join me: ${generateShareableLink(badge)}

#HealthBot #HealthTracking #Wellness`
}

/**
 * Download badge as an image (uses canvas)
 */
export async function downloadBadgeImage(badge: BadgeData): Promise<void> {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1000)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 1000)
    
    // Add purple accent
    const accentGradient = ctx.createLinearGradient(0, 0, 800, 1000)
    accentGradient.addColorStop(0, 'rgba(147, 51, 234, 0.3)')
    accentGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)')
    ctx.fillStyle = accentGradient
    ctx.fillRect(0, 0, 800, 1000)
    
    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('HealthBot Achievement', 400, 100)
    
    // Badge circle
    const centerX = 400
    const centerY = 350
    const radius = 150
    
    // Badge gradient
    const badgeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    const rarityColors: Record<string, { start: string; end: string }> = {
      Legendary: { start: '#fbbf24', end: '#f59e0b' },
      Epic: { start: '#a855f7', end: '#7c3aed' },
      Rare: { start: '#3b82f6', end: '#2563eb' },
      Common: { start: '#6b7280', end: '#4b5563' },
    }
    const colors = rarityColors[badge.rarity] || rarityColors.Common
    badgeGradient.addColorStop(0, colors.start)
    badgeGradient.addColorStop(1, colors.end)
    
    ctx.fillStyle = badgeGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Badge icon (star)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 120px Arial'
    ctx.fillText('⭐', centerX, centerY + 40)
    
    // Badge name
    ctx.font = 'bold 42px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(badge.name, 400, 580)
    
    // Rarity
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = colors.start
    ctx.fillText(badge.rarity.toUpperCase(), 400, 630)
    
    // Description
    ctx.font = '24px Arial'
    ctx.fillStyle = '#9ca3af'
    const words = badge.description.split(' ')
    let line = ''
    let y = 700
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 600 && i > 0) {
        ctx.fillText(line, 400, y)
        line = words[i] + ' '
        y += 35
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 400, y)
    
    // Earned date
    ctx.font = '20px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(`Earned: ${new Date(badge.earnedDate).toLocaleDateString()}`, 400, 820)
    
    // Username
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`@${badge.username}`, 400, 880)
    
    // Footer
    ctx.font = '20px Arial'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('🏥 HealthBot - AI Health Tracker', 400, 950)
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Could not create image blob')
      }
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `healthbot-badge-${badge.id}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
    
  } catch (error) {
    console.error('Error generating badge image:', error)
    throw error
  }
}

/**
 * Copy shareable link to clipboard
 */
export async function copyShareLink(badge: BadgeData): Promise<void> {
  const link = generateShareableLink(badge)
  await navigator.clipboard.writeText(link)
}

/**
 * Share badge via Web Share API (mobile)
 */
export async function shareBadgeNative(badge: BadgeData): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported')
  }
  
  const shareData = {
    title: `${badge.name} - HealthBot Achievement`,
    text: generateShareText(badge),
    url: generateShareableLink(badge),
  }
  
  await navigator.share(shareData)
}
