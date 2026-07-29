import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CompetitionRecord } from '../types/competition'

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR')
const formatTime = (value: string) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function exportCompetitionsToExcel(records: CompetitionRecord[]) {
  const rows = records.map((record) => ({
    Participant: record.participant_name,
    Type: record.participant_type,
    Sport: record.sport_type,
    Discipline: record.discipline,
    Compétition: record.competition_name,
    Date: formatDate(record.competition_datetime),
    Heure: formatTime(record.competition_datetime),
    Lieu: record.location,
    Étape: record.stage,
    Statut: record.status,
    Résultat: record.result ?? ''
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
    record.participant_name,
    record.participant_type,
    record.sport_type,
    record.discipline,
    record.competition_name,
    formatDate(record.competition_datetime),
    formatTime(record.competition_datetime),
    record.location,
    record.stage,
    record.status,
    record.result ?? ''
  ])

  autoTable(doc, {
    startY: 26,
    head: [[
      'Participant',
      'Type',
      'Sport',
      'Discipline',
      'Compétition',
      'Date',
      'Heure',
      'Lieu',
      'Étape',
      'Statut',
      'Résultat'
    ]],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [243, 244, 246] }
  })

  doc.save(`competitions-${new Date().toISOString().slice(0, 10)}.pdf`)
}
