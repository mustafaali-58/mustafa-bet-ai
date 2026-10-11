import { notFound } from 'next/navigation';

// Bilinmeyen adresler de sitenin kendi "sayfa bulunamadı" görünümünü alır.
export default function CatchAllPage() {
  notFound();
}
