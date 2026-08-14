import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CompetitionRecord } from '../types/competition'

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR')
const formatTime = (value: string) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

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

export function exportCompetitionsToExcel(records: CompetitionRecord[]) {
  const rows = records.map((record) => ({
    Participant: getParticipantName(record),
    Type: record.type_participant,
    Sport: getSportName(record),
    Compétition: record.nom_competition,
    Date: formatDate(record.date_heure),
    Heure: formatTime(record.date_heure),
    Lieu: record.lieu,
    Étape: record.etape,
    Statut: record.statut,
    Résultat: record.resultat ?? '',
    Adversaire: record.adversaire ?? ''
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Compétitions')

  XLSX.writeFile(workbook, `competitions-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function exportCompetitionsToPdf(records: CompetitionRecord[]) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const title = 'Export des compétitions'
  doc.setFontSize(14)
  doc.text(title, 14, 20)

  const body = records.map((record) => [
    getParticipantName(record),
    record.type_participant,
    getSportName(record),
    record.nom_competition,
    formatDate(record.date_heure),
    formatTime(record.date_heure),
    record.lieu,
    record.etape,
    record.statut,
    record.resultat ?? '',
    record.adversaire ?? ''
  ])

  autoTable(doc, {
    startY: 26,
    head: [[
      'Participant',
      'Type',
      'Sport',
      'Compétition',
      'Date',
      'Heure',
      'Lieu',
      'Étape',
      'Statut',
      'Résultat',
      'Adversaire'
    ]],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [243, 244, 246] }
  })

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
