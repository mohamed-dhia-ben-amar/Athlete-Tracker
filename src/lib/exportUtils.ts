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
    Résultat: record.resultat ?? ''
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
    record.resultat ?? ''
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
      'Résultat'
    ]],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [243, 244, 246] }
  })

  doc.save(`competitions-${new Date().toISOString().slice(0, 10)}.pdf`)
}