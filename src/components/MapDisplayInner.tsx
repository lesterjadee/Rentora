'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function fixIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

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

type Props = { lat: number; lng: number; name?: string }

export default function MapDisplayInner({ lat, lng, name }: Props) {
  const [icon, setIcon] = useState<L.DivIcon | null>(null)

  useEffect(() => {
    fixIcons()
    setIcon(makeGreenIcon())
  }, [])

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(4,149,22,0.15)' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ height: '240px', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {icon && (
          <Marker position={[lat, lng]} icon={icon}>
            {name && <Popup><span style={{ fontSize: '12px' }}>{name}</span></Popup>}
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}