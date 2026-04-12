import { redirect } from 'next/navigation'

// La racine "/" redirige vers le dashboard principal
export default function RootPage() {
  redirect('/home')
}
