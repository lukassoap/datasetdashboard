import Typography from '@mui/material/Typography'

export default function HeaderUI() {
  return (
    <Typography
      variant="h2"
      component="h1"
      sx={{
        fontWeight: 'bold',
        color: '#7b3f21',
        letterSpacing: '0.03em',
        marginBottom: 2,
      }}
    >
      Dashboard de Vehículos
    </Typography>
  )
}
