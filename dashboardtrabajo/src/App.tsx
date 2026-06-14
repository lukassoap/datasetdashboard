import { useMemo, useState } from 'react'
import * as Papa from 'papaparse'
import csvText from '../dataset/patiotuerca2023-02-10.csv?raw'
import HeaderUI from './assets/HeaderUI'
import type { Listing } from './types/DashboardTypes'
import type { SelectChangeEvent } from '@mui/material/Select'
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const chartColors = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
]

const parseNumber = (value?: string) => {
  if (!value) return 0
  const cleaned = value.replace(/,/g, '.').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeText = (value?: string) => value?.trim() || 'Unknown'

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

const formatKm = (value: number) =>
  `${Math.round(value).toLocaleString('en-US')} km`

const groupCounts = (items: Listing[], key: (item: Listing) => string) => {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item) || 'Unknown'
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export default function App() {
  const [selectedPlace, setSelectedPlace] = useState('All')

  const listings = useMemo<Listing[]>(() => {
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    })

    return parsed.data.map((row: Record<string, string>) => ({
      year: parseNumber(row.year),
      mileage: parseNumber(row.Kilometraje),
      price: parseNumber(row.Precio),
      place: normalizeText(row.Lugar),
      negotiation: normalizeText(row.Negociacion),
      category: normalizeText(row.Categoria),
      brand: normalizeText(row.Marca),
      subtype: normalizeText(row.Subtipo),
      model: normalizeText(row.Modelo),
    }))
  }, [])

  const filteredListings = useMemo<Listing[]>(
    () =>
      selectedPlace === 'All'
        ? listings
        : listings.filter((item: Listing) => item.place === selectedPlace),
    [listings, selectedPlace],
  )

  const places = useMemo<string[]>(
    () => ['All', ...Array.from(new Set(listings.map((item: Listing) => item.place))).sort()],
    [listings],
  )

  const totalListings = filteredListings.length
  const avgPrice = filteredListings.reduce((sum: number, item: Listing) => sum + item.price, 0) / Math.max(totalListings, 1)
  const avgMileage = filteredListings.reduce((sum: number, item: Listing) => sum + item.mileage, 0) / Math.max(totalListings, 1)
  const uniqueBrands = new Set(filteredListings.map((item: Listing) => item.brand)).size
  const categoryData = groupCounts(filteredListings, (item: Listing) => item.category).slice(0, 8)
  const brandData = groupCounts(filteredListings, (item: Listing) => item.brand).slice(0, 8)
  const cityData = groupCounts(filteredListings, (item: Listing) => item.place).slice(0, 8)

  const yearData = Object.entries(
    filteredListings.reduce<Record<string, { count: number; total: number }>>((acc, item: Listing) => {
      const yearKey = item.year ? String(item.year) : 'Unknown'
      acc[yearKey] ??= { count: 0, total: 0 }
      acc[yearKey].count += 1
      acc[yearKey].total += item.price
      return acc
    }, {}),
  )
    .map(([year, value]: [string, { count: number; total: number }]) => ({
      year,
      averagePrice: Math.round(value.total / value.count),
      count: value.count,
    }))
    .filter((item) => item.year !== 'Unknown')
    .sort((a, b) => Number(a.year) - Number(b.year))
    .slice(-10)

  const topModels = groupCounts(filteredListings, (item) => item.model).slice(0, 10)

  const handlePlaceChange = (event: SelectChangeEvent<string>) => {
    setSelectedPlace(event.target.value as string)
  }

  return (
    <Box sx={{ p: 4, background: '#f4f6fa', minHeight: '100vh' }}>
      <HeaderUI />
      <Typography variant="subtitle1" sx={{ mb: 3, color: '#555' }}>
        Dashboard de vehículos usados y nuevos con estadísticas extraídas del CSV.
      </Typography>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' } }}>
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total de anuncios
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {totalListings}
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Precio promedio
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(avgPrice)}
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Kilometraje promedio
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatKm(avgMileage)}
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Marcas únicas
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {uniqueBrands}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ my: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="place-select-label">Ciudad / Lugar</InputLabel>
          <Select
            labelId="place-select-label"
            value={selectedPlace}
            label="Ciudad / Lugar"
            onChange={handlePlaceChange}
          >
            {places.map((place) => (
              <MenuItem key={place} value={place}>
                {place}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
        <Card elevation={2} sx={{ height: 420 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribución por categoría
            </Typography>
            <ResponsiveContainer width="100%" height={330}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={110}
                  fill="#8884d8"
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ height: 420 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top marcas por cantidad de anuncios
            </Typography>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={brandData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4e79a7">
                  {brandData.map((_, index) => (
                    <Cell key={`brand-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ height: 420 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Anuncios por ciudad / lugar
            </Typography>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={cityData} layout="vertical" margin={{ top: 20, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#59a14f" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ height: 420 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Precio promedio por año (últimos 10 años)
            </Typography>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={yearData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value: number) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="averagePrice" fill="#f28e2b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Modelos más frecuentes
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' } }}>
            {topModels.map((item, index) => (
              <Card sx={{ background: '#f8fafc' }} key={`${item.name}-${index}`}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.name}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
