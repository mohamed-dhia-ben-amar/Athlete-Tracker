import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CompetitionRecord } from '../types/competition'

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR', { timeZone: 'UTC' })
const formatTime = (value: string) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

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
  const title = 'Export des compétitions'
  doc.setFontSize(14)
  doc.text(title, 14, 20)

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
  let currentY = 28

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

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), 14, currentY)
    currentY += 6

    const renderGroup = (records: CompetitionRecord[], label: string) => {
      if (records.length === 0) return

      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(label, 14, currentY)
      currentY += 5

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
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        margin: { left: 14, right: 14 }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (doc as any).lastAutoTable.finalY + 8
    }

    renderGroup(athleteRecords, 'Athlètes')
    renderGroup(teamRecords, 'Équipes')

    currentY += 4

    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }
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

  const drawFooter = () => {
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Chronologie — ${participantName}`,
      margin,
      pageHeight - footerHeight
    )
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - margin,
      pageHeight - footerHeight,
      { align: 'right' }
    )
  }

  const body = events.map((event) => [
    formatDate(event.date),
    typeLabels[event.type] ?? event.type,
    event.label,
    event.detail
  ])

  autoTable(doc, {
    startY: 20,
    head: [['Date', 'Type', 'Événement', 'Détails']],
    body,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin, bottom: footerHeight + 4 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
    didDrawPage: (_data: unknown) => {
      drawFooter()
    },
    pageBreak: 'auto'
  })

  doc.save(`chronologie-${participantName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
