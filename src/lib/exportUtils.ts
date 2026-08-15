import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CompetitionRecord } from '../types/competition'

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR', { timeZone: 'UTC' })
const formatTime = (value: string) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

// ---- Shared design tokens -------------------------------------------------
const COLORS = {
  primary: [79, 70, 229] as [number, number, number],      // indigo-600
  primaryDark: [55, 48, 163] as [number, number, number],  // indigo-800
  slateDark: [30, 41, 59] as [number, number, number],     // slate-800
  slateMid: [100, 116, 139] as [number, number, number],   // slate-500
  slateLight: [148, 163, 184] as [number, number, number], // slate-400
  rowAlt: [245, 247, 251] as [number, number, number],     // slate-50/indigo tint
  border: [226, 232, 240] as [number, number, number],     // slate-200
  chipBg: [238, 242, 255] as [number, number, number],     // indigo-50
  white: [255, 255, 255] as [number, number, number]
}

function drawHeaderBand(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 22, 'F')
  doc.setTextColor(...COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(title, 14, 14)
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(subtitle, pageWidth - 14, 14, { align: 'right' })
  }
  doc.setTextColor(0, 0, 0)
}

function drawSectionChip(doc: jsPDF, label: string, x: number, y: number) {
  doc.setFontSize(9)
  const textWidth = doc.getTextWidth(label)
  const paddingX = 3
  const chipWidth = textWidth + paddingX * 2
  const chipHeight = 6
  doc.setFillColor(...COLORS.chipBg)
  doc.roundedRect(x, y - chipHeight + 1.5, chipWidth, chipHeight, 1.2, 1.2, 'F')
  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(label, x + paddingX, y)
  doc.setTextColor(0, 0, 0)
}

function getParticipantName(record: CompetitionRecord): string {
  if (record.type_participant === 'athlète' && record.athletes) {
    return `${record.athletes.prenom} ${record.athletes.nom}`
  }
  if (record.type_participant === 'équipe' && record.equipes) {
    return record.equipes.nom
  }
  if (record.type_participant === 'officiel' && record.officiels) {
    return `${record.officiels.prenom} ${record.officiels.nom}`
  }
  return '—'
}

function getSportName(record: CompetitionRecord): string {
  if (record.sports) {
    return record.sports.nom
  }
  return '—'
}

export function exportCompetitionsToPdf(records: CompetitionRecord[]) {
  const doc = new jsPDF({ orientation: 'portrait' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerHeight = 8

  const generatedOn = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  drawHeaderBand(doc, 'Export des compétitions', `Généré le ${generatedOn}`)

  const drawFooter = (pageNumber: number, totalPages: number) => {
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.slateLight)
    doc.text('Export des compétitions', 14, pageHeight - footerHeight)
    doc.text(`Page ${pageNumber} / ${totalPages}`, pageWidth - 14, pageHeight - footerHeight, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  const validRecords = records.filter((record) => record.date_heure)

  const groupedByDay = new Map<string, CompetitionRecord[]>()
  for (const record of validRecords) {
    const date = new Date(record.date_heure)
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (!groupedByDay.has(dayKey)) {
      groupedByDay.set(dayKey, [])
    }
    groupedByDay.get(dayKey)!.push(record)
  }

  const sortedDays = Array.from(groupedByDay.keys()).sort()
  let currentY = 34

  for (const day of sortedDays) {
    const dayRecords = groupedByDay.get(day)!
    const athleteRecords = dayRecords.filter((r) => r.type_participant === 'athlète')
    const teamRecords = dayRecords.filter((r) => r.type_participant === 'équipe')

    const sortFn = (a: CompetitionRecord, b: CompetitionRecord) => {
      const nameA = getParticipantName(a)
      const nameB = getParticipantName(b)
      if (nameA !== nameB) return nameA.localeCompare(nameB)
      const sportA = getSportName(a)
      const sportB = getSportName(b)
      if (sportA !== sportB) return sportA.localeCompare(sportB)
      return new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()
    }
    athleteRecords.sort(sortFn)
    teamRecords.sort(sortFn)

    const [year, month, date] = day.split('-')
    const dateObj = new Date(Number(year), Number(month) - 1, Number(date))
    const dayLabel = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Day header with accent underline
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.slateDark)
    const dayText = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)
    doc.text(dayText, 14, currentY)
    const textWidth = doc.getTextWidth(dayText)
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.8)
    doc.line(14, currentY + 1.5, 14 + textWidth, currentY + 1.5)
    doc.setTextColor(0, 0, 0)
    currentY += 8

    const renderGroup = (records: CompetitionRecord[], label: string) => {
      if (records.length === 0) return

      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      drawSectionChip(doc, label, 14, currentY)
      currentY += 6

      const body = records.map((record) => [
        record.nom_competition,
        formatTime(record.date_heure),
        record.lieu,
        record.etape,
        getSportName(record),
        getParticipantName(record),
        record.adversaire ?? '',
        record.statut,
        record.resultat ?? ''
      ])

      autoTable(doc, {
        startY: currentY,
        head: [['Compétition', 'Heure', 'Lieu', 'Étape', 'Sport', 'Participant', 'Adversaire', 'Statut', 'Résultat']],
        body,
        styles: { fontSize: 7, cellPadding: 2.2, textColor: [30, 41, 59], lineColor: COLORS.border, lineWidth: 0.1 },
        headStyles: {
          fillColor: COLORS.slateDark,
          textColor: COLORS.white,
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: { fillColor: COLORS.rowAlt },
        margin: { left: 14, right: 14 },
        theme: 'grid'
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (doc as any).lastAutoTable.finalY + 8
    }

    renderGroup(athleteRecords, 'ATHLÈTES')
    renderGroup(teamRecords, 'ÉQUIPES')

    currentY += 4

    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawFooter(i, pageCount)
  }

  doc.save(`competitions-${new Date().toISOString().slice(0, 10)}.pdf`)
}

export interface TimelineEvent {
  date: string
  type: 'competition' | 'flight' | 'accommodation'
  label: string
  detail: string
}

export function exportTimelineToPdf(
  participantName: string,
  participantType: string,
  events: TimelineEvent[]
) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const footerHeight = 8

  const typeLabels: Record<string, string> = {
    competition: 'Compétition',
    flight: 'Vol',
    accommodation: 'Hébergement'
  }

  const typeChipColors: Record<string, [number, number, number]> = {
    competition: [79, 70, 229],   // indigo
    flight: [14, 165, 233],       // sky
    accommodation: [16, 185, 129] // emerald
  }

  drawHeaderBand(doc, `Chronologie — ${participantName}`, participantType)

  const drawFooter = (pageNumber: number) => {
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.slateLight)
    doc.text(
      `Chronologie — ${participantName}`,
      margin,
      pageHeight - footerHeight
    )
    doc.text(
      `Page ${pageNumber}`,
      pageWidth - margin,
      pageHeight - footerHeight,
      { align: 'right' }
    )
    doc.setTextColor(0, 0, 0)
  }

  const body = events.map((event) => [
    formatDate(event.date),
    typeLabels[event.type] ?? event.type,
    event.label,
    event.detail
  ])

  autoTable(doc, {
    startY: 28,
    head: [['Date', 'Type', 'Événement', 'Détails']],
    body,
    styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
    headStyles: { fillColor: COLORS.slateDark, textColor: COLORS.white, fontSize: 10, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    margin: { left: margin, right: margin, bottom: footerHeight + 4 },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
    theme: 'grid',
    didParseCell: (data) => {
      // Colorize the "Type" column as a subtle tag-like accent
      if (data.section === 'body' && data.column.index === 1) {
        const rawType = events[data.row.index]?.type
        const color = rawType ? typeChipColors[rawType] : undefined
        if (color) {
          data.cell.styles.textColor = color
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
    didDrawPage: (data) => {
      drawFooter(data.pageNumber)
    },
    pageBreak: 'auto'
  })

  doc.save(`chronologie-${participantName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`)
}