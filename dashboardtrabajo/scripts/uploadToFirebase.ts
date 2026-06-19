import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'
import * as fs from 'fs'
import * as path from 'path'
import Papa from 'papaparse'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const firebaseConfig = {
  apiKey: 'AIzaSyB0k1agAjm6HVhqdx0uTs5j4fxDieSDdaM',
  authDomain: 'dashboardtest-681fb.firebaseapp.com',
  databaseURL: 'https://dashboardtest-681fb-default-rtdb.firebaseio.com',
  projectId: 'dashboardtest-681fb',
  storageBucket: 'dashboardtest-681fb.firebasestorage.app',
  messagingSenderId: '904186649969',
  appId: '1:904186649969:web:bce4c39de343ad4940ead0',
  measurementId: 'G-C1VF4346B7',
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

const parseNumber = (value?: string) => {
  if (!value) return 0
  const cleaned = String(value).replace(/,/g, '.').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeText = (value?: string) => String(value || '').trim() || 'Unknown'

async function uploadCSVToFirebase() {
  try {
    const csvPath = path.join(__dirname, '../dataset/patiotuerca2023-02-10.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')

    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    })

    const listings: Record<string, Record<string, unknown>> = {}

    parsed.data.forEach((row: Record<string, string>, index: number) => {
      const id = `listing_${index + 1}`
      listings[id] = {
        year: parseNumber(row.year),
        Kilometraje: parseNumber(row.Kilometraje),
        Precio: parseNumber(row.Precio),
        Lugar: normalizeText(row.Lugar),
        Negociacion: normalizeText(row.Negociacion),
        Categoria: normalizeText(row.Categoria),
        Marca: normalizeText(row.Marca),
        Subtipo: normalizeText(row.Subtipo),
        Modelo: normalizeText(row.Modelo),
      }
    })

    console.log(`Uploading ${Object.keys(listings).length} records to Firebase...`)

    const listingsRef = ref(database, '/listings')
    await set(listingsRef, listings)

    console.log('✓ Successfully uploaded all records to Firebase Realtime Database at /listings')
    process.exit(0)
  } catch (error) {
    console.error('Error uploading to Firebase:', error)
    process.exit(1)
  }
}

uploadCSVToFirebase()
