'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icons broken by webpack
function fixIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Custom green pin matching Rentora theme
function makeGreenIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;
      background:#049516;border:3px solid #FFFFFF;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 10px rgba(4,149,22,0.5);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  })
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onSelect(e.latlng.lat, e.latlng.lng) } })
  return null
}

export type MeetupLocation = { lat: number; lng: number; name: string }

type Props = {
  value: MeetupLocation | null
  onChange: (loc: MeetupLocation) => void
}

export default function MapPickerInner({ value, onChange }: Props) {
  const [geocoding, setGeocoding] = useState(false)
  const [icon, setIcon] = useState<L.DivIcon | null>(null)

  useEffect(() => {
    fixIcons()
    setIcon(makeGreenIcon())
  }, [])

  const handleSelect = async (lat: number, lng: number) => {
    setGeocoding(true)
    let name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'Rentora-GC/1.0' } }
      )
      const data = await res.json()
      if (data.display_name) {
        const parts: string[] = data.display_name.split(', ')
        name = parts.slice(0, 4).join(', ')
      }
    } catch {}
    onChange({ lat, lng, name })
    setGeocoding(false)
  }

  // Default center: Olongapo City (Gordon College area)
  const center: [number, number] = value ? [value.lat, value.lng] : [14.8295, 120.2809]

  return (
    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(4,149,22,0.18)' }}>
      <MapContainer
        center={center}
        zoom={value ? 16 : 15}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onSelect={handleSelect} />
        {value && icon && (
          <Marker
            position={[value.lat, value.lng]}
            icon={icon}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = e.target.getLatLng()
                handleSelect(lat, lng)
              },
            }}
          />
        )}
      </MapContainer>

      {geocoding && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(1,30,5,0.85)', color: '#6EFF80', fontSize: '11px', fontWeight: '700', padding: '5px 12px', borderRadius: '8px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
          Getting address...
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(1,30,5,0.75)', color: 'rgba(240,255,242,0.8)', fontSize: '11px', fontWeight: '600', padding: '5px 14px', borderRadius: '8px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', whiteSpace: 'nowrap' }}>
        Click map to place pin · Drag pin to adjust
      </div>
    </div>
  )
}